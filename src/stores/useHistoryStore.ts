import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { WorkoutSessionItem, PersonalRecordItem, SetLogItem } from "@/types";
import { calculate1RM, calculateVolume } from "@/lib/calculations/strength";

interface HistoryStore {
  sessions: WorkoutSessionItem[];
  personalRecords: PersonalRecordItem[];
  addCompletedSession: (session: WorkoutSessionItem) => { newPRs: PersonalRecordItem[] };
  updateHistoricalSession: (id: string, updates: Partial<WorkoutSessionItem>) => void;
  deleteHistoricalSession: (id: string) => void;
  getPreviousPerformance: (
    exerciseId: string,
    setNumber?: number,
    planDayId?: string | null
  ) => { previousWeight: number; previousReps: number } | null;
  recalculatePRs: () => void;
}

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set, get) => ({
      sessions: [],
      personalRecords: [],

      addCompletedSession: (newSession) => {
        const { sessions, personalRecords } = get();
        const updatedSessions = [newSession, ...sessions];
        const newPRs: PersonalRecordItem[] = [];

        // Check new PRs across exercises in this session
        newSession.exercises.forEach((ex) => {
          ex.sets.forEach((setLog) => {
            if (!setLog.isCompleted || setLog.setType === "warmup" || setLog.weight <= 0) return;

            const calculated1RM = calculate1RM(setLog.weight, setLog.reps);

            // Check Max Weight PR
            const existingMaxWeight = personalRecords.find(
              (pr) => pr.exerciseId === ex.exerciseId && pr.prType === "max_weight"
            );
            if (!existingMaxWeight || setLog.weight > existingMaxWeight.value) {
              newPRs.push({
                id: `pr-${crypto.randomUUID()}`,
                userId: newSession.userId,
                exerciseId: ex.exerciseId,
                prType: "max_weight",
                value: setLog.weight,
                weight: setLog.weight,
                reps: setLog.reps,
                achievedAt: newSession.completedAt || new Date().toISOString(),
              });
            }

            // Check 1RM PR
            const existing1RM = personalRecords.find(
              (pr) => pr.exerciseId === ex.exerciseId && pr.prType === "max_1rm"
            );
            if (!existing1RM || calculated1RM > existing1RM.value) {
              newPRs.push({
                id: `pr-${crypto.randomUUID()}`,
                userId: newSession.userId,
                exerciseId: ex.exerciseId,
                prType: "max_1rm",
                value: calculated1RM,
                weight: setLog.weight,
                reps: setLog.reps,
                achievedAt: newSession.completedAt || new Date().toISOString(),
              });
            }
          });
        });

        // Merge PRs replacing older values of same type
        const mergedPRs = [...personalRecords];
        newPRs.forEach((pr) => {
          const idx = mergedPRs.findIndex(
            (p) => p.exerciseId === pr.exerciseId && p.prType === pr.prType
          );
          if (idx >= 0) {
            mergedPRs[idx] = pr;
          } else {
            mergedPRs.push(pr);
          }
        });

        set({
          sessions: updatedSessions,
          personalRecords: mergedPRs,
        });

        return { newPRs };
      },

      updateHistoricalSession: (id, updates) => {
        set((state) => ({
          sessions: state.sessions.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        }));
        get().recalculatePRs();
      },

      deleteHistoricalSession: (id) => {
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== id),
        }));
        get().recalculatePRs();
      },

      getPreviousPerformance: (exerciseId, setNumber, planDayId) => {
        const { sessions } = get();

        // 1. Look for matching completed session
        for (const session of sessions) {
          if (session.status !== "completed") continue;
          if (planDayId && session.planDayId && session.planDayId !== planDayId) {
            // Optional filter if user wants strict plan day comparison
          }

          const matchedEx = session.exercises.find((e) => e.exerciseId === exerciseId);
          if (matchedEx && matchedEx.sets.length > 0) {
            // Look for matching setNumber, or use the last completed working set
            let targetSet: SetLogItem | undefined;
            if (setNumber !== undefined) {
              targetSet = matchedEx.sets.find(
                (s) => s.setNumber === setNumber && s.isCompleted && s.setType !== "warmup"
              );
            }
            if (!targetSet) {
              targetSet = matchedEx.sets.filter((s) => s.isCompleted && s.setType !== "warmup").pop();
            }

            if (targetSet) {
              return {
                previousWeight: targetSet.weight,
                previousReps: targetSet.reps,
              };
            }
          }
        }

        return null;
      },

      recalculatePRs: () => {
        const { sessions } = get();
        const prMap = new Map<string, PersonalRecordItem>();

        sessions.forEach((s) => {
          if (s.status !== "completed") return;
          s.exercises.forEach((ex) => {
            ex.sets.forEach((setLog) => {
              if (!setLog.isCompleted || setLog.setType === "warmup" || setLog.weight <= 0) return;

              const weightKey = `${ex.exerciseId}-max_weight`;
              const currentMaxWeight = prMap.get(weightKey);
              if (!currentMaxWeight || setLog.weight > currentMaxWeight.value) {
                prMap.set(weightKey, {
                  id: `pr-${crypto.randomUUID()}`,
                  userId: s.userId,
                  exerciseId: ex.exerciseId,
                  prType: "max_weight",
                  value: setLog.weight,
                  weight: setLog.weight,
                  reps: setLog.reps,
                  achievedAt: s.completedAt || s.startedAt,
                });
              }

              const oneRM = calculate1RM(setLog.weight, setLog.reps);
              const oneRMKey = `${ex.exerciseId}-max_1rm`;
              const current1RM = prMap.get(oneRMKey);
              if (!current1RM || oneRM > current1RM.value) {
                prMap.set(oneRMKey, {
                  id: `pr-${crypto.randomUUID()}`,
                  userId: s.userId,
                  exerciseId: ex.exerciseId,
                  prType: "max_1rm",
                  value: oneRM,
                  weight: setLog.weight,
                  reps: setLog.reps,
                  achievedAt: s.completedAt || s.startedAt,
                });
              }
            });
          });
        });

        set({ personalRecords: Array.from(prMap.values()) });
      },
    }),
    {
      name: "liftr-history-storage",
      version: 2,
      migrate: () => ({
        sessions: [],
        personalRecords: [],
      }),
      storage: createJSONStorage(() => localStorage),
    }
  )
);
