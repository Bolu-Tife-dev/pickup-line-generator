"use client";

import { useEffect, useState } from "react";

// Root error boundary. After a deploy, a phone can still be holding a stale
// service-worker shell or old chunk hashes — that class of client exception
// fixes itself with a reload, so do it automatically. Bounded: at most 3
// auto-reloads per 10-minute window (counted in sessionStorage), then the
// manual buttons take over so a persistent error can't cause a reload loop.
const RELOAD_KEY = "plg-auto-reloads";
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 3;

function recentAttempts(): number[] {
  try {
    const parsed: unknown = JSON.parse(sessionStorage.getItem(RELOAD_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    const now = Date.now();
    return parsed.filter((t): t is number => typeof t === "number" && now - t < WINDOW_MS);
  } catch {
    return [];
  }
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [exhausted, setExhausted] = useState(false);

  useEffect(() => {
    try {
      const attempts = recentAttempts();
      if (attempts.length >= MAX_ATTEMPTS) {
        setExhausted(true);
        return;
      }
      attempts.push(Date.now());
      sessionStorage.setItem(RELOAD_KEY, JSON.stringify(attempts));
      // Increasing delay: 1.5s, 3s, 4.5s — gives a flaky network time to recover
      const timer = setTimeout(
        () => window.location.reload(),
        1500 * attempts.length,
      );
      return () => clearTimeout(timer);
    } catch {
      /* storage can be blocked in private mode — fall back to manual buttons */
      setExhausted(true);
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
            {exhausted ? "Something went wrong" : "One sec — fixing things…"}
          </h1>
          <p style={{ fontSize: "15px", opacity: 0.85 }}>
            {exhausted
              ? "The app couldn’t recover on its own. Tap Reload below, or come back in a minute."
              : "The app hit a snag and is reloading itself. If it doesn’t come back, tap below."}
          </p>
          <button
            onClick={() => {
              try {
                sessionStorage.removeItem(RELOAD_KEY);
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
