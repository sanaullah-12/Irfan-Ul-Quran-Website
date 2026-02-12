import dbConnect from "../../../lib/dbConnect";
import { requireAuth } from "../../../lib/auth";
import Notification from "../../../lib/models/Notification";

export default async function handler(req, res) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const user = await requireAuth(req, res);
  if (!user) return;

  try {
    await dbConnect();
    await Notification.updateMany(
      { userId: user._id, read: false },
      { read: true },
    );
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Mark all read error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
