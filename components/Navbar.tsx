import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBars,
  FaTimes,
  FaMoon,
  FaSun,
  FaUser,
  FaChevronDown,
  FaChartPie,
} from "react-icons/fa";

type NavChild = {
  name: string;
  description: string;
  path: string;
};

type NavLink = {
  name: string;
  path: string;
  children?: NavChild[];
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileDropdown, setMobileDropdown] = useState<string | null>(null);
  const { user, logout, isAuthenticated, getDashboardPath } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const navLinks: NavLink[] = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    {
      name: "Courses",
      path: "/courses",
      children: [
        {
          name: "Quran Nazra",
          description: "Foundational reading for kids",
          path: "/courses#quran-nazra",
        },
        {
          name: "Quran Tajweed",
          description: "Polish recitation & makharij",
          path: "/courses#quran-tajweed",
        },
        {
          name: "Namaz & Daily Duas",
          description: "Practical salah and supplications",
          path: "/courses#namaz-prayer",
        },
      ],
    },
    { name: "Plans", path: "/plans" },
    {
      name: "Resources",
      path: "/resources",
      children: [
        {
          name: "Nazra Qaida",
          description: "Alphabet drills & practice",
          path: "/resources#nazra",
        },
        {
          name: "Tajweed & Audio",
          description: "Stream 114 surahs by top reciters",
          path: "/resources#tajweed",
        },
        {
          name: "Quran Reader",
          description: "Arabic + Urdu/English translations",
          path: "/resources#quran",
        },
      ],
    },
    { name: "Live Classes", path: "/classes" },
    { name: "Contact", path: "/contact" },
  ];

  const isLinkActive = (link: NavLink) => {
    if (router.pathname === link.path) return true;
    if (link.path !== "/" && router.pathname.startsWith(link.path)) return true;
    return false;
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 dark:bg-dark-bg/95 backdrop-blur-md shadow-soft-lg"
          : "bg-white/80 dark:bg-dark-bg/80 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <img
              src="/logoimage.png"
              alt="Quran Learning"
              className="h-14 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
            />
          </Link>

          {/* Desktop Navigation */}
          <div
            className="hidden lg:flex items-center space-x-1"
            onMouseLeave={() => setActiveDropdown(null)}
          >
            {navLinks.map((link) => (
              <div
                key={link.name}
                className="relative"
                onMouseEnter={() =>
                  link.children && setActiveDropdown(link.name)
                }
              >
                <Link
                  href={link.path}
                  onClick={() => setActiveDropdown(null)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center space-x-1 ${
                    isLinkActive(link)
                      ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-card hover:text-primary-600 dark:hover:text-primary-400"
                  }`}
                >
                  <span>{link.name}</span>
                  {link.children && (
                    <FaChevronDown
                      className={`text-xs transition-transform ${activeDropdown === link.name ? "rotate-180" : "rotate-0"}`}
                    />
                  )}
                </Link>

                <AnimatePresence>
                  {link.children && activeDropdown === link.name && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-0 top-full mt-3 w-72 bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-xl shadow-xl p-4 space-y-3"
                    >
                      {link.children.map((child) => (
                        <Link
                          key={child.path}
                          href={child.path}
                          className="block rounded-lg px-3 py-2 hover:bg-slate-50 dark:hover:bg-dark-bg transition-colors"
                          onClick={() => setActiveDropdown(null)}
                        >
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                            {child.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {child.description}
                          </p>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Right Section: Theme Toggle + Auth */}
          <div className="hidden lg:flex items-center space-x-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-[6px] border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-primary-500 hover:text-primary-600 dark:hover:border-primary-400 dark:hover:text-primary-400 transition-all duration-200"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <FaSun className="text-sm text-amber-500" />
              ) : (
                <FaMoon className="text-sm" />
              )}
            </button>

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link
                  href={getDashboardPath()}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-[6px] border transition-all duration-200 ${
                    router.pathname.includes("/dashboard")
                      ? "border-primary-500 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400"
                      : "border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-primary-500 hover:text-primary-600 dark:hover:border-primary-400 dark:hover:text-primary-400"
                  }`}
                >
                  <FaChartPie className="text-[10px]" />
                  <span>Dashboard</span>
                </Link>
                <div className="w-8 h-8 rounded-[6px] border border-slate-300 dark:border-slate-600 flex items-center justify-center overflow-hidden" title={user?.name}>
                  <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-primary-600 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{user?.name?.charAt(0).toUpperCase()}</span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-xs font-medium rounded-[6px] border border-red-400 dark:border-red-500 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-xs font-medium rounded-[6px] border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-primary-500 hover:text-primary-600 dark:hover:border-primary-400 dark:hover:text-primary-400 transition-all duration-200"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-3 py-1.5 text-xs font-medium rounded-[6px] border border-primary-500 dark:border-primary-400 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-3 lg:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-100 dark:bg-dark-card text-slate-700 dark:text-slate-300"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <FaSun className="text-amber-500" />
              ) : (
                <FaMoon className="text-slate-700" />
              )}
            </button>
            <button
              onClick={() => {
                setIsOpen(!isOpen);
                if (isOpen) setMobileDropdown(null);
              }}
              className="p-2 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              {isOpen ? (
                <FaTimes className="text-2xl" />
              ) : (
                <FaBars className="text-2xl" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden pb-6 space-y-1 overflow-hidden"
          >
            {navLinks.map((link) => (
              <div key={link.name}>
                {link.children ? (
                  /* Parent with dropdown */
                  <>
                    <div className="flex items-center">
                      <Link
                        href={link.path}
                        className={`flex-1 px-4 py-3 rounded-l-lg text-sm font-medium transition-all duration-300 ${
                          isLinkActive(link)
                            ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-card"
                        }`}
                        onClick={() => { setIsOpen(false); setMobileDropdown(null); }}
                      >
                        {link.name}
                      </Link>
                      <button
                        onClick={() => setMobileDropdown(mobileDropdown === link.name ? null : link.name)}
                        className={`px-4 py-3 rounded-r-lg text-sm transition-all duration-200 ${
                          mobileDropdown === link.name
                            ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                            : "text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-dark-card hover:text-slate-600 dark:hover:text-slate-300"
                        }`}
                        aria-label={`Toggle ${link.name} dropdown`}
                      >
                        <FaChevronDown className={`text-xs transition-transform duration-200 ${mobileDropdown === link.name ? "rotate-180" : ""}`} />
                      </button>
                    </div>
                    <AnimatePresence>
                      {mobileDropdown === link.name && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="ml-4 mr-2 mt-1 mb-1 space-y-1 overflow-hidden"
                        >
                          {link.children.map((child) => (
                            <Link
                              key={child.path}
                              href={child.path}
                              className="block px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-dark-bg text-xs text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-dark-border"
                              onClick={() => { setIsOpen(false); setMobileDropdown(null); }}
                            >
                              <p className="font-semibold text-slate-700 dark:text-slate-200">
                                {child.name}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                {child.description}
                              </p>
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  /* Simple link */
                  <Link
                    href={link.path}
                    className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                      isLinkActive(link)
                        ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-card"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {link.name}
                  </Link>
                )}
              </div>
            ))}

            <div className="pt-4 border-t border-slate-200 dark:border-dark-border space-y-3">
              {isAuthenticated ? (
                <>
                  <Link
                    href={getDashboardPath()}
                    className="flex items-center space-x-3 px-4 py-2.5 rounded-[6px] border border-slate-300 dark:border-slate-600 hover:border-primary-500 dark:hover:border-primary-400 transition-all"
                    onClick={() => setIsOpen(false)}
                  >
                    <FaChartPie className="text-primary-600 dark:text-primary-400" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Dashboard</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="w-full px-4 py-2.5 rounded-[6px] border border-red-400 dark:border-red-500 text-red-500 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block text-center px-4 py-2.5 rounded-[6px] border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 text-sm font-medium hover:border-primary-500 hover:text-primary-600 dark:hover:border-primary-400 dark:hover:text-primary-400 transition-all duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="block text-center px-4 py-2.5 rounded-[6px] border border-primary-500 dark:border-primary-400 text-primary-600 dark:text-primary-400 text-sm font-medium hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
