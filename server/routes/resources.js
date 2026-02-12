const express = require("express");
const router = express.Router();
const {
  authMiddleware,
  requireResourceAccess,
} = require("../middleware/authMiddleware");
const ResourceRequest = require("../models/ResourceRequest");
const User = require("../models/User");

// ─── RESOURCE ACCESS CHECK (backend enforcement) ────────────────
// This endpoint is called before loading any actual resources.
// Admin → always allowed
// Others → only if resourceAccess === true
router.get("/check-access", authMiddleware, async (req, res) => {
  try {
    if (req.userRole === "admin") {
      return res.json({ hasAccess: true });
    }
    const user = await User.findById(req.userId).select("resourceAccess");
    if (user.resourceAccess) {
      return res.json({ hasAccess: true });
    }
    // Check if there's a pending request
    const pendingReq = await ResourceRequest.findOne({
      userId: req.userId,
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
});

// Request resource access
router.post("/request", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { message } = req.body;

    // Check if user already has access
    if (req.user.resourceAccess) {
      return res
        .status(400)
        .json({ message: "You already have resource access" });
    }

    // Check for existing pending request
    const existingRequest = await ResourceRequest.findOne({
      userId,
      status: "pending",
    });

    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "You already have a pending request" });
    }

    const request = new ResourceRequest({
      userId,
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
});

// Check resource access status
router.get("/status", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select("resourceAccess");

    const pendingReq = await ResourceRequest.findOne({
      userId,
      status: "pending",
    });

    const latestRequest = await ResourceRequest.findOne({ userId })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      hasAccess: user.resourceAccess,
      pendingRequest: !!pendingReq,
      latestRequest: latestRequest || null,
    });
  } catch (error) {
    console.error("Resource status error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
