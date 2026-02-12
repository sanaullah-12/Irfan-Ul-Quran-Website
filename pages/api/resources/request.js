import dbConnect from "../../../lib/dbConnect";
import { requireAuth } from "../../../lib/auth";
import ResourceRequest from "../../../lib/models/ResourceRequest";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const user = await requireAuth(req, res);
  if (!user) return;

  try {
    await dbConnect();
    const { message } = req.body;

    if (user.resourceAccess) {
      return res
        .status(400)
        .json({ message: "You already have resource access" });
    }

    const existingRequest = await ResourceRequest.findOne({
      userId: user._id,
      status: "pending",
    });

    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "You already have a pending request" });
    }

    const request = new ResourceRequest({
      userId: user._id,
      requestMessage:
        message || "Please grant me access to learning resources.",
    });
    await request.save();

    res
      .status(201)
      .json({ message: "Resource access request submitted", request });
  } catch (error) {
    console.error("Resource request error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
