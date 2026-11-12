"use client";

import { useState, type FormEvent } from "react";

import styles from "./public-event.module.css";

type RsvpResponse = {
  status?: string;
  message?: string;
};

type Feedback = {
  kind: "success" | "error";
  message: string;
};

export default function RsvpForm({ publicSlug }: { publicSlug: string }) {
  const [guestName, setGuestName] = useState("");
  const [contact, setContact] = useState("");
  const [partySize, setPartySize] = useState("");
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  async function submitRsvp(formData: FormData) {
    setPending(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicSlug,
          guestName: String(formData.get("guestName") ?? "").trim(),
          contact: String(formData.get("contact") ?? "").trim(),
          partySize: Number(formData.get("partySize")),
        }),
      });

      const result = (await response.json()) as RsvpResponse;
      const message = result.message ?? "Your RSVP was not saved. Try again.";

      if (response.ok && result.status === "success") {
        setFeedback({ kind: "success", message });
        setSubmitted(true);
        setGuestName("");
        setContact("");
        setPartySize("");
        return;
      }

      setFeedback({ kind: "error", message });
    } catch {
      setFeedback({
        kind: "error",
        message: "Your RSVP was not saved. Try again.",
      });
    } finally {
      setPending(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || submitted) {
      return;
    }

    const form = event.currentTarget;
    if (!form.reportValidity()) {
      return;
    }

    void submitRsvp(new FormData(form));
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label className={styles.field} htmlFor="guest-name">
        <span>Your name</span>
        <input
          id="guest-name"
          name="guestName"
          type="text"
          autoComplete="name"
          placeholder="Enter your name"
          value={guestName}
          onChange={(change) => setGuestName(change.target.value)}
          required
          disabled={pending || submitted}
        />
      </label>

      <label className={styles.field} htmlFor="guest-contact">
        <span>Contact</span>
        <input
          id="guest-contact"
          name="contact"
          type="text"
          autoComplete="off"
          placeholder="Phone or email"
          value={contact}
          onChange={(change) => setContact(change.target.value)}
          required
          disabled={pending || submitted}
        />
      </label>

      <label className={styles.field} htmlFor="party-size">
        <span>Number of guests</span>
        <input
          id="party-size"
          name="partySize"
          type="number"
          inputMode="numeric"
          min="1"
          max="10"
          step="1"
          placeholder="Including you"
          value={partySize}
          onChange={(change) => setPartySize(change.target.value)}
          required
          disabled={pending || submitted}
        />
      </label>

      <div className={styles.feedback} aria-live="polite" aria-atomic="true">
        {feedback && (
          <p
            className={
              feedback.kind === "success"
                ? styles.successMessage
                : styles.errorMessage
            }
            role={feedback.kind === "success" ? "status" : "alert"}
          >
            {feedback.message}
          </p>
        )}
      </div>

      <button
        className={styles.submitButton}
        type="submit"
        disabled={pending || submitted}
      >
        {pending ? "Sending RSVP…" : submitted ? "RSVP saved" : "RSVP"}
      </button>
    </form>
  );
}
