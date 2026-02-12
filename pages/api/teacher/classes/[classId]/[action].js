import dbConnect from "../../../../../lib/dbConnect";
import { requireRoleApproved } from "../../../../../lib/auth";
import User from "../../../../../lib/models/User";
import ClassSchedule from "../../../../../lib/models/ClassSchedule";
import ActivityLog from "../../../../../lib/models/ActivityLog";
import Notification from "../../../../../lib/models/Notification";

export default async function handler(req, res) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const user = await requireRoleApproved(req, res, "teacher");
  if (!user) return;

  await dbConnect();
  const { classId, action } = req.query;
  const teacherId = user._id;

  try {
    if (action === "status") {
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

      return res.json({
        message: "Class status updated",
        class: classSchedule,
      });
    }

    if (action === "cancel") {
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

      return res.json({
        message: "Class cancelled and student notified",
        class: cls,
      });
    }

    if (action === "reschedule") {
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

      return res.json({
        message: "Class rescheduled and student notified",
        class: cls,
      });
    }

    res.status(400).json({ message: "Invalid action" });
  } catch (error) {
    console.error("Teacher class action error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
