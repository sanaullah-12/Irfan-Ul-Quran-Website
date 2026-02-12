const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Class = require("../models/Class");
const User = require("../models/User");
const ClassSchedule = require("../models/ClassSchedule");
const Notification = require("../models/Notification");
const { v4: uuidv4 } = require("uuid");

// Middleware to verify JWT token
const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key",
    );
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Get all teachers (for schedule form)
router.get("/teachers", authenticate, async (req, res) => {
  try {
    if (req.userRole !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }
    const teachers = await User.find({ role: "teacher", accountStatus: "approved" })
      .select("name email")
      .sort({ name: 1 })
      .lean();
    res.json({ teachers });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch teachers" });
  }
});

// Get all students (for schedule form)
router.get("/students", authenticate, async (req, res) => {
  try {
    if (req.userRole !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }
    const students = await User.find({ role: "student", accountStatus: "approved" })
      .select("name email")
      .sort({ name: 1 })
      .lean();
    res.json({ students });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch students" });
  }
});

// Create a class (teacher or admin)
router.post("/create", authenticate, async (req, res) => {
  try {
    if (req.userRole !== "teacher" && req.userRole !== "admin") {
      return res
        .status(403)
        .json({ message: "Only teachers or admins can create classes" });
    }

    const { title, description, scheduledTime, duration, teacherId, studentIds, maxStudents, courseType } = req.body;

    // Admin can pick a teacher; teacher creates for themselves
    const assignedTeacher = req.userRole === "admin" && teacherId ? teacherId : req.userId;

    const roomId = uuidv4();

    const newClass = new Class({
      title,
      description,
      teacher: assignedTeacher,
      scheduledTime,
      duration: duration || 60,
      roomId,
      maxStudents: maxStudents || 10,
      courseType: courseType || "General",
      enrolledStudents: Array.isArray(studentIds) ? studentIds : [],
    });

    await newClass.save();
    await newClass.populate("teacher", "name email");
    await newClass.populate("enrolledStudents", "name email");

    // ── Notifications & ClassSchedule entries ──
    const teacher = await User.findById(assignedTeacher);
    const teacherName = teacher ? teacher.name : "Teacher";
    const classDuration = duration || 60;
    const schedDate = new Date(scheduledTime);

    // Map frontend courseType to ClassSchedule enum
    const courseTypeMap = {
      "Quran Nazra": "Nazra",
      "Quran Tajweed": "Tajweed",
      "Quran Hifz": "Hifz",
      "Namaz & Duas": "Translation",
      "Islamic Studies": "Tafseer",
      "General": "Nazra",
    };
    const scheduleCourseType = courseTypeMap[courseType] || "Nazra";

    const fmtDate = schedDate.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Create ClassSchedule + Notification for each enrolled student
    const enrolledIds = Array.isArray(studentIds) ? studentIds : [];
    console.log(`Creating ClassSchedule for ${enrolledIds.length} students, teacher: ${assignedTeacher}`);

    for (const sid of enrolledIds) {
      try {
        // Create ClassSchedule so it appears in student & teacher dashboards
        const schedule = new ClassSchedule({
          userId: sid,
          teacherId: assignedTeacher,
          courseType: scheduleCourseType,
          teacherName: teacherName,
          scheduledDate: schedDate,
          duration: classDuration,
          status: "scheduled",
          roomId,
          notes: description || "",
        });
        await schedule.save();
        console.log(`ClassSchedule created for student ${sid}, id: ${schedule._id}`);

        // Auto-assign teacher ↔ student relationship
        if (teacher) {
          const alreadyAssigned = (teacher.assignedStudents || []).some(
            (s) => s.toString() === sid.toString()
          );
          if (!alreadyAssigned) {
            teacher.assignedStudents = teacher.assignedStudents || [];
            teacher.assignedStudents.push(sid);
          }
        }
        const student = await User.findById(sid);
        if (student && (!student.assignedTeacher || student.assignedTeacher.toString() !== assignedTeacher.toString())) {
          student.assignedTeacher = assignedTeacher;
          await student.save();
        }

        // Notify student
        await Notification.create({
          userId: sid,
          type: "class_scheduled",
          title: "New Class Scheduled",
          message: `Your ${courseType || "General"} class "${title}" with ${teacherName} is scheduled for ${fmtDate} (${classDuration} min).`,
          metadata: {
            classId: schedule._id,
            courseType: scheduleCourseType,
            scheduledDate: schedDate,
            teacherName,
            roomId,
          },
        });
        console.log(`Notification sent to student ${sid}`);
      } catch (innerErr) {
        console.error(`Error creating schedule/notification for student ${sid}:`, innerErr);
      }
    }

    // Save teacher (in case assignedStudents was updated)
    if (teacher && enrolledIds.length > 0) {
      await teacher.save();
    }

    // Notify teacher (if admin is creating)
    if (req.userRole === "admin" && assignedTeacher && assignedTeacher.toString() !== req.userId.toString()) {
      try {
        const studentNames = newClass.enrolledStudents.map((s) => s.name).join(", ");
        await Notification.create({
          userId: assignedTeacher,
          type: "class_scheduled",
          title: "New Class Assigned",
          message: `Admin scheduled "${title}" (${courseType || "General"}) for ${fmtDate} (${classDuration} min).${studentNames ? ` Students: ${studentNames}` : ""}`,
          metadata: {
            courseType: scheduleCourseType,
            scheduledDate: schedDate,
            teacherName,
            roomId,
          },
        });
        console.log(`Notification sent to teacher ${assignedTeacher}`);
      } catch (notifErr) {
        console.error("Error notifying teacher:", notifErr);
      }
    }

    res.status(201).json({
      message: "Class created and notifications sent",
      class: newClass,
    });
  } catch (error) {
    console.error("Create class error:", error);
    res
      .status(500)
      .json({ message: "Failed to create class", error: error.message });
  }
});

