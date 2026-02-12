import dbConnect from "../../../lib/dbConnect";
import { requireRoleApproved } from "../../../lib/auth";
import User from "../../../lib/models/User";
import ClassSchedule from "../../../lib/models/ClassSchedule";
import Notification from "../../../lib/models/Notification";
import { v4 as uuidv4 } from "uuid";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const user = await requireRoleApproved(req, res, "teacher");
  if (!user) return;

  try {
    await dbConnect();
    const { studentId, courseType, scheduledDate, duration, notes } = req.body;
    const teacherId = user._id;

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
}
