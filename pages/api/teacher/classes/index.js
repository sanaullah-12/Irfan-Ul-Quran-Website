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
    const teacherId = user._id;
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
}
