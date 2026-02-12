import dbConnect from "../../../../lib/dbConnect";
import { requireRole } from "../../../../lib/auth";
import ClassSchedule from "../../../../lib/models/ClassSchedule";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const user = await requireRole(req, res, "admin");
  if (!user) return;

  try {
    await dbConnect();
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
}
