"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { setRsvpCheckedIn } from "@/app/actions/guest-list";

import styles from "./guest-list.module.css";

type GuestRowData = {
  id: string;
  guest_name: string;
  contact: string;
  party_size: number;
  checked_in: boolean;
};

export default function GuestListScreen({
  eventId,
  guests,
  totalGuests,
}: {
  eventId: string;
  guests: GuestRowData[];
  totalGuests: number;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredGuests = normalizedQuery
    ? guests.filter((guest) =>
        guest.guest_name.toLowerCase().includes(normalizedQuery),
      )
    : guests;

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.topbar}>
          <Link className={styles.brand} href="/events" aria-label="Back to My events">
            <span className={styles.brandMark} aria-hidden="true">
              H
            </span>
            <span>HeadCount</span>
          </Link>
          <Link className={styles.backLink} href="/events">
            My events
          </Link>
        </header>

        <section className={styles.heading} aria-labelledby="guest-list-title">
          <div>
            <p className={styles.eyebrow}>Event attendance</p>
            <h1 id="guest-list-title">Guest list</h1>
            <p className={styles.subtitle}>
              Mark each RSVP as guests arrive. One check-in covers the whole party.
            </p>
          </div>
        </section>

        <section className={styles.totalCard} aria-label="Total guest count">
          <span>Total guests</span>
          <strong>{totalGuests}</strong>
        </section>

        {guests.length > 0 ? (
          <section className={styles.searchPanel} aria-label="Search guest list">
            <label className={styles.searchLabel} htmlFor="guest-search">
              Search guests by name
            </label>
            <input
              className={styles.searchInput}
              id="guest-search"
              type="search"
              autoComplete="off"
              placeholder="Enter a guest name"
              value={searchQuery}
              onChange={(change) => setSearchQuery(change.target.value)}
            />
            <p className={styles.searchCount} aria-live="polite">
              Showing {filteredGuests.length} of {guests.length} RSVPs
            </p>
          </section>
        ) : null}

        {guests.length === 0 ? (
          <section className={styles.emptyState} aria-labelledby="empty-title">
            <div className={styles.emptyIcon} aria-hidden="true">
              <svg viewBox="0 0 48 48" fill="none">
                <circle cx="19" cy="16" r="6" />
                <path d="M7 37c0-6.6 5.4-12 12-12s12 5.4 12 12M33 17h9M37.5 12.5v9" />
              </svg>
            </div>
            <h2 id="empty-title">No guests have RSVPed yet</h2>
            <p>Your guest list will appear here when someone responds.</p>
          </section>
        ) : filteredGuests.length === 0 ? (
          <section className={styles.emptyState} aria-labelledby="no-results-title">
            <h2 id="no-results-title">No matching guests</h2>
            <p>Try another name or clear your search.</p>
            <button
              className={styles.clearSearchButton}
              type="button"
              onClick={() => setSearchQuery("")}
            >
              Clear search
            </button>
          </section>
        ) : (
          <ul className={styles.guestList} aria-label="Guests who have RSVPed">
            {filteredGuests.map((guest) => (
              <li key={guest.id}>
                <GuestRow eventId={eventId} guest={guest} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

function GuestRow({
  eventId,
  guest,
}: {
  eventId: string;
  guest: GuestRowData;
}) {
  const [checkedIn, setCheckedIn] = useState(guest.checked_in);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState("");

  function updateCheckIn(nextValue: boolean) {
    const previousValue = checkedIn;
    setCheckedIn(nextValue);
    setErrorMessage("");

    startTransition(async () => {
      const result = await setRsvpCheckedIn(eventId, guest.id, nextValue);

      if (result.status === "success") {
        setCheckedIn(result.rsvp.checked_in);
        return;
      }

      setCheckedIn(previousValue);
      setErrorMessage(
        result.status === "error"
          ? result.message
          : "This RSVP could not be found. Refresh the page and try again.",
      );
    });
  }

  return (
    <article className={styles.guestCard}>
      <div className={styles.guestDetails}>
        <h2>{guest.guest_name}</h2>
        <p>
          {guest.party_size} {guest.party_size === 1 ? "guest" : "guests"}
        </p>
        <p className={styles.guestContact}>
          <span>Contact</span> {guest.contact}
        </p>
      </div>

      <div className={styles.checkInArea}>
        <label
          className={`${styles.checkInControl} ${checkedIn ? styles.checked : ""}`}
        >
          <input
            type="checkbox"
            checked={checkedIn}
            onChange={(change) => updateCheckIn(change.target.checked)}
            disabled={isPending}
            aria-label={
              checkedIn
                ? `Mark ${guest.guest_name} as not checked in`
                : `Mark ${guest.guest_name} as checked in`
            }
          />
          <span>{checkedIn ? "Checked in" : "Not checked in"}</span>
        </label>
        <p
          className={errorMessage ? styles.rowError : styles.rowStatus}
          role={errorMessage ? "alert" : "status"}
          aria-live="polite"
          aria-atomic="true"
        >
          {errorMessage || (isPending ? "Saving check-in…" : "")}
        </p>
      </div>
    </article>
  );
}
