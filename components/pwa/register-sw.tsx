"use client";

import { useEffect } from "react";

// Registers the service worker and repairs iOS's notorious
// standalone-mode scroll/URL-bar cache after a cold start.
function RegisterServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
        /* registration is non-critical */
      });
    }

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
        true;
    if (standalone) {
      document.documentElement.classList.add("is-standalone");
    }
  }, []);
  return null;
}

export default RegisterServiceWorker;
