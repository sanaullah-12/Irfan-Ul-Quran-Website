import dbConnect from "../../../lib/dbConnect";
import { requireAuth } from "../../../lib/auth";
import User from "../../../lib/models/User";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const user = await requireAuth(req, res);
  if (!user) return;

  if (user.role !== "admin") {
    return res.status(403).json({ message: "Admin only" });
  }

  try {
    await dbConnect();
    const teachers = await User.find({
      role: "teacher",
      accountStatus: "approved",
    })
      .select("name email")
      .sort({ name: 1 })
      .lean();
    res.json({ teachers });
  } catch {
    res.status(500).json({ message: "Failed to fetch teachers" });
  }
}
