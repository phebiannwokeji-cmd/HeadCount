import type { Metadata } from "next";

import EventForm from "../event-form";

export const metadata: Metadata = {
  title: "Create event",
};

export default function CreateEventPage() {
  return <EventForm mode="create" />;
}
