import dbConnect from "../../../lib/dbConnect";
import { requireAuth } from "../../../lib/auth";
import User from "../../../lib/models/User";
import ResourceRequest from "../../../lib/models/ResourceRequest";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const user = await requireAuth(req, res);
  if (!user) return;

  try {
    await dbConnect();
    const fullUser = await User.findById(user._id).select("resourceAccess");

    const pendingReq = await ResourceRequest.findOne({
      userId: user._id,
      status: "pending",
    });

    const latestRequest = await ResourceRequest.findOne({ userId: user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      hasAccess: fullUser.resourceAccess,
      pendingRequest: !!pendingReq,
      latestRequest: latestRequest || null,
    });
  } catch (error) {
    console.error("Resource status error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
