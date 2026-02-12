import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { text } = req.query;
  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Missing text parameter" });
  }

  try {
    // Server-side proxy for Google Translate TTS (avoids CORS)
    // Male voice effect is applied client-side via Web Audio API pitch shifting
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ar&client=tw-ob&q=${encodeURIComponent(text)}`;
    const response = await fetch(ttsUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Referer: "https://translate.google.com/",
      },
    });

    if (!response.ok) {
      return res.status(502).json({ error: "TTS service unavailable" });
    }

    const buf = await response.arrayBuffer();
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    return res.send(Buffer.from(buf));
  } catch (err) {
    console.error("TTS error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
