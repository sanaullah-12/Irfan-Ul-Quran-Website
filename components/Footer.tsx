import React from "react";
import Link from "next/link";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBookOpen,
  FaHeart,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="relative bg-white dark:bg-dark-bg border-t border-slate-200 dark:border-dark-border mt-20">
      {/* Decorative Top Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-primary-600 to-emerald-500"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* About Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 dark:from-emerald-600 dark:to-emerald-800 rounded-xl flex items-center justify-center">
                <FaBookOpen className="text-white text-lg" />
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-primary-600 dark:from-emerald-400 dark:to-primary-400 bg-clip-text text-transparent">
                Irfan UL Quran Learning
              </h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              A comprehensive platform for learning the Quran with experienced
              teachers through live classes and extensive resources.
            </p>
            <div className="flex space-x-3 pt-2">
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-dark-card text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-300"
                aria-label="Facebook"
              >
                <FaFacebook size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-dark-card text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-300"
                aria-label="Twitter"
              >
                <FaTwitter size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-dark-card text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-300"
                aria-label="Instagram"
              >
                <FaInstagram size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-dark-card text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-300"
                aria-label="YouTube"
              >
                <FaYoutube size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-5">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-300 inline-flex items-center group"
                >
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-300 inline-flex items-center group"
                >
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/plans"
                  className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-300 inline-flex items-center group"
                >
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Pricing Plans
                </Link>
              </li>
              <li>
                <Link
                  href="/resources"
                  className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-300 inline-flex items-center group"
                >
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Resources
                </Link>
              </li>
              <li>
                <Link
                  href="/classes"
                  className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-300 inline-flex items-center group"
                >
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Live Classes
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-5">
              Resources
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/resources#nazra"
                  className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-300 inline-flex items-center group"
                >
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Nazra Qaida
                </Link>
              </li>
              <li>
                <Link
                  href="/resources#tajweed"
                  className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-300 inline-flex items-center group"
                >
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Tajweed & Surahs
                </Link>
              </li>
              <li>
                <Link
                  href="/resources#quran"
                  className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-300 inline-flex items-center group"
                >
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Full Quran (30 Paras)
                </Link>
              </li>
              <li>
                <Link
                  href="/resources#hadith"
                  className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-300 inline-flex items-center group"
                >
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Hadith Collection
                </Link>
              </li>
              <li>
                <Link
                  href="/resources#duas"
                  className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-300 inline-flex items-center group"
                >
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Daily Duas
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-5">
              Contact Us
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <FaMapMarkerAlt className="text-emerald-600 dark:text-emerald-400 mt-1 flex-shrink-0" />
                <span className="text-slate-600 dark:text-slate-400 text-sm">
                  Sector F-10 Islamabad Pakistan
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <FaPhone className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span className="text-slate-600 dark:text-slate-400 text-sm">
                  +92 313 5064381
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <FaEnvelope className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span className="text-slate-600 dark:text-slate-400 text-sm">
                  irfanulquran02@gmail.com
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-200 dark:border-dark-border mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              © {new Date().getFullYear()} Quran Learning Platform. All rights
              reserved.
            </p>
            <p className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 text-sm">
              <span>Made with</span>
              <FaHeart className="text-red-500 animate-pulse" />
              <span>for the Ummah</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
