import dbConnect from "../../../lib/dbConnect";
import { requireAuth } from "../../../lib/auth";
import User from "../../../lib/models/User";
import ActivityLog from "../../../lib/models/ActivityLog";

export default async function handler(req, res) {
  const user = await requireAuth(req, res);
  if (!user) return;

  await dbConnect();
  const userId = user._id;

  if (req.method === "GET") {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const activities = await ActivityLog.find({ userId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .lean();
      res.json({ activities });
    } catch (error) {
      console.error("Activities error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  } else if (req.method === "POST") {
    try {
      const { activityType, activityDetails } = req.body;
      const activity = new ActivityLog({
        userId,
        activityType,
        activityDetails,
      });
      await activity.save();
      await User.findByIdAndUpdate(userId, { lastActivity: new Date() });
      res.status(201).json({ message: "Activity logged", activity });
    } catch (error) {
      console.error("Log activity error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
