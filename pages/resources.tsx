import React, { useState, useEffect, useRef, useCallback } from "react";
import Head from "next/head";
import Layout from "../components/Layout";
import ProtectedRoute from "../components/ProtectedRoute";
import QuranReader from "../components/QuranReader";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBook,
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaStepForward,
  FaStepBackward,
  FaLock,
  FaClock,
  FaTimes,
  FaVolumeDown,
  FaStar,
  FaCrown,
  FaCheckCircle,
} from "react-icons/fa";
import { quranService, hadithService, duaService } from "../utils/quranService";
import api from "../utils/api";

export default function Resources() {
  useAuth();
  const [activeTab, setActiveTab] = useState("nazra");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [surahs, setSurahs] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [juzList, setJuzList] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [hadiths, setHadiths] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [duas, setDuas] = useState<any[]>([]);
  const [selectedReciter, setSelectedReciter] = useState("ar.alafasy");
  const [, setPlayingAudio] = useState<HTMLAudioElement | null>(null);
  const [playingSurah, setPlayingSurah] = useState<number | null>(null);

  // --- Arabic letter speech ---
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);
  const letterAudioRef = useRef<AudioBufferSourceNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const speakArabic = async (text: string, idx: number) => {
    // Stop any previous playback
    if (letterAudioRef.current) {
      try {
        letterAudioRef.current.stop();
      } catch {}
      letterAudioRef.current = null;
    }

    setSpeakingIdx(idx);

    try {
      // Create or reuse AudioContext
      if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
        audioCtxRef.current = new AudioContext();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") await ctx.resume();

      // Fetch audio from TTS API
      const response = await fetch(`/api/tts?text=${encodeURIComponent(text)}`);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

      // Play with lowered pitch for male voice effect
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.playbackRate.value = 0.85; // Lower pitch → deeper male voice
      source.connect(ctx.destination);
      letterAudioRef.current = source;
      source.onended = () => {
        setSpeakingIdx(null);
        letterAudioRef.current = null;
      };
      source.start();
    } catch {
      setSpeakingIdx(null);
      letterAudioRef.current = null;
    }
  };

  const [loading, setLoading] = useState(false);
  const [selectedJuz, setSelectedJuz] = useState<number | null>(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Resource access state
  const [accessChecked, setAccessChecked] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [pendingRequest, setPendingRequest] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [requestingAccess, setRequestingAccess] = useState(false);

  // 5-minute timer popup state
  const [showTimerPopup, setShowTimerPopup] = useState(false);
  const [timerExpired, setTimerExpired] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(5);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const tabs = [
    { id: "nazra", name: "Nazra Qaida", icon: <FaBook /> },
    { id: "tajweed", name: "Tajweed & Surahs", icon: <FaVolumeUp /> },
    { id: "quran", name: "Full Quran (30 Paras)", icon: <FaBook /> },
    { id: "hadith", name: "Hadith Collection", icon: <FaBook /> },
    { id: "duas", name: "Daily Duas", icon: <FaBook /> },
  ];

  useEffect(() => {
    // Check resource access from backend
    checkResourceAccess();

    // Allow deep-linking via hash (#quran, #tajweed, etc.)
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "");
      const allowedTabs = ["nazra", "tajweed", "quran", "hadith", "duas"];
      if (hash && allowedTabs.includes(hash)) {
        setActiveTab(hash);
      }
    }
  }, []);

  // Persistent 5-minute countdown timer per login session (survives page navigation)
  useEffect(() => {
    if (accessChecked && !hasAccess && !pendingRequest) {
      const TIMER_DURATION = 5 * 60; // 5 minutes in seconds
      const STORAGE_KEY = "resource_timer_start";

      // Get or set the start timestamp for this login session
      let startTime = sessionStorage.getItem(STORAGE_KEY);
      if (!startTime) {
        startTime = Date.now().toString();
        sessionStorage.setItem(STORAGE_KEY, startTime);
      }
      const startTs = parseInt(startTime, 10);

      // Calculate how many seconds have already elapsed
      const elapsedSeconds = Math.floor((Date.now() - startTs) / 1000);
      let remaining = TIMER_DURATION - elapsedSeconds;

      // If 5 minutes already passed, show popup immediately
      if (remaining <= 0) {
        setTimerMinutes(0);
        setTimerSeconds(0);
        setTimerExpired(true);
        setShowTimerPopup(true);
        return;
      }

      // Set initial display values
      setTimerMinutes(Math.floor(remaining / 60));
      setTimerSeconds(remaining % 60);

      // Tick every second
      countdownRef.current = setInterval(() => {
        remaining--;
        if (remaining <= 0) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          setTimerMinutes(0);
          setTimerSeconds(0);
          setTimerExpired(true);
          setShowTimerPopup(true);
        } else {
          setTimerMinutes(Math.floor(remaining / 60));
          setTimerSeconds(remaining % 60);
        }
      }, 1000);
    }

    const currentTimerRef = timerRef.current;
    const currentCountdownRef = countdownRef.current;
    return () => {
      if (currentTimerRef) clearTimeout(currentTimerRef);
      if (currentCountdownRef) clearInterval(currentCountdownRef);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessChecked, hasAccess, pendingRequest]);

  const checkResourceAccess = async () => {
    try {
      const res = await api.get("/resources/check-access");
      setHasAccess(res.data.hasAccess);
      setPendingRequest(res.data.pendingRequest || false);
    } catch (error) {
      console.error("Access check failed:", error);
      setHasAccess(false);
    } finally {
      setAccessChecked(true);
    }
  };

  const handleRequestAccess = async () => {
    try {
      setRequestingAccess(true);
      await api.post("/resources/request", {
        message: "Please grant me access to learning resources.",
      });
      setPendingRequest(true);
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      alert(msg || "Error submitting request");
    } finally {
      setRequestingAccess(false);
    }
  };

  const loadResources = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === "tajweed") {
        const surahsData = await quranService.getAllSurahs();
        setSurahs(surahsData);
      } else if (activeTab === "quran") {
        const juzData = await quranService.getAllJuz();
        setJuzList(juzData);
      } else if (activeTab === "hadith") {
        const hadithData = await hadithService.getHadiths("bukhari");
        setHadiths(hadithData.hadiths);
      } else if (activeTab === "duas") {
        const duasData = duaService.getDuas();
        setDuas(duasData);
      }
    } catch (error) {
      console.error("Error loading resources:", error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  const playSurah = async (surahNumber: number) => {
    try {
      // Stop currently playing audio - clear ref FIRST to prevent stale error handlers
      if (audioRef.current) {
        const oldAudio = audioRef.current;
        audioRef.current = null;
        oldAudio.pause();
        oldAudio.src = "";
      }

      if (playingSurah === surahNumber) {
        // If same surah, stop playback
        setPlayingAudio(null);
        setPlayingSurah(null);
        setAudioProgress(0);
        setAudioDuration(0);
        return;
      }

      // Get complete Surah audio URL
      const audioUrl = await quranService.getSurahAudio(
        surahNumber,
        selectedReciter,
      );

      // Create and play audio
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // Set up event listeners - all guard against stale audio
      audio.addEventListener("loadedmetadata", () => {
        if (audioRef.current !== audio) return;
        setAudioDuration(audio.duration);
      });

      audio.addEventListener("timeupdate", () => {
        if (audioRef.current !== audio) return;
        setAudioProgress(audio.currentTime);
      });

      audio.addEventListener("ended", () => {
        if (audioRef.current !== audio) return;
        setPlayingAudio(null);
        setPlayingSurah(null);
        setAudioProgress(0);
        // Auto-play next surah if available
        if (surahNumber < 114) {
          playSurah(surahNumber + 1);
        }
      });

      audio.addEventListener("error", (e) => {
        // Ignore errors from stale/replaced audio elements
        if (audioRef.current !== audio) return;
        console.error("Audio playback error:", e);
        setPlayingAudio(null);
        setPlayingSurah(null);
      });

      await audio.play();
      setPlayingAudio(audio);
      setPlayingSurah(surahNumber);
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  };

  const playPreviousSurah = () => {
    if (playingSurah && playingSurah > 1) {
      playSurah(playingSurah - 1);
    }
  };

  const playNextSurah = () => {
    if (playingSurah && playingSurah < 114) {
      playSurah(playingSurah + 1);
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const openJuzReader = (juzNumber: number) => {
    setSelectedJuz(juzNumber);
  };

  const closeJuzReader = () => {
    setSelectedJuz(null);
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (typeof window !== "undefined") {
      const newUrl = `${window.location.pathname}#${tabId}`;
      window.history.replaceState(null, "", newUrl);
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <Head>
          <title>Resources - Quran Learning Platform</title>
        </Head>

        {/* ─── 5-MINUTE TIMER PREMIUM POPUP ──────────────────── */}
        <AnimatePresence>
          {showTimerPopup && !hasAccess && accessChecked && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            >
              <motion.div
                initial={{ scale: 0.85, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.85, opacity: 0, y: 30 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 dark:border-dark-border relative overflow-hidden"
              >
                {/* Decorative top gradient bar */}
                <div className="h-2 bg-gradient-to-r from-primary-500 via-gold to-secondary-500" />

                <div className="p-8">
                  {/* Close button — always visible on mobile, hidden after expiry on desktop */}
                  {(!timerExpired || true) && (
                    <button
                      onClick={() => setShowTimerPopup(false)}
                      className={`absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-dark-bg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-dark-border transition-all ${timerExpired ? "sm:hidden" : ""}`}
                    >
                      <FaTimes className="text-sm" />
                    </button>
                  )}

                  <div className="text-center">
                    {/* Icon */}
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
                      <FaCrown className="text-white text-3xl" />
                    </div>

                    {pendingRequest ? (
                      <>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                          Request Pending
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
                          Your access request has been submitted and is awaiting
                          admin approval. You&apos;ll get full unlimited access
                          once approved.
                        </p>
                        <div className="flex items-center justify-center gap-2 px-4 py-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl mb-5">
                          <FaClock className="text-amber-500" />
                          <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                            Awaiting admin approval
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                          Your Free Preview Has Ended
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
                          You&apos;ve been exploring our resources for 5
                          minutes. To continue with unlimited access, request
                          approval or upgrade to Premium.
                        </p>

                        {/* Benefits list */}
                        <div className="text-left bg-slate-50 dark:bg-dark-bg rounded-xl p-5 mb-6 border border-slate-100 dark:border-dark-border">
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                            What you get with full access
                          </p>
                          <div className="space-y-2.5">
                            {[
                              "Complete Nazra Qaida with audio pronunciation",
                              "All 114 Surahs with multiple reciters",
                              "Full Quran — 30 Juz with translations",
                              "Hadith collections & daily Duas",
                              "Unlimited listening & reading time",
                            ].map((item, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-2.5"
                              >
                                <FaCheckCircle className="text-primary-500 text-sm flex-shrink-0" />
                                <span className="text-sm text-slate-700 dark:text-slate-300">
                                  {item}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="space-y-3">
                          <button
                            onClick={handleRequestAccess}
                            disabled={requestingAccess}
                            className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white rounded-xl font-bold text-base transition-all disabled:opacity-50 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                          >
                            <FaLock className="text-sm" />
                            {requestingAccess
                              ? "Sending Request..."
                              : "Request Free Access"}
                          </button>
                          <button
                            onClick={() => {
                              window.location.href = "/plans";
                            }}
                            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-gold hover:from-amber-600 hover:to-gold-dark text-white rounded-xl font-bold text-base transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                          >
                            <FaStar className="text-sm" />
                            Upgrade to Premium
                          </button>
                        </div>
                      </>
                    )}

                    {/* "Continue browsing" only before timer expires */}
                    {!timerExpired && (
                      <button
                        onClick={() => setShowTimerPopup(false)}
                        className="mt-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium text-sm transition-colors"
                      >
                        Continue browsing
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Free preview timer banner */}
            {accessChecked &&
              !hasAccess &&
              !pendingRequest &&
              !showTimerPopup &&
              (timerMinutes > 0 || timerSeconds > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/15 dark:to-secondary-900/15 border border-primary-200 dark:border-primary-800/40 rounded-xl px-5 py-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <FaClock className="text-primary-600 dark:text-primary-400" />
                    <p className="text-sm text-primary-800 dark:text-primary-300">
                      <span className="font-semibold">Free Preview:</span>{" "}
                      {timerMinutes}:{timerSeconds.toString().padStart(2, "0")}{" "}
                      remaining
                    </p>
                  </div>
                  <button
                    onClick={() => (window.location.href = "/plans")}
                    className="px-4 py-1.5 bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-xs font-semibold rounded-lg hover:from-primary-700 hover:to-secondary-700 transition-all"
                  >
                    Get Premium
                  </button>
                </motion.div>
              )}

            {/* Pending request banner */}
            {accessChecked && !hasAccess && pendingRequest && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl px-5 py-3 flex items-center gap-3"
              >
                <FaClock className="text-amber-500" />
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  <span className="font-semibold">Access Pending:</span> Your
                  request is awaiting admin approval. You can continue browsing
                  in the meantime.
                </p>
              </motion.div>
            )}

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-4">
                Learning Resources
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300">
                Complete collection of Quranic resources for your learning
                journey
              </p>
            </motion.div>

            {/* Tabs */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg"
                      : "bg-white dark:bg-dark-card text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-transparent dark:border-dark-border"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </div>

            {/* Content */}
            <div
              className={`bg-white dark:bg-dark-card rounded-2xl shadow-soft-lg border border-slate-100 dark:border-dark-border p-8${timerExpired && !hasAccess ? " filter blur-md pointer-events-none select-none" : ""}`}
            >
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="loader"></div>
                </div>
              ) : (
                <>
                  {/* Nazra Qaida */}
                  {activeTab === "nazra" && (
                    <div>
                      <h2 className="text-3xl font-bold text-emerald-700 dark:text-emerald-400 mb-6">
                        Nazra Qaida for Beginners
                      </h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {[
                          {
                            letter: "ا",
                            name: "Alif",
                            pron: "a / aa",
                            word: "أَسَدٌ",
                            wordMeaning: "Lion",
                          },
                          {
                            letter: "ب",
                            name: "Baa",
                            pron: "b",
                            word: "بَابٌ",
                            wordMeaning: "Door",
                          },
                          {
                            letter: "ت",
                            name: "Taa",
                            pron: "t",
                            word: "تُفَّاحٌ",
                            wordMeaning: "Apple",
                          },
                          {
                            letter: "ث",
                            name: "Thaa",
                            pron: "th (soft)",
                            word: "ثَعْلَبٌ",
                            wordMeaning: "Fox",
                          },
                          {
                            letter: "ج",
                            name: "Jeem",
                            pron: "j",
                            word: "جَمَلٌ",
                            wordMeaning: "Camel",
                          },
                          {
                            letter: "ح",
                            name: "Haa",
                            pron: "ḥ (breathy)",
                            word: "حِصَانٌ",
                            wordMeaning: "Horse",
                          },
                          {
                            letter: "خ",
                            name: "Khaa",
                            pron: "kh",
                            word: "خُبْزٌ",
                            wordMeaning: "Bread",
                          },
                          {
                            letter: "د",
                            name: "Daal",
                            pron: "d",
                            word: "دَجَاجَةٌ",
                            wordMeaning: "Chicken",
                          },
                          {
                            letter: "ذ",
                            name: "Dhaal",
                            pron: "dh (the)",
                            word: "ذَهَبٌ",
                            wordMeaning: "Gold",
                          },
                          {
                            letter: "ر",
                            name: "Raa",
                            pron: "r (rolled)",
                            word: "رَجُلٌ",
                            wordMeaning: "Man",
                          },
                          {
                            letter: "ز",
                            name: "Zaay",
                            pron: "z",
                            word: "زَهْرَةٌ",
                            wordMeaning: "Flower",
                          },
                          {
                            letter: "س",
                            name: "Seen",
                            pron: "s",
                            word: "سَمَكٌ",
                            wordMeaning: "Fish",
                          },
                          {
                            letter: "ش",
                            name: "Sheen",
                            pron: "sh",
                            word: "شَمْسٌ",
                            wordMeaning: "Sun",
                          },
                          {
                            letter: "ص",
                            name: "Saad",
                            pron: "ṣ (heavy s)",
                            word: "صَقْرٌ",
                            wordMeaning: "Falcon",
                          },
                          {
                            letter: "ض",
                            name: "Daad",
                            pron: "ḍ (heavy d)",
                            word: "ضَوْءٌ",
                            wordMeaning: "Light",
                          },
                          {
                            letter: "ط",
                            name: "Taa",
                            pron: "ṭ (heavy t)",
                            word: "طَائِرٌ",
                            wordMeaning: "Bird",
                          },
                          {
                            letter: "ظ",
                            name: "Dhaa",
                            pron: "ẓ (heavy dh)",
                            word: "ظِلٌّ",
                            wordMeaning: "Shadow",
                          },
                          {
                            letter: "ع",
                            name: "Ayn",
                            pron: "ʿ (throat)",
                            word: "عَيْنٌ",
                            wordMeaning: "Eye",
                          },
                          {
                            letter: "غ",
                            name: "Ghayn",
                            pron: "gh",
                            word: "غُرَابٌ",
                            wordMeaning: "Crow",
                          },
                          {
                            letter: "ف",
                            name: "Faa",
                            pron: "f",
                            word: "فِيلٌ",
                            wordMeaning: "Elephant",
                          },
                          {
                            letter: "ق",
                            name: "Qaaf",
                            pron: "q (deep)",
                            word: "قَمَرٌ",
                            wordMeaning: "Moon",
                          },
                          {
                            letter: "ك",
                            name: "Kaaf",
                            pron: "k",
                            word: "كِتَابٌ",
                            wordMeaning: "Book",
                          },
                          {
                            letter: "ل",
                            name: "Laam",
                            pron: "l",
                            word: "لَيْلٌ",
                            wordMeaning: "Night",
                          },
                          {
                            letter: "م",
                            name: "Meem",
                            pron: "m",
                            word: "مَاءٌ",
                            wordMeaning: "Water",
                          },
                          {
                            letter: "ن",
                            name: "Noon",
                            pron: "n",
                            word: "نَجْمٌ",
                            wordMeaning: "Star",
                          },
                          {
                            letter: "ه",
                            name: "Haa",
                            pron: "h (light)",
                            word: "هِلَالٌ",
                            wordMeaning: "Crescent",
                          },
                          {
                            letter: "و",
                            name: "Waaw",
                            pron: "w / oo",
                            word: "وَرْدٌ",
                            wordMeaning: "Rose",
                          },
                          {
                            letter: "ي",
                            name: "Yaa",
                            pron: "y / ee",
                            word: "يَدٌ",
                            wordMeaning: "Hand",
                          },
                        ].map((item, index) => (
                          <div
                            key={index}
                            className="card text-center hover:scale-[1.03] cursor-pointer transition-transform duration-200 p-4"
                          >
                            <div className="text-5xl font-arabic text-primary-700 dark:text-primary-400 mb-1 leading-tight">
                              {item.letter}
                            </div>
                            <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
                              {item.name}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                              /{item.pron}/
                            </p>
                            {/* Audio buttons */}
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  speakArabic(item.letter, index);
                                }}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-[6px] border text-[11px] font-medium transition-all duration-200 ${
                                  speakingIdx === index
                                    ? "border-primary-500 text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20"
                                    : "border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400"
                                }`}
                                title={`Listen to ${item.name}`}
                              >
                                <FaVolumeUp className="text-[10px]" />
                                {speakingIdx === index
                                  ? "Playing..."
                                  : "Letter"}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  speakArabic(item.word, index + 100);
                                }}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-[6px] border text-[11px] font-medium transition-all duration-200 ${
                                  speakingIdx === index + 100
                                    ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20"
                                    : "border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                                }`}
                                title={`Listen to ${item.wordMeaning}`}
                              >
                                <FaVolumeDown className="text-[10px]" />
                                {speakingIdx === index + 100
                                  ? "Playing..."
                                  : "Word"}
                              </button>
                            </div>
                            <div className="border-t border-slate-200 dark:border-dark-border pt-2 mt-1">
                              <p className="text-2xl font-arabic text-emerald-700 dark:text-emerald-400 leading-tight">
                                {item.word}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                {item.wordMeaning}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-8 p-6 bg-emerald-50 dark:bg-dark-bg rounded-lg border border-emerald-100 dark:border-dark-border">
                        <h3 className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mb-3">
                          Learning Guide
                        </h3>
                        <p className="text-slate-700 dark:text-slate-300">
                          Start by learning each Arabic letter, its
                          pronunciation, and how to connect them. Each card
                          shows the letter, how it sounds, and an example Arabic
                          word. Practice daily for best results. Your teacher
                          will guide you through each step.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Tajweed & Surahs */}
                  {activeTab === "tajweed" && (
                    <div>
                      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h2 className="text-2xl sm:text-3xl font-bold text-primary-700 dark:text-primary-400">
                          All 114 Surahs - Complete Audio
                        </h2>
                        <select
                          value={selectedReciter}
                          onChange={(e) => setSelectedReciter(e.target.value)}
                          className="w-full sm:w-auto px-4 py-2.5 border border-slate-300 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-dark-card dark:text-slate-200 text-sm"
                        >
                          {quranService.getReciters().map((reciter) => (
                            <option
                              key={reciter.identifier}
                              value={reciter.identifier}
                            >
                              {reciter.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Audio Player Controls */}
                      {playingSurah && (
                        <motion.div
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mb-6 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl p-4 sm:p-6 shadow-soft-lg"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                            <div className="min-w-0">
                              <h3 className="text-base sm:text-xl font-bold truncate">
                                Surah {playingSurah} -{" "}
                                {
                                  surahs.find((s) => s.number === playingSurah)
                                    ?.englishName
                                }
                              </h3>
                              <p className="text-emerald-100 text-xs sm:text-sm truncate">
                                {
                                  quranService
                                    .getReciters()
                                    .find(
                                      (r) => r.identifier === selectedReciter,
                                    )?.name
                                }
                              </p>
                            </div>
                            <div className="flex items-center justify-center space-x-3 flex-shrink-0">
                              <button
                                onClick={playPreviousSurah}
                                disabled={playingSurah === 1}
                                className="p-2.5 sm:p-3 bg-white/20 hover:bg-white/30 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <FaStepBackward className="text-sm sm:text-base" />
                              </button>
                              <button
                                onClick={() => playSurah(playingSurah)}
                                className="p-3 sm:p-4 bg-white text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors shadow-soft"
                              >
                                <FaPause size={20} className="sm:hidden" />
                                <FaPause
                                  size={24}
                                  className="hidden sm:block"
                                />
                              </button>
                              <button
                                onClick={playNextSurah}
                                disabled={playingSurah === 114}
                                className="p-2.5 sm:p-3 bg-white/20 hover:bg-white/30 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <FaStepForward className="text-sm sm:text-base" />
                              </button>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="space-y-2">
                            <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-white h-full transition-all duration-300"
                                style={{
                                  width: `${(audioProgress / audioDuration) * 100 || 0}%`,
                                }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs sm:text-sm text-emerald-100">
                              <span>{formatTime(audioProgress)}</span>
                              <span>{formatTime(audioDuration)}</span>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
                        {surahs.map((surah) => (
                          <div
                            key={surah.number}
                            className={`card flex items-center justify-between hover:shadow-xl cursor-pointer transition-all ${
                              playingSurah === surah.number
                                ? "ring-2 ring-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                                : ""
                            }`}
                            onClick={() => playSurah(surah.number)}
                          >
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-full flex items-center justify-center font-bold">
                                  {surah.number}
                                </div>
                                <div>
                                  <h3 className="font-bold text-primary-700 dark:text-primary-400">
                                    {surah.englishName}
                                  </h3>
                                  <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {surah.numberOfAyahs} verses
                                  </p>
                                </div>
                              </div>
                            </div>
                            <button className="text-gold dark:text-gold text-2xl">
                              {playingSurah === surah.number ? (
                                <FaPause />
                              ) : (
                                <FaPlay />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Full Quran (30 Paras) */}
                  {activeTab === "quran" && (
                    <div>
                      <h2 className="text-3xl font-bold text-emerald-700 dark:text-emerald-400 mb-6">
                        Complete Quran - 30 Juz (Paras)
                      </h2>
                      <p className="text-slate-600 dark:text-slate-400 mb-6">
                        Click a Juz to open the reader with Arabic text plus
                        instant English and Maududi Urdu translations. Use the
                        toggle inside the reader to switch between languages at
                        any time.
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-6 gap-4">
                        {juzList.map((juz) => (
                          <motion.div
                            key={juz.number}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openJuzReader(juz.number)}
                            className="card text-center cursor-pointer hover:shadow-soft-lg transition-all group"
                          >
                            <div className="text-4xl font-bold bg-gradient-to-r from-emerald-700 to-primary-600 dark:from-emerald-400 dark:to-primary-400 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                              {juz.number}
                            </div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              Juz {juz.number}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {juz.name.split(" - ")[1]}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                      <div className="mt-8 p-6 bg-emerald-50 dark:bg-dark-bg rounded-lg border border-emerald-100 dark:border-dark-border">
                        <h3 className="font-bold text-primary-700 dark:text-primary-400 mb-2">
                          About Juz Reading
                        </h3>
                        <p className="text-slate-700 dark:text-slate-300">
                          The Quran is divided into 30 equal parts (Juz/Para)
                          for easier daily reading and memorization. Each Juz
                          you open now includes Arabic text alongside
                          synchronized English and Urdu translations so you can
                          follow the tafsir style that suits you best.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Hadith Collection */}
                  {activeTab === "hadith" && (
                    <div>
                      <h2 className="text-3xl font-bold text-emerald-700 dark:text-emerald-400 mb-6">
                        Hadith Collection
                      </h2>
                      <div className="space-y-6">
                        {hadiths.map((hadith) => (
                          <div
                            key={hadith.id}
                            className="border border-slate-200 dark:border-dark-border rounded-lg p-6 bg-slate-50 dark:bg-dark-bg"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-3 py-1 rounded-full text-sm">
                                {hadith.book}
                              </span>
                              <span className="text-sm text-slate-500 dark:text-slate-400">
                                Chapter: {hadith.chapter}
                              </span>
                            </div>
                            <div className="arabic-text text-center mb-4 text-primary-700 dark:text-primary-400">
                              {hadith.arabic}
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 text-center italic">
                              &ldquo;{hadith.text}&rdquo;
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Duas */}
                  {activeTab === "duas" && (
                    <div>
                      <h2 className="text-3xl font-bold text-emerald-700 dark:text-emerald-400 mb-6">
                        Daily Duas & Supplications
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {duas.map((dua) => (
                          <div key={dua.id} className="card">
                            <div className="mb-3">
                              <span className="bg-gold text-white px-3 py-1 rounded-full text-sm">
                                {dua.category}
                              </span>
                            </div>
                            <h3 className="text-xl font-bold text-primary-700 dark:text-primary-400 mb-3">
                              {dua.title}
                            </h3>
                            <div className="arabic-text text-center mb-3 text-emerald-800 dark:text-emerald-300">
                              {dua.arabic}
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 text-sm mb-2 text-center italic">
                              {dua.transliteration}
                            </p>
                            <p className="text-slate-700 dark:text-slate-300 text-center">
                              {dua.translation}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quran Reader Modal */}
        {selectedJuz && (
          <QuranReader juzNumber={selectedJuz} onClose={closeJuzReader} />
        )}
      </Layout>
    </ProtectedRoute>
  );
}
