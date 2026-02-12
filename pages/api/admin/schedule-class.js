import dbConnect from "../../../lib/dbConnect";
import { requireRole } from "../../../lib/auth";
import User from "../../../lib/models/User";
import ClassSchedule from "../../../lib/models/ClassSchedule";
import Notification from "../../../lib/models/Notification";
import { v4 as uuidv4 } from "uuid";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const admin = await requireRole(req, res, "admin");
  if (!admin) return;

  try {
    await dbConnect();
    const { studentId, teacherId, courseType, scheduledDate, duration, notes } =
      req.body;

    if (!studentId || !teacherId || !courseType || !scheduledDate) {
      return res.status(400).json({
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
      teacherId,
      courseType,
      teacherName: teacher.name,
      scheduledDate: new Date(scheduledDate),
      duration: duration || 60,
      status: "scheduled",
      roomId,
      notes,
    });
    await newClass.save();

    // Auto-assign teacher-student relationship
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
}
