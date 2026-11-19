"use client";

export default function GlobalError({ reset }) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "1rem",
          background: "#fbf9f4",
          color: "#2a1f22",
        }}
      >
        <h1 style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>
          Something went wrong
        </h1>
        <p style={{ marginBottom: "1.5rem", color: "#6b5b5f" }}>
          Please try again in a moment.
        </p>
        <button
          onClick={() => reset()}
          style={{
            background: "#b0405c",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "0.6rem 1.25rem",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}

