import React, { useState } from "react";
import Head from "next/head";
import Layout from "../components/Layout";
import ProtectedRoute from "../components/ProtectedRoute";
import { motion } from "framer-motion";
import { FaCheck, FaStar } from "react-icons/fa";
import { loadStripe } from "@stripe/stripe-js";
import api from "../utils/api";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
);

export default function Plans() {
  const [loading, setLoading] = useState<string | null>(null);

  const plans = [
    {
      name: "Basic Plan",
      price: "€20",
      period: "per hour",
      plan: "basic",
      features: [
        "Nazra Quran learning",
        "Basic Arabic reading",
        "One-on-one sessions",
        "Flexible scheduling",
        "Progress tracking",
      ],
      description: "Perfect for beginners starting their Quran journey",
      color: "from-blue-500 to-blue-600",
    },
    {
      name: "Standard Plan",
      price: "€40",
      period: "per hour",
      plan: "standard",
      popular: true,
      features: [
        "Everything in Basic",
        "Tajweed rules & practice",
        "Daily Duas instruction",
        "Namaz (Prayer) guidance",
        "Islamic etiquette lessons",
        "Homework assignments",
      ],
      description: "Most popular choice for comprehensive learning",
      color: "from-primary-600 to-secondary-600",
    },
    {
      name: "Premium Plan",
      price: "€60",
      period: "per hour",
      plan: "premium",
      features: [
        "Everything in Standard",
        "Complete Quran with Tajweed",
        "Hadith studies",
        "Islamic history lessons",
        "Personal mentoring",
        "Hifz (memorization) program",
        "Priority support",
        "Certificate upon completion",
      ],
      description: "Complete Islamic education package",
      color: "from-purple-500 to-purple-600",
    },
  ];

  const handlePurchase = async (plan: string) => {
    setLoading(plan);

    try {
      // Create payment intent
      const response = await api.post("/payment/create-payment-intent", {
        plan,
      });
      const { clientSecret } = response.data;

      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Stripe not loaded");
      }

      // Redirect to Stripe checkout
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: {
              token: "tok_visa", // In production, use Stripe Elements
            },
          },
        },
      );

      if (error) {
        alert("Payment failed: " + error.message);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // Confirm payment on backend
        await api.post("/payment/confirm-payment", {
          paymentIntentId: paymentIntent.id,
          plan,
        });

        alert("Payment successful! Your plan is now active.");
        window.location.reload();
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <Head>
          <title>Pricing Plans - Quran Learning Platform</title>
        </Head>

        <div className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-4">
                Choose Your Learning Plan
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                Select the perfect plan for your Quran learning journey. All
                plans include live classes with certified teachers.
              </p>
            </motion.div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`relative bg-white dark:bg-dark-card rounded-2xl shadow-xl border border-slate-100 dark:border-dark-border overflow-hidden ${
                    plan.popular ? "ring-4 ring-gold transform scale-105" : ""
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0 bg-gold text-white px-4 py-1 rounded-bl-lg flex items-center space-x-1">
                      <FaStar />
                      <span className="font-semibold text-sm">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div
                    className={`bg-gradient-to-r ${plan.color} p-8 text-white`}
                  >
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <div className="flex items-baseline mb-2">
                      <span className="text-5xl font-bold">{plan.price}</span>
                      <span className="ml-2 text-lg opacity-90">
                        {plan.period}
                      </span>
                    </div>
                    <p className="text-sm opacity-90">{plan.description}</p>
                  </div>

                  <div className="p-8">
                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start space-x-3">
                          <FaCheck className="text-primary-700 dark:text-primary-400 mt-1 flex-shrink-0" />
                          <span className="text-slate-700 dark:text-slate-300">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handlePurchase(plan.plan)}
                      disabled={loading === plan.plan}
                      className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
                        plan.popular
                          ? "bg-gold hover:bg-yellow-600 text-white"
                          : "bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white"
                      } disabled:opacity-50`}
                    >
                      {loading === plan.plan ? "Processing..." : "Select Plan"}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Additional Info */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-16 bg-white dark:bg-dark-card rounded-2xl shadow-xl border border-slate-100 dark:border-dark-border p-8 text-center"
            >
              <h3 className="text-2xl font-bold text-primary-700 dark:text-primary-400 mb-4">
                All Plans Include
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-slate-700 dark:text-slate-300">
                <div>
                  <p className="font-semibold">✓ Live Video Classes</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Interactive sessions with screen sharing
                  </p>
                </div>
                <div>
                  <p className="font-semibold">✓ Flexible Scheduling</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Book classes at your convenience
                  </p>
                </div>
                <div>
                  <p className="font-semibold">✓ Progress Tracking</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Monitor your learning journey
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
