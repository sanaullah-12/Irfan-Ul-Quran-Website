import dbConnect from "../../../lib/dbConnect";
import { requireAuth } from "../../../lib/auth";
import Class from "../../../lib/models/Class";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const user = await requireAuth(req, res);
  if (!user) return;

  try {
    await dbConnect();
    const classes = await Class.find()
      .populate("teacher", "name email")
      .sort({ scheduledTime: 1 });

    res.json({ classes });
  } catch (error) {
    console.error("Get classes error:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch classes", error: error.message });
  }
}
