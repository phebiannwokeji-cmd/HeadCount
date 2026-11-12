"use client";

import { useEffect, useState } from "react";

import styles from "./share-event-link.module.css";

export default function ShareEventLink({
  publicSlug,
}: {
  publicSlug: string;
}) {
  const [copyMessage, setCopyMessage] = useState("");
  const [origin, setOrigin] = useState("");
  const invitePath = `/invite/${publicSlug}`;
  const inviteUrl = origin ? new URL(invitePath, origin).toString() : invitePath;

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  async function copyInviteLink() {
    try {
      await navigator.clipboard.writeText(
        new URL(invitePath, window.location.origin).toString(),
      );
      setCopyMessage("Invite link copied.");
    } catch {
      setCopyMessage("Copy failed. Select and copy the link above.");
    }
  }

  return (
    <div className={styles.shareBox}>
      <span className={styles.label}>Public invite link</span>
      <div className={styles.shareRow}>
        <a
          className={styles.url}
          href={invitePath}
          target="_blank"
          rel="noreferrer"
          aria-label="Open public event invite page"
        >
          {inviteUrl}
        </a>
        <button className={styles.copyButton} type="button" onClick={copyInviteLink}>
          Copy link
        </button>
      </div>
      <span className={styles.status} role="status" aria-live="polite">
        {copyMessage}
      </span>
    </div>
  );
}
