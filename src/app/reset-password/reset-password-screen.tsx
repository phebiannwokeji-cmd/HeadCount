"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";

import {
  updatePassword,
  type AuthActionResult,
} from "@/app/actions/auth";

import styles from "../login/auth-screen.module.css";

const INITIAL_RESULT: AuthActionResult = { status: "error", message: "" };

export default function ResetPasswordScreen() {
  const [result, formAction, isPending] = useActionState(
    updatePassword,
    INITIAL_RESULT,
  );
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (result.status === "success") {
      setPassword("");
      setConfirmPassword("");
    }
  }, [result]);

  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <header className={styles.brand} aria-label="HeadCount home">
          <span className={styles.brandMark} aria-hidden="true">
            H
          </span>
          <span>HeadCount</span>
        </header>

        <section className={styles.card} aria-labelledby="reset-title">
          <div className={styles.intro}>
            <p className={styles.eyebrow}>Account recovery</p>
            <h1 id="reset-title">Choose a new password.</h1>
            <p className={styles.description}>
              Set a new password for your HeadCount account.
            </p>
          </div>

          {result.status === "success" ? (
            <div className={styles.form}>
              <p className={styles.successMessage} role="status">
                {result.message}
              </p>
              <Link className={styles.submitButton} href="/events">
                Continue to your events
              </Link>
            </div>
          ) : (
            <form className={styles.form} action={formAction}>
              <label className={styles.field} htmlFor="new-password">
                <span>New password</span>
                <input
                  id="new-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Enter a new password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={isPending}
                />
              </label>

              <label className={styles.field} htmlFor="confirm-password">
                <span>Confirm new password</span>
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Enter the new password again"
                  required
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  disabled={isPending}
                />
              </label>

              <div className={styles.feedback} aria-live="polite" aria-atomic="true">
                {isPending ? (
                  <p className={styles.pendingMessage} role="status">
                    Updating your password…
                  </p>
                ) : result.message ? (
                  <p className={styles.errorMessage} role="alert">
                    {result.message}
                  </p>
                ) : null}
              </div>

              <button
                className={styles.submitButton}
                type="submit"
                disabled={isPending}
              >
                {isPending ? "Updating password…" : "Update password"}
              </button>

              <Link className={styles.textButton} href="/login">
                Back to log in
              </Link>
            </form>
          )}
        </section>

        <p className={styles.footer}>One link. A clearer guest list.</p>
      </div>
    </main>
  );
}
