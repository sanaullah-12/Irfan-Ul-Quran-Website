import dbConnect from "../../../lib/dbConnect";
import { requireAuth } from "../../../lib/auth";
import Stripe from "stripe";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const user = await requireAuth(req, res);
  if (!user) return;

  try {
    await dbConnect();
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { plan } = req.body;

    const prices = {
      basic: 2000,
      standard: 4000,
      premium: 6000,
    };

    const amount = prices[plan];
    if (!amount) {
      return res.status(400).json({ message: "Invalid plan" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "eur",
      automatic_payment_methods: { enabled: true },
      metadata: { userId: user._id.toString(), plan },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Payment intent error:", error);
    res
      .status(500)
      .json({ message: "Payment creation failed", error: error.message });
  }
}
