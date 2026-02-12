import dbConnect from "../../../../lib/dbConnect";
import { requireRole } from "../../../../lib/auth";
import User from "../../../../lib/models/User";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const user = await requireRole(req, res, "admin");
  if (!user) return;

  try {
    await dbConnect();
    const { role, status, search } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (status) filter.accountStatus = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ users });
  } catch (error) {
    console.error("Admin get users error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
