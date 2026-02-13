import React from "react";
import Head from "next/head";
import Layout from "../components/Layout";
import ProtectedRoute from "../components/ProtectedRoute";
import { motion } from "framer-motion";
import { FaGraduationCap, FaBook, FaAward, FaHeart } from "react-icons/fa";

export default function About() {
  return (
    <ProtectedRoute>
      <Layout>
        <Head>
          <title>About Us - Quran Learning Platform</title>
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
                About Our Platform
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                Dedicated to spreading authentic Islamic knowledge through
                modern technology
              </p>
            </motion.div>

            {/* Mission Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white dark:bg-dark-card rounded-2xl shadow-xl border border-slate-100 dark:border-dark-border p-8 md:p-12 mb-12"
            >
              <h2 className="text-3xl font-bold text-primary-700 dark:text-primary-400 mb-6 text-center">
                Our Mission
              </h2>
              <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed text-center max-w-4xl mx-auto">
                Our mission is to make Quranic education accessible to everyone,
                everywhere. We combine traditional Islamic teaching methods with
                modern technology to provide a comprehensive learning
                experience. Whether you&apos;re a beginner or looking to perfect
                your recitation, we&apos;re here to guide you every step of the
                way.
              </p>
            </motion.div>

            {/* Teacher Profile */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-16"
            >
              <h2 className="text-3xl font-bold text-emerald-700 dark:text-emerald-400 mb-8 text-center">
                Meet Your Teacher
              </h2>

              <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl border border-slate-100 dark:border-dark-border p-8 md:p-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-1">
                    <div className="w-48 h-48 mx-auto bg-gradient-to-br from-primary-600 to-secondary-600 rounded-full flex items-center justify-center">
                      <FaGraduationCap className="text-8xl text-white" />
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold text-primary-700 dark:text-primary-400 mb-2">
                        Attique Ur Rehman
                      </h3>
                      <p className="text-gold dark:text-gold font-semibold">
                        Certified Quran Teacher & Islamic Scholar
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <FaAward className="text-gold dark:text-gold text-2xl mt-1" />
                        <div>
                          <h4 className="font-bold text-lg text-slate-800 dark:text-slate-200">
                            Qualifications
                          </h4>
                          <p className="text-slate-600 dark:text-slate-400">
                            • Master&apos;s in Islamic Studies from Al-Azhar
                            University
                            <br />
                            • Certified Tajweed Instructor (Ijazah in Hafs
                            recitation)
                            <br />• Bachelor&apos;s in Arabic Language and
                            Literature
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <FaBook className="text-gold dark:text-gold text-2xl mt-1" />
                        <div>
                          <h4 className="font-bold text-lg text-slate-800 dark:text-slate-200">
                            Experience
                          </h4>
                          <p className="text-slate-600 dark:text-slate-400">
                            • 15+ years of teaching Quran and Islamic studies
                            <br />
                            • Taught over 1,000 students worldwide
                            <br />• Specialized in Nazra, Tajweed, and Hifz
                            programs
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <FaHeart className="text-gold dark:text-gold text-2xl mt-1" />
                        <div>
                          <h4 className="font-bold text-lg text-slate-800 dark:text-slate-200">
                            Teaching Methodology
                          </h4>
                          <p className="text-slate-600 dark:text-slate-400">
                            • Patient and personalized approach for each student
                            <br />
                            • Focus on proper pronunciation and understanding
                            <br />
                            • Interactive sessions with practical examples
                            <br />• Regular progress assessments and feedback
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Values Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-emerald-700 dark:text-emerald-400 mb-8 text-center">
                Our Values
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    title: "Authenticity",
                    description:
                      "We teach from authentic sources following the methodology of traditional Islamic scholars",
                  },
                  {
                    title: "Excellence",
                    description:
                      "We strive for the highest quality in both teaching and technology",
                  },
                  {
                    title: "Accessibility",
                    description:
                      "Making Quranic education available to everyone, regardless of location or background",
                  },
                ].map((value, index) => (
                  <div key={index} className="card text-center">
                    <h3 className="text-xl font-bold text-primary-700 dark:text-primary-400 mb-3">
                      {value.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      {value.description}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
