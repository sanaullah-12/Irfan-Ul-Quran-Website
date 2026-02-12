import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Layout from "../components/Layout";
import { motion } from "framer-motion";
import {
  FaBook,
  FaPlay,
  FaVideo,
  FaUsers,
  FaQuran,
  FaMosque,
  FaCheckCircle,
} from "react-icons/fa";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Layout>
      <Head>
        <title>Quran Learning Platform - Read. Reflect. Rise.</title>
        <meta
          name="description"
          content="Transform your spiritual journey with expert Quran teachers. Learn Tajweed, memorization, and Islamic studies online."
        />
      </Head>

      {/* Hero Section - Inspired by Reference Image */}
      <section className="min-h-screen flex items-center justify-center px-4 pt-32 pb-20 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 right-10 w-72 h-72 bg-primary-200/20 dark:bg-primary-500/10 rounded-full blur-3xl animate-float"></div>
          <div
            className="absolute bottom-20 left-10 w-96 h-96 bg-gold/10 dark:bg-gold/5 rounded-full blur-3xl animate-float"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Side - Hero Text */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 30 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              {/* Small Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: mounted ? 1 : 0, scale: mounted ? 1 : 0.8 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center space-x-2 bg-primary-50 dark:bg-primary-900/30 px-4 py-2 rounded-full"
              ></motion.div>

              {/* Main Headline */}
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-primary-700 via-secondary-600 to-primary-800 dark:from-primary-400 dark:via-secondary-400 dark:to-primary-500 bg-clip-text text-transparent">
                    Read.
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-gold via-accent-500 to-gold-light dark:from-gold-light dark:via-accent-400 dark:to-gold bg-clip-text text-transparent">
                    Reflect.
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-primary-700 via-secondary-600 to-primary-800 dark:from-primary-400 dark:via-secondary-400 dark:to-primary-500 bg-clip-text text-transparent">
                    Rise.
                  </span>
                </h1>
              </div>

              {/* Quranic Verse */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: mounted ? 1 : 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="bg-white/60 dark:bg-dark-card/60 backdrop-blur-sm rounded-2xl p-6 border border-emerald-100 dark:border-dark-border shadow-soft"
              >
                <p className="font-arabic text-3xl text-center mb-3 text-emerald-800 dark:text-emerald-300 leading-loose">
                  إِنَّ هَـٰذَا ٱلْقُرْءَانَ يَهْدِى لِلَّتِى هِىَ أَقْوَمُ
                </p>
                <p className="text-center text-slate-700 dark:text-slate-300 font-medium">
                  &ldquo;Indeed, this Qur&apos;an guides to that which is most suitable&rdquo;
                </p>
                <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-2">
                  — Surah Al-Isra (17:9)
                </p>
              </motion.div>

              {/* Description */}
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                Transform your spiritual journey with personalized Quran
                lessons. Learn Tajweed, memorization, and Islamic studies from
                expert teachers—anytime, anywhere.
              </p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex flex-wrap gap-4 pt-2"
              >
                <Link
                  href="/signup"
                  className="px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-soft hover:shadow-glow inline-flex items-center space-x-2"
                >
                  <span>Start Learning Free</span>
                  <FaPlay className="text-sm" />
                </Link>
                <Link
                  href="/plans"
                  className="px-8 py-4 bg-white dark:bg-dark-card hover:bg-slate-50 dark:hover:bg-slate-700 text-primary-700 dark:text-primary-400 rounded-xl font-semibold text-lg transition-all duration-300 border-2 border-primary-200 dark:border-primary-700 inline-flex items-center space-x-2"
                >
                  <span>View Plans</span>
                </Link>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: mounted ? 1 : 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="flex flex-wrap items-center gap-6 pt-4 text-sm text-slate-600 dark:text-slate-400"
              >
                <div className="flex items-center space-x-2">
                  <FaCheckCircle className="text-primary-600 dark:text-primary-400" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaCheckCircle className="text-primary-600 dark:text-primary-400" />
                  <span>Certified teachers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaCheckCircle className="text-primary-600 dark:text-primary-400" />
                  <span>24/7 support</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Side - Animated Quran Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: mounted ? 1 : 0, x: mounted ? 0 : 50 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative hidden lg:block"
            >
              <div className="relative">
                {/* Main Illustration Card */}
                <motion.div
                  animate={{
                    y: [0, -15, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative bg-gradient-to-br from-white/80 to-primary-50/80 dark:from-dark-card/80 dark:to-primary-900/20 backdrop-blur-sm rounded-3xl p-8 shadow-soft-lg border border-primary-100/50 dark:border-dark-border overflow-hidden"
                >
                  {/* Real Quran Image */}
                  <div className="relative w-full h-auto">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/quran-hero.jpg"
                      alt="Open Quran with Prayer Beads"
                      className="w-full h-auto rounded-2xl shadow-2xl object-cover"
                      style={{ maxHeight: "500px" }}
                    />
                    {/* Overlay Gradient for Better Integration */}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary-900/20 via-transparent to-transparent rounded-2xl pointer-events-none"></div>
                    {/* Decorative Islamic Pattern Overlay */}
                    <div className="absolute top-4 right-4 text-gold opacity-40">
                      <svg width="60" height="60" viewBox="0 0 60 60">
                        <circle
                          cx="30"
                          cy="30"
                          r="25"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="0.5"
                        />
                        {[0, 45, 90, 135, 180, 225, 270, 315].map(
                          (angle, i) => (
                            <g key={i} transform={`rotate(${angle} 30 30)`}>
                              <polygon
                                points="30,10 32,20 30,25 28,20"
                                fill="currentColor"
                              />
                            </g>
                          ),
                        )}
                      </svg>
                    </div>
                  </div>
                </motion.div>

                {/* Floating Icons */}
                <motion.div
                  animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute -top-8 -right-8 bg-white dark:bg-dark-card rounded-2xl p-5 shadow-soft-lg border border-primary-100 dark:border-dark-border"
                >
                  <FaMosque className="text-primary-600 dark:text-primary-400 text-4xl" />
                </motion.div>

                <motion.div
                  animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                  className="absolute -bottom-6 -left-6 bg-gradient-to-br from-gold to-gold-dark rounded-2xl p-5 shadow-glow"
                >
                  <FaQuran className="text-white text-4xl" />
                </motion.div>

                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute top-1/2 -right-12 bg-primary-50 dark:bg-primary-900/30 rounded-full p-4 shadow-soft"
                >
                  <FaBook className="text-primary-600 dark:text-primary-400 text-3xl" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-white/50 dark:bg-dark-card/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 space-y-4"
          >
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-700 to-primary-600 dark:from-emerald-400 dark:to-primary-400 bg-clip-text text-transparent">
              Why Choose Our Platform?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Everything you need for a complete Quran learning experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <FaBook className="text-5xl" />,
                title: "Complete Resources",
                description:
                  "Full Quran, Hadith collections, Duas, and Tajweed guides",
                color: "from-emerald-500 to-primary-600",
              },
              {
                icon: <FaVideo className="text-5xl" />,
                title: "Live Video Classes",
                description:
                  "HD video sessions with screen sharing and interactive tools",
                color: "from-blue-500 to-blue-600",
              },
              {
                icon: <FaUsers className="text-5xl" />,
                title: "Expert Teachers",
                description:
                  "Certified instructors with Ijazah and years of experience",
                color: "from-gold to-gold-dark",
              },
              {
                icon: <FaPlay className="text-5xl" />,
                title: "Audio Library",
                description: "Beautiful recitations by world-renowned Qaris",
                color: "from-purple-500 to-purple-600",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative bg-white dark:bg-dark-card rounded-2xl p-8 shadow-soft hover:shadow-soft-lg transition-all duration-300 border border-slate-100 dark:border-dark-border overflow-hidden"
              >
                {/* Background Gradient on Hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 transition-opacity duration-300`}
                ></div>

                <div className="relative z-10">
                  <div
                    className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.color} text-white mb-4 shadow-soft`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto relative"
        >
          {/* Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-primary-500/20 dark:from-emerald-500/10 dark:to-primary-500/10 blur-3xl rounded-3xl"></div>

          <div className="relative bg-gradient-to-br from-emerald-600 via-primary-600 to-emerald-700 dark:from-emerald-700 dark:via-primary-700 dark:to-emerald-800 rounded-3xl shadow-soft-lg p-12 md:p-16 text-center text-white overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl"></div>

            <div className="relative z-10 space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                Begin Your Spiritual Journey Today
              </h2>
              <p className="text-xl opacity-95 max-w-2xl mx-auto">
                Join thousands of students worldwide in learning and memorizing
                the Noble Quran
              </p>
              <div className="flex flex-wrap justify-center gap-4 pt-4">
                <Link
                  href="/signup"
                  className="px-8 py-4 bg-white text-emerald-700 hover:bg-slate-50 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-soft inline-flex items-center space-x-2"
                >
                  <span>Get Started Free</span>
                  <FaPlay className="text-sm" />
                </Link>
                <Link
                  href="/contact"
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-xl text-lg font-semibold transition-all duration-300 border-2 border-white/30"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </Layout>
  );
}
