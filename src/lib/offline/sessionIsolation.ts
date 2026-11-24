import { useBodyStore } from "@/stores/useBodyStore";
import { useExerciseStore } from "@/stores/useExerciseStore";
import { useHistoryStore } from "@/stores/useHistoryStore";
import { usePlanStore } from "@/stores/usePlanStore";
import { useWorkoutStore } from "@/stores/useWorkoutStore";
import { clearAllOfflineData } from "@/lib/offline/db";

const OWNER_UID_KEY = "liftr_session_owner_uid";

const PERSISTED_STORE_KEYS = [
  "liftr-body-storage",
  "liftr-exercises-storage",
  "liftr-history-storage",
  "liftr-plans-storage",
  "liftr-workout-storage",
];

/**
 * Returns the authenticated owner userId persisted for the current browser session.
 */
export function getActiveClientUserId(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(OWNER_UID_KEY) || "";
  } catch {
    return "";
  }
}

/**
 * Purges all in-memory Zustand state, localStorage caches, and IndexedDB stores.
 */
export function clearAllUserBrowserData(): void {
  if (typeof window === "undefined") return;

  try {
    useWorkoutStore.setState({
      activeSession: null,
      syncStatus: "synced",
      elapsedSeconds: 0,
      restTimer: {
        remainingSeconds: 0,
        totalSeconds: 0,
        isRunning: false,
      },
    });
    useHistoryStore.setState({
      sessions: [],
      personalRecords: [],
    });
    usePlanStore.setState({
      plans: [],
    });
    useExerciseStore.setState({
      exercises: [],
    });
    useBodyStore.setState({
      userBodyProfile: {
        id: "profile-default",
        userId: "",
        height: null,
        heightUnit: "cm",
        startingWeight: null,
        targetWeight: null,
        targetDate: null,
        goalType: "maintenance",
      },
      weightLogs: [],
      bodyMeasurements: [],
    });
  } catch {
    // Ignore store reset errors
  }

  try {
    PERSISTED_STORE_KEYS.forEach((key) => localStorage.removeItem(key));
    localStorage.removeItem(OWNER_UID_KEY);
  } catch {
    // Ignore storage access errors
  }

  void clearAllOfflineData();
}

/**
 * Verifies localStorage/IndexedDB ownership matches the authenticated Supabase userId.
 * If another user (or an unowned pre-migration store) was cached, wipes all client data first.
 */
export function reconcileClientSessionOwner(activeUserId: string | null | undefined): void {
  if (typeof window === "undefined") return;

  if (!activeUserId) {
    clearAllUserBrowserData();
    return;
  }

  try {
    const storedUid = localStorage.getItem(OWNER_UID_KEY);
    if (storedUid !== activeUserId) {
      clearAllUserBrowserData();
      localStorage.setItem(OWNER_UID_KEY, activeUserId);
    }
  } catch {
    // Ignore storage errors
  }
}
