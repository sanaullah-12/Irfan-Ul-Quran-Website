import dbConnect from "../../../../../lib/dbConnect";
import { requireRole } from "../../../../../lib/auth";
import ClassSchedule from "../../../../../lib/models/ClassSchedule";
import Notification from "../../../../../lib/models/Notification";

export default async function handler(req, res) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const admin = await requireRole(req, res, "admin");
  if (!admin) return;

  await dbConnect();
  const { classId, action } = req.query;

  try {
    if (action === "cancel") {
      const { reason } = req.body;
      const cls = await ClassSchedule.findById(classId);
      if (!cls) return res.status(404).json({ message: "Class not found" });

      cls.status = "cancelled";
      if (reason)
        cls.notes =
          (cls.notes ? cls.notes + " | " : "") + "Cancelled: " + reason;
      await cls.save();

      const fmtDate = new Date(cls.scheduledDate).toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

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

      return res.json({
        message: "Class cancelled and notifications sent",
        class: cls,
      });
    }

    if (action === "reschedule") {
      const { scheduledDate, duration } = req.body;
      if (!scheduledDate)
        return res.status(400).json({ message: "New date is required" });

      const cls = await ClassSchedule.findById(classId);
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

      return res.json({
        message: "Class rescheduled and notifications sent",
        class: cls,
      });
    }

    res.status(400).json({ message: "Invalid action" });
  } catch (error) {
    console.error("Admin class action error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
