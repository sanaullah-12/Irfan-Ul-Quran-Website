import dbConnect from "../../../lib/dbConnect";
import { requireAuth } from "../../../lib/auth";
import User from "../../../lib/models/User";
import CourseEnrollment from "../../../lib/models/CourseEnrollment";
import ClassSchedule from "../../../lib/models/ClassSchedule";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const user = await requireAuth(req, res);
  if (!user) return;

  try {
    await dbConnect();
    const userId = user._id;

    const fullUser = await User.findById(userId).select("-password");
    if (!fullUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const now = new Date();
    const [coursesEnrolled, upcomingClasses, completedClasses] =
      await Promise.all([
        CourseEnrollment.countDocuments({ userId, status: "active" }),
        ClassSchedule.countDocuments({
          userId,
          scheduledDate: { $gte: now },
          status: "scheduled",
        }),
        ClassSchedule.countDocuments({ userId, status: "completed" }),
      ]);

    res.json({
      user: {
        name: fullUser.name,
        email: fullUser.email,
        plan: fullUser.plan,
        planExpiryDate: fullUser.planExpiryDate,
        hoursRemaining: fullUser.hoursRemaining,
        lastActivity: fullUser.lastActivity,
      },
      stats: {
        totalClassesTaken: completedClasses,
        upcomingClasses,
        coursesEnrolled,
      },
    });
  } catch (error) {
    console.error("Dashboard overview error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
