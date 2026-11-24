import { openDB, DBSchema, IDBPDatabase } from "idb";
import { WorkoutSessionItem } from "@/types";

interface LiftrDB extends DBSchema {
  active_workout: {
    key: string;
    value: WorkoutSessionItem;
  };
  sync_queue: {
    key: string;
    value: {
      id: string;
      userId: string;
      action: "create" | "update" | "delete";
      entityType: "workout" | "weight" | "measurement";
      payload: unknown;
      createdAt: string;
      idempotencyKey: string;
    };
  };
}

const DB_NAME = "liftr_offline_db";
const DB_VERSION = 2;

let dbPromise: Promise<IDBPDatabase<LiftrDB>> | null = null;

export function getDB() {
  if (typeof window === "undefined") return null;

  if (!dbPromise) {
    dbPromise = openDB<LiftrDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("active_workout")) {
          db.createObjectStore("active_workout");
        }
        if (!db.objectStoreNames.contains("sync_queue")) {
          db.createObjectStore("sync_queue", { keyPath: "id" });
        }
      },
    });
  }

  return dbPromise;
}

/**
 * Persists active workout locally to IndexedDB bound to its owner userId.
 */
export async function saveActiveWorkoutOffline(session: WorkoutSessionItem): Promise<void> {
  if (!session.userId) return;
  const db = await getDB();
  if (!db) return;
  await db.put("active_workout", session, "current");
}

/**
 * Loads active workout from IndexedDB only if it belongs to expectedUserId.
 */
export async function loadActiveWorkoutOffline(
  expectedUserId: string
): Promise<WorkoutSessionItem | undefined> {
  if (!expectedUserId) return undefined;
  const db = await getDB();
  if (!db) return undefined;
  const session = await db.get("active_workout", "current");
  if (session && session.userId !== expectedUserId) {
    await db.delete("active_workout", "current");
    return undefined;
  }
  return session;
}

/**
 * Clears active workout from IndexedDB upon finish.
 */
export async function clearActiveWorkoutOffline(): Promise<void> {
  const db = await getDB();
  if (!db) return;
  await db.delete("active_workout", "current");
}

/**
 * Enqueues a sync operation tagged with owner userId and idempotency key.
 */
export async function queueSyncOperation(operation: {
  userId: string;
  action: "create" | "update" | "delete";
  entityType: "workout" | "weight" | "measurement";
  payload: unknown;
  idempotencyKey: string;
}): Promise<void> {
  if (!operation.userId) return;
  const db = await getDB();
  if (!db) return;
  const id = crypto.randomUUID();
  await db.put("sync_queue", {
    id,
    ...operation,
    createdAt: new Date().toISOString(),
  });
}

/**
 * Clears all offline IndexedDB stores (used on sign-out or user switch).
 */
export async function clearAllOfflineData(): Promise<void> {
  try {
    const db = await getDB();
    if (!db) return;
    await db.clear("active_workout");
    await db.clear("sync_queue");
  } catch {
    // Ignore IndexedDB errors when restricted in private/sandbox contexts
  }
}

export function getActiveClientUserId(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem("liftr_session_owner_uid") || "";
  } catch {
    return "";
  }
}
