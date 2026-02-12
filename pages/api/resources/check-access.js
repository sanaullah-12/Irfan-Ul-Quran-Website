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

    if (user.role === "admin") {
      return res.json({ hasAccess: true });
    }

    const fullUser = await User.findById(user._id).select("resourceAccess");
    if (fullUser.resourceAccess) {
      return res.json({ hasAccess: true });
    }

    const pendingReq = await ResourceRequest.findOne({
      userId: user._id,
      status: "pending",
    });

    return res.json({
      hasAccess: false,
      pendingRequest: !!pendingReq,
    });
  } catch (error) {
    console.error("Resource check-access error:", error);
    res.status(500).json({ message: "Server error" });
  }
}
