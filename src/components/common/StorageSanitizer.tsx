"use client";

import { useEffect } from "react";

/**
 * StorageSanitizer
 * Ensures any stale mock data previously cached in browser localStorage
 * from earlier demo versions is purged on first load.
 */
export default function StorageSanitizer() {
  useEffect(() => {
    try {
      const MIGRATION_KEY = "liftr_fresh_start_v2";
      if (!localStorage.getItem(MIGRATION_KEY)) {
        localStorage.removeItem("liftr-exercises-storage");
        localStorage.removeItem("liftr-plans-storage");
        localStorage.removeItem("liftr-history-storage");
        localStorage.removeItem("liftr-body-storage");
        localStorage.removeItem("liftr-workout-storage");
        localStorage.setItem(MIGRATION_KEY, "true");
      }
    } catch {
      // Storage access may be restricted in certain sandbox or private browsing contexts
    }
  }, []);

  return null;
}
