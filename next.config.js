/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Temporarily disabled to prevent dev issues
  images: {
    domains: ["cdn.islamic-services.com", "via.placeholder.com"],
  },
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      // fallback: checked AFTER all pages/api routes and dynamic routes.
      // This lets pages/api/juz/[juz].ts and pages/api/urdu/[surah].ts
      // be handled by Next.js, while unmatched /api/* calls proxy to Express.
      fallback: [
        {
          source: "/api/:path*",
          destination: "http://localhost:3001/api/:path*",
        },
      ],
    };
  },
};

module.exports = nextConfig;
