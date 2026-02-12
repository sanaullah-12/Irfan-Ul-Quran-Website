import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "../components/DashboardLayout";
import EmptyState from "../components/EmptyState";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import {
  FaUserGraduate, FaBookOpen, FaCalendarAlt, FaClock, FaCheckCircle,
  FaHistory, FaUser, FaStar, FaPlay, FaVideo, FaGraduationCap,
  FaTimesCircle, FaLock, FaCreditCard, FaBell, FaTrashAlt, FaBan,
  FaStickyNote,
} from "react-icons/fa";
import api from "../utils/api";

/* ── Interfaces ───────────────────────────────────────────────── */
interface Stats { totalClassesTaken: number; upcomingClasses: number; coursesEnrolled: number; }
interface UserInfo { name: string; email: string; plan: string; planExpiryDate: string; hoursRemaining: number; lastActivity: string; }
interface ClassItem { _id: string; courseType: string; teacherName: string; scheduledDate: string; duration: number; status: string; roomId: string; notes?: string; }
interface Course { _id: string; courseTitle: string; courseType: string; status: string; progress: number; enrollmentDate: string; description?: string; }
interface NextClass { _id: string; courseType: string; teacherName: string; scheduledDate: string; duration: number; roomId: string; }
interface NotificationItem { _id: string; type: string; title: string; message: string; read: boolean; createdAt: string; metadata?: any; }

type Tab = "overview" | "courses" | "upcoming" | "history" | "notifications" | "profile";

