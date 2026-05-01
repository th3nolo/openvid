import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  // Pin the redirect origin to a server-configured value. Building it from
  // the Host / X-Forwarded-Host header lets a caller behind an untrusted
  // proxy (or any deployment without one) point the OAuth redirect at an
  // attacker-controlled domain after the code exchange completes.
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Error exchanging code for session:", error);
      return NextResponse.redirect(`${origin}/login?error=auth_failed`);
    }
  }

  return NextResponse.redirect(`${origin}/editor`);
}