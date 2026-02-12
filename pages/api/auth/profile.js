import dbConnect from "../../../lib/dbConnect";
import User from "../../../lib/models/User";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key",
    );
    await dbConnect();
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
        accountStatus: user.accountStatus,
        resourceAccess: user.resourceAccess,
      },
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
}
