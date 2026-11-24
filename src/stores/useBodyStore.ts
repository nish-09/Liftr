import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  WeightLogItem,
  BodyMeasurementItem,
  UserBodyProfile,
  WeightUnit,
  MeasurementUnit,
} from "@/types";

const EMPTY_BODY_PROFILE: UserBodyProfile = {
  id: "profile-default",
  userId: "local-user",
  height: null,
  heightUnit: "cm",
  startingWeight: null,
  targetWeight: null,
  targetDate: null,
  goalType: "maintenance",
};

interface BodyStore {
  userBodyProfile: UserBodyProfile;
  weightLogs: WeightLogItem[];
  bodyMeasurements: BodyMeasurementItem[];

  updateBodyProfile: (updates: Partial<UserBodyProfile>) => void;
  logWeight: (
    weight: number,
    unit?: WeightUnit,
    recordedAt?: string,
    notes?: string,
    allowDuplicate?: boolean
  ) => { success: boolean; error?: string };
  updateWeightLog: (id: string, updates: Partial<WeightLogItem>) => void;
  deleteWeightLog: (id: string) => void;

  logMeasurement: (
    measurementType: BodyMeasurementItem["measurementType"],
    value: number,
    unit?: MeasurementUnit,
    recordedAt?: string,
    notes?: string,
    customName?: string
  ) => void;
  updateMeasurement: (id: string, updates: Partial<BodyMeasurementItem>) => void;
  deleteMeasurement: (id: string) => void;

  getLatestWeight: () => number;
}

export const useBodyStore = create<BodyStore>()(
  persist(
    (set, get) => ({
      userBodyProfile: EMPTY_BODY_PROFILE,
      weightLogs: [],
      bodyMeasurements: [],

      updateBodyProfile: (updates) => {
        set((state) => ({
          userBodyProfile: { ...state.userBodyProfile, ...updates },
        }));
      },

      logWeight: (weight, unit = "kg", recordedAt, notes, allowDuplicate = false) => {
        const dateStr = recordedAt || new Date().toISOString().split("T")[0];
        const { weightLogs } = get();

        // Prevent duplicate daily entries unless explicitly confirmed
        if (!allowDuplicate) {
          const existing = weightLogs.find((w) => w.recordedAt === dateStr);
          if (existing) {
            return {
              success: false,
              error: `A weight record for ${dateStr} already exists (${existing.weight} ${existing.unit}). Update or delete that record, or confirm replacement.`,
            };
          }
        }

        const newLog: WeightLogItem = {
          id: `wl-${crypto.randomUUID()}`,
          userId: "local-user",
          weight: Number(weight.toFixed(2)),
          unit,
          recordedAt: dateStr,
          notes: notes || "",
        };

        const updated = [newLog, ...weightLogs].sort(
          (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
        );

        set({ weightLogs: updated });
        return { success: true };
      },

      updateWeightLog: (id, updates) => {
        set((state) => ({
          weightLogs: state.weightLogs.map((w) => (w.id === id ? { ...w, ...updates } : w)),
        }));
      },

      deleteWeightLog: (id) => {
        set((state) => ({
          weightLogs: state.weightLogs.filter((w) => w.id !== id),
        }));
      },

      logMeasurement: (measurementType, value, unit = "cm", recordedAt, notes, customName) => {
        const dateStr = recordedAt || new Date().toISOString().split("T")[0];
        const newMeasurement: BodyMeasurementItem = {
          id: `bm-${crypto.randomUUID()}`,
          userId: "local-user",
          measurementType,
          value: Number(value.toFixed(2)),
          unit,
          recordedAt: dateStr,
          notes: notes || "",
          customName: customName || null,
        };

        set((state) => ({
          bodyMeasurements: [newMeasurement, ...state.bodyMeasurements].sort(
            (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
          ),
        }));
      },

      updateMeasurement: (id, updates) => {
        set((state) => ({
          bodyMeasurements: state.bodyMeasurements.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        }));
      },

      deleteMeasurement: (id) => {
        set((state) => ({
          bodyMeasurements: state.bodyMeasurements.filter((m) => m.id !== id),
        }));
      },

      getLatestWeight: () => {
        const { weightLogs, userBodyProfile } = get();
        if (weightLogs.length > 0) {
          return weightLogs[0].weight;
        }
        return userBodyProfile.startingWeight || 0;
      },
    }),
    {
      name: "liftr-body-storage",
      version: 2,
      migrate: () => ({
        userBodyProfile: EMPTY_BODY_PROFILE,
        weightLogs: [],
        bodyMeasurements: [],
      }),
      storage: createJSONStorage(() => localStorage),
    }
  )
);
