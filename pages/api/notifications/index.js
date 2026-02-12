import dbConnect from "../../../lib/dbConnect";
import { requireAuth } from "../../../lib/auth";
import Notification from "../../../lib/models/Notification";

export default async function handler(req, res) {
  const user = await requireAuth(req, res);
  if (!user) return;

  await dbConnect();

  if (req.method === "GET") {
    try {
      const limit = parseInt(req.query.limit) || 30;
      const notifications = await Notification.find({ userId: user._id })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      const unreadCount = await Notification.countDocuments({
        userId: user._id,
        read: false,
      });

      res.json({ notifications, unreadCount });
    } catch (error) {
      console.error("Get notifications error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  } else if (req.method === "DELETE") {
    // Clear read notifications
    try {
      await Notification.deleteMany({ userId: user._id, read: true });
      res.json({ message: "Read notifications cleared" });
    } catch (error) {
      console.error("Clear notifications error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
