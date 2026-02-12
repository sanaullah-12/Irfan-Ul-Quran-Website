import dbConnect from "../../../../lib/dbConnect";
import { requireAuth } from "../../../../lib/auth";
import User from "../../../../lib/models/User";
import ClassSchedule from "../../../../lib/models/ClassSchedule";
import ActivityLog from "../../../../lib/models/ActivityLog";

export default async function handler(req, res) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const user = await requireAuth(req, res);
  if (!user) return;

  try {
    await dbConnect();
    const { classId } = req.query;
    const { status } = req.body;

    const classSchedule = await ClassSchedule.findOneAndUpdate(
      { _id: classId, userId: user._id },
      { status },
      { new: true },
    );

    if (!classSchedule) {
      return res.status(404).json({ message: "Class not found" });
    }

    if (status === "completed") {
      await User.findByIdAndUpdate(user._id, {
        $inc: { totalClassesTaken: 1 },
      });
      await ActivityLog.create({
        userId: user._id,
        activityType: "class_attended",
        activityDetails: { classId },
      });
    }

    res.json({ message: "Class status updated", class: classSchedule });
  } catch (error) {
    console.error("Update class status error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
