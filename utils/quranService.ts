import axios from "axios";

// Quran API for Surahs and Audio
const QURAN_API_BASE = "https://api.alquran.cloud/v1";
const QURAN_COM_API = "https://api.quran.com/api/v4";
const QURAN_COM_CHAPTERS = `${QURAN_COM_API}/chapters`;
const QURAN_COM_VERSES = `${QURAN_COM_API}/quran/verses/uthmani`;
const QURAN_COM_TRANSLATION = `${QURAN_COM_API}/quran/translations`;
const AL_QURAN_SURAH_ENDPOINT = "https://alquran-api.pages.dev/api/quran/surah";

type ChapterMap = Record<number, { name: string; arabicName: string }>;

let cachedChapters: ChapterMap | null = null;

const getChapterMap = async (): Promise<ChapterMap> => {
  if (cachedChapters) {
    return cachedChapters;
  }

  try {
    const { data } = await axios.get(QURAN_COM_CHAPTERS, {
      params: { language: "en" },
      timeout: 15000,
    });

    cachedChapters = (data?.chapters || []).reduce(
      (map: ChapterMap, chapter: any) => {
        map[chapter.id] = {
          name: chapter.name_simple,
          arabicName: chapter.name_arabic,
        };
        return map;
      },
      {},
    );
  } catch (error) {
    console.error("Error loading chapter metadata from Quran.com", error);
    cachedChapters = {};
  }

  return cachedChapters!;
};

const EN_TRANSLATION_ID = 131; // Clear Quran by Dr. Mustafa Khattab
const UR_TRANSLATION_ID = 20; // Tafheem-ul-Quran by Maulana Maududi

const alQuranUrduSurahCache = new Map<number, any[]>();
const juzDataCache = new Map<number, any[]>();

const fetchAlQuranUrduSurah = async (surahNumber: number) => {
  // This function should ONLY be called from server-side code
  // If called from browser, it means something went wrong
  if (typeof window !== "undefined") {
    console.error(
      "⚠️ fetchAlQuranUrduSurah called from browser! This should not happen.",
    );
    return [];
  }

  if (alQuranUrduSurahCache.has(surahNumber)) {
    console.log(`  ✓ Using cached Surah ${surahNumber} (Urdu)`);
    return alQuranUrduSurahCache.get(surahNumber) || [];
  }

  console.log(`  ⟳ Fetching Surah ${surahNumber} (Urdu) from Al-Quran API...`);
  try {
    const { data } = await axios.get(
      `${AL_QURAN_SURAH_ENDPOINT}/${surahNumber}`,
      {
        params: { lang: "ur" },
        timeout: 10000,
      },
    );
    const verses = data?.verses || data?.data?.verses || [];
    alQuranUrduSurahCache.set(surahNumber, verses);
    console.log(`  ✓ Cached Surah ${surahNumber} (${verses.length} verses)`);
    return verses;
  } catch (error: any) {
    console.error(`Error fetching Surah ${surahNumber} Urdu:`, error.message);
    alQuranUrduSurahCache.set(surahNumber, []);
    return [];
  }
};

const fetchUrduTranslationsFromAlQuran = async (ayahs: any[]) => {
  const translationMap: Record<string, string> = {};

  const surahAyahMap = ayahs.reduce(
    (map: Record<number, Set<number>>, ayah: any) => {
      const surahNumber = ayah?.surah?.number;
      const numberInSurah = ayah?.numberInSurah;
      if (!surahNumber || !numberInSurah) {
        return map;
      }

      if (!map[surahNumber]) {
        map[surahNumber] = new Set<number>();
      }

      map[surahNumber].add(numberInSurah);
      return map;
    },
    {},
  );

  const fetchTasks = Object.entries(surahAyahMap).map(
    async ([surahNumberStr, ayahSet]) => {
      const surahNumber = Number(surahNumberStr);
      const verseNumbers = ayahSet as Set<number>;
      const verses = await fetchAlQuranUrduSurah(surahNumber);

      if (!verses.length) {
        return;
      }

      verses.forEach((verse: any, index: number) => {
        const verseNumber = Number(
          verse.numberInSurah ??
            verse.id ??
            verse.verse_number ??
            verse.verseNumber ??
            verse.ayahNumber ??
            index + 1,
        );

        if (!Number.isFinite(verseNumber)) {
          return;
        }

        if (verseNumbers.has(verseNumber)) {
          const translationText =
            verse.translation ??
            verse.translate ??
            verse.text_translation ??
            "";

          if (translationText) {
            translationMap[`${surahNumber}:${verseNumber}`] = translationText;
          }
        }
      });
    },
  );

  await Promise.all(fetchTasks);

  return translationMap;
};

