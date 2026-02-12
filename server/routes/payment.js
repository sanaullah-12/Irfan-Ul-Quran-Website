const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to verify JWT token
const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key",
    );
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Create payment intent
router.post("/create-payment-intent", authenticate, async (req, res) => {
  try {
    const { plan } = req.body;

    const prices = {
      basic: 2000, // €20 in cents
      standard: 4000, // €40 in cents
      premium: 6000, // €60 in cents
    };

    const amount = prices[plan];

    if (!amount) {
      return res.status(400).json({ message: "Invalid plan" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "eur",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId: req.userId,
        plan,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Payment intent error:", error);
    res
      .status(500)
      .json({ message: "Payment creation failed", error: error.message });
  }
});

// Confirm payment and update user plan
router.post("/confirm-payment", authenticate, async (req, res) => {
  try {
    const { paymentIntentId, plan } = req.body;

    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      // Update user plan
      const user = await User.findById(req.userId);

      user.plan = plan;
      user.planExpiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
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
});

module.exports = router;
