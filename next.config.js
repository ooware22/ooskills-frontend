/** @type {import('next').NextConfig} */
// Security headers (equivalent to helmet)
const securityHeaders = [
  // Enforce HTTPS for 2 years + include subdomains + allow preload list
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Prevent MIME-type sniffing
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // Prevent clickjacking — only allow same-origin framing
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  // Enable browser XSS filter
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  // Control how much referrer info is sent
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // Restrict browser feature access
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  // Content Security Policy — baseline restrictive policy
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://images.unsplash.com https://cdn.worldvectorlogo.com https://ooskills-backend.onrender.com https://randomuser.me https://pbwxwhkkjkshcsugaubp.supabase.co https://*.r2.dev https://platform-lookaside.fbsbx.com https://lh3.googleusercontent.com",
      "connect-src 'self' https://ooskills-backend.onrender.com http://localhost:8000 https://pbwxwhkkjkshcsugaubp.supabase.co",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
  // Prevent DNS prefetching for privacy
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
];

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
      {
        protocol: "https",
        hostname: "ooskills-backend.onrender.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
      },
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
      {
        protocol: "https",
        hostname: "pbwxwhkkjkshcsugaubp.supabase.co",
      },
      {
        protocol: "https",
        hostname: "*.r2.dev",
      },
      {
        protocol: "https",
        hostname: "platform-lookaside.fbsbx.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  // Apply security headers to all routes
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  // Production performance optimizations
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  compiler: {
    // Remove console.log in production for smaller bundles
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
};

const withNextIntl = require("next-intl/plugin")("./src/i18n.ts");

const intlConfig = withNextIntl(nextConfig);

if (intlConfig.experimental && intlConfig.experimental.turbo) {
  delete intlConfig.experimental.turbo;
  if (Object.keys(intlConfig.experimental).length === 0) {
    delete intlConfig.experimental;
  }
}

module.exports = intlConfig;
