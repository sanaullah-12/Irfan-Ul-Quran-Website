/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Temporarily disabled to prevent dev issues
  images: {
    domains: ["cdn.islamic-services.com", "via.placeholder.com"],
  },
  // No rewrites needed — all API routes are now Next.js API routes
};

module.exports = nextConfig;
