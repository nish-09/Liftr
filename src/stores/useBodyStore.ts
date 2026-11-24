import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  WeightLogItem,
  BodyMeasurementItem,
  UserBodyProfile,
  WeightUnit,
  MeasurementUnit,
} from "@/types";

const INITIAL_BODY_PROFILE: UserBodyProfile = {
  id: "profile-1",
  userId: "local-user",
  height: 180, // cm
  heightUnit: "cm",
  startingWeight: 78.5,
  targetWeight: 85.0,
  targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  goalType: "gain",
};

const INITIAL_WEIGHT_LOGS: WeightLogItem[] = [
  {
    id: "wl-1",
    userId: "local-user",
    weight: 78.5,
    unit: "kg",
    recordedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    notes: "Starting weight for lean bulk phase.",
  },
  {
    id: "wl-2",
    userId: "local-user",
    weight: 78.9,
    unit: "kg",
    recordedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    notes: "Post-workout morning weigh-in.",
  },
  {
    id: "wl-3",
    userId: "local-user",
    weight: 79.4,
    unit: "kg",
    recordedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    notes: "Surplus holding steady at 300 kcal.",
  },
  {
    id: "wl-4",
    userId: "local-user",
    weight: 79.8,
    unit: "kg",
    recordedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    notes: "Good recovery and fullness.",
  },
  {
    id: "wl-5",
    userId: "local-user",
    weight: 80.2,
    unit: "kg",
    recordedAt: new Date().toISOString().split("T")[0],
    notes: "Current weight checkpoint.",
  },
];

const INITIAL_MEASUREMENTS: BodyMeasurementItem[] = [
  {
    id: "bm-1",
    userId: "local-user",
    measurementType: "chest",
    value: 104,
    unit: "cm",
    recordedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    notes: "Relaxed at nipple line.",
  },
  {
    id: "bm-2",
    userId: "local-user",
    measurementType: "chest",
    value: 106,
    unit: "cm",
    recordedAt: new Date().toISOString().split("T")[0],
    notes: "+2 cm gain over 4 weeks.",
  },
  {
    id: "bm-3",
    userId: "local-user",
    measurementType: "left_arm",
    value: 38.5,
    unit: "cm",
    recordedAt: new Date().toISOString().split("T")[0],
    notes: "Flexed peak.",
  },
  {
    id: "bm-4",
    userId: "local-user",
    measurementType: "right_arm",
    value: 39.0,
    unit: "cm",
    recordedAt: new Date().toISOString().split("T")[0],
    notes: "Flexed peak.",
  },
  {
    id: "bm-5",
    userId: "local-user",
    measurementType: "waist",
    value: 82.0,
    unit: "cm",
    recordedAt: new Date().toISOString().split("T")[0],
    notes: "Fasting morning, navel level.",
  },
  {
    id: "bm-6",
    userId: "local-user",
    measurementType: "left_thigh",
    value: 61.5,
    unit: "cm",
    recordedAt: new Date().toISOString().split("T")[0],
  },
  {
    id: "bm-7",
    userId: "local-user",
    measurementType: "right_thigh",
    value: 61.5,
    unit: "cm",
    recordedAt: new Date().toISOString().split("T")[0],
  },
];

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
      userBodyProfile: INITIAL_BODY_PROFILE,
      weightLogs: INITIAL_WEIGHT_LOGS,
      bodyMeasurements: INITIAL_MEASUREMENTS,

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
        return userBodyProfile.startingWeight || 75.0;
      },
    }),
    {
      name: "liftr-body-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
