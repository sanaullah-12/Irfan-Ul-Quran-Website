// Simple script to clear all caches and verify Urdu is working
const { quranService } = require("./utils/quranService");

async function clearAndVerify() {
  console.log("=== Clearing All Caches ===");
  quranService.clearAllCache();

  console.log("\n=== Testing Fresh Juz 1 Load ===");
  const juz = await quranService.getJuzWithTranslation(1);

  const withUrdu = juz.filter(
    (v) => v.urduTranslation && v.urduTranslation.length > 0,
  ).length;
  const total = juz.length;

  console.log(`\nTotal Verses: ${total}`);
  console.log(`With Urdu: ${withUrdu}`);
  console.log(`Percentage: ${((withUrdu / total) * 100).toFixed(1)}%`);

  console.log("\nFirst 3 verses:");
  juz.slice(0, 3).forEach((v) => {
    console.log(`  ${v.surahNumber}:${v.numberInSurah}`);
    console.log(
      `    Urdu: ${v.urduTranslation ? v.urduTranslation.substring(0, 50) : "MISSING"}`,
    );
  });

  if (withUrdu === total) {
    console.log("\n\u2705 SUCCESS! All verses have Urdu translations");
  } else {
    console.log("\n\u274c ISSUE: Some verses missing Urdu");
  }
}

clearAndVerify().catch(console.error);
