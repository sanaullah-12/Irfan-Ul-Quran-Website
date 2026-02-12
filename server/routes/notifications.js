const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const Notification = require("../models/Notification");

// All routes require authentication
router.use(authMiddleware);

// ─── GET NOTIFICATIONS ──────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 30;
    const notifications = await Notification.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const unreadCount = await Notification.countDocuments({
      userId: req.userId,
      read: false,
    });

    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─── GET UNREAD COUNT ───────────────────────────────────────────
router.get("/unread-count", async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.userId,
      read: false,
    });
    res.json({ count });
  } catch (error) {
    console.error("Unread count error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─── MARK SINGLE AS READ ───────────────────────────────────────
router.patch("/:id/read", async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { read: true },
      { new: true },
    );
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json({ notification });
  } catch (error) {
    console.error("Mark read error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─── MARK ALL AS READ ───────────────────────────────────────────
router.patch("/read-all", async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.userId, read: false },
      { read: true },
    );
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Mark all read error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─── DELETE OLD NOTIFICATIONS ───────────────────────────────────
router.delete("/clear", async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.userId, read: true });
    res.json({ message: "Read notifications cleared" });
  } catch (error) {
    console.error("Clear notifications error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
