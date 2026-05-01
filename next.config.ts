import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

// Content-Security-Policy. 'unsafe-inline' is required for Next's hydration
// scripts and Tailwind/Framer-Motion inline styles; 'wasm-unsafe-eval' is
// required by @ffmpeg/ffmpeg. Everything else is locked down.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://images.unsplash.com https://pixabay.com https://cdn.pixabay.com https://images.pexels.com https://api.dicebear.com https://avatars.githubusercontent.com https://lh3.googleusercontent.com https://static-cdn.jtvnw.net",
  "media-src 'self' blob:",
  "font-src 'self' data:",
  "connect-src 'self' https://api.github.com https://api.unsplash.com https://api.pexels.com https://pixabay.com https://api.iconify.design https://api.simplesvg.com https://api.unisvg.com https://*.supabase.co wss://*.supabase.co",
  "worker-src 'self' blob:",
  "frame-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join('; ');

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(self), microphone=(self), display-capture=(self), geolocation=(), payment=(), usb=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Embedder-Policy", value: "unsafe-none" },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      { protocol: 'https', hostname: 'pixabay.com', pathname: '/**' },
      { protocol: 'https', hostname: 'cdn.pixabay.com', pathname: '/**' },
      { protocol: 'https', hostname: 'images.pexels.com', pathname: '/**' },
      // Auth providers avatars
      { protocol: 'https', hostname: 'api.dicebear.com', pathname: '/**' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com', pathname: '/**' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '/**' },
      { protocol: 'https', hostname: 'static-cdn.jtvnw.net', pathname: '/**' },
    ],
  },
  headers: async () => [{
    source: "/(.*)",
    headers: securityHeaders,
  }],
};

export default withNextIntl(nextConfig);
