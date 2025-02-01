"use client";

import { useEffect } from "react";
import ClientLayout from "./ClientLayout";
import { initPerformanceMonitoring } from "../lib/performance";

export function Providers({ children }) {
  useEffect(() => {
    // Initialize performance monitoring
    initPerformanceMonitoring();

    // Register service worker
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.debug("SW registered:", registration);
          })
          .catch((error) => {
            console.error("SW registration failed:", error);
          });
      });
    }

    // Preload common routes
    if (typeof window !== "undefined") {
      const commonRoutes = ["/", "/login", "/signup", "/settings"];
      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(() => {
          commonRoutes.forEach((route) => {
            const link = document.createElement("link");
            link.rel = "prefetch";
            link.href = route;
            document.head.appendChild(link);
          });
        });
      }
    }
  }, []);

  return <ClientLayout>{children}</ClientLayout>;
}
