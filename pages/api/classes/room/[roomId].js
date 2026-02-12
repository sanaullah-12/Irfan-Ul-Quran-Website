import dbConnect from "../../../../lib/dbConnect";
import { requireAuth } from "../../../../lib/auth";
import Class from "../../../../lib/models/Class";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const user = await requireAuth(req, res);
  if (!user) return;

  try {
    await dbConnect();
    const { roomId } = req.query;
    const classItem = await Class.findOne({ roomId })
      .populate("teacher", "name email")
      .populate("enrolledStudents", "name email");

    if (!classItem) {
      return res.status(404).json({ message: "Class not found" });
    }

    res.json({ class: classItem });
  } catch (error) {
    console.error("Get class error:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch class", error: error.message });
  }
}
