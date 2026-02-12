import dbConnect from "../../../lib/dbConnect";
import { requireRole } from "../../../lib/auth";
import User from "../../../lib/models/User";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const user = await requireRole(req, res, "admin");
  if (!user) return;

  try {
    await dbConnect();
    const users = await User.find({
      "paymentHistory.0": { $exists: true },
    })
      .select("name email plan paymentHistory")
      .lean();

    const allPayments = [];
    users.forEach((u) => {
      u.paymentHistory.forEach((payment) => {
        allPayments.push({
          userName: u.name,
          userEmail: u.email,
          ...payment,
        });
      });
    });

    allPayments.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({ payments: allPayments });
  } catch (error) {
    console.error("Admin payments error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
