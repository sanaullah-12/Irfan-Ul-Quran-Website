import dbConnect from "../../../../lib/dbConnect";
import { requireRole } from "../../../../lib/auth";
import ResourceRequest from "../../../../lib/models/ResourceRequest";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const user = await requireRole(req, res, "admin");
  if (!user) return;

  try {
    await dbConnect();
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const requests = await ResourceRequest.find(filter)
      .populate("userId", "name email role")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ requests });
  } catch (error) {
    console.error("Get resource requests error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
