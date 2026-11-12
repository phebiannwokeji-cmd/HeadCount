export default function HomePage() {
  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        gap: "1rem",
        padding: "2rem",
      }}
    >
      <h1 style={{ fontSize: "2.5rem", fontWeight: 700 }}>HeadCount</h1>
      <p style={{ fontSize: "1.125rem", color: "#555" }}>
        Collect RSVPs from a single link so you know who is coming.
      </p>
    </main>
  );
}

