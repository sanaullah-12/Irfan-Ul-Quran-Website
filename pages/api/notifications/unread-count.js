import dbConnect from "../../../lib/dbConnect";
import { requireAuth } from "../../../lib/auth";
import Notification from "../../../lib/models/Notification";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const user = await requireAuth(req, res);
  if (!user) return;

  try {
    await dbConnect();
    const count = await Notification.countDocuments({
      userId: user._id,
      read: false,
    });
    res.json({ count });
  } catch (error) {
    console.error("Unread count error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