// Get all classes
router.get("/all", authenticate, async (req, res) => {
  try {
    const classes = await Class.find()
      .populate("teacher", "name email")
      .sort({ scheduledTime: 1 });

    res.json({ classes });
  } catch (error) {
    console.error("Get classes error:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch classes", error: error.message });
  }
});

// Enroll in a class
router.post("/enroll/:classId", authenticate, async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.classId).populate("teacher", "name email");

    if (!classItem) {
      return res.status(404).json({ message: "Class not found" });
    }

    if (classItem.enrolledStudents.includes(req.userId)) {
      return res.status(400).json({ message: "Already enrolled" });
    }

    if (classItem.enrolledStudents.length >= classItem.maxStudents) {
      return res.status(400).json({ message: "Class is full" });
    }

    classItem.enrolledStudents.push(req.userId);
    await classItem.save();

    // Create ClassSchedule entry for this student
    const courseTypeMap = {
      "Quran Nazra": "Nazra",
      "Quran Tajweed": "Tajweed",
      "Quran Hifz": "Hifz",
      "Namaz & Duas": "Translation",
      "Islamic Studies": "Tafseer",
      "General": "Nazra",
    };
    const scheduleCourseType = courseTypeMap[classItem.courseType] || "Nazra";
    const teacherName = classItem.teacher?.name || "Teacher";

    const schedule = new ClassSchedule({
      userId: req.userId,
      teacherId: classItem.teacher?._id,
      courseType: scheduleCourseType,
      teacherName,
      scheduledDate: classItem.scheduledTime,
      duration: classItem.duration,
      status: "scheduled",
      roomId: classItem.roomId,
      notes: classItem.description || "",
    });
    await schedule.save();

    const fmtDate = new Date(classItem.scheduledTime).toLocaleString("en-US", {
      weekday: "short", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

    // Notify the student
    await Notification.create({
      userId: req.userId,
      type: "class_scheduled",
      title: "Enrolled in Class",
      message: `You enrolled in "${classItem.title}" with ${teacherName} on ${fmtDate} (${classItem.duration} min).`,
      metadata: {
        classId: schedule._id,
        courseType: scheduleCourseType,
        scheduledDate: classItem.scheduledTime,
        teacherName,
        roomId: classItem.roomId,
      },
    });

    // Notify the teacher about new enrollment
    if (classItem.teacher?._id) {
      const student = await User.findById(req.userId);
      await Notification.create({
        userId: classItem.teacher._id,
        type: "class_scheduled",
        title: "New Student Enrolled",
        message: `${student?.name || "A student"} enrolled in your class "${classItem.title}" on ${fmtDate}.`,
        metadata: {
          classId: schedule._id,
          courseType: scheduleCourseType,
          scheduledDate: classItem.scheduledTime,
          teacherName,
          roomId: classItem.roomId,
        },
      });
    }

    res.json({ message: "Enrolled successfully", class: classItem });
  } catch (error) {
    console.error("Enroll error:", error);
    res.status(500).json({ message: "Failed to enroll", error: error.message });
  }
});

// Get class by room ID
router.get("/room/:roomId", authenticate, async (req, res) => {
  try {
    const classItem = await Class.findOne({ roomId: req.params.roomId })
      .populate("teacher", "name email")
      .populate("enrolledStudents", "name email");

    if (!classItem) {
      return res.status(404).json({ message: "Class not found" });
    }

    res.json({ class: classItem });
  } catch (error) {
    console.error("Get class error:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch class", error: error.message });
  }
});

module.exports = router;
