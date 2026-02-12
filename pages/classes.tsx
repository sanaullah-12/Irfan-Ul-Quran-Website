import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import Layout from "../components/Layout";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaVideo,
  FaClock,
  FaUsers,
  FaCalendar,
  FaPlus,
  FaTimes,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaBookOpen,
  FaSearch,
  FaCheck,
} from "react-icons/fa";
import api from "../utils/api";

interface TeacherOption {
  _id: string;
  name: string;
  email: string;
}
interface StudentOption {
  _id: string;
  name: string;
  email: string;
}

export default function Classes() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Schedule modal state
  const [showSchedule, setShowSchedule] = useState(false);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [form, setForm] = useState({
    title: "",
    description: "",
    courseType: "Quran Nazra",
    scheduledTime: "",
    duration: 60,
    maxStudents: 10,
    teacherId: "",
    studentIds: [] as string[],
  });

  // Search filters & dropdown state for teacher/student pickers
  const [teacherSearch, setTeacherSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [teacherDropdownOpen, setTeacherDropdownOpen] = useState(false);
  const [studentDropdownOpen, setStudentDropdownOpen] = useState(false);
  const teacherRef = useRef<HTMLDivElement>(null);
  const studentRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (teacherRef.current && !teacherRef.current.contains(e.target as Node)) {
        setTeacherDropdownOpen(false);
      }
      if (studentRef.current && !studentRef.current.contains(e.target as Node)) {
        setStudentDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const response = await api.get("/classes/all");
      setClasses(response.data.classes);
    } catch (error) {
      console.error("Error loading classes:", error);
    } finally {
      setLoading(false);
    }
  };

  const openScheduleModal = async () => {
    setShowSchedule(true);
    setLoadingOptions(true);
    try {
      const [tRes, sRes] = await Promise.all([
        api.get("/classes/teachers"),
        api.get("/classes/students"),
      ]);
      setTeachers(tRes.data.teachers || []);
      setStudents(sRes.data.students || []);
    } catch (error) {
      console.error("Error loading options:", error);
    } finally {
      setLoadingOptions(false);
    }
  };

  const closeScheduleModal = () => {
    setShowSchedule(false);
    setForm({
      title: "",
      description: "",
      courseType: "Quran Nazra",
      scheduledTime: "",
      duration: 60,
      maxStudents: 10,
      teacherId: "",
      studentIds: [],
    });
    setTeacherSearch("");
    setStudentSearch("");
    setTeacherDropdownOpen(false);
    setStudentDropdownOpen(false);
  };

  const toggleStudent = (id: string) => {
    setForm((prev) => ({
      ...prev,
      studentIds: prev.studentIds.includes(id)
        ? prev.studentIds.filter((s) => s !== id)
        : [...prev.studentIds, id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.scheduledTime || !form.teacherId) {
      alert("Please fill in title, date/time, and select a teacher.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/classes/create", form);
      closeScheduleModal();
      loadClasses();
      alert("Class scheduled successfully! Notifications sent to teacher and students.");
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to schedule class");
    } finally {
      setSubmitting(false);
    }
  };

  const enrollInClass = async (classId: string) => {
    try {
      await api.post(`/classes/enroll/${classId}`);
      alert("Successfully enrolled in class!");
      loadClasses();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to enroll");
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredTeachers = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(teacherSearch.toLowerCase()) ||
      t.email.toLowerCase().includes(teacherSearch.toLowerCase()),
  );
  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(studentSearch.toLowerCase()),
  );

  const courseTypes = [
    "Quran Nazra",
    "Quran Tajweed",
    "Quran Hifz",
    "Namaz & Duas",
    "Islamic Studies",
    "General",
  ];

  const isAdmin = user?.role === "admin";

  return (
    <ProtectedRoute>
      <Layout>
        <Head>
          <title>Live Classes - Quran Learning Platform</title>
        </Head>

        <div className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-4">
                Live Classes
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 mb-6">
                Join interactive video sessions with experienced teachers
              </p>
              {isAdmin && (
                <button
                  onClick={openScheduleModal}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <FaPlus className="text-xs" />
                  <span>Schedule New Class</span>
                </button>
              )}
            </motion.div>

            {/* Classes Grid */}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="loader"></div>
              </div>
            ) : classes.length === 0 ? (
              <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl border border-slate-100 dark:border-dark-border p-12 text-center">
                <FaVideo className="text-6xl text-slate-400 dark:text-slate-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                  No Classes Scheduled
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Check back later for upcoming live classes
                </p>
                {isAdmin && (
                  <button
                    onClick={openScheduleModal}
                    className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-sm font-semibold rounded-xl"
                  >
                    <FaPlus className="text-xs" />
                    <span>Schedule First Class</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {classes.map((classItem, index) => (
                  <motion.div
                    key={classItem._id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="card"
                  >
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            classItem.status === "scheduled"
                              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                              : classItem.status === "ongoing"
                                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {classItem.status.toUpperCase()}
                        </span>
                        <div className="flex items-center text-slate-600 dark:text-slate-400 text-sm">
                          <FaUsers className="mr-1" />
                          {classItem.enrolledStudents?.length || 0}/
                          {classItem.maxStudents}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-primary-700 dark:text-primary-400 mb-1">
                        {classItem.title}
                      </h3>
                      {classItem.courseType && (
                        <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 mb-2">
                          {classItem.courseType}
                        </span>
                      )}
                      <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">
                        {classItem.description}
                      </p>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-slate-700 dark:text-slate-300">
                        <FaCalendar className="text-gold dark:text-gold mr-2" />
                        <span className="text-sm">
                          {formatDate(classItem.scheduledTime)}
                        </span>
                      </div>
                      <div className="flex items-center text-slate-700 dark:text-slate-300">
                        <FaClock className="text-gold dark:text-gold mr-2" />
                        <span className="text-sm">
                          {classItem.duration} minutes
                        </span>
                      </div>
                      <div className="flex items-center text-slate-700 dark:text-slate-300">
                        <FaChalkboardTeacher className="text-gold dark:text-gold mr-2" />
                        <span className="text-sm">
                          Teacher: {classItem.teacher?.name || "TBA"}
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      {classItem.status === "scheduled" && (
                        <button
                          onClick={() => enrollInClass(classItem._id)}
                          className="flex-1 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-semibold py-2 rounded-lg transition-all duration-300"
                        >
                          Enroll Now
                        </button>
                      )}
                      {classItem.status === "ongoing" && (
                        <Link
                          href={`/class-room/${classItem.roomId}`}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition-all duration-300 text-center flex items-center justify-center space-x-2"
                        >
                          <FaVideo />
                          <span>Join Class</span>
                        </Link>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Features Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-16 bg-white dark:bg-dark-card rounded-2xl shadow-xl border border-slate-100 dark:border-dark-border p-8"
            >
              <h2 className="text-3xl font-bold text-primary-700 dark:text-primary-400 mb-8 text-center">
                Live Class Features
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-600 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaVideo className="text-white text-2xl" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-2">
                    HD Video Quality
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Crystal clear video and audio for the best learning
                    experience
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-600 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaUsers className="text-white text-2xl" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-2">
                    Interactive Sessions
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Engage directly with teachers and ask questions in real-time
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-600 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaCalendar className="text-white text-2xl" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-2">
                    Screen Sharing
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Teachers can share Quran text and teaching materials
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ══════════ SCHEDULE CLASS MODAL ══════════ */}
        <AnimatePresence>
          {showSchedule && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
              onClick={closeScheduleModal}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-dark-border"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-dark-border">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center">
                      <FaCalendar className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                        Schedule New Class
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Pick a teacher, add students, and set the time
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeScheduleModal}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-bg text-slate-500 transition-colors"
                  >
                    <FaTimes />
                  </button>
                </div>

                {loadingOptions ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="loader"></div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Row: Title + Course Type */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                          Class Title *
                        </label>
                        <input
                          type="text"
                          value={form.title}
                          onChange={(e) =>
                            setForm({ ...form, title: e.target.value })
                          }
                          placeholder="e.g. Surah Al-Baqarah Tajweed"
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bg text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                          Course Type
                        </label>
                        <select
                          value={form.courseType}
                          onChange={(e) =>
                            setForm({ ...form, courseType: e.target.value })
                          }
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bg text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                        >
                          {courseTypes.map((ct) => (
                            <option key={ct} value={ct}>
                              {ct}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                        Description
                      </label>
                      <textarea
                        value={form.description}
                        onChange={(e) =>
                          setForm({ ...form, description: e.target.value })
                        }
                        rows={2}
                        placeholder="Brief description of the class..."
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bg text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none"
                      />
                    </div>

                    {/* Row: Date/Time + Duration + Max Students */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                          Date & Time *
                        </label>
                        <input
                          type="datetime-local"
                          value={form.scheduledTime}
                          onChange={(e) =>
                            setForm({ ...form, scheduledTime: e.target.value })
                          }
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bg text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                          Duration (min)
                        </label>
                        <select
                          value={form.duration}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              duration: Number(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bg text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                        >
                          {[30, 45, 60, 90, 120].map((d) => (
                            <option key={d} value={d}>
                              {d} min
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                          Max Students
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={50}
                          value={form.maxStudents}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              maxStudents: Number(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bg text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* ── Select Teacher (Dropdown) ── */}
                    <div className="relative" ref={teacherRef}>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                        <FaChalkboardTeacher className="inline mr-1" />
                        Assign Teacher *
                      </label>
                      <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs z-10" />
                        <input
                          type="text"
                          placeholder={form.teacherId ? (teachers.find(t => t._id === form.teacherId)?.name || "Search teachers...") : "Search & select a teacher..."}
                          value={teacherSearch}
                          onChange={(e) => {
                            setTeacherSearch(e.target.value);
                            setTeacherDropdownOpen(true);
                          }}
                          onFocus={() => setTeacherDropdownOpen(true)}
                          className={`w-full pl-8 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none ${
                            form.teacherId && !teacherSearch
                              ? "text-primary-700 dark:text-primary-400 font-medium"
                              : "text-slate-800 dark:text-white"
                          }`}
                        />
                        {form.teacherId && (
                          <button
                            type="button"
                            onClick={() => {
                              setForm({ ...form, teacherId: "" });
                              setTeacherSearch("");
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 z-10"
                          >
                            <FaTimes className="text-xs" />
                          </button>
                        )}
                      </div>
                      {/* Selected teacher badge */}
                      {form.teacherId && !teacherDropdownOpen && (
                        <div className="mt-2 inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
                          <div className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center">
                            <FaCheck className="text-[9px]" />
                          </div>
                          <span className="text-sm font-medium text-primary-700 dark:text-primary-400">
                            {teachers.find(t => t._id === form.teacherId)?.name}
                          </span>
                          <span className="text-[11px] text-primary-500 dark:text-primary-500">
                            {teachers.find(t => t._id === form.teacherId)?.email}
                          </span>
                        </div>
                      )}
                      {/* Dropdown list */}
                      {teacherDropdownOpen && (
                        <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto space-y-1 border border-slate-200 dark:border-dark-border rounded-xl p-2 bg-white dark:bg-dark-card shadow-xl z-20">
                          {filteredTeachers.length === 0 ? (
                            <p className="text-xs text-slate-400 text-center py-3">
                              No teachers found
                            </p>
                          ) : (
                            filteredTeachers.map((t) => (
                              <button
                                type="button"
                                key={t._id}
                                onClick={() => {
                                  setForm({ ...form, teacherId: t._id });
                                  setTeacherSearch("");
                                  setTeacherDropdownOpen(false);
                                }}
                                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left text-sm transition-all ${
                                  form.teacherId === t._id
                                    ? "bg-primary-100 dark:bg-primary-900/30 border border-primary-400 dark:border-primary-600"
                                    : "hover:bg-slate-50 dark:hover:bg-dark-bg border border-transparent"
                                }`}
                              >
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                    form.teacherId === t._id
                                      ? "bg-primary-600 text-white"
                                      : "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                                  }`}
                                >
                                  {form.teacherId === t._id ? (
                                    <FaCheck className="text-xs" />
                                  ) : (
                                    <FaChalkboardTeacher className="text-xs" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-slate-800 dark:text-white truncate">
                                    {t.name}
                                  </p>
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                    {t.email}
                                  </p>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>

                    {/* ── Select Students (Dropdown) ── */}
                    <div className="relative" ref={studentRef}>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                        <FaUserGraduate className="inline mr-1" />
                        Enroll Students ({form.studentIds.length} selected)
                      </label>
                      <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs z-10" />
                        <input
                          type="text"
                          placeholder={form.studentIds.length > 0 ? `${form.studentIds.length} student(s) selected — search more...` : "Search & select students..."}
                          value={studentSearch}
                          onChange={(e) => {
                            setStudentSearch(e.target.value);
                            setStudentDropdownOpen(true);
                          }}
                          onFocus={() => setStudentDropdownOpen(true)}
                          className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bg text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                        />
                      </div>
                      {/* Selected chips */}
                      {form.studentIds.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {form.studentIds.map((sid) => {
                            const s = students.find((st) => st._id === sid);
                            if (!s) return null;
                            return (
                              <span
                                key={sid}
                                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[11px] font-medium"
                              >
                                <FaUserGraduate className="text-[9px]" />
                                <span>{s.name}</span>
                                <button
                                  type="button"
                                  onClick={() => toggleStudent(sid)}
                                  className="hover:text-red-500 ml-0.5"
                                >
                                  <FaTimes className="text-[9px]" />
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      )}
                      {/* Dropdown list */}
                      {studentDropdownOpen && (
                        <div className="absolute left-0 right-0 mt-1 max-h-52 overflow-y-auto space-y-1 border border-slate-200 dark:border-dark-border rounded-xl p-2 bg-white dark:bg-dark-card shadow-xl z-20">
                          <div className="flex items-center justify-between px-2 pb-1.5 border-b border-slate-100 dark:border-dark-border mb-1">
                            <span className="text-[11px] text-slate-400">{filteredStudents.length} student(s)</span>
                            <button
                              type="button"
                              onClick={() => {
                                setStudentDropdownOpen(false);
                                setStudentSearch("");
                              }}
                              className="text-[11px] text-primary-600 dark:text-primary-400 hover:underline font-medium"
                            >
                              Done
                            </button>
                          </div>
                          {filteredStudents.length === 0 ? (
                            <p className="text-xs text-slate-400 text-center py-3">
                              No students found
                            </p>
                          ) : (
                            filteredStudents.map((s) => {
                              const selected = form.studentIds.includes(s._id);
                              return (
                                <button
                                  type="button"
                                  key={s._id}
                                  onClick={() => toggleStudent(s._id)}
                                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left text-sm transition-all ${
                                    selected
                                      ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-400 dark:border-emerald-600"
                                      : "hover:bg-slate-50 dark:hover:bg-dark-bg border border-transparent"
                                  }`}
                                >
                                  <div
                                    className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                                      selected
                                        ? "bg-emerald-600 border-emerald-600 text-white"
                                        : "border-slate-300 dark:border-slate-600"
                                    }`}
                                  >
                                    {selected && (
                                      <FaCheck className="text-[9px]" />
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-medium text-slate-800 dark:text-white truncate">
                                      {s.name}
                                    </p>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                      {s.email}
                                    </p>
                                  </div>
                                </button>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-200 dark:border-dark-border">
                      <button
                        type="button"
                        onClick={closeScheduleModal}
                        className="px-4 py-2.5 text-sm font-medium rounded-xl border border-slate-300 dark:border-dark-border text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-bg transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:from-primary-700 hover:to-secondary-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                      >
                        {submitting ? "Scheduling..." : "Schedule Class"}
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Layout>
    </ProtectedRoute>
  );
}
