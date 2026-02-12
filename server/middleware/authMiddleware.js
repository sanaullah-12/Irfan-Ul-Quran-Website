const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Base authentication middleware - verifies JWT and loads user
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key",
    );

    // Always fetch fresh user data from DB for role/status checks
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Check if account is approved (admins are always approved)
    if (user.accountStatus === "blocked") {
      return res
        .status(403)
        .json({ message: "Your account has been blocked. Contact admin." });
    }

    req.userId = user._id.toString();
    req.userEmail = user.email;
    req.userRole = user.role;
    req.userStatus = user.accountStatus;
    req.user = user;

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Role-based middleware factory
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.userRole) {
      return res.status(401).json({ message: "Authentication required" });
    }
    if (!roles.includes(req.userRole)) {
      return res
        .status(403)
        .json({ message: "Access denied. Insufficient permissions." });
    }
    next();
  };
};

// Require approved account status
const requireApproved = (req, res, next) => {
  if (req.userRole === "admin") {
    return next(); // Admins are always approved
  }
  if (req.userStatus !== "approved") {
    return res.status(403).json({
      message:
        "Your account is pending approval. Please wait for admin to approve.",
      accountStatus: req.userStatus,
    });
  }
  next();
};

// Require resource access
const requireResourceAccess = async (req, res, next) => {
  if (req.userRole === "admin") {
    return next(); // Admins always have access
  }
  if (!req.user.resourceAccess) {
    return res.status(403).json({
      message: "Resource access not granted. Please request access from admin.",
    });
  }
  next();
};

module.exports = {
  authMiddleware,
  requireRole,
  requireApproved,
  requireResourceAccess,
};
