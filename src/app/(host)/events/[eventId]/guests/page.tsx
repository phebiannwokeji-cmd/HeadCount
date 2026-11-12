import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getEventGuestList } from "@/app/actions/guest-list";

import GuestListScreen from "./guest-list-screen";
import styles from "./guest-list.module.css";

export const metadata: Metadata = {
  title: "Guest list",
};

export default async function GuestListPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const result = await getEventGuestList(eventId);

  if (result.status === "not-found") {
    notFound();
  }

  if (result.status === "error") {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.errorState} role="alert">
            <p>{result.message}</p>
            <Link href="/events">Back to My events</Link>
          </div>
        </div>
      </main>
    );
  }

  const guests = result.rsvps.map(
    ({ id, guest_name, contact, party_size, checked_in }) => ({
      id,
      guest_name,
      contact,
      party_size,
      checked_in,
    }),
  );

  return (
    <GuestListScreen
      eventId={eventId}
      guests={guests}
      totalGuests={result.totals.totalGuests}
    />
  );
}
