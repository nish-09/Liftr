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
      action: "create" | "update" | "delete";
      entityType: "workout" | "weight" | "measurement";
      payload: unknown;
      createdAt: string;
      idempotencyKey: string;
    };
  };
}

const DB_NAME = "liftr_offline_db";
const DB_VERSION = 1;

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
 * Persists active workout locally to IndexedDB for instant offline survival
 */
export async function saveActiveWorkoutOffline(session: WorkoutSessionItem): Promise<void> {
  const db = await getDB();
  if (!db) return;
  await db.put("active_workout", session, "current");
}

/**
 * Loads active workout from IndexedDB if browser closed unexpectedly
 */
export async function loadActiveWorkoutOffline(): Promise<WorkoutSessionItem | undefined> {
  const db = await getDB();
  if (!db) return undefined;
  return await db.get("active_workout", "current");
}

/**
 * Clears active workout from IndexedDB upon finish
 */
export async function clearActiveWorkoutOffline(): Promise<void> {
  const db = await getDB();
  if (!db) return;
  await db.delete("active_workout", "current");
}

/**
 * Enqueues a sync operation with idempotency key
 */
export async function queueSyncOperation(operation: {
  action: "create" | "update" | "delete";
  entityType: "workout" | "weight" | "measurement";
  payload: unknown;
  idempotencyKey: string;
}): Promise<void> {
  const db = await getDB();
  if (!db) return;
  const id = crypto.randomUUID();
  await db.put("sync_queue", {
    id,
    ...operation,
    createdAt: new Date().toISOString(),
  });
}
