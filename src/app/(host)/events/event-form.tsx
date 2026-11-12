"use client";

import Link from "next/link";
import { useActionState, useCallback, useEffect, useState } from "react";

import {
  createEvent,
  editEvent,
  type EventActionResult,
  type EventForEdit,
} from "@/app/actions/events";

import styles from "./event-form.module.css";

type EventFormProps = {
  mode: "create" | "edit";
  event?: EventForEdit;
};

const INITIAL_RESULT: EventActionResult = { status: "error", message: "" };

function toLocalDateTimeValue(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function EventForm({ mode, event }: EventFormProps) {
  const isEdit = mode === "edit";
  const [title, setTitle] = useState(event?.title ?? "");
  const [eventDate, setEventDate] = useState("");
  const [venue, setVenue] = useState(event?.venue ?? "");
  const [capacity, setCapacity] = useState(
    event ? String(event.capacity) : "",
  );
  const [description, setDescription] = useState(event?.description ?? "");

  useEffect(() => {
    setEventDate(event ? toLocalDateTimeValue(event.event_date) : "");
  }, [event]);

  const action = useCallback(
    async (_previousResult: EventActionResult, formData: FormData) => {
      const dateValue = formData.get("event_date");
      if (typeof dateValue === "string" && dateValue.trim() !== "") {
        const parsedDate = new Date(dateValue);
        if (!Number.isNaN(parsedDate.getTime())) {
          formData.set("event_date", parsedDate.toISOString());
        }
      }

      if (isEdit && event) {
        formData.set("id", event.id);
        return editEvent(formData);
      }

      return createEvent(formData);
    },
    [event, isEdit],
  );
  const [result, formAction, isPending] = useActionState(
    action,
    INITIAL_RESULT,
  );

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.topbar}>
          <Link className={styles.brand} href="/events">
            <span className={styles.brandMark} aria-hidden="true">
              H
            </span>
            <span>HeadCount</span>
          </Link>
          <Link className={styles.backLink} href="/events">
            My events
          </Link>
        </header>

        <section className={styles.panel} aria-labelledby="form-title">
          <p className={styles.eyebrow}>{isEdit ? "Event details" : "New event"}</p>
          <h1 id="form-title">{isEdit ? "Edit event" : "Create an event"}</h1>
          <p className={styles.description}>
            {isEdit
              ? "Update the details guests will see on your invite."
              : "Add the details for the event you’re hosting."}
          </p>

          <form className={styles.form} action={formAction}>
            <label className={styles.field} htmlFor="event-title">
              <span>Event title</span>
              <input
                id="event-title"
                name="title"
                type="text"
                autoComplete="off"
                placeholder="e.g. Amara’s birthday party"
                value={title}
                onChange={(change) => setTitle(change.target.value)}
                required
                disabled={isPending}
              />
            </label>

            <label className={styles.field} htmlFor="event-date">
              <span>Date and time</span>
              <input
                id="event-date"
                name="event_date"
                type="datetime-local"
                value={eventDate}
                onChange={(change) => setEventDate(change.target.value)}
                required
                disabled={isPending}
              />
            </label>

            <label className={styles.field} htmlFor="event-venue">
              <span>Venue</span>
              <input
                id="event-venue"
                name="venue"
                type="text"
                autoComplete="street-address"
                placeholder="Where will it take place?"
                value={venue}
                onChange={(change) => setVenue(change.target.value)}
                required
                disabled={isPending}
              />
            </label>

            <label className={styles.field} htmlFor="event-capacity">
              <span>Capacity</span>
              <input
                id="event-capacity"
                name="capacity"
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                placeholder="Number of guests"
                value={capacity}
                onChange={(change) => setCapacity(change.target.value)}
                required
                disabled={isPending}
              />
              <span className={styles.fieldHint}>
                Count the maximum number of guests, not RSVPs.
              </span>
            </label>

            <label className={styles.field} htmlFor="event-description">
              <span>Description <span className={styles.optional}>(optional)</span></span>
              <textarea
                id="event-description"
                name="description"
                rows={4}
                placeholder="Share any useful details about the event."
                value={description}
                onChange={(change) => setDescription(change.target.value)}
                disabled={isPending}
              />
            </label>

            <div className={styles.feedback} aria-live="polite" aria-atomic="true">
              {isPending ? (
                <p className={styles.pendingMessage} role="status">
                  {isEdit ? "Saving event changes…" : "Creating your event…"}
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

            <div className={styles.actions}>
              <button className={styles.submitButton} type="submit" disabled={isPending}>
                {isPending
                  ? isEdit
                    ? "Saving…"
                    : "Creating…"
                  : isEdit
                    ? "Save changes"
                    : "Create event"}
              </button>
              <Link className={styles.cancelLink} href="/events">
                Cancel
              </Link>
            </div>

            {result.status === "success" && (
              <Link className={styles.successLink} href="/events">
                Back to My events
              </Link>
            )}
          </form>
        </section>
      </div>
    </main>
  );
}
