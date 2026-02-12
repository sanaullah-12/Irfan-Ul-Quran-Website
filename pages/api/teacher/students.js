import dbConnect from "../../../lib/dbConnect";
import { requireRoleApproved } from "../../../lib/auth";
import User from "../../../lib/models/User";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const user = await requireRoleApproved(req, res, "teacher");
  if (!user) return;

  try {
    await dbConnect();
    const teacher = await User.findById(user._id).populate(
      "assignedStudents",
      "name email plan accountStatus totalClassesTaken lastActivity",
    );
    res.json({ students: teacher.assignedStudents || [] });
  } catch (error) {
    console.error("Teacher students error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
