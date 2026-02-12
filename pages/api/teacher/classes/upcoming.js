import dbConnect from "../../../../lib/dbConnect";
import { requireRoleApproved } from "../../../../lib/auth";
import ClassSchedule from "../../../../lib/models/ClassSchedule";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const user = await requireRoleApproved(req, res, "teacher");
  if (!user) return;

  try {
    await dbConnect();
    const now = new Date();

    const classes = await ClassSchedule.find({
      teacherId: user._id,
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
}
