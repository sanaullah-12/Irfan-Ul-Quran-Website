import React, { useState } from "react";
import Head from "next/head";
import Layout from "../components/Layout";
import ProtectedRoute from "../components/ProtectedRoute";
import { motion } from "framer-motion";
import {
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaPaperPlane,
  FaWhatsapp,
  FaEdit,
} from "react-icons/fa";
import api from "../utils/api";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [whatsAppMessage, setWhatsAppMessage] = useState(
    "Assalamualaikum, I want your services please tell me about your Quran learning courses and classes.",
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await api.post("/contact/send", formData);
      setSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setError(msg || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppContact = () => {
    setShowWhatsAppModal(true);
  };

  const sendWhatsAppMessage = () => {
    const phoneNumber = "923135064381"; // Pakistan number format for WhatsApp
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      whatsAppMessage,
    )}`;
    window.open(whatsappURL, "_blank");
    setShowWhatsAppModal(false);
  };

  return (
    <ProtectedRoute>
      <Layout>
        <Head>
          <title>Contact Us - Quran Learning Platform</title>
        </Head>

        <div className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-4">
                Contact Us
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300">
                We&apos;re here to help! Reach out to us with any questions
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white dark:bg-dark-card rounded-2xl shadow-xl border border-slate-100 dark:border-dark-border p-8"
              >
                <h2 className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mb-6">
                  Send us a Message
                </h2>

                {success && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg mb-4">
                    Message sent successfully! We&apos;ll get back to you soon.
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-4">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white dark:bg-dark-bg border border-slate-300 dark:border-dark-border text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Student name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white dark:bg-dark-bg border border-slate-300 dark:border-dark-border text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="student@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white dark:bg-dark-bg border border-slate-300 dark:border-dark-border text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Nazra,Tajweed,Namaz?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 bg-white dark:bg-dark-bg border border-slate-300 dark:border-dark-border text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                      placeholder="Your message..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <FaPaperPlane />
                    <span>{loading ? "Sending..." : "Send Message"}</span>
                  </button>
                </form>
              </motion.div>

              {/* Contact Information */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl border border-slate-100 dark:border-dark-border p-8">
                  <h2 className="text-2xl font-bold text-primary-700 dark:text-primary-400 mb-6">
                    Contact Information
                  </h2>

                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FaMapMarkerAlt className="text-white text-xl" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1">
                          Address
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400">
                          Sector F-10
                          <br />
                          Islamabad, Pakistan
                          <br />
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FaPhone className="text-white text-xl" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1">
                          Phone
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400">
                          +92 313 5064381
                          <br />
                          Available: Mon-Fri, 9am-12pm
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FaEnvelope className="text-white text-xl" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1">
                          Email
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400">
                          atiq.ajiz786@gmail.com
                          <br />
                          irfanulquran02@gmail.com
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-primary-600 to-secondary-600 rounded-2xl shadow-xl p-8 text-white">
                  <h3 className="text-2xl font-bold mb-4">Office Hours</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Monday - Friday:</span>
                      <span className="font-semibold">9:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saturday:</span>
                      <span className="font-semibold">10:00 AM - 4:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sunday:</span>
                      <span className="font-semibold">Closed</span>
                    </div>
                  </div>
                </div>

                {/* WhatsApp Contact Section */}
                <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl border border-slate-100 dark:border-dark-border p-8">
                  <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-4 flex items-center">
                    <FaWhatsapp className="mr-3 text-3xl" />
                    Quick WhatsApp Contact
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    Get instant response! Send us a message on WhatsApp for
                    immediate assistance with your queries.
                  </p>
                  <button
                    onClick={handleWhatsAppContact}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-3"
                  >
                    <FaWhatsapp className="text-2xl" />
                    <span>Contact on WhatsApp</span>
                  </button>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 text-center">
                    Available: Mon-Fri 9AM-6PM (Response within minutes)
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* WhatsApp Message Modal */}
        {showWhatsAppModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl border border-slate-100 dark:border-dark-border p-8 max-w-md w-full"
            >
              <div className="flex items-center mb-6">
                <FaWhatsapp className="text-3xl text-green-500 mr-3" />
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                  WhatsApp Message
                </h3>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center">
                  <FaEdit className="mr-2" />
                  Edit Your Message
                </label>
                <textarea
                  value={whatsAppMessage}
                  onChange={(e) => setWhatsAppMessage(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-white dark:bg-dark-bg border border-slate-300 dark:border-dark-border text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  placeholder="Type your message here..."
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  You can edit this message before sending it via WhatsApp
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setShowWhatsAppModal(false)}
                  className="flex-1 bg-slate-200 dark:bg-dark-bg hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold py-3 rounded-lg transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={sendWhatsAppMessage}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <FaWhatsapp />
                  <span>Send</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </Layout>
    </ProtectedRoute>
  );
}
