import React from "react";
import Head from "next/head";
import Layout from "./Layout";
import NotificationBell from "./NotificationBell";
import { useAuth } from "../context/AuthContext";
import {
  FaChartPie,
  FaUsers,
  FaBookOpen,
  FaCalendarAlt,
  FaChartLine,
  FaCreditCard,
  FaUserGraduate,
  FaCalendarPlus,
  FaHistory,
  FaUser,
  FaBook,
  FaBell,
} from "react-icons/fa";

interface TabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const adminTabs: TabItem[] = [
  { id: "overview", label: "Overview", icon: <FaChartPie /> },
  { id: "users", label: "Users", icon: <FaUsers /> },
  { id: "resources", label: "Resources", icon: <FaBookOpen /> },
  { id: "classes", label: "Classes", icon: <FaCalendarAlt /> },
  { id: "activity", label: "Activity", icon: <FaChartLine /> },
  { id: "payments", label: "Payments", icon: <FaCreditCard /> },
];

const teacherTabs: TabItem[] = [
  { id: "overview", label: "Overview", icon: <FaChartPie /> },
  { id: "students", label: "Students", icon: <FaUserGraduate /> },
  { id: "schedule", label: "Schedule", icon: <FaCalendarPlus /> },
  { id: "classes", label: "History", icon: <FaHistory /> },
  { id: "profile", label: "Profile", icon: <FaUser /> },
];

const studentTabs: TabItem[] = [
  { id: "overview", label: "Overview", icon: <FaChartPie /> },
  { id: "courses", label: "Courses", icon: <FaBook /> },
  { id: "upcoming", label: "Upcoming", icon: <FaCalendarAlt /> },
  { id: "history", label: "History", icon: <FaHistory /> },
  { id: "notifications", label: "Alerts", icon: <FaBell /> },
  { id: "profile", label: "Profile", icon: <FaUser /> },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
  pendingBadge?: number;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
  activeTab,
  onTabChange,
  pendingBadge,
}) => {
  const { user } = useAuth();
  const role = user?.role || "student";

  const tabs =
    role === "admin"
      ? adminTabs
      : role === "teacher"
        ? teacherTabs
        : studentTabs;

  const roleColor = "from-primary-600 to-secondary-600";

  return (
    <Layout>
      <Head>
        <title>{title} - Quran Learning Platform</title>
      </Head>

      <div className="pt-24 pb-8 min-h-screen">
        {/* Dashboard Tab Bar */}
        <div className="sticky top-20 z-30 bg-white/95 dark:bg-dark-bg/95 backdrop-blur-md border-b border-slate-200 dark:border-dark-border shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              {/* Tabs */}
              <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide py-2">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  const badge =
                    (tab.id === "resources" || tab.id === "notifications") &&
                    pendingBadge
                      ? pendingBadge
                      : undefined;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => onTabChange(tab.id)}
                      className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                        isActive
                          ? `bg-gradient-to-r ${roleColor} text-white shadow-md`
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-card"
                      }`}
                    >
                      <span className="text-sm">{tab.icon}</span>
                      <span>{tab.label}</span>
                      {badge && badge > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                          {badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Notification Bell */}
              {user && <NotificationBell />}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </div>
    </Layout>
  );
};

export default DashboardLayout;
