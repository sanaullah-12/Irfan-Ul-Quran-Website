import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "../../components/DashboardLayout";
import EmptyState from "../../components/EmptyState";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import {
  FaUsers,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaBookOpen,
  FaChalkboardTeacher,
  FaCalendarPlus,
  FaVideo,
  FaPlay,
  FaRedo,
  FaTrashAlt,
  FaUserGraduate,
  FaStickyNote,
  FaBan,
} from "react-icons/fa";
import api from "../../utils/api";

/* ── Interfaces ───────────────────────────────────────────────── */
interface Stats {
  totalStudents: number;
  totalClasses: number;
  upcomingClasses: number;
  completedClasses: number;
}
interface TeacherInfo {
  name: string;
  email: string;
}
interface StudentItem {
  _id: string;
  name: string;
  email: string;
  plan: string;
  accountStatus: string;
  totalClassesTaken?: number;
  lastActivity?: string;
}
interface ClassItem {
  _id: string;
  courseType: string;
  teacherName: string;
  scheduledDate: string;
  duration: number;
  status: string;
  roomId: string;
  notes?: string;
  userId?: { _id: string; name: string; email: string };
}

type Tab = "overview" | "students" | "classes" | "schedule" | "profile";

/* ── Reusable Modal ───────────────────────────────────────────── */
function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-dark-border">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xl"
          >
            &times;
          </button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </div>
  );
}

