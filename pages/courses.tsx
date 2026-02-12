import React from "react";
import Head from "next/head";
import Link from "next/link";
import Layout from "../components/Layout";
import ProtectedRoute from "../components/ProtectedRoute";
import { motion } from "framer-motion";
import {
  FaBookOpen,
  FaMicrophone,
  FaPray,
  FaHands,
  FaArrowRight,
  FaGraduationCap,
  FaClock,
} from "react-icons/fa";

export default function Courses() {
  const courses = [
    {
      id: "quran-nazra",
      title: "Quran Nazra",
      icon: FaBookOpen,
      description:
        "Learn to read the Quran with proper pronunciation and fluency. Perfect for beginners who want to start their Quranic journey.",
      color: "from-primary-500 to-primary-700",
      bgColor: "bg-primary-50 dark:bg-primary-900/20",
      iconColor: "text-primary-600 dark:text-primary-400",
      duration: "3-6 months",
      level: "Beginner",
      features: [
        "Arabic alphabet recognition",
        "Basic reading skills",
        "Pronunciation practice",
        "Reading fluency development",
      ],
    },
    {
      id: "quran-tajweed",
      title: "Quran Tajweed",
      icon: FaMicrophone,
      description:
        "Master the rules of Tajweed for beautiful and accurate Quran recitation. Essential for those who want to perfect their recitation.",
      color: "from-secondary-500 to-secondary-700",
      bgColor: "bg-secondary-50 dark:bg-secondary-900/20",
      iconColor: "text-secondary-600 dark:text-secondary-400",
      duration: "6-12 months",
      level: "Intermediate",
      features: [
        "Tajweed rules and application",
        "Makharij (articulation points)",
        "Sifaat (characteristics of letters)",
        "Advanced recitation techniques",
      ],
    },
    {
      id: "namaz-prayer",
      title: "Namaz (Prayer Learning)",
      icon: FaPray,
      description:
        "Complete guide to performing the five daily prayers correctly. Learn the essential pillar of Islam with proper understanding.",
      color: "from-gold to-gold-dark",
      bgColor: "bg-gold/10 dark:bg-gold/5",
      iconColor: "text-gold dark:text-gold-light",
      duration: "1-2 months",
      level: "All Levels",
      features: [
        "Prayer positions and movements",
        "Essential duas and surahs",
        "Prayer timings and rules",
        "Practical demonstration",
      ],
    },
    {
      id: "daily-duas",
      title: "Duas (Daily Supplications)",
      icon: FaHands,
      description:
        "Learn authentic daily supplications from the Quran and Sunnah. Strengthen your connection with Allah through beautiful duas.",
      color: "from-accent-600 to-accent-800",
      bgColor: "bg-accent-100 dark:bg-accent-900/10",
      iconColor: "text-accent-700 dark:text-accent-400",
      duration: "2-3 months",
      level: "All Levels",
      features: [
        "Morning and evening duas",
        "Mealtime supplications",
        "Travel and protection duas",
        "Arabic text with translation",
      ],
    },
  ];

  return (
    <ProtectedRoute>
      <Layout>
        <Head>
          <title>Islamic Courses - Quran Learning Platform</title>
          <meta
            name="description"
            content="Comprehensive Islamic education courses including Quran Nazra, Tajweed, Namaz, and Daily Duas. Learn from certified teacher Attiq Ur Rehman."
          />
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
              <div className="inline-flex items-center space-x-2 bg-primary-50 dark:bg-primary-900/30 px-4 py-2 rounded-full mb-4">
                <FaGraduationCap className="text-primary-600 dark:text-primary-400" />
                <span className="text-sm font-medium text-primary-700 dark:text-primary-400">
                  Learn with Expert Guidance
                </span>
              </div>

              <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-4">
                Islamic Courses
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                Comprehensive Islamic education designed for all ages and skill
                levels. Learn from certified teacher{" "}
                <span className="font-semibold text-primary-600 dark:text-primary-400">
                  Attiq Ur Rehman
                </span>
              </p>
            </motion.div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              {courses.map((course, index) => (
                <motion.div
                  key={course.id}
                  id={course.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Link href={`/courses/${course.id}`}>
                    <div className="group card hover:shadow-soft-lg transition-all duration-300 cursor-pointer h-full">
                      {/* Course Icon and Title */}
                      <div className="flex items-start space-x-4 mb-4">
                        <div
                          className={`${course.bgColor} p-4 rounded-2xl transition-transform duration-300 group-hover:scale-110`}
                        >
                          <course.icon
                            className={`${course.iconColor} text-3xl`}
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {course.title}
                          </h3>
                          <div className="flex items-center space-x-3 text-sm text-slate-600 dark:text-slate-400">
                            <span className="flex items-center space-x-1">
                              <FaClock className="text-xs" />
                              <span>{course.duration}</span>
                            </span>
                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-medium">
                              {course.level}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                        {course.description}
                      </p>

                      {/* Key Features */}
                      <div className="space-y-2 mb-6">
                        {course.features.slice(0, 3).map((feature, idx) => (
                          <div
                            key={idx}
                            className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400"
                          >
                            <div
                              className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${course.color}`}
                            ></div>
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* View Details Button */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`inline-flex items-center space-x-2 font-semibold ${course.iconColor} group-hover:translate-x-1 transition-transform duration-300`}
                        >
                          <span>View Details</span>
                          <FaArrowRight className="text-sm" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Teacher Info Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-gradient-to-br from-primary-600 to-secondary-600 rounded-2xl shadow-xl p-8 md:p-12 text-white text-center"
            >
              <div className="max-w-3xl mx-auto">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <FaGraduationCap className="text-4xl text-white" />
                </div>
                <h3 className="text-3xl font-bold mb-3">
                  Learn from an Expert
                </h3>
                <p className="text-lg mb-2 text-white/90">
                  All courses are taught by
                </p>
                <p className="text-2xl font-bold mb-4">Attiq Ur Rehman</p>
                <p className="text-white/90 leading-relaxed mb-6">
                  Certified Islamic scholar with years of experience in Quran
                  teaching, Tajweed, and Islamic studies. Dedicated to helping
                  students of all ages strengthen their connection with the
                  Quran and deepen their understanding of Islam.
                </p>
                <div className="flex flex-wrap justify-center gap-4 text-sm">
                  <div className="bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                    ✓ Certified Quran Teacher
                  </div>
                  <div className="bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                    ✓ Tajweed Expert
                  </div>
                  <div className="bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                    ✓ 10+ Years Experience
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
