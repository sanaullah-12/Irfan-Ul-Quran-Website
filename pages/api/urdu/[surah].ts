import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const AL_QURAN_SURAH_ENDPOINT = "https://alquran-api.pages.dev/api/quran/surah";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { surah } = req.query;
  const surahParam = Array.isArray(surah) ? surah[0] : surah;
  const surahNumber = parseInt(surahParam || "", 10);

  if (
    !surahParam ||
    Number.isNaN(surahNumber) ||
    surahNumber < 1 ||
    surahNumber > 114
  ) {
    return res
      .status(400)
      .json({ message: "Please provide a Surah number between 1 and 114." });
  }

  try {
    const { data } = await axios.get(
      `${AL_QURAN_SURAH_ENDPOINT}/${surahNumber}`,
      {
        params: { lang: "ur" },
        timeout: 10000,
      },
    );

    const verses = data?.verses || data?.data?.verses || [];
    return res.status(200).json({ verses });
  } catch (error: unknown) {
    console.error(
      `API error fetching Surah ${surahNumber} Urdu:`,
      error instanceof Error ? error.message : error,
    );
    return res.status(500).json({
      message: "Unable to load Urdu translation.",
      verses: [],
    });
  }
}
