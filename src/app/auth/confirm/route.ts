import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");

  if (!code && (!tokenHash || type !== "email")) {
    return confirmationFailure(request);
  }

  try {
    const supabase = await createClient();
    const { error } = code
      ? await supabase.auth.exchangeCodeForSession(code)
      : await supabase.auth.verifyOtp({
          token_hash: tokenHash!,
          type: "email",
        });

    if (error) {
      return confirmationFailure(request);
    }

    return NextResponse.redirect(new URL("/events", request.url));
  } catch {
    return confirmationFailure(request);
  }
}

function confirmationFailure(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("confirmation", "invalid");
  return NextResponse.redirect(loginUrl);
}
