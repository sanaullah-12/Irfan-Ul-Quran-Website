import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import api from "../utils/api";

interface QuranReaderProps {
  juzNumber: number;
  onClose: () => void;
}

interface Ayah {
  number: number;
  text: string;
  englishTranslation: string;
  urduTranslation: string;
  surah: string;
  surahNumber: number;
  numberInSurah: number;
}

type TranslationMode = "none" | "english" | "urdu" | "both";

const translationModes: { id: TranslationMode; label: string }[] = [
  { id: "none", label: "Arabic Only" },
  { id: "english", label: "Arabic + English" },
  { id: "urdu", label: "Arabic + Urdu" },
  { id: "both", label: "Arabic + Both" },
];

const QuranReader: React.FC<QuranReaderProps> = ({ juzNumber, onClose }) => {
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [translationMode, setTranslationMode] =
    useState<TranslationMode>("english");
  const ayahsPerPage = 10;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const normalizeAyahs = (rawAyahs: any[] = []): Ayah[] =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rawAyahs.map((ayah: any) => ({
      number: ayah.number,
      text: ayah.text,
      englishTranslation: ayah.englishTranslation ?? ayah.translation ?? "",
      urduTranslation: ayah.urduTranslation ?? "",
      surah: ayah.surah,
      surahNumber: ayah.surahNumber,
      numberInSurah: ayah.numberInSurah,
    }));

  useEffect(() => {
    loadJuz();
    logJuzActivity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [juzNumber]);

  const logJuzActivity = async () => {
    try {
      await api.post("/dashboard/activities", {
        activityType: "juz_view",
        activityDetails: {
          juzNumber,
        },
      });
    } catch {
      // Silently fail if logging fails
      console.debug("Activity logging skipped");
    }
  };

  const loadJuz = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log(`Fetching Juz ${juzNumber} from /api/juz/${juzNumber}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`/api/juz/${juzNumber}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(
          `API returned ${response.status}: ${response.statusText}`,
        );
      }

      const data = await response.json();
      console.log(`Received ${data.length} verses with Urdu translations`);

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("No verses returned from the API");
      }

      setAyahs(normalizeAyahs(data));
      setCurrentPage(0);
    } catch (err: unknown) {
      console.error("Error loading Juz:", err);
      if (err instanceof Error && err.name === "AbortError") {
        setError(
          "Request timed out. The server may be busy. Please try again.",
        );
      } else {
        setError(
          (err instanceof Error ? err.message : null) ||
            `Failed to load Juz ${juzNumber}. Please try again.`,
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(ayahs.length / ayahsPerPage);
  const currentAyahs = ayahs.slice(
    currentPage * ayahsPerPage,
    (currentPage + 1) * ayahsPerPage,
  );

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  let currentSurah = "";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-dark-card rounded-2xl shadow-soft-lg w-full max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white p-4 sm:p-6 flex justify-between items-center">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-display">
                Juz {juzNumber}
              </h2>
              <p className="text-emerald-100 text-xs sm:text-sm">
                Complete Quran - Para {juzNumber}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Close"
            >
              <FaTimes size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-3 sm:p-6 overflow-y-auto max-h-[calc(90vh-180px)] sm:max-h-[calc(90vh-200px)]">
            {loading ? (
              <div className="flex flex-col justify-center items-center py-20 gap-4">
                <div className="loader"></div>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Loading Juz {juzNumber}...
                </p>
              </div>
            ) : error ? (
              <div className="flex flex-col justify-center items-center py-20 gap-4 text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <span className="text-3xl">⚠️</span>
                </div>
                <p className="text-red-600 dark:text-red-400 font-medium">
                  {error}
                </p>
                <button
                  onClick={loadJuz}
                  className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {ayahs.length > 0 && (
                  <div className="flex flex-col gap-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                          Translation Mode
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                          Switch between Arabic-only, English, Urdu, or both.
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:flex bg-white dark:bg-dark-card rounded-xl sm:rounded-full p-1 gap-1 sm:gap-0 shadow-inner">
                      {translationModes.map((mode) => (
                        <button
                          key={mode.id}
                          onClick={() => setTranslationMode(mode.id)}
                          className={`px-3 py-2 sm:py-1.5 text-xs sm:text-sm font-medium rounded-lg sm:rounded-full transition-all ${
                            translationMode === mode.id
                              ? "bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-soft"
                              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-border"
                          }`}
                        >
                          {mode.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {currentAyahs.map((ayah, index) => {
                  const showSurahHeader = ayah.surah !== currentSurah;
                  if (showSurahHeader) {
                    currentSurah = ayah.surah;
                  }

                  return (
                    <div key={ayah.number}>
                      {showSurahHeader && (
                        <div className="mb-6 text-center">
                          <div className="inline-block bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-6 py-3 rounded-full shadow-soft">
                            <h3 className="text-xl font-bold">{ayah.surah}</h3>
                            <p className="text-sm text-emerald-100">
                              Surah {ayah.surahNumber}
                            </p>
                          </div>
                        </div>
                      )}

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-gradient-to-br from-slate-50 to-emerald-50/30 dark:from-dark-bg dark:to-emerald-900/10 rounded-xl p-4 sm:p-6 border border-emerald-100 dark:border-dark-border shadow-soft"
                      >
                        {/* Ayah Number Badge */}
                        <div className="flex justify-center mb-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-full flex items-center justify-center font-bold shadow-soft">
                            {ayah.numberInSurah}
                          </div>
                        </div>

                        {/* Arabic Text */}
                        <div className="text-right mb-6 leading-loose">
                          <p className="font-arabic text-2xl sm:text-3xl text-emerald-800 dark:text-emerald-300 leading-relaxed">
                            {ayah.text}
                          </p>
                        </div>

                        {/* Translation */}
                        {(() => {
                          if (translationMode === "none") {
                            return null;
                          }

                          const showEnglish =
                            (translationMode === "english" ||
                              translationMode === "both") &&
                            Boolean(ayah.englishTranslation);

                          const showUrdu =
                            (translationMode === "urdu" ||
                              translationMode === "both") &&
                            Boolean(ayah.urduTranslation);

                          if (!showEnglish && !showUrdu) {
                            return null;
                          }

                          return (
                            <div className="border-t border-emerald-200 dark:border-dark-border pt-4 space-y-3">
                              {showEnglish && (
                                <p
                                  className="text-slate-700 dark:text-slate-300 leading-relaxed"
                                  dangerouslySetInnerHTML={{
                                    __html: ayah.englishTranslation,
                                  }}
                                ></p>
                              )}
                              {showUrdu && (
                                <p
                                  className="text-emerald-900 dark:text-emerald-200 leading-relaxed font-serif"
                                  dir="rtl"
                                  dangerouslySetInnerHTML={{
                                    __html: ayah.urduTranslation,
                                  }}
                                ></p>
                              )}
                            </div>
                          );
                        })()}

                        {/* Ayah Reference */}
                        <div className="mt-3 text-sm text-slate-500 dark:text-slate-400 text-right">
                          {ayah.surah} - Ayah {ayah.numberInSurah}
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pagination Footer */}
          {!loading && totalPages > 1 && (
            <div className="bg-slate-50 dark:bg-dark-bg border-t border-slate-200 dark:border-dark-border p-3 sm:p-4 flex justify-between items-center">
              <button
                onClick={prevPage}
                disabled={currentPage === 0}
                className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm sm:text-base"
              >
                <FaChevronLeft size={12} />
                <span>Prev</span>
              </button>

              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                {currentPage + 1} / {totalPages}
              </div>

              <button
                onClick={nextPage}
                disabled={currentPage === totalPages - 1}
                className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm sm:text-base"
              >
                <span>Next</span>
                <FaChevronRight size={12} />
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QuranReader;
