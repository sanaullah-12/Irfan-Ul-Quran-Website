import type { NextApiRequest, NextApiResponse } from "next";
import { quranService } from "../../../utils/quranService";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { juz } = req.query;
  const juzParam = Array.isArray(juz) ? juz[0] : juz;
  const juzNumber = parseInt(juzParam || "", 10);

  if (!juzParam || Number.isNaN(juzNumber) || juzNumber < 1 || juzNumber > 30) {
    return res
      .status(400)
      .json({ message: "Please provide a Juz number between 1 and 30." });
  }

  try {
    const data = await quranService.getJuzWithTranslation(juzNumber);
    return res.status(200).json(data);
  } catch (error) {
    console.error("API error fetching Juz:", error);
    return res.status(500).json({ message: "Unable to load Juz data." });
  }
}
