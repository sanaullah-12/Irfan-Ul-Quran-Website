import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "../../components/DashboardLayout";
import EmptyState from "../../components/EmptyState";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import {
  FaUsers,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaShieldAlt,
  FaBan,
  FaUnlock,
  FaSearch,
  FaBookOpen,
  FaCreditCard,
  FaChartLine,
  FaInbox,
  FaFileInvoiceDollar,
  FaClipboardList,
  FaCalendarPlus,
  FaVideo,
  FaTrashAlt,
  FaRedo,
} from "react-icons/fa";
import api from "../../utils/api";

interface Stats {
  totalStudents: number;
  totalTeachers: number;
  totalUsers: number;
  blockedUsers: number;
  totalClasses: number;
  upcomingClasses: number;
  completedClasses: number;
  pendingResources: number;
}
interface UserItem {
  _id: string;
  name: string;
  email: string;
  role: string;
  accountStatus: string;
  resourceAccess: boolean;
  plan: string;
  createdAt: string;
}
interface ResourceReq {
  _id: string;
  userId: { _id: string; name: string; email: string; role: string };
  status: string;
  requestMessage: string;
  createdAt: string;
}
interface ActivityItem {
  _id: string;
  userId: { name: string; email: string; role: string };
  activityType: string;
  timestamp: string;
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
  teacherId?: { _id: string; name: string; email: string };
}
interface PaymentItem {
  userName: string;
  userEmail: string;
  amount: number;
  currency: string;
  plan: string;
  date: string;
}

