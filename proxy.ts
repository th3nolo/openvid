import { updateSession } from "@/utils/supabase/middleware";
import { NextResponse, type NextRequest } from "next/server";
import createIntlMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  localeDetection: true
});

const buildCsp = (nonce: string) => [
  "default-src 'self'",
  // 'strict-dynamic' lets the nonce'd Next bootstrap chain in /_next/static
  // chunks; 'wasm-unsafe-eval' is required by @ffmpeg/ffmpeg for the editor.
  `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'wasm-unsafe-eval'`,
  // Tailwind v4 + Framer-Motion still emit inline style attributes; CSS-only
  // nonces aren't worth the regression risk for the protection they add.
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://images.unsplash.com https://pixabay.com https://cdn.pixabay.com https://images.pexels.com https://api.dicebear.com https://avatars.githubusercontent.com https://lh3.googleusercontent.com https://static-cdn.jtvnw.net",
  "media-src 'self' blob:",
  "font-src 'self' data:",
  "connect-src 'self' https://api.github.com https://api.unsplash.com https://api.pexels.com https://pixabay.com https://api.iconify.design https://api.simplesvg.com https://api.unisvg.com https://*.supabase.co wss://*.supabase.co",
  "worker-src 'self' blob:",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join('; ');

export default async function proxy(request: NextRequest) {
  // x-vercel-ip-country is injected by Vercel's edge and cannot be set by the
  // client. On non-Vercel deploys this falls back to UNKNOWN.
  const country = request.headers.get('x-vercel-ip-country') || 'UNKNOWN';
  const nonce = btoa(crypto.randomUUID());
  const csp = buildCsp(nonce);

  // Inject per-request signals into the *request* headers so RSC server
  // components can read them via `headers()`. Setting CSP here also lets
  // Next.js auto-apply the nonce to its inline hydration / RSC-flight scripts
  // and any next/script <Script> tag.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('x-user-country', country);
  requestHeaders.set('content-security-policy', csp);

  const intlResponse = intlMiddleware(request);
  const isLocaleRedirect = intlResponse.status >= 300 && intlResponse.status < 400;

  // Pull supabase auth-cookie updates regardless so silent token refresh isn't lost.
  const supabaseResponse = await updateSession(request);
  const isAuthRedirect = supabaseResponse.status >= 300 && supabaseResponse.status < 400;

  if (isAuthRedirect) {
    supabaseResponse.headers.set('Content-Security-Policy', csp);
    return supabaseResponse;
  }

  if (isLocaleRedirect) {
    intlResponse.headers.set('Content-Security-Policy', csp);
    supabaseResponse.cookies.getAll().forEach((c) => intlResponse.cookies.set(c));
    return intlResponse;
  }

  // Pass-through case: build the final response with the overridden request
  // headers so downstream pages see x-nonce / x-user-country.
  const finalResponse = NextResponse.next({ request: { headers: requestHeaders } });
  finalResponse.headers.set('Content-Security-Policy', csp);

  // Forward any non-internal headers next-intl set (Vary, link/hreflang, …).
  intlResponse.headers.forEach((value, key) => {
    if (key.startsWith('x-middleware-')) return;
    if (key === 'content-security-policy') return;
    if (finalResponse.headers.has(key)) return;
    finalResponse.headers.set(key, value);
  });

  // Carry over locale + auth cookies. Auth cookies must keep their full
  // ResponseCookie options (httpOnly/secure/sameSite/maxAge/path) — passing
  // only name+value drops every flag and downgrades cookie security.
  intlResponse.cookies.getAll().forEach((c) => finalResponse.cookies.set(c));
  supabaseResponse.cookies.getAll().forEach((c) => finalResponse.cookies.set(c));

  return finalResponse;
}

export const config = {
  matcher: [
    '/((?!api|ffmpeg|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|avif|webm|wasm|js)$).*)'
  ],
};
