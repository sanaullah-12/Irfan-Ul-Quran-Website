import dbConnect from "../../../lib/dbConnect";
import User from "../../../lib/models/User";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await dbConnect();
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    let assignedRole = "student";
    if (User.isAdminEmail(email)) {
      assignedRole = "admin";
    } else if (role === "teacher" || role === "student") {
      assignedRole = role;
    }
    if (role === "admin" && !User.isAdminEmail(email)) {
      assignedRole = "student";
    }

    const user = new User({
      name,
      email,
      password,
      role: assignedRole,
      accountStatus: "approved",
      resourceAccess: assignedRole === "admin",
    });
    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" },
    );

    res.status(201).json({
      message: "Account created successfully",
      token,
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
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