type Tab =
  | "overview"
  | "users"
  | "resources"
  | "classes"
  | "activity"
  | "payments";

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [resourceRequests, setResourceRequests] = useState<ResourceReq[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityItem[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userFilter, setUserFilter] = useState({
    role: "",
    status: "",
    search: "",
  });
  const [teachers, setTeachers] = useState<UserItem[]>([]);
  const [, setStudents] = useState<UserItem[]>([]);
  const [assignTeacherId, setAssignTeacherId] = useState("");

  // Reschedule modal
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState<ClassItem | null>(
    null,
  );
  const [rescheduleForm, setRescheduleForm] = useState({
    scheduledDate: "",
    duration: 60,
  });

  // Cancel modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<ClassItem | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  // Class filter
  const [classFilter, setClassFilter] = useState<string>("all");

  useEffect(() => {
    const t = router.query.tab as Tab | undefined;
    if (
      t &&
      [
        "overview",
        "users",
        "resources",
        "classes",
        "activity",
        "payments",
      ].includes(t)
    )
      setActiveTab(t);
  }, [router.query.tab]);

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== "admin") {
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
      const [
        overviewRes,
        usersRes,
        resourceRes,
        activityRes,
        classesRes,
        paymentsRes,
      ] = await Promise.all([
        api.get("/admin/overview"),
        api.get("/admin/users"),
        api.get("/admin/resource-requests"),
        api.get("/admin/activity-logs?limit=50"),
        api.get("/admin/classes"),
        api.get("/admin/payments").catch(() => ({ data: { payments: [] } })),
      ]);
      setStats(overviewRes.data.stats);
      setUsers(usersRes.data.users);
      setResourceRequests(resourceRes.data.requests);
      setActivityLogs(activityRes.data.logs);
      setClasses(classesRes.data.classes || []);
      setPayments(paymentsRes.data.payments || []);
      setTeachers(
        usersRes.data.users.filter(
          (u: UserItem) =>
            u.role === "teacher" && u.accountStatus === "approved",
        ),
      );
      setStudents(
        usersRes.data.users.filter(
          (u: UserItem) =>
            u.role === "student" && u.accountStatus === "approved",
        ),
      );
    } catch (error) {
      console.error("Admin data fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  // User actions
  const handleBlockUser = async (userId: string) => {
    if (!confirm("Block this user?")) return;
    try {
      await api.patch(`/admin/users/${userId}/block`);
      fetchData();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      alert(msg || "Error");
    }
  };
  const handleUnblockUser = async (userId: string) => {
    try {
      await api.patch(`/admin/users/${userId}/unblock`);
      fetchData();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      alert(msg || "Error");
    }
  };
  const handleApproveResource = async (id: string) => {
    try {
      await api.patch(`/admin/resource-requests/${id}/approve`);
      fetchData();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      alert(msg || "Error");
    }
  };
  const handleRejectResource = async (id: string) => {
    try {
      await api.patch(`/admin/resource-requests/${id}/reject`);
      fetchData();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      alert(msg || "Error");
    }
  };
  const handleAssignTeacher = async (studentId: string) => {
    if (!assignTeacherId) {
      alert("Select a teacher first");
      return;
    }
    try {
      await api.patch(`/admin/users/${studentId}/assign-teacher`, {
        teacherId: assignTeacherId,
      });
      setAssignTeacherId("");
      fetchData();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      alert(msg || "Error");
    }
  };

  // Schedule class - redirects to Live Classes page
  const goToLiveClasses = () => router.push("/classes");

  // Cancel class
  const handleCancelClass = async () => {
    if (!cancelTarget) return;
    try {
      await api.patch(`/admin/classes/${cancelTarget._id}/cancel`, {
        reason: cancelReason,
      });
      setShowCancelModal(false);
      setCancelTarget(null);
      setCancelReason("");
      fetchData();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      alert(msg || "Error");
    }
  };

  // Reschedule class
  const handleRescheduleClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleTarget || !rescheduleForm.scheduledDate) {
      alert("Select a new date");
      return;
    }
    try {
      await api.patch(
        `/admin/classes/${rescheduleTarget._id}/reschedule`,
        rescheduleForm,
      );
      setShowRescheduleModal(false);
      setRescheduleTarget(null);
      setRescheduleForm({ scheduledDate: "", duration: 60 });
      fetchData();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      alert(msg || "Error");
    }
  };

  const filteredUsers = users.filter((u) => {
    if (userFilter.role && u.role !== userFilter.role) return false;
    if (userFilter.status && u.accountStatus !== userFilter.status)
      return false;
    if (userFilter.search) {
      const s = userFilter.search.toLowerCase();
      if (
        !u.name.toLowerCase().includes(s) &&
        !u.email.toLowerCase().includes(s)
      )
        return false;
    }
    return true;
  });

  const filteredClasses =
    classFilter === "all"
      ? classes
      : classes.filter((c) => c.status === classFilter);

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  const fmtTime = (d: string) =>
    new Date(d).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const bc: Record<string, string> = {
    pending:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    approved:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    blocked: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    admin:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    teacher: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    student:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    scheduled:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    completed:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    missed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    cancelled:
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  };
  const badge = (v: string) => (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${bc[v] || "bg-gray-100 text-gray-700"}`}
    >
      {v}
    </span>
  );

  const changeTab = (tab: string) => {
    setActiveTab(tab as Tab);
    router.replace(
      { pathname: router.pathname, query: tab === "overview" ? {} : { tab } },
      undefined,
      { shallow: true },
    );
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout
        title="Admin Dashboard"
        activeTab={activeTab}
        onTabChange={changeTab}
      >
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      </DashboardLayout>
    );
  }
  if (!user || user.role !== "admin") return null;

  // Modal overlay helper
  const Modal = ({
    children,
    onClose,
  }: {
    children: React.ReactNode;
    onClose: () => void;
  }) => (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-dark-card rounded-2xl border border-slate-200 dark:border-dark-border shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </div>
  );

  const inputClass =
    "w-full px-4 py-2.5 border border-slate-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none";
  const labelClass =
    "block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide";

  return (
    <DashboardLayout
      title="Admin Dashboard"
      activeTab={activeTab}
      onTabChange={changeTab}
      pendingBadge={stats?.pendingResources}
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-1">
          <FaShieldAlt className="text-2xl text-primary-600" />
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
            Admin Dashboard
          </h1>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage users, classes, resources, and monitor platform activity
        </p>
      </div>

      {/* ═══ OVERVIEW ═══ */}
      {activeTab === "overview" && stats && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
            {[
              {
                l: "Total Students",
                v: stats.totalStudents,
                i: <FaUserGraduate />,
                c: "from-emerald-500 to-green-500",
              },
              {
                l: "Total Teachers",
                v: stats.totalTeachers,
                i: <FaChalkboardTeacher />,
                c: "from-blue-500 to-cyan-500",
              },
              {
                l: "Total Users",
                v: stats.totalUsers,
                i: <FaUsers />,
                c: "from-amber-500 to-orange-500",
              },
              {
                l: "Blocked Users",
                v: stats.blockedUsers,
                i: <FaBan />,
                c: "from-red-500 to-pink-500",
              },
              {
                l: "Total Classes",
                v: stats.totalClasses,
                i: <FaCalendarAlt />,
                c: "from-primary-600 to-secondary-600",
              },
              {
                l: "Upcoming Classes",
                v: stats.upcomingClasses,
                i: <FaClock />,
                c: "from-secondary-500 to-secondary-600",
              },
              {
                l: "Completed Classes",
                v: stats.completedClasses,
                i: <FaCheckCircle />,
                c: "from-green-600 to-emerald-500",
              },
              {
                l: "Resource Requests",
                v: stats.pendingResources,
                i: <FaBookOpen />,
                c: "from-orange-500 to-red-500",
              },
            ].map((c, i) => (
              <motion.div
                key={c.l}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white dark:bg-dark-card rounded-xl border border-slate-100 dark:border-dark-border p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">
                      {c.l}
                    </p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">
                      {c.v}
                    </p>
                  </div>
                  <div
                    className={`w-11 h-11 bg-gradient-to-br ${c.c} rounded-xl flex items-center justify-center text-white`}
                  >
                    {c.i}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          {stats.pendingResources > 0 && (
            <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-xl p-5 flex items-center justify-between mb-5">
              <div className="flex items-center space-x-3">
                <FaBookOpen className="text-orange-600 text-xl" />
                <p className="text-sm font-medium text-orange-800 dark:text-orange-400">
                  {stats.pendingResources} pending resource request(s)
                </p>
              </div>
              <button
                onClick={() => changeTab("resources")}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-all"
              >
                Review
              </button>
            </div>
          )}
          {stats.upcomingClasses > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl p-5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FaCalendarAlt className="text-blue-600 text-xl" />
                <p className="text-sm font-medium text-blue-800 dark:text-blue-400">
                  {stats.upcomingClasses} upcoming class(es)
                </p>
              </div>
              <button
                onClick={() => changeTab("classes")}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all"
              >
                View Classes
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* ═══ USERS ═══ */}
      {activeTab === "users" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-100 dark:border-dark-border p-5 mb-5 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={userFilter.search}
                  onChange={(e) =>
                    setUserFilter({ ...userFilter, search: e.target.value })
                  }
                  className={`${inputClass} !pl-9`}
                />
              </div>
              <select
                value={userFilter.role}
                onChange={(e) =>
                  setUserFilter({ ...userFilter, role: e.target.value })
                }
                className={inputClass}
              >
                <option value="">All Roles</option>
                <option value="student">Students</option>
                <option value="teacher">Teachers</option>
                <option value="admin">Admins</option>
              </select>
              <select
                value={userFilter.status}
                onChange={(e) =>
                  setUserFilter({ ...userFilter, status: e.target.value })
                }
                className={inputClass}
              >
                <option value="">All Status</option>
                <option value="approved">Approved</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>
          <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-100 dark:border-dark-border shadow-sm overflow-hidden">
            {filteredUsers.length === 0 ? (
              <EmptyState
                icon={<FaUsers />}
                title="No users found"
                description="Adjust your filters or check back later."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-dark-bg border-b border-slate-200 dark:border-dark-border">
                    <tr>
                      {[
                        "User",
                        "Role",
                        "Status",
                        "Resources",
                        "Joined",
                        "Actions",
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
                    {filteredUsers.map((u) => (
                      <tr
                        key={u._id}
                        className="hover:bg-slate-50 dark:hover:bg-dark-bg transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <p className="text-sm font-medium text-slate-800 dark:text-white">
                            {u.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {u.email}
                          </p>
                        </td>
                        <td className="px-5 py-3.5">{badge(u.role)}</td>
                        <td className="px-5 py-3.5">
                          {badge(u.accountStatus)}
                        </td>
                        <td className="px-5 py-3.5">
                          {u.resourceAccess ? (
                            <FaCheckCircle className="text-green-500" />
                          ) : (
                            <FaTimesCircle className="text-red-400" />
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-slate-500 dark:text-slate-400">
                          {fmt(u.createdAt)}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                            {u.accountStatus === "approved" &&
                              u.role !== "admin" && (
                                <button
                                  onClick={() => handleBlockUser(u._id)}
                                  className="px-2.5 py-1 bg-red-500 hover:bg-red-600 text-white text-[11px] rounded-lg font-medium flex items-center space-x-1"
                                >
                                  <FaBan className="text-[9px]" />
                                  <span>Block</span>
                                </button>
                              )}
                            {u.accountStatus === "blocked" && (
                              <button
                                onClick={() => handleUnblockUser(u._id)}
                                className="px-2.5 py-1 bg-green-500 hover:bg-green-600 text-white text-[11px] rounded-lg font-medium flex items-center space-x-1"
                              >
                                <FaUnlock className="text-[9px]" />
                                <span>Unblock</span>
                              </button>
                            )}
                            {u.role === "student" &&
                              u.accountStatus === "approved" && (
                                <div className="flex items-center space-x-1">
                                  <select
                                    value={assignTeacherId}
                                    onChange={(e) =>
                                      setAssignTeacherId(e.target.value)
                                    }
                                    className="px-2 py-1 border border-slate-200 dark:border-dark-border rounded text-[11px] bg-white dark:bg-dark-bg text-slate-800 dark:text-white"
                                  >
                                    <option value="">Assign Teacher</option>
                                    {teachers.map((t) => (
                                      <option key={t._id} value={t._id}>
                                        {t.name}
                                      </option>
                                    ))}
                                  </select>
                                  {assignTeacherId && (
                                    <button
                                      onClick={() => handleAssignTeacher(u._id)}
                                      className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-[11px] rounded font-medium"
                                    >
                                      Assign
                                    </button>
                                  )}
                                </div>
                              )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ═══ RESOURCES ═══ */}
      {activeTab === "resources" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-100 dark:border-dark-border shadow-sm p-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-5 flex items-center">
              <FaBookOpen className="mr-2 text-orange-500" />
              Resource Access Requests
            </h2>
            {resourceRequests.length === 0 ? (
              <EmptyState
                icon={<FaInbox />}
                title="No resource requests"
                description="When users request resource access, they will appear here."
              />
            ) : (
              <div className="space-y-3">
                {resourceRequests.map((req) => (
                  <div
                    key={req._id}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-dark-bg rounded-xl border border-slate-200 dark:border-dark-border"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-white">
                        {req.userId?.name || "Unknown"}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {req.userId?.email} &middot; {req.userId?.role}
                      </p>
                      {req.requestMessage && (
                        <p className="text-xs text-slate-400 mt-1 italic">
                          &ldquo;{req.requestMessage}&rdquo;
                        </p>
                      )}
                      <p className="text-[11px] text-slate-400 mt-1">
                        {fmt(req.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {req.status === "pending" ? (
                        <>
                          <button
                            onClick={() => handleApproveResource(req._id)}
                            className="px-3.5 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs rounded-lg font-medium"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectResource(req._id)}
                            className="px-3.5 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs rounded-lg font-medium"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        badge(req.status)
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ═══ CLASSES (FULL MANAGEMENT) ═══ */}
      {activeTab === "classes" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Header + Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center">
              <FaCalendarAlt className="mr-2 text-primary-500" />
              Class Management
            </h2>
            <button
              onClick={goToLiveClasses}
              className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white rounded-xl text-sm font-semibold flex items-center space-x-2 shadow-md transition-all"
            >
              <FaCalendarPlus />
              <span>Schedule from Live Classes</span>
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-5">
            {[
              { v: "all", l: "All" },
              { v: "scheduled", l: "Upcoming" },
              { v: "completed", l: "Completed" },
              { v: "missed", l: "Missed" },
              { v: "cancelled", l: "Cancelled" },
            ].map((f) => (
              <button
                key={f.v}
                onClick={() => setClassFilter(f.v)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${classFilter === f.v ? "bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-md" : "bg-white dark:bg-dark-card text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-dark-border hover:bg-slate-50"}`}
              >
                {f.l}{" "}
                {f.v !== "all"
                  ? `(${classes.filter((c) => c.status === f.v).length})`
                  : `(${classes.length})`}
              </button>
            ))}
          </div>

          {/* Class List */}
          <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-100 dark:border-dark-border shadow-sm overflow-hidden">
            {filteredClasses.length === 0 ? (
              <EmptyState
                icon={<FaCalendarAlt />}
                title="No classes found"
                description="Schedule a new class from the Live Classes page."
                actionLabel="Go to Live Classes"
                onAction={goToLiveClasses}
              />
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-dark-border">
                {filteredClasses.map((cls) => (
                  <div
                    key={cls._id}
                    className="p-5 hover:bg-slate-50 dark:hover:bg-dark-bg transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                      <div className="flex items-start space-x-4 flex-1">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center text-white flex-shrink-0 ${cls.status === "completed" ? "bg-gradient-to-br from-green-500 to-emerald-500" : cls.status === "scheduled" ? "bg-gradient-to-br from-blue-500 to-cyan-500" : cls.status === "cancelled" ? "bg-gradient-to-br from-slate-400 to-slate-500" : "bg-gradient-to-br from-red-500 to-pink-500"}`}
                        >
                          {cls.status === "completed" ? (
                            <FaCheckCircle />
                          ) : cls.status === "scheduled" ? (
                            <FaClock />
                          ) : (
                            <FaTimesCircle />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 flex-wrap">
                            <p className="text-sm font-bold text-slate-800 dark:text-white">
                              {cls.courseType}
                            </p>
                            {badge(cls.status)}
                          </div>
                          <div className="mt-1 grid grid-cols-1 sm:grid-cols-3 gap-1 text-xs text-slate-500 dark:text-slate-400">
                            <p>
                              <span className="font-medium text-slate-600 dark:text-slate-300">
                                Student:
                              </span>{" "}
                              {cls.userId?.name || "N/A"}
                            </p>
                            <p>
                              <span className="font-medium text-slate-600 dark:text-slate-300">
                                Teacher:
                              </span>{" "}
                              {cls.teacherId?.name || cls.teacherName || "N/A"}
                            </p>
                            <p>
                              <span className="font-medium text-slate-600 dark:text-slate-300">
                                Date:
                              </span>{" "}
                              {fmt(cls.scheduledDate)} at{" "}
                              {fmtTime(cls.scheduledDate)}
                            </p>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {cls.duration} min{" "}
                            {cls.notes ? `· ${cls.notes}` : ""}
                          </p>
                        </div>
                      </div>
                      {/* Actions */}
                      {cls.status === "scheduled" && (
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <button
                            onClick={() =>
                              router.push(`/class-room/${cls.roomId}`)
                            }
                            title="Join Room"
                            className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs"
                          >
                            <FaVideo />
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
                            title="Reschedule"
                            className="p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs"
                          >
                            <FaRedo />
                          </button>
                          <button
                            onClick={() => {
                              setCancelTarget(cls);
                              setShowCancelModal(true);
                            }}
                            title="Cancel"
                            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs"
                          >
                            <FaTrashAlt />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ═══ ACTIVITY ═══ */}
      {activeTab === "activity" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-100 dark:border-dark-border shadow-sm p-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-5 flex items-center">
              <FaChartLine className="mr-2 text-blue-500" />
              Activity Logs
            </h2>
            {activityLogs.length === 0 ? (
              <EmptyState
                icon={<FaClipboardList />}
                title="No activity found"
                description="User activities will be recorded here."
              />
            ) : (
              <div className="space-y-2">
                {activityLogs.map((log) => (
                  <div
                    key={log._id}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-dark-bg rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${log.activityType === "login" ? "bg-blue-500" : log.activityType === "class_attended" ? "bg-green-500" : log.activityType === "surah_view" ? "bg-purple-500" : "bg-gray-400"}`}
                      />
                      <div>
                        <p className="text-sm font-medium text-slate-800 dark:text-white">
                          {log.userId?.name || "Unknown"}{" "}
                          <span className="text-slate-400 font-normal">
                            ({log.userId?.role})
                          </span>
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {log.activityType.replace(/_/g, " ")}
                        </p>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 flex-shrink-0">
                      {new Date(log.timestamp).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ═══ PAYMENTS ═══ */}
      {activeTab === "payments" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-100 dark:border-dark-border shadow-sm p-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-5 flex items-center">
              <FaCreditCard className="mr-2 text-green-500" />
              Payment History
            </h2>
            {payments.length === 0 ? (
              <EmptyState
                icon={<FaFileInvoiceDollar />}
                title="No payments recorded"
                description="Payment records will appear here once transactions occur."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-dark-bg border-b border-slate-200 dark:border-dark-border">
                    <tr>
                      {["User", "Plan", "Amount", "Date"].map((h) => (
                        <th
                          key={h}
                          className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
                    {payments.map((p, i) => (
                      <tr
                        key={i}
                        className="hover:bg-slate-50 dark:hover:bg-dark-bg transition-colors"
                      >
                        <td className="px-5 py-3">
                          <p className="text-sm font-medium text-slate-800 dark:text-white">
                            {p.userName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {p.userEmail}
                          </p>
                        </td>
                        <td className="px-5 py-3 text-sm text-slate-600 dark:text-slate-400 capitalize">
                          {p.plan}
                        </td>
                        <td className="px-5 py-3 text-sm font-semibold text-slate-800 dark:text-white">
                          ${p.amount} {p.currency?.toUpperCase()}
                        </td>
                        <td className="px-5 py-3 text-xs text-slate-500 dark:text-slate-400">
                          {fmt(p.date)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ═══ RESCHEDULE MODAL ═══ */}
      {showRescheduleModal && rescheduleTarget && (
        <Modal
          onClose={() => {
            setShowRescheduleModal(false);
            setRescheduleTarget(null);
          }}
        >
          <div className="p-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 flex items-center">
              <FaRedo className="mr-2 text-amber-500" />
              Reschedule Class
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              {rescheduleTarget.courseType} · {rescheduleTarget.userId?.name} ·
              Currently: {fmt(rescheduleTarget.scheduledDate)} at{" "}
              {fmtTime(rescheduleTarget.scheduledDate)}
            </p>
            <form onSubmit={handleRescheduleClass} className="space-y-4">
              <div>
                <label className={labelClass}>New Date & Time</label>
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
                <label className={labelClass}>Duration</label>
                <select
                  value={rescheduleForm.duration}
                  onChange={(e) =>
                    setRescheduleForm({
                      ...rescheduleForm,
                      duration: Number(e.target.value),
                    })
                  }
                  className={inputClass}
                >
                  {[30, 45, 60, 90, 120].map((d) => (
                    <option key={d} value={d}>
                      {d} min
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-sm font-semibold transition-all"
                >
                  Reschedule
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRescheduleModal(false);
                    setRescheduleTarget(null);
                  }}
                  className="px-6 py-3 border border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-400 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-dark-bg transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* ═══ CANCEL MODAL ═══ */}
      {showCancelModal && cancelTarget && (
        <Modal
          onClose={() => {
            setShowCancelModal(false);
            setCancelTarget(null);
          }}
        >
          <div className="p-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 flex items-center">
              <FaTrashAlt className="mr-2 text-red-500" />
              Cancel Class
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-5">
              Are you sure you want to cancel{" "}
              <strong>{cancelTarget.courseType}</strong> class with{" "}
              <strong>{cancelTarget.userId?.name}</strong> on{" "}
              <strong>{fmt(cancelTarget.scheduledDate)}</strong>? Both the
              student and teacher will be notified.
            </p>
            <div className="mb-4">
              <label className={labelClass}>Reason (Optional)</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Why is this class being cancelled?"
                className={`${inputClass} h-20 resize-none`}
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleCancelClass}
                className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-all"
              >
                Cancel Class
              </button>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelTarget(null);
                }}
                className="px-6 py-3 border border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-400 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-dark-bg transition-all"
              >
                Go Back
              </button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}