export default function StudentDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [upcomingClasses, setUpcomingClasses] = useState<ClassItem[]>([]);
  const [classHistory, setClassHistory] = useState<ClassItem[]>([]);
  const [nextClass, setNextClass] = useState<NextClass | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    const t = router.query.tab as Tab | undefined;
    if (t && ["overview", "courses", "upcoming", "history", "notifications", "profile"].includes(t)) setActiveTab(t);
  }, [router.query.tab]);

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== "student") { router.push("/"); return; }
      fetchData();
    }
  }, [authLoading, user]);

  useEffect(() => {
    if (!nextClass) return;
    const interval = setInterval(() => {
      const diff = new Date(nextClass.scheduledDate).getTime() - Date.now();
      if (diff <= 0) { setCountdown("Starting now!"); clearInterval(interval); return; }
      const days = Math.floor(diff / 86400000);
      const hrs = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setCountdown(days > 0 ? `${days}d ${hrs}h ${mins}m` : `${hrs}h ${mins}m ${secs}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [nextClass]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Use allSettled so one failing request doesn't break everything
      const results = await Promise.allSettled([
        api.get("/dashboard/overview"),
        api.get("/dashboard/courses"),
        api.get("/dashboard/classes/upcoming"),
        api.get("/dashboard/classes/history"),
        api.get("/dashboard/classes/next"),
        api.get("/notifications"),
      ]);
      const [overviewRes, coursesRes, upcomingRes, historyRes, nextRes, notifRes] = results;
      if (overviewRes.status === "fulfilled") { setStats(overviewRes.value.data.stats); setUserInfo(overviewRes.value.data.user); }
      if (coursesRes.status === "fulfilled") setCourses(coursesRes.value.data.courses || []);
      if (upcomingRes.status === "fulfilled") setUpcomingClasses(upcomingRes.value.data.classes || []);
      if (historyRes.status === "fulfilled") setClassHistory(historyRes.value.data.classes || []);
      if (nextRes.status === "fulfilled") setNextClass(nextRes.value.data.nextClass || null);
      if (notifRes.status === "fulfilled") { setNotifications(notifRes.value.data.notifications || []); setUnreadCount(notifRes.value.data.unreadCount || 0); }
    } catch (error) { console.error("Student data fetch error:", error); }
    finally { setLoading(false); }
  };

  /* Notification actions */
  const markRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };
  const markAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {}
  };
  const clearNotifications = async () => {
    try {
      await api.delete("/notifications/clear");
      setNotifications(prev => prev.filter(n => !n.read));
    } catch {}
  };

  /* Helpers */
  const fmt = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const fmtTime = (d: string) => new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const fmtRelative = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };
  const bc: Record<string, string> = {
    scheduled: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    missed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    cancelled: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    paused: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  };
  const badge = (v: string) => <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${bc[v] || "bg-gray-100 text-gray-700"}`}>{v}</span>;
  const notifIcon = (type: string) => {
    if (type === "class_scheduled") return <FaCalendarAlt className="text-blue-500" />;
    if (type === "class_cancelled") return <FaBan className="text-red-500" />;
    if (type === "class_reminder") return <FaClock className="text-amber-500" />;
    if (type === "class_completed") return <FaCheckCircle className="text-green-500" />;
    return <FaBell className="text-purple-500" />;
  };

  const changeTab = (tab: string) => {
    setActiveTab(tab as Tab);
    router.replace({ pathname: router.pathname, query: tab === "overview" ? {} : { tab } }, undefined, { shallow: true });
  };

  if (authLoading || loading) return (
    <DashboardLayout title="Student Dashboard" activeTab={activeTab} onTabChange={changeTab} pendingBadge={unreadCount > 0 ? unreadCount : undefined}>
      <div className="flex items-center justify-center h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" /></div>
    </DashboardLayout>
  );
  if (!user || user.role !== "student") return null;

  return (
    <DashboardLayout title="Student Dashboard" activeTab={activeTab} onTabChange={changeTab} pendingBadge={unreadCount > 0 ? unreadCount : undefined}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-1">
          <FaUserGraduate className="text-2xl text-emerald-600" />
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">My Dashboard</h1>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">Welcome back, {user.name}. Track your learning progress.</p>
      </div>

      {/* Unread Notifications Banner */}
      {unreadCount > 0 && activeTab !== "notifications" && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-center justify-between cursor-pointer"
          onClick={() => changeTab("notifications")}>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <FaBell className="text-blue-600 text-xl" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unreadCount}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300">You have {unreadCount} new notification{unreadCount > 1 ? "s" : ""}</p>
              <p className="text-xs text-blue-600 dark:text-blue-400">Click to view your notifications</p>
            </div>
          </div>
          <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">View &rarr;</span>
        </motion.div>
      )}

      {/* Resource Access Banner */}
      {user.resourceAccess === false && (
        <div className="mb-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FaLock className="text-amber-600 text-xl" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-400">Resource Access Required</p>
              <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">Request access to unlock Quran reader, Juz viewer, and learning materials.</p>
            </div>
          </div>
          <button onClick={() => router.push("/resources")} className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-all">Request Access</button>
        </div>
      )}

      {/* ═══ OVERVIEW ═══ */}
      {activeTab === "overview" && stats && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            {[
              { l: "Classes Taken", v: stats.totalClassesTaken, i: <FaCheckCircle />, c: "from-green-500 to-emerald-500" },
              { l: "Upcoming Classes", v: stats.upcomingClasses, i: <FaClock />, c: "from-amber-500 to-orange-500" },
              { l: "Courses Enrolled", v: stats.coursesEnrolled, i: <FaBookOpen />, c: "from-blue-500 to-cyan-500" },
            ].map((c, i) => (
              <motion.div key={c.l} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-dark-card rounded-xl border border-slate-100 dark:border-dark-border p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">{c.l}</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">{c.v}</p>
                  </div>
                  <div className={`w-11 h-11 bg-gradient-to-br ${c.c} rounded-xl flex items-center justify-center text-white`}>{c.i}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Next Class Countdown + Plan Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
            <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-100 dark:border-dark-border shadow-sm p-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center"><FaCalendarAlt className="mr-2 text-blue-500" />Next Class</h3>
              {nextClass ? (
                <div>
                  <div className="text-center mb-4">
                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">{countdown}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">until your next class</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-dark-bg rounded-xl p-4 border border-slate-200 dark:border-dark-border">
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">{nextClass.courseType}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {fmt(nextClass.scheduledDate)} at {fmtTime(nextClass.scheduledDate)} &middot; {nextClass.duration}min &middot; {nextClass.teacherName}
                    </p>
                    <button onClick={() => router.push(`/class-room/${nextClass.roomId}`)}
                      className="mt-3 w-full px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-lg text-sm font-medium flex items-center justify-center space-x-2">
                      <FaVideo className="text-sm" /><span>Join Class</span>
                    </button>
                  </div>
                </div>
              ) : (
                <EmptyState icon={<FaCalendarAlt />} title="No upcoming class" description="Your teacher will schedule your next class." />
              )}
            </div>

            <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-100 dark:border-dark-border shadow-sm p-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center"><FaCreditCard className="mr-2 text-purple-500" />My Plan</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Current Plan</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${userInfo?.plan === "premium" ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-white" : userInfo?.plan === "standard" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"}`}>
                    {(userInfo?.plan || "free").toUpperCase()}
                  </span>
                </div>
                {userInfo?.hoursRemaining !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Hours Remaining</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-white">{userInfo.hoursRemaining}h</span>
                  </div>
                )}
                {userInfo?.planExpiryDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Expires</span>
                    <span className="text-sm font-medium text-slate-800 dark:text-white">{fmt(userInfo.planExpiryDate)}</span>
                  </div>
                )}
                {userInfo?.plan === "free" && (
                  <button onClick={() => router.push("/plans")}
                    className="w-full mt-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white rounded-lg text-sm font-semibold flex items-center justify-center space-x-2">
                    <FaStar className="text-sm" /><span>Upgrade Plan</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Recent Notifications */}
          {notifications.filter(n => !n.read).length > 0 && (
            <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-100 dark:border-dark-border shadow-sm p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center"><FaBell className="mr-2 text-blue-500" />Recent Notifications</h3>
                <button onClick={() => changeTab("notifications")} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">View All</button>
              </div>
              <div className="space-y-2">
                {notifications.filter(n => !n.read).slice(0, 3).map(n => (
                  <div key={n._id} className="flex items-start gap-3 p-3 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 cursor-pointer"
                    onClick={() => { markRead(n._id); changeTab("notifications"); }}>
                    <div className="mt-0.5">{notifIcon(n.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-white">{n.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{n.message}</p>
                    </div>
                    <span className="text-[11px] text-slate-400 whitespace-nowrap">{fmtRelative(n.createdAt)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Classes */}
          {upcomingClasses.length > 0 && (
            <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-100 dark:border-dark-border shadow-sm p-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center"><FaClock className="mr-2 text-amber-500" />Upcoming Classes</h3>
              <div className="space-y-3">
                {upcomingClasses.slice(0, 3).map(cls => (
                  <div key={cls._id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border">
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-white">{cls.courseType} &middot; {cls.teacherName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{fmt(cls.scheduledDate)} at {fmtTime(cls.scheduledDate)} &middot; {cls.duration}min</p>
                    </div>
                    <button onClick={() => router.push(`/class-room/${cls.roomId}`)}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs rounded-lg font-medium"><FaPlay className="inline mr-1" />Join</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* ═══ COURSES ═══ */}
      {activeTab === "courses" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-100 dark:border-dark-border shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-5 flex items-center"><FaGraduationCap className="mr-2 text-blue-500" />My Courses</h2>
            {courses.length === 0 ? (
              <EmptyState icon={<FaBookOpen />} title="No courses enrolled" description="Enroll in a course to begin your Quran learning journey." actionLabel="Browse Courses" onAction={() => router.push("/courses")} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.map(c => (
                  <div key={c._id} className="bg-slate-50 dark:bg-dark-bg rounded-xl p-5 border border-slate-200 dark:border-dark-border">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-white">{c.courseTitle || c.courseType}</h3>
                      {badge(c.status)}
                    </div>
                    {c.description && <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{c.description}</p>}
                    <div className="relative w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all" style={{ width: `${c.progress || 0}%` }} />
                    </div>
                    <div className="flex justify-between mt-1.5">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">Progress</span>
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">{c.progress || 0}%</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">Enrolled: {fmt(c.enrollmentDate)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ═══ UPCOMING ═══ */}
      {activeTab === "upcoming" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-100 dark:border-dark-border shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-5 flex items-center"><FaClock className="mr-2 text-amber-500" />Upcoming Classes</h2>
            {upcomingClasses.length === 0 ? (
              <EmptyState icon={<FaCalendarAlt />} title="No upcoming classes" description="Your teacher will schedule classes for you. Check back soon!" />
            ) : (
              <div className="space-y-3">
                {upcomingClasses.map(cls => (
                  <div key={cls._id} className="p-4 rounded-xl bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-white"><FaClock className="text-sm" /></div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-white">{cls.courseType}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{cls.teacherName} &middot; {fmt(cls.scheduledDate)} at {fmtTime(cls.scheduledDate)} &middot; {cls.duration}min</p>
                        </div>
                      </div>
                      <button onClick={() => router.push(`/class-room/${cls.roomId}`)}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs rounded-lg font-medium flex items-center space-x-1">
                        <FaVideo className="text-[10px]" /><span>Join</span>
                      </button>
                    </div>
                    {cls.notes && <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1"><FaStickyNote className="text-slate-400" /> {cls.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ═══ HISTORY ═══ */}
      {activeTab === "history" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-100 dark:border-dark-border shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-5 flex items-center"><FaHistory className="mr-2 text-slate-500" />Class History</h2>
            {classHistory.length === 0 ? (
              <EmptyState icon={<FaHistory />} title="No class history" description="Your completed and past classes will appear here." />
            ) : (
              <div className="space-y-3">
                {classHistory.map(cls => (
                  <div key={cls._id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${cls.status === "completed" ? "bg-gradient-to-br from-green-500 to-emerald-500" : cls.status === "missed" ? "bg-gradient-to-br from-red-500 to-pink-500" : "bg-gradient-to-br from-slate-400 to-slate-500"}`}>
                        {cls.status === "completed" ? <FaCheckCircle className="text-sm" /> : <FaTimesCircle className="text-sm" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-white">{cls.courseType}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{cls.teacherName} &middot; {fmt(cls.scheduledDate)} &middot; {cls.duration}min</p>
                        {cls.notes && <p className="text-xs text-slate-400 mt-0.5">{cls.notes}</p>}
                      </div>
                    </div>
                    {badge(cls.status)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ═══ NOTIFICATIONS ═══ */}
      {activeTab === "notifications" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-100 dark:border-dark-border shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center">
                <FaBell className="mr-2 text-blue-500" />Notifications
                {unreadCount > 0 && <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">{unreadCount}</span>}
              </h2>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition">
                    Mark All Read
                  </button>
                )}
                {notifications.some(n => n.read) && (
                  <button onClick={clearNotifications} className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition">
                    <FaTrashAlt className="inline mr-1" />Clear Read
                  </button>
                )}
              </div>
            </div>

            {notifications.length === 0 ? (
              <EmptyState icon={<FaBell />} title="No notifications" description="You're all caught up! Notifications about your classes will appear here." />
            ) : (
              <div className="space-y-2">
                {notifications.map(n => (
                  <motion.div key={n._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    className={`flex items-start gap-3 p-4 rounded-xl border transition cursor-pointer ${
                      n.read
                        ? "bg-slate-50 dark:bg-dark-bg border-slate-200 dark:border-dark-border"
                        : "bg-blue-50/60 dark:bg-blue-900/15 border-blue-200 dark:border-blue-800/50"
                    }`}
                    onClick={() => !n.read && markRead(n._id)}>
                    <div className="mt-0.5 flex-shrink-0">{notifIcon(n.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-medium ${n.read ? "text-slate-600 dark:text-slate-400" : "text-slate-800 dark:text-white"}`}>{n.title}</p>
                        {!n.read && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{n.message}</p>
                      <p className="text-[11px] text-slate-400 mt-1">{fmtRelative(n.createdAt)}</p>
                    </div>
                    {n.metadata?.roomId && n.type === "class_scheduled" && (
                      <button onClick={(e) => { e.stopPropagation(); router.push(`/class-room/${n.metadata.roomId}`); }}
                        className="flex-shrink-0 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs rounded-lg font-medium flex items-center gap-1">
                        <FaVideo className="text-[10px]" /> Join
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ═══ PROFILE ═══ */}
      {activeTab === "profile" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-100 dark:border-dark-border shadow-sm p-6 max-w-xl">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-5 flex items-center"><FaUser className="mr-2 text-emerald-500" />My Profile</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">{user.name.charAt(0).toUpperCase()}</div>
                <div>
                  <p className="text-lg font-bold text-slate-800 dark:text-white">{user.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-5">
                <div className="bg-slate-50 dark:bg-dark-bg rounded-xl p-4 border border-slate-200 dark:border-dark-border">
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Role</p>
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 capitalize">{user.role}</p>
                </div>
                <div className="bg-slate-50 dark:bg-dark-bg rounded-xl p-4 border border-slate-200 dark:border-dark-border">
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Plan</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white capitalize">{userInfo?.plan || "free"}</p>
                </div>
                <div className="bg-slate-50 dark:bg-dark-bg rounded-xl p-4 border border-slate-200 dark:border-dark-border">
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Classes Taken</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">{stats?.totalClassesTaken || 0}</p>
                </div>
                <div className="bg-slate-50 dark:bg-dark-bg rounded-xl p-4 border border-slate-200 dark:border-dark-border">
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Courses</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">{stats?.coursesEnrolled || 0}</p>
                </div>
              </div>
              {userInfo?.lastActivity && <p className="text-xs text-slate-400 mt-3">Last active: {fmt(userInfo.lastActivity)}</p>}
            </div>
          </div>
        </motion.div>
      )}
    </DashboardLayout>
  );
}
