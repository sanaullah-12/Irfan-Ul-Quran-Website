const express = require("express");
const router = express.Router();
const {
  authMiddleware,
  requireRole,
  requireApproved,
} = require("../middleware/authMiddleware");
const User = require("../models/User");
const CourseEnrollment = require("../models/CourseEnrollment");
const ClassSchedule = require("../models/ClassSchedule");
const ActivityLog = require("../models/ActivityLog");
const Notification = require("../models/Notification");
const { v4: uuidv4 } = require("uuid");

// All teacher routes require auth + teacher role + approved
router.use(authMiddleware, requireRole("teacher"), requireApproved);

// ─── TEACHER DASHBOARD OVERVIEW ─────────────────────────────────
router.get("/overview", async (req, res) => {
  try {
    const teacherId = req.userId;
    const now = new Date();

    const teacher = await User.findById(teacherId)
      .select("-password")
      .populate("assignedStudents", "name email plan accountStatus");

    const [totalClasses, upcomingClasses, completedClasses] = await Promise.all(
      [
        ClassSchedule.countDocuments({ teacherId }),
        ClassSchedule.countDocuments({
          teacherId,
          scheduledDate: { $gte: now },
          status: "scheduled",
        }),
        ClassSchedule.countDocuments({ teacherId, status: "completed" }),
      ],
    );

    res.json({
      teacher: {
        name: teacher.name,
        email: teacher.email,
      },
      assignedStudents: teacher.assignedStudents || [],
      stats: {
        totalStudents: (teacher.assignedStudents || []).length,
        totalClasses,
        upcomingClasses,
        completedClasses,
      },
    });
  } catch (error) {
    console.error("Teacher overview error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─── ASSIGNED STUDENTS ──────────────────────────────────────────
router.get("/students", async (req, res) => {
  try {
    const teacher = await User.findById(req.userId).populate(
      "assignedStudents",
      "name email plan accountStatus totalClassesTaken lastActivity",
    );

    res.json({ students: teacher.assignedStudents || [] });
  } catch (error) {
    console.error("Teacher students error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─── SCHEDULE CLASS ─────────────────────────────────────────────
router.post("/schedule-class", async (req, res) => {
  try {
    const { studentId, courseType, scheduledDate, duration, notes } = req.body;
    const teacherId = req.userId;

    // Verify student is assigned to this teacher
    const teacher = await User.findById(teacherId);
    if (!teacher.assignedStudents.includes(studentId)) {
      return res
        .status(403)
        .json({ message: "This student is not assigned to you" });
    }

    const newClass = new ClassSchedule({
      userId: studentId,
      teacherId,
      courseType,
      teacherName: teacher.name,
      scheduledDate: new Date(scheduledDate),
      duration: duration || 60,
      status: "scheduled",
      roomId: uuidv4(),
      notes,
    });

    await newClass.save();

    // Notify student about the scheduled class
    const fmtDate = new Date(scheduledDate).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    await Notification.create({
      userId: studentId,
      type: "class_scheduled",
      title: "New Class Scheduled",
      message: `Your ${courseType} class with ${teacher.name} is scheduled for ${fmtDate} (${duration || 60} min).`,
      metadata: {
        classId: newClass._id,
        courseType,
        scheduledDate: new Date(scheduledDate),
        teacherName: teacher.name,
        roomId: newClass.roomId,
      },
    });

    res
      .status(201)
      .json({
        message: "Class scheduled and student notified",
        class: newClass,
      });
  } catch (error) {
    console.error("Schedule class error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─── GET TEACHER'S CLASSES ──────────────────────────────────────
router.get("/classes", async (req, res) => {
  try {
    const teacherId = req.userId;
    const { status } = req.query;
    const filter = { teacherId };
    if (status) filter.status = status;

    const classes = await ClassSchedule.find(filter)
      .populate("userId", "name email")
      .sort({ scheduledDate: -1 })
      .lean();

    res.json({ classes });
  } catch (error) {
    console.error("Teacher classes error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─── UPCOMING CLASSES ───────────────────────────────────────────
router.get("/classes/upcoming", async (req, res) => {
  try {
    const teacherId = req.userId;
    const now = new Date();

    const classes = await ClassSchedule.find({
      teacherId,
      scheduledDate: { $gte: now },
      status: "scheduled",
    })
      .populate("userId", "name email")
      .sort({ scheduledDate: 1 })
      .limit(10)
      .lean();

    res.json({ classes });
  } catch (error) {
    console.error("Teacher upcoming error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─── MARK ATTENDANCE / UPDATE CLASS STATUS ──────────────────────
router.patch("/classes/:classId/status", async (req, res) => {
  try {
    const teacherId = req.userId;
    const { classId } = req.params;
    const { status, notes } = req.body;

    const classSchedule = await ClassSchedule.findOne({
      _id: classId,
      teacherId,
    });
    if (!classSchedule) {
      return res
        .status(404)
        .json({ message: "Class not found or not assigned to you" });
    }

    classSchedule.status = status;
    if (notes) classSchedule.notes = notes;
    await classSchedule.save();

    // If completed, update student stats
    if (status === "completed") {
      await User.findByIdAndUpdate(classSchedule.userId, {
        $inc: { totalClassesTaken: 1 },
        lastActivity: new Date(),
      });

      await ActivityLog.create({
        userId: classSchedule.userId,
        activityType: "class_attended",
        activityDetails: { classId },
      });
    }

    res.json({ message: "Class status updated", class: classSchedule });
  } catch (error) {
    console.error("Update class error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─── CANCEL CLASS ───────────────────────────────────────────────
router.patch("/classes/:classId/cancel", async (req, res) => {
  try {
    const teacherId = req.userId;
    const { classId } = req.params;
    const { reason } = req.body;

    const cls = await ClassSchedule.findOne({
      _id: classId,
      teacherId,
    }).populate("userId", "name email");
    if (!cls)
      return res
        .status(404)
        .json({ message: "Class not found or not assigned to you" });
    if (cls.status === "cancelled")
      return res.status(400).json({ message: "Class already cancelled" });

    const teacher = await User.findById(teacherId).select("name");
    cls.status = "cancelled";
    if (reason)
      cls.notes = cls.notes
        ? `${cls.notes} | Cancelled: ${reason}`
        : `Cancelled: ${reason}`;
    await cls.save();

    // Notify student
    const fmtDate = new Date(cls.scheduledDate).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    await Notification.create({
      userId: cls.userId._id,
      type: "class_cancelled",
      title: "Class Cancelled",
      message: `Your ${cls.courseType} class on ${fmtDate} has been cancelled by ${teacher.name}.${reason ? ` Reason: ${reason}` : ""}`,
      metadata: {
        classId: cls._id,
        courseType: cls.courseType,
        scheduledDate: cls.scheduledDate,
        teacherName: teacher.name,
      },
    });

    res.json({ message: "Class cancelled and student notified", class: cls });
  } catch (error) {
    console.error("Teacher cancel class error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─── RESCHEDULE CLASS ───────────────────────────────────────────
router.patch("/classes/:classId/reschedule", async (req, res) => {
  try {
    const teacherId = req.userId;
    const { classId } = req.params;
    const { scheduledDate, duration } = req.body;

    const cls = await ClassSchedule.findOne({
      _id: classId,
      teacherId,
    }).populate("userId", "name email");
    if (!cls)
      return res
        .status(404)
        .json({ message: "Class not found or not assigned to you" });

    const teacher = await User.findById(teacherId).select("name");
    const oldDate = cls.scheduledDate;
    cls.scheduledDate = new Date(scheduledDate);
    if (duration) cls.duration = duration;
    cls.status = "scheduled";
    await cls.save();

    // Notify student
    const fmtOld = new Date(oldDate).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const fmtNew = new Date(scheduledDate).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    await Notification.create({
      userId: cls.userId._id,
      type: "class_scheduled",
      title: "Class Rescheduled",
      message: `Your ${cls.courseType} class has been moved from ${fmtOld} to ${fmtNew} by ${teacher.name}.`,
      metadata: {
        classId: cls._id,
        courseType: cls.courseType,
        scheduledDate: new Date(scheduledDate),
        teacherName: teacher.name,
        roomId: cls.roomId,
      },
    });

    res.json({ message: "Class rescheduled and student notified", class: cls });
  } catch (error) {
    console.error("Teacher reschedule error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─── ADD PROGRESS NOTE ──────────────────────────────────────────
router.post("/students/:studentId/progress", async (req, res) => {
  try {
    const teacherId = req.userId;
    const { studentId } = req.params;
    const { note, courseType } = req.body;

    // Verify student is assigned
    const teacher = await User.findById(teacherId);
    if (!teacher.assignedStudents.includes(studentId)) {
      return res.status(403).json({ message: "Student not assigned to you" });
    }

    await ActivityLog.create({
      userId: studentId,
      activityType: "progress_note",
      activityDetails: {
        resourceName: `Progress Note: ${note}`,
        courseType,
      },
    });

    res.json({ message: "Progress note added" });
  } catch (error) {
    console.error("Progress note error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
