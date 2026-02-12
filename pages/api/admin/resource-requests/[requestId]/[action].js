import dbConnect from "../../../../../lib/dbConnect";
import { requireRole } from "../../../../../lib/auth";
import ResourceRequest from "../../../../../lib/models/ResourceRequest";
import User from "../../../../../lib/models/User";

export default async function handler(req, res) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const admin = await requireRole(req, res, "admin");
  if (!admin) return;

  await dbConnect();
  const { requestId, action } = req.query;

  try {
    if (action === "approve") {
      const request = await ResourceRequest.findByIdAndUpdate(
        requestId,
        { status: "approved", reviewedBy: admin._id, reviewedAt: new Date() },
        { new: true },
      );
      if (!request)
        return res.status(404).json({ message: "Request not found" });
      await User.findByIdAndUpdate(request.userId, { resourceAccess: true });
      return res.json({ message: "Resource access approved", request });
    }

    if (action === "reject") {
      const request = await ResourceRequest.findByIdAndUpdate(
        requestId,
        { status: "rejected", reviewedBy: admin._id, reviewedAt: new Date() },
        { new: true },
      );
      if (!request)
        return res.status(404).json({ message: "Request not found" });
      return res.json({ message: "Resource access rejected", request });
    }

    res.status(400).json({ message: "Invalid action" });
  } catch (error) {
    console.error("Resource request action error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
