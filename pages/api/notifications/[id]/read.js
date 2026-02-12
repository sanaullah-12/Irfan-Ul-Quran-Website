import dbConnect from "../../../../lib/dbConnect";
import { requireAuth } from "../../../../lib/auth";
import Notification from "../../../../lib/models/Notification";

export default async function handler(req, res) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const user = await requireAuth(req, res);
  if (!user) return;

  try {
    await dbConnect();
    const { id } = req.query;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: user._id },
      { read: true },
      { new: true },
    );
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json({ notification });
  } catch (error) {
    console.error("Mark read error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
