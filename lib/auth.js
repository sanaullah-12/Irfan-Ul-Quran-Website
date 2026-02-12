import jwt from "jsonwebtoken";
import dbConnect from "./dbConnect";
import User from "./models/User";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

/**
 * Authenticate a Next.js API request.
 * Returns the user document (without password) or null.
 */
export async function authenticate(req) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET);
    await dbConnect();
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) return null;
    if (user.accountStatus === "blocked") return null;
    return user;
  } catch {
    return null;
  }
}

/**
 * Require authentication — sends 401 if not authenticated.
 * Returns user or null (after sending response).
 */
export async function requireAuth(req, res) {
  const user = await authenticate(req);
  if (!user) {
    res.status(401).json({ message: "Authentication required" });
    return null;
  }
  return user;
}

/**
 * Require specific role(s) — sends 403 if role doesn't match.
 * Returns user or null (after sending response).
 */
export async function requireRole(req, res, ...roles) {
  const user = await requireAuth(req, res);
  if (!user) return null; // 401 already sent

  if (!roles.includes(user.role)) {
    res
      .status(403)
      .json({ message: "Access denied. Insufficient permissions." });
    return null;
  }
  return user;
}

/**
 * Require approved account — sends 403 if not approved (admins always pass).
 */
export async function requireApproved(req, res) {
  const user = await requireAuth(req, res);
  if (!user) return null;

  if (user.role !== "admin" && user.accountStatus !== "approved") {
    res.status(403).json({
      message: "Your account is pending approval.",
      accountStatus: user.accountStatus,
    });
    return null;
  }
  return user;
}

/**
 * Require role + approved.
 */
export async function requireRoleApproved(req, res, ...roles) {
  const user = await requireAuth(req, res);
  if (!user) return null;

  if (!roles.includes(user.role)) {
    res
      .status(403)
      .json({ message: "Access denied. Insufficient permissions." });
    return null;
  }

  if (user.role !== "admin" && user.accountStatus !== "approved") {
    res.status(403).json({
      message: "Your account is pending approval.",
      accountStatus: user.accountStatus,
    });
    return null;
  }

  return user;
}
