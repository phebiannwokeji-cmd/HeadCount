import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HeadCount",
  description: "Collect RSVPs from a single link so you know who is coming.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

