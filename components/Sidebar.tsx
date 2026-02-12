import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaChartPie,
  FaUsers,
  FaBookOpen,
  FaCalendarAlt,
  FaChartLine,
  FaCreditCard,
  FaSignOutAlt,
  FaUserGraduate,
  FaCalendarPlus,
  FaHistory,
  FaUser,
  FaBook,
  FaChevronLeft,
  FaChevronRight,
  FaBars,
  FaTimes,
  FaMoon,
  FaSun,
  FaHome,
  FaBell,
} from "react-icons/fa";

export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  badge?: number;
}

const adminMenu: Omit<SidebarItem, "onClick">[] = [
  {
    id: "overview",
    label: "Dashboard",
    icon: <FaChartPie />,
    href: "/admin/dashboard",
  },
  {
    id: "users",
    label: "Manage Users",
    icon: <FaUsers />,
    href: "/admin/dashboard?tab=users",
  },
  {
    id: "resources",
    label: "Resource Requests",
    icon: <FaBookOpen />,
    href: "/admin/dashboard?tab=resources",
  },
  {
    id: "classes",
    label: "Classes Overview",
    icon: <FaCalendarAlt />,
    href: "/admin/dashboard?tab=classes",
  },
  {
    id: "activity",
    label: "Activity Logs",
    icon: <FaChartLine />,
    href: "/admin/dashboard?tab=activity",
  },
  {
    id: "payments",
    label: "Payments",
    icon: <FaCreditCard />,
    href: "/admin/dashboard?tab=payments",
  },
];

const teacherMenu: Omit<SidebarItem, "onClick">[] = [
  {
    id: "overview",
    label: "Dashboard",
    icon: <FaChartPie />,
    href: "/teacher/dashboard",
  },
  {
    id: "students",
    label: "My Students",
    icon: <FaUserGraduate />,
    href: "/teacher/dashboard?tab=students",
  },
  {
    id: "schedule",
    label: "Schedule Classes",
    icon: <FaCalendarPlus />,
    href: "/teacher/dashboard?tab=schedule",
  },
  {
    id: "classes",
    label: "Class History",
    icon: <FaHistory />,
    href: "/teacher/dashboard?tab=classes",
  },
  {
    id: "resources-link",
    label: "Resources",
    icon: <FaBook />,
    href: "/resources",
  },
  {
    id: "profile",
    label: "Profile",
    icon: <FaUser />,
    href: "/teacher/dashboard?tab=profile",
  },
];

const studentMenu: Omit<SidebarItem, "onClick">[] = [
  {
    id: "overview",
    label: "Dashboard",
    icon: <FaChartPie />,
    href: "/dashboard",
  },
  {
    id: "courses",
    label: "My Courses",
    icon: <FaBook />,
    href: "/dashboard?tab=courses",
  },
  {
    id: "upcoming",
    label: "Upcoming Classes",
    icon: <FaCalendarAlt />,
    href: "/dashboard?tab=upcoming",
  },
  {
    id: "history",
    label: "Class History",
    icon: <FaHistory />,
    href: "/dashboard?tab=history",
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: <FaBell />,
    href: "/dashboard?tab=notifications",
  },
  {
    id: "resources-link",
    label: "Resources",
    icon: <FaBookOpen />,
    href: "/resources",
  },
  {
    id: "profile",
    label: "Profile",
    icon: <FaUser />,
    href: "/dashboard?tab=profile",
  },
];

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  pendingBadge?: number;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  pendingBadge,
}) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const role = user?.role || "student";

  const menuItems =
    role === "admin"
      ? adminMenu
      : role === "teacher"
        ? teacherMenu
        : studentMenu;

  const roleLabel =
    role === "admin" ? "Admin" : role === "teacher" ? "Teacher" : "Student";
  const roleColor = "from-primary-600 to-secondary-600";

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleItemClick = (item: Omit<SidebarItem, "onClick">) => {
    // For external page links (like /resources), navigate away
    if (item.id === "resources-link") {
      router.push("/resources");
      setMobileOpen(false);
      return;
    }
    onTabChange(item.id);
    setMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo / Brand */}
      <div className="p-5 border-b border-slate-200 dark:border-dark-border">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 min-w-0">
            <div
              className={`w-10 h-10 bg-gradient-to-br ${roleColor} rounded-xl flex items-center justify-center flex-shrink-0 shadow-md`}
            >
              <FaHome className="text-white text-sm" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                  Quran Learning
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {roleLabel} Panel
                </p>
              </div>
            )}
          </Link>

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-7 h-7 items-center justify-center rounded-md hover:bg-slate-100 dark:hover:bg-dark-bg text-slate-400 transition-colors"
          >
            {collapsed ? (
              <FaChevronRight className="text-xs" />
            ) : (
              <FaChevronLeft className="text-xs" />
            )}
          </button>
        </div>
      </div>

      {/* User Card */}
      <div className="px-4 py-4">
        <div className="flex items-center space-x-3">
          <div
            className={`w-9 h-9 bg-gradient-to-br ${roleColor} rounded-full flex items-center justify-center flex-shrink-0`}
          >
            <FaUser className="text-white text-xs" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                {user?.name}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {user?.email}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="px-4">
        <div className="border-t border-slate-200 dark:border-dark-border" />
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          const badge =
            item.id === "resources" && pendingBadge
              ? pendingBadge
              : item.id === "notifications" && pendingBadge
                ? pendingBadge
                : undefined;

          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? `bg-gradient-to-r ${roleColor} text-white shadow-md`
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-bg hover:text-slate-800 dark:hover:text-white"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <span
                className={`text-base flex-shrink-0 ${
                  isActive
                    ? "text-white"
                    : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                }`}
              >
                {item.icon}
              </span>
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {badge && badge > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                      {badge}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="px-3 py-4 border-t border-slate-200 dark:border-dark-border space-y-1">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-bg transition-all"
          title={collapsed ? "Toggle Theme" : undefined}
        >
          <span className="text-base flex-shrink-0">
            {theme === "dark" ? (
              <FaSun className="text-amber-500" />
            ) : (
              <FaMoon className="text-slate-400" />
            )}
          </span>
          {!collapsed && (
            <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          )}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
          title={collapsed ? "Logout" : undefined}
        >
          <span className="text-base flex-shrink-0">
            <FaSignOutAlt />
          </span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-5 left-4 z-50 w-10 h-10 bg-white dark:bg-dark-card rounded-xl shadow-lg border border-slate-200 dark:border-dark-border flex items-center justify-center text-slate-600 dark:text-slate-300"
      >
        <FaBars />
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-[260px] bg-white dark:bg-dark-card border-r border-slate-200 dark:border-dark-border shadow-2xl"
          >
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setMobileOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-dark-bg text-slate-500"
              >
                <FaTimes />
              </button>
            </div>
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-40 bg-white dark:bg-dark-card border-r border-slate-200 dark:border-dark-border transition-all duration-300 ${
          collapsed ? "w-[72px]" : "w-[260px]"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
