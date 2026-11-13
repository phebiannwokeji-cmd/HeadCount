"use client";

import { useActionState, useCallback, useEffect, useState } from "react";

import {
  requestPasswordReset,
  resendSignupConfirmation,
  signIn,
  signUp,
  type AuthActionResult,
} from "@/app/actions/auth";

import styles from "./auth-screen.module.css";

type AuthMode = "signup" | "login" | "recovery";

const INITIAL_RESULT: AuthActionResult = { status: "error", message: "" };

export default function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>("signup");
  const [confirmationMessage, setConfirmationMessage] = useState("");

  useEffect(() => {
    const currentUrl = new URL(window.location.href);
    const hashParams = new URLSearchParams(currentUrl.hash.slice(1));
    const callbackError =
      hashParams.get("error_code") || hashParams.get("error");
    const confirmationResult = currentUrl.searchParams.get("confirmation");
    const resetResult = currentUrl.searchParams.get("reset");

    if (callbackError || confirmationResult || resetResult) {
      setMode("login");
      setConfirmationMessage(
        resetResult
          ? "That password reset link is invalid or expired. Request a new one below."
          : "That confirmation link is invalid or expired. Enter your email and request a fresh link below.",
      );
      window.history.replaceState({}, document.title, currentUrl.pathname);
    }
  }, []);

  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <header className={styles.brand} aria-label="HeadCount home">
          <span className={styles.brandMark} aria-hidden="true">
            H
          </span>
          <span>HeadCount</span>
        </header>

        <AuthPanel
          key={mode}
          mode={mode}
          onModeChange={setMode}
          confirmationMessage={confirmationMessage}
        />

        <p className={styles.footer}>One link. A clearer guest list.</p>
      </div>
    </main>
  );
}

function AuthPanel({
  mode,
  onModeChange,
  confirmationMessage,
}: {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  confirmationMessage: string;
}) {
  const action = useCallback(
    async (_previousResult: AuthActionResult, formData: FormData) =>
      mode === "signup"
        ? signUp(formData)
        : mode === "recovery"
          ? requestPasswordReset(_previousResult, formData)
          : signIn(formData),
    [mode],
  );
  const [result, formAction, isPending] = useActionState(
    action,
    INITIAL_RESULT,
  );
  const [resendResult, resendFormAction, isResending] = useActionState(
    resendSignupConfirmation,
    INITIAL_RESULT,
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const isSignup = mode === "signup";
  const isRecovery = mode === "recovery";

  useEffect(() => {
    if (!isPending && result.status !== "error" && result.message) {
      setPassword("");
    }
  }, [isPending, result]);

  return (
    <section className={styles.card} aria-labelledby="auth-title">
      <div className={styles.intro}>
        <p className={styles.eyebrow}>Welcome to HeadCount</p>
        <h1 id="auth-title">
          {isSignup
            ? "Bring your guest list together."
            : isRecovery
              ? "Reset your password."
              : "Welcome back."}
        </h1>
        <p className={styles.description}>
          {isSignup
            ? "Create an account to plan your event and keep track of who is coming."
            : isRecovery
              ? "We’ll send a link to the email address on your account."
              : "Sign in to get back to your events and guest lists."}
        </p>
      </div>

      {isRecovery ? (
        <button
          className={styles.textButton}
          type="button"
          onClick={() => onModeChange("login")}
          disabled={isPending}
        >
          Back to log in
        </button>
      ) : (
        <div className={styles.modeSwitch} aria-label="Choose an account action">
          <button
            className={isSignup ? styles.selectedMode : styles.modeButton}
            type="button"
            aria-pressed={isSignup}
            onClick={() => onModeChange("signup")}
            disabled={isPending}
          >
            Sign up
          </button>
          <button
            className={!isSignup ? styles.selectedMode : styles.modeButton}
            type="button"
            aria-pressed={!isSignup}
            onClick={() => onModeChange("login")}
            disabled={isPending}
          >
            Log in
          </button>
        </div>
      )}

      <form className={styles.form} action={formAction}>
        {confirmationMessage ? (
          <p className={styles.noticeMessage} role="status">
            {confirmationMessage}
          </p>
        ) : null}

        <label className={styles.field} htmlFor="email">
          <span>Email address</span>
          <input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="you@example.com"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isPending}
          />
        </label>

        {!isRecovery ? (
          <>
            <label className={styles.field} htmlFor="password">
              <span>Password</span>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isSignup ? "new-password" : "current-password"}
                placeholder="Enter your password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={isPending}
              />
            </label>
            {!isSignup ? (
              <button
                className={styles.textButton}
                type="button"
                onClick={() => onModeChange("recovery")}
                disabled={isPending}
              >
                Forgot password?
              </button>
            ) : null}
          </>
        ) : null}

        <div className={styles.feedback} aria-live="polite" aria-atomic="true">
          {isPending ? (
            <p className={styles.pendingMessage} role="status">
              {isSignup
                ? "Creating your account…"
                : isRecovery
                  ? "Sending reset link…"
                  : "Signing you in…"}
            </p>
          ) : result.message ? (
            <p
              className={
                result.status === "error"
                  ? styles.errorMessage
                  : styles.successMessage
              }
              role={result.status === "error" ? "alert" : "status"}
            >
              {result.message}
            </p>
          ) : null}
        </div>

        <button
          className={styles.submitButton}
          type="submit"
          disabled={isPending}
        >
          {isPending
            ? isSignup
              ? "Creating account…"
              : isRecovery
                ? "Sending reset link…"
                : "Signing in…"
            : isSignup
              ? "Create account"
              : isRecovery
                ? "Send reset link"
                : "Log in"}
        </button>

        {mode === "login" ? (
          <>
            {resendResult.message ? (
              <p
                className={
                  resendResult.status === "error"
                    ? styles.errorMessage
                    : styles.successMessage
                }
                role={resendResult.status === "error" ? "alert" : "status"}
                aria-live="polite"
              >
                {resendResult.message}
              </p>
            ) : null}
            <button
              className={styles.secondaryButton}
              type="submit"
              formAction={resendFormAction}
              formNoValidate
              disabled={isPending || isResending}
            >
              {isResending
                ? "Sending confirmation link…"
                : "Resend confirmation email"}
            </button>
          </>
        ) : null}
      </form>
    </section>
  );
}