const fetchUrduTranslationsFromVerseKeys = async (verses: any[]) => {
  const translationMap: Record<string, string> = {};

  const surahAyahMap = verses.reduce(
    (map: Record<number, Set<number>>, verse: any) => {
      if (!verse.verse_key) return map;

      const [surahPart, ayahPart] = String(verse.verse_key).split(":");
      const surahNumber = parseInt(surahPart || "0", 10);
      const numberInSurah = parseInt(ayahPart || "0", 10);

      if (!surahNumber || !numberInSurah) {
        return map;
      }

      if (!map[surahNumber]) {
        map[surahNumber] = new Set<number>();
      }

      map[surahNumber].add(numberInSurah);
      return map;
    },
    {},
  );

  const fetchTasks = Object.entries(surahAyahMap).map(
    async ([surahNumberStr, ayahSet]) => {
      const surahNumber = Number(surahNumberStr);
      const verseNumbers = ayahSet as Set<number>;
      const verses = await fetchAlQuranUrduSurah(surahNumber);

      if (!verses.length) {
        return;
      }

      verses.forEach((verse: any, index: number) => {
        const verseNumber = Number(
          verse.numberInSurah ??
            verse.id ??
            verse.verse_number ??
            verse.verseNumber ??
            verse.ayahNumber ??
            index + 1,
        );

        if (!Number.isFinite(verseNumber)) {
          return;
        }

        if (verseNumbers.has(verseNumber)) {
          const translationText =
            verse.translation ??
            verse.translate ??
            verse.text_translation ??
            "";

          if (translationText) {
            translationMap[`${surahNumber}:${verseNumber}`] = translationText;
          }
        }
      });
    },
  );

  await Promise.all(fetchTasks);

  return translationMap;
};

const fetchPaginatedQuranData = async (
  url: string,
  params: Record<string, any>,
  resultKey: string,
) => {
  const perPage = 300;
  let page = 1;
  let hasMore = true;
  const combined: any[] = [];

  while (hasMore) {
    const { data } = await axios.get(url, {
      params: { ...params, per_page: perPage, page },
      timeout: 15000,
    });
    const chunk = data?.[resultKey] || [];
    combined.push(...chunk);

    const pagination = data?.pagination;
    if (
      !pagination ||
      !pagination.total_pages ||
      page >= pagination.total_pages
    ) {
      hasMore = false;
    } else {
      page += 1;
    }

    if (chunk.length === 0) {
      hasMore = false;
    }
  }

  return combined;
};

const fetchLegacyJuzWithTranslation = async (juzNumber: number) => {
  const [arabicResponse, translationResponse] = await Promise.all([
    axios.get(`${QURAN_API_BASE}/juz/${juzNumber}/quran-uthmani`, {
      timeout: 15000,
    }),
    axios.get(`${QURAN_API_BASE}/juz/${juzNumber}/en.sahih`, {
      timeout: 15000,
    }),
  ]);

  const arabicAyahs = arabicResponse.data.data.ayahs;
  const translatedAyahs = translationResponse.data.data.ayahs;
  const urduTranslationMap =
    await fetchUrduTranslationsFromAlQuran(arabicAyahs);

  return arabicAyahs.map((ayah: any, index: number) => ({
    number: ayah.number,
    text: ayah.text,
    englishTranslation: translatedAyahs[index]?.text || "",
    urduTranslation: (() => {
      const surahNumber = ayah?.surah?.number;
      if (!surahNumber) {
        return "";
      }
      return urduTranslationMap[`${surahNumber}:${ayah.numberInSurah}`] || "";
    })(),
    surah: ayah.surah.name,
    surahNumber: ayah.surah.number,
    numberInSurah: ayah.numberInSurah,
  }));
};

