import dbConnect from "../../../lib/dbConnect";
import { requireRole } from "../../../lib/auth";
import ActivityLog from "../../../lib/models/ActivityLog";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const user = await requireRole(req, res, "admin");
  if (!user) return;

  try {
    await dbConnect();
    const limit = parseInt(req.query.limit) || 50;

    const logs = await ActivityLog.find()
      .populate("userId", "name email role")
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    res.json({ logs });
  } catch (error) {
    console.error("Activity logs error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
