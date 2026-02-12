import dbConnect from "../../../lib/dbConnect";
import { requireAuth } from "../../../lib/auth";
import CourseEnrollment from "../../../lib/models/CourseEnrollment";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const user = await requireAuth(req, res);
  if (!user) return;

  try {
    await dbConnect();
    const courses = await CourseEnrollment.find({ userId: user._id })
      .sort({ enrollmentDate: -1 })
      .lean();
    res.json({ courses });
  } catch (error) {
    console.error("Courses error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
