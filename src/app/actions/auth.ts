"use server";

import { createClient } from "@/utils/supabase/server";
import { requireHost } from "@/utils/supabase/require-host";
import { redirect } from "next/navigation";

export type AuthActionResult = {
  status: "success" | "notice" | "error";
  message: string;
};

type Credentials = {
  email: string;
  password: string;
};

function confirmationCallbackUrl() {
  const appUrl = process.env.APP_URL || "http://localhost:3000";
  return new URL("/auth/confirm", appUrl).toString();
}

function passwordRecoveryCallbackUrl() {
  const appUrl = process.env.APP_URL || "http://localhost:3000";
  return new URL("/auth/recover", appUrl).toString();
}

type CredentialsResult =
  | { valid: true; credentials: Credentials }
  | { valid: false; result: AuthActionResult };

function readCredentials(formData: FormData): CredentialsResult {
  const emailValue = formData.get("email");
  const passwordValue = formData.get("password");

  if (typeof emailValue !== "string" || emailValue.trim() === "") {
    return {
      valid: false,
      result: { status: "error", message: "Enter your email address." },
    };
  }

  const email = emailValue.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    return {
      valid: false,
      result: { status: "error", message: "Enter a valid email address." },
    };
  }

  if (
    typeof passwordValue !== "string" ||
    passwordValue.length === 0 ||
    passwordValue.trim() === ""
  ) {
    return {
      valid: false,
      result: { status: "error", message: "Enter your password." },
    };
  }

  return {
    valid: true,
    credentials: { email, password: passwordValue },
  };
}

function readEmail(formData: FormData):
  | { valid: true; email: string }
  | { valid: false; result: AuthActionResult } {
  const emailValue = formData.get("email");

  if (typeof emailValue !== "string" || emailValue.trim() === "") {
    return {
      valid: false,
      result: { status: "error", message: "Enter your email address." },
    };
  }

  const email = emailValue.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    return {
      valid: false,
      result: { status: "error", message: "Enter a valid email address." },
    };
  }

  return { valid: true, email };
}

function safeAuthError(
  error: { status?: number },
  fallbackMessage: string,
): AuthActionResult {
  if (error.status === 429) {
    return {
      status: "error",
      message: "Too many attempts. Wait a moment and try again.",
    };
  }

  return { status: "error", message: fallbackMessage };
}

export async function signUp(
  formData: FormData,
): Promise<AuthActionResult> {
  const parsed = readCredentials(formData);

  if (!parsed.valid) {
    return parsed.result;
  }

  let hasSession = false;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      ...parsed.credentials,
      options: { emailRedirectTo: confirmationCallbackUrl() },
    });

    if (error) {
      return safeAuthError(
        error,
        "Unable to sign up with those details. If you already have an account, try signing in.",
      );
    }

    if (!data.session) {
      return {
        status: "notice",
        message:
          "If signup can be completed for this address, check your email for a confirmation link. If it expires, switch to Log in and request a new one.",
      };
    }

    hasSession = true;
  } catch {
    return {
      status: "error",
      message: "Unable to sign up right now. Try again later.",
    };
  }

  if (hasSession) {
    redirect("/events");
  }

  return { status: "success", message: "Account created." };
}

export async function resendSignupConfirmation(
  _previousResult: AuthActionResult,
  formData: FormData,
): Promise<AuthActionResult> {
  const parsed = readEmail(formData);

  if (!parsed.valid) {
    return parsed.result;
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: parsed.email,
      options: { emailRedirectTo: confirmationCallbackUrl() },
    });

    if (error) {
      if (error.status === 429) {
        return safeAuthError(error, "Unable to resend confirmation email.");
      }

      // Keep the response neutral so it does not disclose account status.
      return {
        status: "notice",
        message:
          "If this address has a pending signup, a fresh confirmation link will arrive. Check your inbox and spam folder.",
      };
    }

    return {
      status: "notice",
      message:
        "If this address has a pending signup, a fresh confirmation link will arrive. Check your inbox and spam folder.",
    };
  } catch {
    return {
      status: "error",
      message: "Unable to resend confirmation email right now. Try again later.",
    };
  }
}

export async function requestPasswordReset(
  _previousResult: AuthActionResult,
  formData: FormData,
): Promise<AuthActionResult> {
  const parsed = readEmail(formData);

  if (!parsed.valid) {
    return parsed.result;
  }

  const neutralMessage =
    "If an account exists for this email, password reset instructions will arrive shortly. Check your inbox and spam folder.";

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.email, {
      redirectTo: passwordRecoveryCallbackUrl(),
    });

    if (error?.status === 429) {
      return safeAuthError(error, "Unable to request a password reset.");
    }

    if (error) {
      return {
        status: "error",
        message: "Unable to send reset instructions right now. Try again later.",
      };
    }

    // Keep the response neutral so it does not disclose account status.
    return { status: "notice", message: neutralMessage };
  } catch {
    return {
      status: "error",
      message: "Unable to request a password reset right now. Try again later.",
    };
  }
}

export async function updatePassword(
  _previousResult: AuthActionResult,
  formData: FormData,
): Promise<AuthActionResult> {
  const passwordValue = formData.get("password");
  const confirmPasswordValue = formData.get("confirmPassword");

  if (
    typeof passwordValue !== "string" ||
    passwordValue.trim() === "" ||
    typeof confirmPasswordValue !== "string" ||
    confirmPasswordValue.trim() === ""
  ) {
    return { status: "error", message: "Enter and confirm your new password." };
  }

  if (passwordValue !== confirmPasswordValue) {
    return { status: "error", message: "The passwords do not match." };
  }

  try {
    const supabase = await createClient();
    const { data, error: userError } = await supabase.auth.getUser();

    if (userError || !data.user) {
      return {
        status: "error",
        message: "Your reset link has expired. Request a new password reset email.",
      };
    }

    const { error } = await supabase.auth.updateUser({ password: passwordValue });

    if (error) {
      return safeAuthError(
        error,
        "Unable to update the password. Choose a password that meets the project requirements and try again.",
      );
    }

    return { status: "success", message: "Your password has been updated." };
  } catch {
    return {
      status: "error",
      message: "Unable to update the password right now. Try again later.",
    };
  }
}

export async function signIn(
  formData: FormData,
): Promise<AuthActionResult> {
  const parsed = readCredentials(formData);

  if (!parsed.valid) {
    return parsed.result;
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword(
      parsed.credentials,
    );

    if (error) {
      return safeAuthError(
        error,
        "Unable to sign in with those details. Check them and try again.",
      );
    }

  } catch {
    return {
      status: "error",
      message: "Unable to sign in right now. Try again later.",
    };
  }

  redirect("/events");
}

export async function signOut(): Promise<AuthActionResult> {
  await requireHost();

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return safeAuthError(error, "Unable to sign out. Try again.");
    }

    return { status: "success", message: "Signed out." };
  } catch {
    return {
      status: "error",
      message: "Unable to sign out right now. Try again later.",
    };
  }
}
