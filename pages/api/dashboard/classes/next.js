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

    const nextClass = await ClassSchedule.findOne({
      userId: user._id,
      scheduledDate: { $gte: now },
      status: "scheduled",
    })
      .sort({ scheduledDate: 1 })
      .lean();

    res.json({ nextClass });
  } catch (error) {
    console.error("Next class error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
