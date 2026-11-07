"use client";

import { useEffect } from "react";

// Root error boundary. After a deploy, a phone can still be holding a stale
// service-worker shell or old chunk hashes — that class of client exception
// fixes itself with ONE reload, so do it automatically (once per tab) and
// keep a manual button for anything else.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    try {
      if (sessionStorage.getItem("plg-auto-reload") !== "1") {
        sessionStorage.setItem("plg-auto-reload", "1");
        const timer = setTimeout(() => window.location.reload(), 1500);
        return () => clearTimeout(timer);
      }
    } catch {
      /* storage can be blocked in private mode */
    }
  }, []);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
          background: "#FED8D8",
          color: "#A5455C",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <div>
          <h1 style={{ fontSize: "22px", marginBottom: "8px" }}>
            One sec — fixing things…
          </h1>
          <p style={{ fontSize: "15px", opacity: 0.85 }}>
            The app hit a snag and is reloading itself. If it doesn’t come
            back, tap below.
          </p>
          <button
            onClick={() => {
              try {
                sessionStorage.removeItem("plg-auto-reload");
              } catch {
                /* ignore */
              }
              window.location.reload();
            }}
            style={{
              marginTop: "16px",
              border: "none",
              borderRadius: "999px",
              background: "#FF2157",
              color: "#fff",
              fontSize: "16px",
              padding: "10px 24px",
              cursor: "pointer",
            }}
          >
            Reload
          </button>
          <div style={{ marginTop: 18, display: "flex", gap: 10, justifyContent: "center" }}>
            <button
              onClick={() => reset()}
              style={{
                border: "1px solid #A5455C",
                borderRadius: "999px",
                background: "transparent",
                color: "#A5455C",
                fontSize: "14px",
                padding: "8px 18px",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
