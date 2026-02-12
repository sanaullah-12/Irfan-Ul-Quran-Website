import dbConnect from "../../../lib/dbConnect";
import { requireAuth } from "../../../lib/auth";
import User from "../../../lib/models/User";
import Stripe from "stripe";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const authUser = await requireAuth(req, res);
  if (!authUser) return;

  try {
    await dbConnect();
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { paymentIntentId, plan } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      const user = await User.findById(authUser._id);
      user.plan = plan;
      user.planExpiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      user.paymentHistory.push({
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        plan,
        stripePaymentId: paymentIntentId,
      });
      await user.save();

      res.json({
        message: "Payment successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          plan: user.plan,
          planExpiryDate: user.planExpiryDate,
        },
      });
    } else {
      res.status(400).json({ message: "Payment not successful" });
    }
  } catch (error) {
    console.error("Payment confirmation error:", error);
    res
      .status(500)
      .json({ message: "Payment confirmation failed", error: error.message });
  }
}
