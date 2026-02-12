import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import ProtectedRoute from "../../components/ProtectedRoute";
import { motion } from "framer-motion";
import {
  FaBookOpen,
  FaMicrophone,
  FaPray,
  FaHands,
  FaWhatsapp,
  FaGraduationCap,
  FaClock,
  FaUsers,
  FaCheckCircle,
  FaArrowLeft,
} from "react-icons/fa";
import Link from "next/link";

export default function CourseDetails() {
  const router = useRouter();
  const { courseId } = router.query;

  const coursesData = {
    "quran-nazra": {
      title: "Quran Nazra",
      icon: FaBookOpen,
      description:
        "Learn to read the Holy Quran with proper pronunciation and fluency. This foundational course is perfect for beginners who want to start their Quranic journey with confidence.",
      color: "from-primary-500 to-primary-700",
      bgColor: "bg-primary-50 dark:bg-primary-900/20",
      iconColor: "text-primary-600 dark:text-primary-400",
      duration: "3-6 months",
      level: "Beginner",
      targetAudience: "Children (5+) and Adults of all ages",
      prerequisites: "None - Complete beginner friendly",
      features: [
        "Arabic alphabet recognition and pronunciation",
        "Basic reading skills development",
        "Pronunciation practice with feedback",
        "Reading fluency development",
        "Letter joining and word formation",
        "Short verses and chapters practice",
        "Reading speed improvement",
        "Confidence building in Quranic reading",
      ],
      outcomes: [
        "Read the Quran independently with confidence",
        "Proper pronunciation of Arabic letters",
        "Understanding of basic Arabic text structure",
        "Ability to read any Arabic text fluently",
        "Strong foundation for advanced Quranic studies",
      ],
      schedule: "2-3 sessions per week, 45 minutes each",
    },
    "quran-tajweed": {
      title: "Quran Tajweed",
      icon: FaMicrophone,
      description:
        "Master the beautiful art of Quranic recitation with proper Tajweed rules. This advanced course will perfect your recitation and bring you closer to the melodious recitation of the Quran.",
      color: "from-secondary-500 to-secondary-700",
      bgColor: "bg-secondary-50 dark:bg-secondary-900/20",
      iconColor: "text-secondary-600 dark:text-secondary-400",
      duration: "6-12 months",
      level: "Intermediate to Advanced",
      targetAudience: "Students who can already read the Quran",
      prerequisites: "Ability to read Arabic/Quran (Nazra level)",
      features: [
        "Complete Tajweed rules (Ahkam-e-Tajweed)",
        "Makharij (proper articulation points)",
        "Sifaat (characteristics of letters)",
        "Ghunnah, Qalqalah, and other rules",
        "Advanced recitation techniques",
        "Melodious recitation patterns",
        "Voice modulation and breath control",
        "Practice with different Quranic verses",
      ],
      outcomes: [
        "Beautiful and accurate Quran recitation",
        "Complete understanding of Tajweed rules",
        "Ability to teach others proper recitation",
        "Enhanced spiritual connection through recitation",
        "Recognition of recitation mistakes and corrections",
      ],
      schedule: "2 sessions per week, 60 minutes each",
    },
    "namaz-prayer": {
      title: "Namaz (Prayer Learning)",
      icon: FaPray,
      description:
        "Learn the complete method of performing the five daily prayers (Salah) correctly according to Islamic teachings. An essential course for every Muslim to fulfill this fundamental pillar of Islam.",
      color: "from-gold to-gold-dark",
      bgColor: "bg-gold/10 dark:bg-gold/5",
      iconColor: "text-gold dark:text-gold-light",
      duration: "1-2 months",
      level: "All Levels",
      targetAudience: "New Muslims, Children, and Adults needing guidance",
      prerequisites: "None - Suitable for complete beginners",
      features: [
        "Prayer positions and movements (Rakat)",
        "Essential duas and surahs for prayer",
        "Prayer timings and their significance",
        "Wudu (ablution) step-by-step guide",
        "Qibla direction and prayer space setup",
        "Different types of prayers (Fard, Sunnah, Nafl)",
        "Practical demonstration and practice",
        "Common mistakes and their corrections",
      ],
      outcomes: [
        "Perform all five daily prayers correctly",
        "Complete understanding of prayer requirements",
        "Ability to lead prayers for family",
        "Strong foundation in Islamic worship",
        "Increased spiritual discipline and connection",
      ],
      schedule: "1-2 sessions per week, 45 minutes each",
    },
    "daily-duas": {
      title: "Duas (Daily Supplications)",
      icon: FaHands,
      description:
        "Learn authentic daily supplications from the Quran and Sunnah of Prophet Muhammad (PBUH). Strengthen your connection with Allah through beautiful duas for every aspect of daily life.",
      color: "from-accent-600 to-accent-800",
      bgColor: "bg-accent-100 dark:bg-accent-900/10",
      iconColor: "text-accent-700 dark:text-accent-400",
      duration: "2-3 months",
      level: "All Levels",
      targetAudience: "Muslims of all ages seeking spiritual enrichment",
      prerequisites:
        "Basic Arabic reading ability (recommended but not required)",
      features: [
        "Morning and evening remembrance (Azkar)",
        "Mealtime supplications and etiquettes",
        "Travel, protection, and safety duas",
        "Duas for various life situations",
        "Arabic text with English translation",
        "Memorization techniques and tips",
        "Understanding the meanings and benefits",
        "Integration into daily routine",
      ],
      outcomes: [
        "Memorize essential daily duas",
        "Understand the meaning and significance of supplications",
        "Develop a strong habit of remembering Allah",
        "Enhanced spiritual awareness throughout the day",
        "Increased reliance on Allah in all matters",
      ],
      schedule: "1 session per week, 45 minutes each",
    },
  };

  const course = coursesData[courseId as keyof typeof coursesData];

  if (!course) {
    return (
      <ProtectedRoute>
        <Layout>
          <Head>
            <title>Course Not Found - Quran Learning Platform</title>
          </Head>
          <div className="py-20 px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">Course Not Found</h1>
            <Link href="/courses">
              <span className="text-primary-600 hover:text-primary-700">
                ← Back to Courses
              </span>
            </Link>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  const handleWhatsAppContact = () => {
    const phoneNumber = "923135064381"; // Pakistan number format for WhatsApp
    const message = `Assalamualaikum, I am interested in the ${course.title} course. Please provide me with more details about enrollment and scheduling.`;
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message,
    )}`;
    window.open(whatsappURL, "_blank");
  };

  return (
    <ProtectedRoute>
      <Layout>
        <Head>
          <title>{course.title} Course - Quran Learning Platform</title>
          <meta
            name="description"
            content={`${course.description} Learn with certified teacher Attiq Ur Rehman.`}
          />
        </Head>

        <div className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <Link href="/courses">
                <span className="inline-flex items-center space-x-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
                  <FaArrowLeft />
                  <span>Back to Courses</span>
                </span>
              </Link>
            </motion.div>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <div
                className={`${course.bgColor} inline-flex p-6 rounded-3xl mb-6`}
              >
                <course.icon className={`${course.iconColor} text-6xl`} />
              </div>
              <h1
                className={`text-5xl font-bold bg-gradient-to-r ${course.color} bg-clip-text text-transparent mb-4`}
              >
                {course.title}
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
                {course.description}
              </p>
            </motion.div>

            {/* Course Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="card text-center"
              >
                <FaClock
                  className={`${course.iconColor} text-3xl mb-3 mx-auto`}
                />
                <h3 className="font-bold text-lg mb-1">Duration</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {course.duration}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="card text-center"
              >
                <FaGraduationCap
                  className={`${course.iconColor} text-3xl mb-3 mx-auto`}
                />
                <h3 className="font-bold text-lg mb-1">Level</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {course.level}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="card text-center"
              >
                <FaUsers
                  className={`${course.iconColor} text-3xl mb-3 mx-auto`}
                />
                <h3 className="font-bold text-lg mb-1">Schedule</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {course.schedule}
                </p>
              </motion.div>
            </div>

            {/* Course Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {/* What You'll Learn */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="card"
              >
                <h3 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-200">
                  What You&apos;ll Learn
                </h3>
                <div className="space-y-3">
                  {course.features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-start space-x-3">
                      <FaCheckCircle
                        className={`${course.iconColor} mt-1 flex-shrink-0`}
                      />
                      <span className="text-slate-600 dark:text-slate-400">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Learning Outcomes */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="card"
              >
                <h3 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-200">
                  Learning Outcomes
                </h3>
                <div className="space-y-3">
                  {course.outcomes.map((outcome: string, index: number) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div
                        className={`w-2 h-2 rounded-full bg-gradient-to-r ${course.color} mt-2 flex-shrink-0`}
                      />
                      <span className="text-slate-600 dark:text-slate-400">
                        {outcome}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="card"
              >
                <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-200">
                  Target Audience
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {course.targetAudience}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="card"
              >
                <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-200">
                  Prerequisites
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {course.prerequisites}
                </p>
              </motion.div>
            </div>

            {/* Teacher Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl shadow-xl p-8 text-white text-center mb-8"
            >
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaGraduationCap className="text-3xl" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Your Instructor</h3>
              <p className="text-2xl font-bold mb-3 text-gold">
                Attiq Ur Rehman
              </p>
              <p className="text-white/90 mb-4">
                Certified Islamic Scholar & Quran Teacher
              </p>
              <p className="text-sm text-white/80 max-w-2xl mx-auto">
                With years of experience in Islamic education and Quranic
                studies, Ustadh Attiq brings deep knowledge and patience to help
                students achieve their learning goals in a supportive
                environment.
              </p>
            </motion.div>

            {/* Contact WhatsApp Button */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="text-center"
            >
              <button
                onClick={handleWhatsAppContact}
                className="inline-flex items-center space-x-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-soft hover:shadow-glow text-lg"
              >
                <FaWhatsapp className="text-2xl" />
                <span>Contact on WhatsApp</span>
              </button>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
                Click to start a conversation about enrollment and scheduling
              </p>
            </motion.div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