/* ── Dashboard ────────────────────────────────────────────────── */
export default function TeacherDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [teacherInfo, setTeacherInfo] = useState<TeacherInfo | null>(null);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);

  /* Reschedule modal */
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState<ClassItem | null>(
    null,
  );
  const [rescheduleForm, setRescheduleForm] = useState({
    scheduledDate: "",
    duration: 60,
  });

  /* Cancel modal */
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<ClassItem | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  /* Class filter */
  const [classFilter, setClassFilter] = useState<string>("all");

  useEffect(() => {
    const t = router.query.tab as Tab | undefined;
    if (
      t &&
      ["overview", "students", "classes", "schedule", "profile"].includes(t)
    )
      setActiveTab(t);
  }, [router.query.tab]);

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== "teacher") {
        router.push("/");
        return;
      }
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const results = await Promise.allSettled([
        api.get("/teacher/overview"),
        api.get("/teacher/students"),
        api.get("/teacher/classes"),
      ]);
      const [overviewRes, studentsRes, classesRes] = results;
      if (overviewRes.status === "fulfilled") {
        setStats(overviewRes.value.data.stats);
        setTeacherInfo(overviewRes.value.data.teacher);
      }
      if (studentsRes.status === "fulfilled")
        setStudents(studentsRes.value.data.students || []);
      if (classesRes.status === "fulfilled")
        setClasses(classesRes.value.data.classes || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ── Cancel Class ───────────────────────────────────────────── */
  const handleCancel = async () => {
    if (!cancelTarget) return;
    try {
      await api.patch(`/teacher/classes/${cancelTarget._id}/cancel`, {
        reason: cancelReason,
      });
      setShowCancelModal(false);
      setCancelTarget(null);
      setCancelReason("");
      fetchData();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      alert(msg || "Failed to cancel");
    }
  };

  /* ── Reschedule Class ───────────────────────────────────────── */
  const handleReschedule = async () => {
    if (!rescheduleTarget || !rescheduleForm.scheduledDate) return;
    try {
      await api.patch(
        `/teacher/classes/${rescheduleTarget._id}/reschedule`,
        rescheduleForm,
      );
      setShowRescheduleModal(false);
      setRescheduleTarget(null);
      setRescheduleForm({ scheduledDate: "", duration: 60 });
      fetchData();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      alert(msg || "Failed to reschedule");
    }
  };

  /* ── Mark Class Status ──────────────────────────────────────── */
  const handleMarkStatus = async (classId: string, status: string) => {
    try {
      await api.patch(`/teacher/classes/${classId}/status`, { status });
      fetchData();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      alert(msg || "Failed to update");
    }
  };

  /* ── Filtered Classes ───────────────────────────────────────── */
  const now = new Date();
  const filteredClasses = classes.filter((c) => {
    if (classFilter === "upcoming")
      return c.status === "scheduled" && new Date(c.scheduledDate) >= now;
    if (classFilter === "completed") return c.status === "completed";
    if (classFilter === "missed") return c.status === "missed";
    if (classFilter === "cancelled") return c.status === "cancelled";
    return true;
  });
  const classCounts = {
    all: classes.length,
    upcoming: classes.filter(
      (c) => c.status === "scheduled" && new Date(c.scheduledDate) >= now,
    ).length,
    completed: classes.filter((c) => c.status === "completed").length,
    missed: classes.filter((c) => c.status === "missed").length,
    cancelled: classes.filter((c) => c.status === "cancelled").length,
  };

  /* ── Helpers ────────────────────────────────────────────────── */
  const statusBadge = (s: string) => {
    const m: Record<string, string> = {
      scheduled:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
      completed:
        "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
      missed: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
      cancelled:
        "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
    };
    return m[s] || m.scheduled;
  };
  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  const fmtTime = (d: string) =>
    new Date(d).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  const inputClass =
    "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bg text-slate-800 dark:text-white focus:ring-2 focus:ring-primary-500/50 outline-none transition";
  const labelClass =
    "block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1";

  if (authLoading || loading)
    return (
      <DashboardLayout
        title="Teacher Dashboard"
        activeTab={activeTab}
        onTabChange={(t: string) => setActiveTab(t as Tab)}
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );

  /* ════════════════════════════════════════════════════════════════
     RENDER
     ════════════════════════════════════════════════════════════ */
  return (
    <DashboardLayout
      title="Teacher Dashboard"
      activeTab={activeTab}
      onTabChange={(t: string) => setActiveTab(t as Tab)}
    >
      {/* ─── OVERVIEW ─────────────────────────────────────────── */}
      {activeTab === "overview" && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "My Students",
                value: stats.totalStudents,
                icon: FaUsers,
                color: "text-primary-600 bg-primary-100 dark:bg-primary-900/40",
              },
              {
                label: "Total Classes",
                value: stats.totalClasses,
                icon: FaCalendarAlt,
                color:
                  "text-secondary-600 bg-secondary-100 dark:bg-secondary-900/40",
              },
              {
                label: "Upcoming",
                value: stats.upcomingClasses,
                icon: FaClock,
                color: "text-amber-600 bg-amber-100 dark:bg-amber-900/40",
              },
              {
                label: "Completed",
                value: stats.completedClasses,
                icon: FaCheckCircle,
                color: "text-green-600 bg-green-100 dark:bg-green-900/40",
              },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-dark-card rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-dark-border"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${s.color}`}>
                    <s.icon className="text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {s.label}
                    </p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">
                      {s.value}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-dark-border">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => router.push("/classes")}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl hover:from-primary-700 hover:to-secondary-700 transition"
              >
                <FaCalendarPlus /> Go to Live Classes
              </button>
              <button
                onClick={() => setActiveTab("students")}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition"
              >
                <FaUsers /> View Students
              </button>
              <button
                onClick={() => setActiveTab("classes")}
                className="flex items-center gap-2 px-4 py-2 bg-secondary-600 text-white rounded-xl hover:bg-secondary-700 transition"
              >
                <FaBookOpen /> Manage Classes
              </button>
            </div>
          </div>

          {/* Upcoming classes preview */}
          {classes.filter(
            (c) => c.status === "scheduled" && new Date(c.scheduledDate) >= now,
          ).length > 0 && (
            <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-dark-border">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                Upcoming Classes
              </h3>
              <div className="space-y-3">
                {classes
                  .filter(
                    (c) =>
                      c.status === "scheduled" &&
                      new Date(c.scheduledDate) >= now,
                  )
                  .sort(
                    (a, b) =>
                      new Date(a.scheduledDate).getTime() -
                      new Date(b.scheduledDate).getTime(),
                  )
                  .slice(0, 3)
                  .map((cls) => (
                    <div
                      key={cls._id}
                      className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-dark-bg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                          <FaVideo className="text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 dark:text-white">
                            {cls.courseType} - {cls.userId?.name || "Student"}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {fmtDate(cls.scheduledDate)} at{" "}
                            {fmtTime(cls.scheduledDate)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => router.push(`/class-room/${cls.roomId}`)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition"
                      >
                        <FaPlay className="text-xs" /> Join
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── STUDENTS ─────────────────────────────────────────── */}
      {activeTab === "students" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
              My Students ({students.length})
            </h3>
          </div>
          {students.length === 0 ? (
            <EmptyState
              icon={<FaUserGraduate />}
              title="No Students Assigned"
              description="No students have been assigned to you yet."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {students.map((s) => (
                <motion.div
                  key={s._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-dark-card rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-dark-border"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                        <FaUserGraduate className="text-primary-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-white">
                          {s.name}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {s.email}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-lg ${s.accountStatus === "approved" ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" : "bg-yellow-100 text-yellow-700"}`}
                    >
                      {s.accountStatus}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <FaBookOpen /> {s.plan || "Free"}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaCheckCircle /> {s.totalClassesTaken || 0} classes
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── CLASSES (Manage) ─────────────────────────────────── */}
      {activeTab === "classes" && (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
              Manage Classes
            </h3>
            <button
              onClick={() => router.push("/classes")}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl hover:from-primary-700 hover:to-secondary-700 transition text-sm"
            >
              <FaCalendarPlus /> Schedule from Live Classes
            </button>
          </div>

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2">
            {(
              ["all", "upcoming", "completed", "missed", "cancelled"] as const
            ).map((f) => (
              <button
                key={f}
                onClick={() => setClassFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  classFilter === f
                    ? "bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-md"
                    : "bg-slate-100 dark:bg-dark-card text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-dark-bg"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)} ({classCounts[f]})
              </button>
            ))}
          </div>

          {/* Class cards */}
          {filteredClasses.length === 0 ? (
            <EmptyState
              icon={<FaCalendarAlt />}
              title="No Classes Found"
              description={`No ${classFilter === "all" ? "" : classFilter} classes yet.`}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredClasses.map((cls) => (
                <motion.div
                  key={cls._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-dark-card rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-dark-border"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <FaBookOpen className="text-primary-600" />
                        <span className="font-semibold text-slate-800 dark:text-white">
                          {cls.courseType}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        <FaUserGraduate className="inline mr-1" />{" "}
                        {cls.userId?.name || "Unknown Student"}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${statusBadge(cls.status)}`}
                    >
                      {cls.status}
                    </span>
                  </div>

                  <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400 mb-4">
                    <p className="flex items-center gap-2">
                      <FaCalendarAlt className="text-slate-400" />{" "}
                      {fmtDate(cls.scheduledDate)} at{" "}
                      {fmtTime(cls.scheduledDate)}
                    </p>
                    <p className="flex items-center gap-2">
                      <FaClock className="text-slate-400" /> {cls.duration}{" "}
                      minutes
                    </p>
                    {cls.notes && (
                      <p className="flex items-center gap-2">
                        <FaStickyNote className="text-slate-400" /> {cls.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {cls.status === "scheduled" && (
                      <>
                        <button
                          onClick={() =>
                            router.push(`/class-room/${cls.roomId}`)
                          }
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition"
                        >
                          <FaVideo className="text-xs" /> Join Room
                        </button>
                        <button
                          onClick={() => handleMarkStatus(cls._id, "completed")}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
                        >
                          <FaCheckCircle className="text-xs" /> Complete
                        </button>
                        <button
                          onClick={() => handleMarkStatus(cls._id, "missed")}
                          className="flex items-center gap-1 px-3 py-1.5 bg-yellow-500 text-white rounded-lg text-sm hover:bg-yellow-600 transition"
                        >
                          <FaBan className="text-xs" /> Missed
                        </button>
                        <button
                          onClick={() => {
                            setRescheduleTarget(cls);
                            setRescheduleForm({
                              scheduledDate: "",
                              duration: cls.duration,
                            });
                            setShowRescheduleModal(true);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700 transition"
                        >
                          <FaRedo className="text-xs" /> Reschedule
                        </button>
                        <button
                          onClick={() => {
                            setCancelTarget(cls);
                            setCancelReason("");
                            setShowCancelModal(true);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition"
                        >
                          <FaTrashAlt className="text-xs" /> Cancel
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── SCHEDULE (Redirect to Live Classes) ─────────────── */}
      {activeTab === "schedule" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
              Scheduled Classes
            </h3>
            <button
              onClick={() => router.push("/classes")}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl hover:from-primary-700 hover:to-secondary-700 transition text-sm"
            >
              <FaCalendarPlus /> Schedule from Live Classes
            </button>
          </div>

          {/* Upcoming scheduled preview */}
          {classes.filter((c) => c.status === "scheduled").length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Your upcoming scheduled classes:
              </p>
              {classes
                .filter((c) => c.status === "scheduled")
                .sort(
                  (a, b) =>
                    new Date(a.scheduledDate).getTime() -
                    new Date(b.scheduledDate).getTime(),
                )
                .slice(0, 10)
                .map((cls) => (
                  <div
                    key={cls._id}
                    className="bg-white dark:bg-dark-card rounded-xl p-4 shadow-sm border border-slate-100 dark:border-dark-border flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-slate-800 dark:text-white">
                        {cls.courseType} — {cls.userId?.name || "Student"}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {fmtDate(cls.scheduledDate)} at{" "}
                        {fmtTime(cls.scheduledDate)} · {cls.duration} min
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/class-room/${cls.roomId}`)}
                        className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition dark:bg-green-900/40 dark:text-green-300"
                      >
                        <FaPlay />
                      </button>
                      <button
                        onClick={() => {
                          setRescheduleTarget(cls);
                          setRescheduleForm({
                            scheduledDate: "",
                            duration: cls.duration,
                          });
                          setShowRescheduleModal(true);
                        }}
                        className="p-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition dark:bg-amber-900/40 dark:text-amber-300"
                      >
                        <FaRedo />
                      </button>
                      <button
                        onClick={() => {
                          setCancelTarget(cls);
                          setCancelReason("");
                          setShowCancelModal(true);
                        }}
                        className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition dark:bg-red-900/40 dark:text-red-300"
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <EmptyState
              icon={<FaCalendarPlus />}
              title="No Scheduled Classes"
              description="Classes are scheduled from the Live Classes section. Go there to schedule a new class."
            />
          )}
        </div>
      )}

      {/* ─── PROFILE ──────────────────────────────────────────── */}
      {activeTab === "profile" && teacherInfo && (
        <div className="max-w-md">
          <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-dark-border space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                <FaChalkboardTeacher className="text-2xl text-primary-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-800 dark:text-white">
                  {teacherInfo.name}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {teacherInfo.email}
                </p>
              </div>
            </div>
            <div className="border-t border-slate-200 dark:border-dark-border pt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Role</span>
                <span className="font-medium text-slate-800 dark:text-white">
                  Teacher
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  Students
                </span>
                <span className="font-medium text-slate-800 dark:text-white">
                  {stats?.totalStudents || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  Total Classes
                </span>
                <span className="font-medium text-slate-800 dark:text-white">
                  {stats?.totalClasses || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  Completed
                </span>
                <span className="font-medium text-slate-800 dark:text-white">
                  {stats?.completedClasses || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
         MODALS
         ═══════════════════════════════════════════════════════ */}

      {/* Reschedule Modal */}
      <Modal
        open={showRescheduleModal}
        onClose={() => {
          setShowRescheduleModal(false);
          setRescheduleTarget(null);
        }}
        title="Reschedule Class"
      >
        {rescheduleTarget && (
          <div className="space-y-4">
            <div className="bg-slate-50 dark:bg-dark-bg rounded-xl p-4 text-sm space-y-1">
              <p>
                <span className="text-slate-500 dark:text-slate-400">
                  Course:
                </span>{" "}
                <strong>{rescheduleTarget.courseType}</strong>
              </p>
              <p>
                <span className="text-slate-500 dark:text-slate-400">
                  Student:
                </span>{" "}
                <strong>{rescheduleTarget.userId?.name || "Unknown"}</strong>
              </p>
              <p>
                <span className="text-slate-500 dark:text-slate-400">
                  Current Date:
                </span>{" "}
                <strong>
                  {fmtDate(rescheduleTarget.scheduledDate)} at{" "}
                  {fmtTime(rescheduleTarget.scheduledDate)}
                </strong>
              </p>
            </div>
            <div>
              <label className={labelClass}>New Date &amp; Time *</label>
              <input
                type="datetime-local"
                value={rescheduleForm.scheduledDate}
                onChange={(e) =>
                  setRescheduleForm({
                    ...rescheduleForm,
                    scheduledDate: e.target.value,
                  })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Duration (min)</label>
              <input
                type="number"
                min={15}
                max={180}
                value={rescheduleForm.duration}
                onChange={(e) =>
                  setRescheduleForm({
                    ...rescheduleForm,
                    duration: +e.target.value,
                  })
                }
                className={inputClass}
              />
            </div>
            <button
              onClick={handleReschedule}
              disabled={!rescheduleForm.scheduledDate}
              className="w-full py-2.5 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 transition disabled:opacity-50"
            >
              Reschedule Class
            </button>
          </div>
        )}
      </Modal>

      {/* Cancel Modal */}
      <Modal
        open={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setCancelTarget(null);
        }}
        title="Cancel Class"
      >
        {cancelTarget && (
          <div className="space-y-4">
            <p className="text-slate-600 dark:text-slate-400">
              Are you sure you want to cancel the{" "}
              <strong>{cancelTarget.courseType}</strong> class with{" "}
              <strong>{cancelTarget.userId?.name || "student"}</strong> on{" "}
              <strong>{fmtDate(cancelTarget.scheduledDate)}</strong>?
            </p>
            <p className="text-sm text-red-600 dark:text-red-400">
              The student will be notified about this cancellation.
            </p>
            <div>
              <label className={labelClass}>Reason (optional)</label>
              <textarea
                rows={2}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className={inputClass}
                placeholder="Why is this class being cancelled?"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelTarget(null);
                }}
                className="flex-1 py-2.5 border border-slate-200 dark:border-dark-border rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-bg transition"
              >
                Keep Class
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition"
              >
                Cancel Class
              </button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
