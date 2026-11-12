import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getPublicEventBySlug,
  type PublicEvent,
} from "@/utils/public-event";

import RsvpForm from "./rsvp-form";
import styles from "./public-event.module.css";

export const metadata: Metadata = {
  title: "Event invitation",
};

const eventDateFormatter = new Intl.DateTimeFormat("en", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "UTC",
  timeZoneName: "short",
});

function formatEventDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date and time unavailable"
    : eventDateFormatter.format(date);
}

export default async function PublicEventPage({
  params,
}: {
  params: Promise<{ publicSlug: string }>;
}) {
  const { publicSlug } = await params;
  const result = await getPublicEventBySlug(publicSlug);

  if (result.status === "not-found") {
    notFound();
  }

  if (result.status === "error") {
    return <UnavailablePage message={result.message} />;
  }

  return <EventInvite event={result.event} publicSlug={publicSlug} />;
}

function EventInvite({
  event,
  publicSlug,
}: {
  event: PublicEvent;
  publicSlug: string;
}) {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.brand}>
          <span className={styles.brandMark} aria-hidden="true">
            H
          </span>
          <span>HeadCount</span>
        </header>

        <article className={styles.card}>
          <div className={styles.eventDetails}>
            <p className={styles.eyebrow}>You’re invited</p>
            <h1>{event.title}</h1>

            <dl className={styles.detailsList}>
              <div>
                <dt>Date and time</dt>
                <dd>{formatEventDate(event.date)}</dd>
              </div>
              <div>
                <dt>Venue</dt>
                <dd>{event.venue}</dd>
              </div>
              <div>
                <dt>Capacity</dt>
                <dd>Up to {event.capacity} guests</dd>
              </div>
            </dl>

            {event.description && (
              <div className={styles.description}>
                <h2>About this event</h2>
                <p>{event.description}</p>
              </div>
            )}

            <p className={styles.privacyNotice}>
              Your name and contact details will be shared with this event’s host.
            </p>
          </div>

          <div className={styles.formPanel}>
            <h2>RSVP</h2>
            <p className={styles.formIntro}>Let the host know who is coming.</p>
            <RsvpForm publicSlug={publicSlug} />
          </div>
        </article>

        <p className={styles.footer}>A simple guest list, by HeadCount.</p>
      </div>
    </main>
  );
}

function UnavailablePage({ message }: { message: string }) {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.brand}>
          <span className={styles.brandMark} aria-hidden="true">
            H
          </span>
          <span>HeadCount</span>
        </header>
        <section className={styles.unavailable} role="status">
          <div className={styles.unavailableMark} aria-hidden="true">
            !
          </div>
          <h1>Event unavailable</h1>
          <p>{message}</p>
        </section>
      </div>
    </main>
  );
}
