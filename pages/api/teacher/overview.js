import dbConnect from "../../../lib/dbConnect";
import { requireRoleApproved } from "../../../lib/auth";
import User from "../../../lib/models/User";
import ClassSchedule from "../../../lib/models/ClassSchedule";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const user = await requireRoleApproved(req, res, "teacher");
  if (!user) return;

  try {
    await dbConnect();
    const teacherId = user._id;
    const now = new Date();

    const teacher = await User.findById(teacherId)
      .select("-password")
      .populate("assignedStudents", "name email plan accountStatus");

    const [totalClasses, upcomingClasses, completedClasses] = await Promise.all(
      [
        ClassSchedule.countDocuments({ teacherId }),
        ClassSchedule.countDocuments({
          teacherId,
          scheduledDate: { $gte: now },
          status: "scheduled",
        }),
        ClassSchedule.countDocuments({ teacherId, status: "completed" }),
      ],
    );

    res.json({
      teacher: { name: teacher.name, email: teacher.email },
      assignedStudents: teacher.assignedStudents || [],
      stats: {
        totalStudents: (teacher.assignedStudents || []).length,
        totalClasses,
        upcomingClasses,
        completedClasses,
      },
    });
  } catch (error) {
    console.error("Teacher overview error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
