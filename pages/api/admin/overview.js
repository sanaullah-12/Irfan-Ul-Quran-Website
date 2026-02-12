import dbConnect from "../../../lib/dbConnect";
import { requireRole } from "../../../lib/auth";
import User from "../../../lib/models/User";
import ClassSchedule from "../../../lib/models/ClassSchedule";
import ResourceRequest from "../../../lib/models/ResourceRequest";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const user = await requireRole(req, res, "admin");
  if (!user) return;

  try {
    await dbConnect();
    const now = new Date();

    const [
      totalStudents,
      totalTeachers,
      totalUsers,
      blockedUsers,
      totalClasses,
      upcomingClasses,
      completedClasses,
      pendingResources,
    ] = await Promise.all([
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "teacher" }),
      User.countDocuments(),
      User.countDocuments({ accountStatus: "blocked" }),
      ClassSchedule.countDocuments(),
      ClassSchedule.countDocuments({
        scheduledDate: { $gte: now },
        status: "scheduled",
      }),
      ClassSchedule.countDocuments({ status: "completed" }),
      ResourceRequest.countDocuments({ status: "pending" }),
    ]);

    res.json({
      stats: {
        totalStudents,
        totalTeachers,
        totalUsers,
        blockedUsers,
        totalClasses,
        upcomingClasses,
        completedClasses,
        pendingResources,
      },
    });
  } catch (error) {
    console.error("Admin overview error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
