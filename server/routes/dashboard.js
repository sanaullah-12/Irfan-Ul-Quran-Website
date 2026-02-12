const express = require("express");
const router = express.Router();
const {
  authMiddleware,
  requireRole,
  requireApproved,
} = require("../middleware/authMiddleware");
const User = require("../models/User");
const CourseEnrollment = require("../models/CourseEnrollment");
const ClassSchedule = require("../models/ClassSchedule");
const ActivityLog = require("../models/ActivityLog");

// Get Dashboard Overview
router.get("/overview", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    // Get user data
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get course enrollments count
    const coursesEnrolled = await CourseEnrollment.countDocuments({
      userId,
      status: "active",
    });

    // Get upcoming classes count
    const now = new Date();
    const upcomingClasses = await ClassSchedule.countDocuments({
      userId,
      scheduledDate: { $gte: now },
      status: "scheduled",
    });

    // Get completed classes count
    const completedClasses = await ClassSchedule.countDocuments({
      userId,
      status: "completed",
    });

    res.json({
      user: {
        name: user.name,
        email: user.email,
        plan: user.plan,
        planExpiryDate: user.planExpiryDate,
        hoursRemaining: user.hoursRemaining,
        lastActivity: user.lastActivity,
      },
      stats: {
        totalClassesTaken: completedClasses,
        upcomingClasses,
        coursesEnrolled,
      },
    });
  } catch (error) {
    console.error("Dashboard overview error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get Recent Activities
router.get("/activities", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const limit = parseInt(req.query.limit) || 10;

    const activities = await ActivityLog.find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    res.json({ activities });
  } catch (error) {
    console.error("Activities error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Log Activity
router.post("/activities", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { activityType, activityDetails } = req.body;

    const activity = new ActivityLog({
      userId,
      activityType,
      activityDetails,
    });

    await activity.save();

    // Update user's last activity
    await User.findByIdAndUpdate(userId, { lastActivity: new Date() });

    res.status(201).json({ message: "Activity logged", activity });
  } catch (error) {
    console.error("Log activity error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get Upcoming Classes
router.get("/classes/upcoming", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const now = new Date();

    const upcomingClasses = await ClassSchedule.find({
      userId,
      scheduledDate: { $gte: now },
      status: "scheduled",
    })
      .sort({ scheduledDate: 1 })
      .limit(10)
      .lean();

    res.json({ classes: upcomingClasses });
  } catch (error) {
    console.error("Upcoming classes error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get Class History
router.get("/classes/history", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const now = new Date();

    const classHistory = await ClassSchedule.find({
      userId,
      $or: [
        { scheduledDate: { $lt: now }, status: "scheduled" },
        { status: { $in: ["completed", "missed", "cancelled"] } },
      ],
    })
      .sort({ scheduledDate: -1 })
      .limit(20)
      .lean();

    res.json({ classes: classHistory });
  } catch (error) {
    console.error("Class history error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get Next Class (for countdown)
router.get("/classes/next", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const now = new Date();

    const nextClass = await ClassSchedule.findOne({
      userId,
      scheduledDate: { $gte: now },
      status: "scheduled",
    })
      .sort({ scheduledDate: 1 })
      .lean();

    res.json({ nextClass });
  } catch (error) {
    console.error("Next class error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get Enrolled Courses
router.get("/courses", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const courses = await CourseEnrollment.find({ userId })
      .sort({ enrollmentDate: -1 })
      .lean();

    res.json({ courses });
  } catch (error) {
    console.error("Courses error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update Class Status (for marking attendance)
router.patch("/classes/:classId/status", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { classId } = req.params;
    const { status } = req.body;

    const classSchedule = await ClassSchedule.findOneAndUpdate(
      { _id: classId, userId },
      { status },
      { new: true },
    );

    if (!classSchedule) {
      return res.status(404).json({ message: "Class not found" });
    }

    // If completed, increment user's total classes taken
    if (status === "completed") {
      await User.findByIdAndUpdate(userId, {
        $inc: { totalClassesTaken: 1 },
      });

      // Log activity
      await ActivityLog.create({
        userId,
        activityType: "class_attended",
        activityDetails: {
          classId,
        },
      });
    }

    res.json({ message: "Class status updated", class: classSchedule });
  } catch (error) {
    console.error("Update class status error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get Payment & Plan Info
router.get("/payment-info", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).select(
      "plan planExpiryDate hoursRemaining paymentHistory",
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      plan: user.plan,
      planExpiryDate: user.planExpiryDate,
      hoursRemaining: user.hoursRemaining,
      paymentHistory: user.paymentHistory,
    });
  } catch (error) {
    console.error("Payment info error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
