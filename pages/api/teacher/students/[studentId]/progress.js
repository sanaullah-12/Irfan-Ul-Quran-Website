import dbConnect from "../../../../../lib/dbConnect";
import { requireRoleApproved } from "../../../../../lib/auth";
import User from "../../../../../lib/models/User";
import ActivityLog from "../../../../../lib/models/ActivityLog";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const user = await requireRoleApproved(req, res, "teacher");
  if (!user) return;

  try {
    await dbConnect();
    const { studentId } = req.query;
    const { note, courseType } = req.body;

    const teacher = await User.findById(user._id);
    if (!teacher.assignedStudents.includes(studentId)) {
      return res.status(403).json({ message: "Student not assigned to you" });
    }

    await ActivityLog.create({
      userId: studentId,
      activityType: "progress_note",
      activityDetails: {
        resourceName: `Progress Note: ${note}`,
        courseType,
      },
    });

    res.json({ message: "Progress note added" });
  } catch (error) {
    console.error("Progress note error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
