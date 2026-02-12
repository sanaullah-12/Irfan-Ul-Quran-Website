import React, { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaExclamationCircle,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaInfoCircle,
} from "react-icons/fa";

const ADMIN_EMAILS = ["qazisanaullah612@gmail.com", "atiq.ajiz786@gmail.com"];

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const router = useRouter();

  const isAdminEmail = ADMIN_EMAILS.includes(email.toLowerCase().trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await signup(name, email, password, isAdminEmail ? undefined : role);
      if (isAdminEmail) {
        router.push("/admin/dashboard");
      } else {
        setSuccess(
          "Account created! Your account is pending admin approval. You will be notified once approved.",
        );
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Sign Up - Quran Learning Platform</title>
      </Head>

      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-soft-lg p-8 border border-slate-100 dark:border-dark-border">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-700 to-secondary-600 dark:from-primary-400 dark:to-secondary-400 bg-clip-text text-transparent mb-2">
                Create Account
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Start your Quran learning journey today
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center">
                <FaExclamationCircle className="mr-2" />
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center">
                <FaInfoCircle className="mr-2 flex-shrink-0" />
                {success}
              </div>
            )}

            {isAdminEmail && (
              <div className="bg-purple-50 border border-purple-200 text-purple-700 px-4 py-3 rounded-lg mb-4 flex items-center">
                <FaInfoCircle className="mr-2 flex-shrink-0" />
                This email is recognized as an admin account. You will be
                auto-assigned the Admin role.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-dark-card dark:text-slate-200"
                    placeholder="Your Name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-dark-card dark:text-slate-200"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-dark-card dark:text-slate-200"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-dark-card dark:text-slate-200"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {!isAdminEmail && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    I want to join as
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole("student")}
                      className={`flex flex-col items-center p-4 border-2 rounded-lg transition-all ${
                        role === "student"
                          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                          : "border-slate-300 dark:border-dark-border hover:border-slate-400"
                      }`}
                    >
                      <FaUserGraduate
                        className={`text-2xl mb-1 ${role === "student" ? "text-emerald-600" : "text-slate-400"}`}
                      />
                      <span
                        className={`text-sm font-medium ${role === "student" ? "text-emerald-700 dark:text-emerald-400" : "text-slate-600 dark:text-slate-400"}`}
                      >
                        Student
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("teacher")}
                      className={`flex flex-col items-center p-4 border-2 rounded-lg transition-all ${
                        role === "teacher"
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-slate-300 dark:border-dark-border hover:border-slate-400"
                      }`}
                    >
                      <FaChalkboardTeacher
                        className={`text-2xl mb-1 ${role === "teacher" ? "text-blue-600" : "text-slate-400"}`}
                      />
                      <span
                        className={`text-sm font-medium ${role === "teacher" ? "text-blue-700 dark:text-blue-400" : "text-slate-600 dark:text-slate-400"}`}
                      >
                        Teacher
                      </span>
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 disabled:opacity-50 shadow-soft"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
