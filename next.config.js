/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cdn.worldvectorlogo.com",
      },
    ],
  },
};

const withNextIntl = require("next-intl/plugin")("./src/i18n.ts");

module.exports = withNextIntl(nextConfig);
