import dbConnect from "../../../../lib/dbConnect";
import { requireAuth } from "../../../../lib/auth";
import ClassSchedule from "../../../../lib/models/ClassSchedule";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const user = await requireAuth(req, res);
  if (!user) return;

  try {
    await dbConnect();
    const now = new Date();

    const classes = await ClassSchedule.find({
      userId: user._id,
      $or: [
        { scheduledDate: { $lt: now }, status: "scheduled" },
        { status: { $in: ["completed", "missed", "cancelled"] } },
      ],
    })
      .sort({ scheduledDate: -1 })
      .limit(20)
      .lean();

    res.json({ classes });
  } catch (error) {
    console.error("Class history error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
