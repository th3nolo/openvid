import { updateSession } from "@/utils/supabase/middleware";
import { type NextRequest } from "next/server";
import createIntlMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  localeDetection: true
});

export default async function proxy(request: NextRequest) {
  const country = request.headers.get('x-vercel-ip-country') || 'UNKNOWN';

  const intlResponse = intlMiddleware(request);
  intlResponse.headers.set('x-user-country', country);

  const supabaseResponse = await updateSession(request);
  // Preserve full cookie options (httpOnly/secure/sameSite/maxAge/path) when
  // forwarding Supabase's auth cookies onto the next-intl response. Passing
  // only name/value drops every flag, which can downgrade `secure`, drop
  // `sameSite`, and turn the refresh-token cookie into a session cookie —
  // logging users out on browser close after any silent token refresh.
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie);
  });

  return intlResponse;
}

export const config = {
  matcher: [
    '/((?!api|ffmpeg|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|avif|webm|wasm|js)$).*)'
  ],
};