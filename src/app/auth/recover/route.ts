import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");

  if (!code && (!tokenHash || type !== "recovery")) {
    return recoveryFailure(request);
  }

  try {
    const supabase = await createClient();
    const { error } = code
      ? await supabase.auth.exchangeCodeForSession(code)
      : await supabase.auth.verifyOtp({
          token_hash: tokenHash!,
          type: "recovery",
        });

    if (error) {
      return recoveryFailure(request);
    }

    return NextResponse.redirect(new URL("/reset-password", request.url));
  } catch {
    return recoveryFailure(request);
  }
}

function recoveryFailure(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("reset", "invalid");
  return NextResponse.redirect(loginUrl);
}
