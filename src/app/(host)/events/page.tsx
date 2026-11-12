import type { Metadata } from "next";
import Link from "next/link";

import { getMyEvents } from "@/app/actions/events";

import ShareEventLink from "./share-event-link";
import styles from "./events.module.css";

export const metadata: Metadata = {
  title: "My events",
};

const eventDateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
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
    ? "Date unavailable"
    : eventDateFormatter.format(date);
}

export default async function MyEventsPage() {
  const result = await getMyEvents();

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.topbar}>
          <Link className={styles.brand} href="/events" aria-label="HeadCount events">
            <span className={styles.brandMark} aria-hidden="true">
              H
            </span>
            <span>HeadCount</span>
          </Link>
        </header>

        <section className={styles.heading} aria-labelledby="page-title">
          <div>
            <p className={styles.eyebrow}>Your gatherings</p>
            <h1 id="page-title">My events</h1>
            <p className={styles.subtitle}>
              Keep your event details and guest lists in one place.
            </p>
          </div>
          <Link className={styles.createButton} href="/events/new">
            <span aria-hidden="true">+</span>
            Create event
          </Link>
        </section>

        {result.status === "error" ? (
          <div className={styles.errorState} role="alert">
            {result.message}
          </div>
        ) : result.events.length === 0 ? (
          <section className={styles.emptyState} aria-labelledby="empty-title">
            <div className={styles.emptyIcon} aria-hidden="true">
              <svg viewBox="0 0 48 48" fill="none">
                <rect x="7.5" y="11" width="33" height="29" rx="6" />
                <path d="M15 7.5v7M33 7.5v7M8 19h32M18 27h5M18 33h12" />
              </svg>
            </div>
            <h2 id="empty-title">Your events will show up here</h2>
            <p>
              Create your first event to start keeping track of who is coming.
            </p>
            <Link className={styles.createButton} href="/events/new">
              <span aria-hidden="true">+</span>
              Create your first event
            </Link>
          </section>
        ) : (
          <section className={styles.eventList} aria-label="Your events">
            {result.events.map((event) => (
              <article className={styles.eventCard} key={event.id}>
                <div className={styles.eventInfo}>
                  <div className={styles.eventDetails}>
                    <h2>{event.title}</h2>
                    <p className={styles.eventMeta}>
                      <span>{formatEventDate(event.event_date)}</span>
                      <span className={styles.separator} aria-hidden="true">
                        ·
                      </span>
                      <span>{event.venue}</span>
                    </p>
                    <div className={styles.capacityStats} aria-label="Guest capacity">
                      <p className={styles.capacity}>
                        Guests booked <strong>{event.bookedGuests} / {event.capacity}</strong>
                      </p>
                      <p className={styles.capacity}>
                        Spots left <strong>{event.spotsLeft}</strong>
                      </p>
                    </div>
                  </div>
                  <ShareEventLink publicSlug={event.public_slug} />
                </div>
                <nav className={styles.eventLinks} aria-label={`${event.title} actions`}>
                  <Link href={`/events/${event.id}/guests`}>Guest list</Link>
                  <Link href={`/events/${event.id}/edit`}>Edit event</Link>
                </nav>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
