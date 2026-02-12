const express = require("express");
const router = express.Router();
const { authMiddleware, requireRole } = require("../middleware/authMiddleware");
const User = require("../models/User");
const CourseEnrollment = require("../models/CourseEnrollment");
const ClassSchedule = require("../models/ClassSchedule");
const ActivityLog = require("../models/ActivityLog");
const ResourceRequest = require("../models/ResourceRequest");
const Notification = require("../models/Notification");
const { v4: uuidv4 } = require("uuid");

// All admin routes require auth + admin role
router.use(authMiddleware, requireRole("admin"));

// ─── DASHBOARD OVERVIEW ─────────────────────────────────────────
router.get("/overview", async (req, res) => {
  try {
    const now = new Date();

    const [
      totalStudents,
      totalTeachers,
      totalUsers,
      blockedUsers,
      totalClasses,
      upcomingClasses,
      completedClasses,
      pendingResources,
    ] = await Promise.all([
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "teacher" }),
      User.countDocuments(),
      User.countDocuments({ accountStatus: "blocked" }),
      ClassSchedule.countDocuments(),
      ClassSchedule.countDocuments({
        scheduledDate: { $gte: now },
        status: "scheduled",
      }),
      ClassSchedule.countDocuments({ status: "completed" }),
      ResourceRequest.countDocuments({ status: "pending" }),
    ]);

    res.json({
      stats: {
        totalStudents,
        totalTeachers,
        totalUsers,
        blockedUsers,
        totalClasses,
        upcomingClasses,
        completedClasses,
        pendingResources,
      },
    });
  } catch (error) {
    console.error("Admin overview error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─── USER MANAGEMENT ────────────────────────────────────────────

// Get all users (with filters)
router.get("/users", async (req, res) => {
  try {
    const { role, status, search } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (status) filter.accountStatus = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ users });
  } catch (error) {
    console.error("Admin get users error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Approve user
router.patch("/users/:userId/approve", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { accountStatus: "approved" },
      { new: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User approved", user });
  } catch (error) {
    console.error("Admin approve error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Block user
router.patch("/users/:userId/block", async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.userId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Cannot block admin accounts
    if (User.isAdminEmail(targetUser.email)) {
      return res.status(403).json({ message: "Cannot block admin accounts" });
    }

    targetUser.accountStatus = "blocked";
    await targetUser.save();

    res.json({ message: "User blocked", user: targetUser });
  } catch (error) {
    console.error("Admin block error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Reject (delete pending user)
router.patch("/users/:userId/reject", async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.userId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (User.isAdminEmail(targetUser.email)) {
      return res.status(403).json({ message: "Cannot reject admin accounts" });
    }

    targetUser.accountStatus = "blocked";
    await targetUser.save();

    res.json({ message: "User rejected" });
  } catch (error) {
    console.error("Admin reject error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Unblock user
router.patch("/users/:userId/unblock", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { accountStatus: "approved" },
      { new: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User unblocked", user });
  } catch (error) {
    console.error("Admin unblock error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─── TEACHER-STUDENT ASSIGNMENT ─────────────────────────────────

// Assign teacher to student
router.patch("/users/:studentId/assign-teacher", async (req, res) => {
  try {
    const { teacherId } = req.body;
    const { studentId } = req.params;

    const student = await User.findById(studentId);
    const teacher = await User.findById(teacherId);

    if (!student || !teacher) {
      return res.status(404).json({ message: "Student or teacher not found" });
    }
    if (teacher.role !== "teacher") {
      return res
        .status(400)
        .json({ message: "Selected user is not a teacher" });
    }
    if (student.role !== "student") {
      return res
        .status(400)
        .json({ message: "Selected user is not a student" });
    }

    student.assignedTeacher = teacherId;
    await student.save();

    // Add student to teacher's list if not already there
    if (!teacher.assignedStudents.includes(studentId)) {
      teacher.assignedStudents.push(studentId);
      await teacher.save();
    }

    res.json({ message: "Teacher assigned to student" });
  } catch (error) {
    console.error("Assign teacher error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─── RESOURCE ACCESS REQUESTS ───────────────────────────────────

// Get all resource requests
router.get("/resource-requests", async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const requests = await ResourceRequest.find(filter)
      .populate("userId", "name email role")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ requests });
  } catch (error) {
    console.error("Get resource requests error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Approve resource request
router.patch("/resource-requests/:requestId/approve", async (req, res) => {
  try {
    const request = await ResourceRequest.findByIdAndUpdate(
      req.params.requestId,
      {
        status: "approved",
        reviewedBy: req.userId,
        reviewedAt: new Date(),
      },
      { new: true },
    );

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Grant resource access to user
    await User.findByIdAndUpdate(request.userId, { resourceAccess: true });

    res.json({ message: "Resource access approved", request });
  } catch (error) {
    console.error("Approve resource request error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Reject resource request
router.patch("/resource-requests/:requestId/reject", async (req, res) => {
  try {
    const request = await ResourceRequest.findByIdAndUpdate(
      req.params.requestId,
      {
        status: "rejected",
        reviewedBy: req.userId,
        reviewedAt: new Date(),
      },
      { new: true },
    );

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.json({ message: "Resource access rejected", request });
  } catch (error) {
    console.error("Reject resource request error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─── CLASS MANAGEMENT ───────────────────────────────────────────

// Get all classes (admin view)
router.get("/classes", async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const classes = await ClassSchedule.find(filter)
      .populate("userId", "name email")
      .populate("teacherId", "name email")
      .sort({ scheduledDate: -1 })
      .lean();

    res.json({ classes });
  } catch (error) {
    console.error("Admin get classes error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Admin schedule class for any student with any teacher
router.post("/schedule-class", async (req, res) => {
  try {
    const { studentId, teacherId, courseType, scheduledDate, duration, notes } =
      req.body;

    if (!studentId || !teacherId || !courseType || !scheduledDate) {
      return res
        .status(400)
        .json({
          message: "Student, teacher, course type, and date are required",
        });
    }

    const student = await User.findById(studentId);
    const teacher = await User.findById(teacherId);
    if (!student) return res.status(404).json({ message: "Student not found" });
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });
    if (teacher.role !== "teacher")
      return res
        .status(400)
        .json({ message: "Selected user is not a teacher" });
    if (student.role !== "student")
      return res
        .status(400)
        .json({ message: "Selected user is not a student" });

    const roomId = uuidv4();

    const newClass = new ClassSchedule({
      userId: studentId,
      teacherId: teacherId,
      courseType,
      teacherName: teacher.name,
      scheduledDate: new Date(scheduledDate),
      duration: duration || 60,
      status: "scheduled",
      roomId,
      notes,
    });

    await newClass.save();

    // Auto-assign teacher-student relationship if not already set
    if (!teacher.assignedStudents.includes(studentId)) {
      teacher.assignedStudents.push(studentId);
      await teacher.save();
    }
    if (
      !student.assignedTeacher ||
      student.assignedTeacher.toString() !== teacherId
    ) {
      student.assignedTeacher = teacherId;
      await student.save();
    }

    const fmtDate = new Date(scheduledDate).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Notify student
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
        roomId,
      },
    });

    // Notify teacher
    await Notification.create({
      userId: teacherId,
      type: "class_scheduled",
      title: "New Class Assigned",
      message: `Admin scheduled a ${courseType} class with ${student.name} for ${fmtDate} (${duration || 60} min).`,
      metadata: {
        classId: newClass._id,
        courseType,
        scheduledDate: new Date(scheduledDate),
        teacherName: teacher.name,
        roomId,
      },
    });

    res
      .status(201)
      .json({
        message: "Class scheduled and notifications sent",
        class: newClass,
      });
  } catch (error) {
    console.error("Admin schedule class error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Admin cancel class
router.patch("/classes/:classId/cancel", async (req, res) => {
  try {
    const { reason } = req.body;
    const cls = await ClassSchedule.findById(req.params.classId);
    if (!cls) return res.status(404).json({ message: "Class not found" });

    cls.status = "cancelled";
    if (reason)
      cls.notes = (cls.notes ? cls.notes + " | " : "") + "Cancelled: " + reason;
    await cls.save();

    const fmtDate = new Date(cls.scheduledDate).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Notify student
    await Notification.create({
      userId: cls.userId,
      type: "class_cancelled",
      title: "Class Cancelled",
      message: `Your ${cls.courseType} class on ${fmtDate} has been cancelled.${reason ? " Reason: " + reason : ""}`,
      metadata: {
        classId: cls._id,
        courseType: cls.courseType,
        scheduledDate: cls.scheduledDate,
      },
    });

    // Notify teacher
    if (cls.teacherId) {
      await Notification.create({
        userId: cls.teacherId,
        type: "class_cancelled",
        title: "Class Cancelled",
        message: `The ${cls.courseType} class on ${fmtDate} has been cancelled by admin.${reason ? " Reason: " + reason : ""}`,
        metadata: {
          classId: cls._id,
          courseType: cls.courseType,
          scheduledDate: cls.scheduledDate,
        },
      });
    }

    res.json({ message: "Class cancelled and notifications sent", class: cls });
  } catch (error) {
    console.error("Admin cancel class error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Admin reschedule class
router.patch("/classes/:classId/reschedule", async (req, res) => {
  try {
    const { scheduledDate, duration } = req.body;
    if (!scheduledDate)
      return res.status(400).json({ message: "New date is required" });

    const cls = await ClassSchedule.findById(req.params.classId);
    if (!cls) return res.status(404).json({ message: "Class not found" });

    const oldDate = new Date(cls.scheduledDate).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    cls.scheduledDate = new Date(scheduledDate);
    if (duration) cls.duration = duration;
    cls.status = "scheduled";
    await cls.save();

    const newDate = new Date(scheduledDate).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Notify student
    await Notification.create({
      userId: cls.userId,
      type: "class_scheduled",
      title: "Class Rescheduled",
      message: `Your ${cls.courseType} class has been moved from ${oldDate} to ${newDate}.`,
      metadata: {
        classId: cls._id,
        courseType: cls.courseType,
        scheduledDate: new Date(scheduledDate),
        teacherName: cls.teacherName,
        roomId: cls.roomId,
      },
    });

    // Notify teacher
    if (cls.teacherId) {
      await Notification.create({
        userId: cls.teacherId,
        type: "class_scheduled",
        title: "Class Rescheduled",
        message: `The ${cls.courseType} class has been rescheduled from ${oldDate} to ${newDate}.`,
        metadata: {
          classId: cls._id,
          courseType: cls.courseType,
          scheduledDate: new Date(scheduledDate),
          teacherName: cls.teacherName,
          roomId: cls.roomId,
        },
      });
    }

    res.json({
      message: "Class rescheduled and notifications sent",
      class: cls,
    });
  } catch (error) {
    console.error("Admin reschedule class error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─── ACTIVITY LOGS ──────────────────────────────────────────────

router.get("/activity-logs", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;

    const logs = await ActivityLog.find()
      .populate("userId", "name email role")
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    res.json({ logs });
  } catch (error) {
    console.error("Activity logs error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─── PAYMENT OVERVIEW ───────────────────────────────────────────

router.get("/payments", async (req, res) => {
  try {
    const users = await User.find({
      "paymentHistory.0": { $exists: true },
    })
      .select("name email plan paymentHistory")
      .lean();

    const allPayments = [];
    users.forEach((user) => {
      user.paymentHistory.forEach((payment) => {
        allPayments.push({
          userName: user.name,
          userEmail: user.email,
          ...payment,
        });
      });
    });

    allPayments.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({ payments: allPayments });
  } catch (error) {
    console.error("Admin payments error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
