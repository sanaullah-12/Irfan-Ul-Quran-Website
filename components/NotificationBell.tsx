import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBell, FaCalendarAlt, FaBan, FaClock, FaCheckCircle, FaTimes,
} from "react-icons/fa";
import api from "../utils/api";

interface NotificationItem {
  _id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export default function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch {}
  };

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

  const fmtRelative = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const notifIcon = (type: string) => {
    if (type === "class_scheduled") return <FaCalendarAlt className="text-blue-500 text-sm" />;
    if (type === "class_cancelled") return <FaBan className="text-red-500 text-sm" />;
    if (type === "class_reminder") return <FaClock className="text-amber-500 text-sm" />;
    if (type === "class_completed") return <FaCheckCircle className="text-green-500 text-sm" />;
    return <FaBell className="text-purple-500 text-sm" />;
  };

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-dark-bg transition">
        <FaBell className="text-lg text-slate-500 dark:text-slate-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-dark-card rounded-2xl shadow-2xl border border-slate-200 dark:border-dark-border z-50 overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-dark-border">
              <p className="text-sm font-semibold text-slate-800 dark:text-white">
                Notifications {unreadCount > 0 && <span className="text-xs text-red-500">({unreadCount} new)</span>}
              </p>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-[11px] text-primary-600 dark:text-primary-400 hover:underline">
                    Mark all read
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                  <FaTimes className="text-xs" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-8 text-center">
                  <FaBell className="text-2xl text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No notifications</p>
                </div>
              ) : (
                notifications.slice(0, 10).map(n => (
                  <div key={n._id}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-slate-100 dark:border-dark-border/50 cursor-pointer hover:bg-slate-50 dark:hover:bg-dark-bg transition ${
                      !n.read ? "bg-primary-50/50 dark:bg-primary-900/10" : ""
                    }`}
                    onClick={() => {
                      if (!n.read) markRead(n._id);
                      if (n.metadata?.roomId && n.type === "class_scheduled") {
                        router.push(`/class-room/${n.metadata.roomId}`);
                      }
                      setOpen(false);
                    }}>
                    <div className="mt-0.5 flex-shrink-0">{notifIcon(n.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className={`text-xs font-medium ${n.read ? "text-slate-500 dark:text-slate-400" : "text-slate-800 dark:text-white"}`}>{n.title}</p>
                        {!n.read && <span className="w-1.5 h-1.5 bg-primary-500 rounded-full flex-shrink-0" />}
                      </div>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{n.message}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{fmtRelative(n.createdAt)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-2.5 border-t border-slate-200 dark:border-dark-border">
                <button onClick={() => { setOpen(false); router.push("/dashboard?tab=notifications"); }}
                  className="w-full text-center text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium">
                  View all notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
