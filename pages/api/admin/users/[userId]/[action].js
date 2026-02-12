import dbConnect from "../../../../../lib/dbConnect";
import { requireRole } from "../../../../../lib/auth";
import User from "../../../../../lib/models/User";

export default async function handler(req, res) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const admin = await requireRole(req, res, "admin");
  if (!admin) return;

  await dbConnect();
  const { userId, action } = req.query;

  try {
    if (action === "approve") {
      const user = await User.findByIdAndUpdate(
        userId,
        { accountStatus: "approved" },
        { new: true },
      ).select("-password");
      if (!user) return res.status(404).json({ message: "User not found" });
      return res.json({ message: "User approved", user });
    }

    if (action === "block") {
      const targetUser = await User.findById(userId);
      if (!targetUser)
        return res.status(404).json({ message: "User not found" });
      if (User.isAdminEmail(targetUser.email)) {
        return res.status(403).json({ message: "Cannot block admin accounts" });
      }
      targetUser.accountStatus = "blocked";
      await targetUser.save();
      return res.json({ message: "User blocked", user: targetUser });
    }

    if (action === "reject") {
      const targetUser = await User.findById(userId);
      if (!targetUser)
        return res.status(404).json({ message: "User not found" });
      if (User.isAdminEmail(targetUser.email)) {
        return res
          .status(403)
          .json({ message: "Cannot reject admin accounts" });
      }
      targetUser.accountStatus = "blocked";
      await targetUser.save();
      return res.json({ message: "User rejected" });
    }

    if (action === "unblock") {
      const user = await User.findByIdAndUpdate(
        userId,
        { accountStatus: "approved" },
        { new: true },
      ).select("-password");
      if (!user) return res.status(404).json({ message: "User not found" });
      return res.json({ message: "User unblocked", user });
    }

    if (action === "assign-teacher") {
      const { teacherId } = req.body;
      const student = await User.findById(userId);
      const teacher = await User.findById(teacherId);

      if (!student || !teacher) {
        return res
          .status(404)
          .json({ message: "Student or teacher not found" });
      }
      if (teacher.role !== "teacher") {
        return res
          .status(400)
          .json({ message: "Selected user is not a teacher" });
      }
      if (student.role !== "student") {
        return res
          .status(400)
          .json({ message: "Selected user is not a student" });
      }

      student.assignedTeacher = teacherId;
      await student.save();

      if (!teacher.assignedStudents.includes(userId)) {
        teacher.assignedStudents.push(userId);
        await teacher.save();
      }

      return res.json({ message: "Teacher assigned to student" });
    }

    res.status(400).json({ message: "Invalid action" });
  } catch (error) {
    console.error("Admin user action error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
