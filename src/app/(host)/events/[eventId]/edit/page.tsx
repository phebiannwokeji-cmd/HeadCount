import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getHostEventForEdit } from "@/app/actions/events";

import EventForm from "../../event-form";
import styles from "../../event-form.module.css";

export const metadata: Metadata = {
  title: "Edit event",
};

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const result = await getHostEventForEdit(eventId);

  if (result.status === "not-found") {
    notFound();
  }

  if (result.status === "error") {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.loadError} role="alert">
            <p>{result.message}</p>
            <Link href="/events">Back to My events</Link>
          </div>
        </div>
      </main>
    );
  }

  return <EventForm mode="edit" event={result.event} />;
}