export const quranService = {
  // Get all Surahs
  async getAllSurahs() {
    try {
      const response = await axios.get(`${QURAN_API_BASE}/surah`);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching surahs:", error);
      throw error;
    }
  },

  // Get specific Surah with translation
  async getSurah(surahNumber: number, edition = "ar.alafasy") {
    try {
      const response = await axios.get(
        `${QURAN_API_BASE}/surah/${surahNumber}/${edition}`,
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching surah:", error);
      throw error;
    }
  },

  // Get Surah audio (Complete Surah - not verse by verse)
  async getSurahAudio(surahNumber: number, reciter = "ar.alafasy") {
    const reciterMap: { [key: string]: string } = {
      "ar.alafasy": "mishaari_raashid_al_3afaasee",
      "ar.abdulbasitmurattal": "abdulbaset_mujawwad",
      "ar.abdurrahmaansudais": "abdullaah_3awwaad_al-juhaynee",
      "ar.shaatree": "abu_bakr_ash-shaatree",
      "ar.husary": "mahmood_khaleel_al-husaree",
      "ar.minshawi": "muhammad_siddeeq_al-minshaawee",
    };

    const reciterFolder = reciterMap[reciter] || reciterMap["ar.alafasy"];
    const paddedSurah = String(surahNumber).padStart(3, "0");

    // Return complete Surah audio URL from Quranic Audio CDN
    return `https://download.quranicaudio.com/quran/${reciterFolder}/${paddedSurah}.mp3`;
  },

  // Get all Juz (30 Paras) with metadata
  async getAllJuz() {
    const juzList = [];
    const juzStartSurahs = [
      { juz: 1, surah: 1, name: "Al-Fatiha" },
      { juz: 2, surah: 2, name: "Al-Baqarah (Midpoint)" },
      { juz: 3, surah: 2, name: "Tilka Al-Rusul" },
      { juz: 4, surah: 3, name: "Lan Tana Lu" },
      { juz: 5, surah: 4, name: "Wal Muhsanat" },
      { juz: 6, surah: 4, name: "La Yuhibbullah" },
      { juz: 7, surah: 5, name: "Wa Iza Sami'u" },
      { juz: 8, surah: 6, name: "Wa Lau Annana" },
      { juz: 9, surah: 7, name: "Qal Al-Mala" },
      { juz: 10, surah: 8, name: "Wa A'lamu" },
      { juz: 11, surah: 9, name: "Ya'tadhiruna" },
      { juz: 12, surah: 11, name: "Wa Ma Min Dabbah" },
      { juz: 13, surah: 12, name: "Wa Ma Ubri'u" },
      { juz: 14, surah: 15, name: "Rubama" },
      { juz: 15, surah: 17, name: "Subhana Allathi" },
      { juz: 16, surah: 18, name: "Qala A Lam" },
      { juz: 17, surah: 21, name: "Iqtaraba" },
      { juz: 18, surah: 23, name: "Qad Aflaha" },
      { juz: 19, surah: 25, name: "Wa Qala Allatheena" },
      { juz: 20, surah: 27, name: "A'man Khalaqa" },
      { juz: 21, surah: 29, name: "Utlu Ma Uhiya" },
      { juz: 22, surah: 33, name: "Wa Man Yaqnut" },
      { juz: 23, surah: 36, name: "Wa Mali" },
      { juz: 24, surah: 39, name: "Faman Azlam" },
      { juz: 25, surah: 41, name: "Ilayhi Yuraddu" },
      { juz: 26, surah: 46, name: "Ha Mim" },
      { juz: 27, surah: 51, name: "Qala Fama Khatbukum" },
      { juz: 28, surah: 58, name: "Qad Sami'a" },
      { juz: 29, surah: 67, name: "Tabaraka" },
      { juz: 30, surah: 78, name: "'Amma" },
    ];

    for (let i = 0; i < juzStartSurahs.length; i++) {
      juzList.push({
        number: juzStartSurahs[i].juz,
        name: `Juz ${juzStartSurahs[i].juz} - ${juzStartSurahs[i].name}`,
        startSurah: juzStartSurahs[i].surah,
      });
    }
    return juzList;
  },

  // Get specific Juz with full ayahs
  async getJuz(juzNumber: number, edition = "quran-uthmani") {
    try {
      const response = await axios.get(
        `${QURAN_API_BASE}/juz/${juzNumber}/${edition}`,
        { timeout: 15000 },
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching juz:", error);
      throw error;
    }
  },

  // Get Juz with translation
  async getJuzWithTranslation(juzNumber: number) {
    // Check cache first
    if (juzDataCache.has(juzNumber)) {
      console.log(`✓ Returning cached Juz ${juzNumber}`);
      return juzDataCache.get(juzNumber)!;
    }

    console.log(`⟳ Fetching Juz ${juzNumber} from APIs...`);
    try {
      const [verses, englishTranslations, chapterMap] = await Promise.all([
        fetchPaginatedQuranData(
          QURAN_COM_VERSES,
          { juz_number: juzNumber },
          "verses",
        ),
        fetchPaginatedQuranData(
          `${QURAN_COM_TRANSLATION}/${EN_TRANSLATION_ID}`,
          { juz_number: juzNumber },
          "translations",
        ),
        getChapterMap(),
      ]);

      const urduTranslationMap =
        await fetchUrduTranslationsFromVerseKeys(verses);

      const englishMap = englishTranslations.reduce(
        (map: Record<string, string>, item: any) => {
          map[item.verse_key] = item.text;
          return map;
        },
        {},
      );

      const result = verses.map((verse: any) => {
        const [surahPart, ayahPart] = String(verse.verse_key || "").split(":");
        const surahNumber = parseInt(surahPart || "0", 10);
        const numberInSurah = parseInt(ayahPart || "0", 10);

        return {
          number: verse.id,
          text: verse.text_uthmani,
          englishTranslation: englishMap[verse.verse_key] || "",
          urduTranslation: urduTranslationMap[verse.verse_key] || "",
          surah: chapterMap[surahNumber]?.name || `Surah ${surahNumber}`,
          surahNumber,
          numberInSurah: numberInSurah || verse.verse_number,
        };
      });

      // Cache the result
      juzDataCache.set(juzNumber, result);
      console.log(`✓ Cached Juz ${juzNumber} (${result.length} verses)`);

      return result;
    } catch (error) {
      console.error("Error fetching juz with translation:", error);
      return fetchLegacyJuzWithTranslation(juzNumber);
    }
  },

  // Available reciters
  getReciters() {
    return [
      {
        identifier: "ar.alafasy",
        name: "Mishary Rashid Alafasy",
        language: "Arabic",
      },
      {
        identifier: "ar.abdulbasitmurattal",
        name: "Abdul Basit (Murattal)",
        language: "Arabic",
      },
      {
        identifier: "ar.abdurrahmaansudais",
        name: "Abdurrahman As-Sudais",
        language: "Arabic",
      },
      {
        identifier: "ar.shaatree",
        name: "Abu Bakr Ash-Shaatree",
        language: "Arabic",
      },
      {
        identifier: "ar.husary",
        name: "Mahmoud Khalil Al-Husary",
        language: "Arabic",
      },
      {
        identifier: "ar.minshawi",
        name: "Mohamed Siddiq Al-Minshawi",
        language: "Arabic",
      },
    ];
  },

  // Cache management utilities
  clearJuzCache(juzNumber?: number) {
    if (juzNumber !== undefined) {
      juzDataCache.delete(juzNumber);
      console.log(`✓ Cleared cache for Juz ${juzNumber}`);
    } else {
      juzDataCache.clear();
      console.log(`✓ Cleared all Juz cache`);
    }
  },

  clearUrduCache(surahNumber?: number) {
    if (surahNumber !== undefined) {
      alQuranUrduSurahCache.delete(surahNumber);
      console.log(`✓ Cleared Urdu cache for Surah ${surahNumber}`);
    } else {
      alQuranUrduSurahCache.clear();
      console.log(`✓ Cleared all Urdu cache`);
    }
  },

  clearAllCache() {
    juzDataCache.clear();
    alQuranUrduSurahCache.clear();
    cachedChapters = null;
    console.log(`✓ Cleared all Quran data cache`);
  },

  getCacheStats() {
    return {
      juzCached: juzDataCache.size,
      urduSurahsCached: alQuranUrduSurahCache.size,
      chaptersLoaded: cachedChapters !== null,
    };
  },
};

// Hadith API
export const hadithService = {
  async getHadithBooks() {
    return [
      { name: "Sahih Bukhari", slug: "bukhari", collection: "bukhari" },
      { name: "Sahih Muslim", slug: "muslim", collection: "muslim" },
      { name: "Sunan Abu Dawood", slug: "abudawud", collection: "abudawud" },
      { name: "Jami At-Tirmidhi", slug: "tirmidhi", collection: "tirmidhi" },
    ];
  },

  async getHadiths(book: string, page = 1, limit = 10) {
    try {
      // Using a simple hadith collection
      const hadiths = [
        {
          id: 1,
          book: "Sahih Bukhari",
          chapter: "Revelation",
          number: 1,
          text: "Actions are according to intentions, and everyone will get what was intended.",
          arabic:
            "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
        },
        {
          id: 2,
          book: "Sahih Muslim",
          chapter: "Faith",
          number: 1,
          text: "Islam is built upon five pillars: testifying that there is no god except Allah and that Muhammad is the Messenger of Allah...",
          arabic:
            "بُنِيَ الإِسْلاَمُ عَلَى خَمْسٍ: شَهَادَةِ أَنْ لاَ إِلَهَ إِلاَّ اللَّهُ",
        },
      ];

      return { hadiths, totalPages: 10 };
    } catch (error) {
      console.error("Error fetching hadiths:", error);
      throw error;
    }
  },
};

// Duas Service
export const duaService = {
  getDuas() {
    return [
      {
        id: 1,
        title: "Morning Dua",
        arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ",
        transliteration: "Asbahnaa wa asbahal-mulku lillaah",
        translation: "We have entered morning and the kingdom belongs to Allah",
        category: "Morning",
      },
      {
        id: 2,
        title: "Evening Dua",
        arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ",
        transliteration: "Amsaynaa wa amsal-mulku lillaah",
        translation: "We have entered evening and the kingdom belongs to Allah",
        category: "Evening",
      },
      {
        id: 3,
        title: "Before Eating",
        arabic: "بِسْمِ اللَّهِ",
        transliteration: "Bismillah",
        translation: "In the name of Allah",
        category: "Eating",
      },
      {
        id: 4,
        title: "After Eating",
        arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا",
        transliteration: "Alhamdulillaahil-lathee at amanaa wa saqaanaa",
        translation: "All praise is to Allah who fed us and gave us drink",
        category: "Eating",
      },
      {
        id: 5,
        title: "Before Sleeping",
        arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
        transliteration: "Bismika Allaahumma amootu wa ahyaa",
        translation: "In Your name O Allah, I die and I live",
        category: "Sleeping",
      },
    ];
  },
};
