/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          // No X-Frame-Options — Arena/E2B preview embeds in iframe.
          // Re-enable SAMEORIGIN on production Vercel if desired.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            // microphone allowed for Playground voice (self only)
            value: "camera=(), microphone=(self), geolocation=()",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
