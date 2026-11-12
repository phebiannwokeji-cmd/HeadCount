import styles from "./public-event.module.css";

export default function PublicEventNotFound() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.brand}>
          <span className={styles.brandMark} aria-hidden="true">
            H
          </span>
          <span>HeadCount</span>
        </header>
        <section className={styles.unavailable}>
          <div className={styles.unavailableMark} aria-hidden="true">
            !
          </div>
          <h1>Invite not found</h1>
          <p>This link was not found.</p>
        </section>
      </div>
    </main>
  );
}
