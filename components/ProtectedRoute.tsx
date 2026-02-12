import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loader"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  // Role check
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-bg">
        <div className="text-center p-8 bg-white dark:bg-dark-card rounded-2xl shadow-lg max-w-md border border-slate-100 dark:border-dark-border">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🚫</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
            Access Denied
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            You do not have permission to access this page.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg font-medium"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Blocked account check
  if (user.role !== "admin" && user.accountStatus === "blocked") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-bg">
        <div className="text-center p-8 bg-white dark:bg-dark-card rounded-2xl shadow-lg max-w-md border border-slate-100 dark:border-dark-border">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🚫</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
            Account Blocked
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Your account has been blocked. Please contact the administrator.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg font-medium"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
