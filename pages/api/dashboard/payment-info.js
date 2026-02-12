import dbConnect from "../../../lib/dbConnect";
import { requireAuth } from "../../../lib/auth";
import User from "../../../lib/models/User";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const user = await requireAuth(req, res);
  if (!user) return;

  try {
    await dbConnect();
    const fullUser = await User.findById(user._id).select(
      "plan planExpiryDate hoursRemaining paymentHistory",
    );

    if (!fullUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      plan: fullUser.plan,
      planExpiryDate: fullUser.planExpiryDate,
      hoursRemaining: fullUser.hoursRemaining,
      paymentHistory: fullUser.paymentHistory,
    });
  } catch (error) {
    console.error("Payment info error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
