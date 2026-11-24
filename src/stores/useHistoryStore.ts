import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { WorkoutSessionItem, PersonalRecordItem, SetLogItem } from "@/types";
import { calculate1RM, calculateVolume } from "@/lib/calculations/strength";

const INITIAL_SESSIONS: WorkoutSessionItem[] = [
  {
    id: "hist-sess-1",
    userId: "local-user",
    planId: "plan-ppl-hypertrophy",
    planDayId: "day-push-1",
    phaseId: "Bulking",
    name: "Push Pull Legs (PPL) Hypertrophy • Push A",
    startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 52 * 60 * 1000).toISOString(),
    durationSeconds: 3120, // 52 mins
    status: "completed",
    notes: "Great chest pump, hit target reps on bench press.",
    totalVolume: 5840,
    exercises: [
      {
        id: "sex-1",
        sessionId: "hist-sess-1",
        exerciseId: "ex-bench-press",
        orderInSession: 1,
        isCompleted: true,
        sets: [
          {
            id: "set-1",
            sessionExerciseId: "sex-1",
            sessionId: "hist-sess-1",
            exerciseId: "ex-bench-press",
            setNumber: 1,
            setType: "normal",
            weight: 80,
            reps: 8,
            isCompleted: true,
          },
          {
            id: "set-2",
            sessionExerciseId: "sex-1",
            sessionId: "hist-sess-1",
            exerciseId: "ex-bench-press",
            setNumber: 2,
            setType: "normal",
            weight: 80,
            reps: 8,
            isCompleted: true,
          },
          {
            id: "set-3",
            sessionExerciseId: "sex-1",
            sessionId: "hist-sess-1",
            exerciseId: "ex-bench-press",
            setNumber: 3,
            setType: "normal",
            weight: 80,
            reps: 7,
            isCompleted: true,
          },
          {
            id: "set-4",
            sessionExerciseId: "sex-1",
            sessionId: "hist-sess-1",
            exerciseId: "ex-bench-press",
            setNumber: 4,
            setType: "normal",
            weight: 80,
            reps: 7,
            isCompleted: true,
          },
        ],
      },
      {
        id: "sex-2",
        sessionId: "hist-sess-1",
        exerciseId: "ex-incline-db-press",
        orderInSession: 2,
        isCompleted: true,
        sets: [
          {
            id: "set-5",
            sessionExerciseId: "sex-2",
            sessionId: "hist-sess-1",
            exerciseId: "ex-incline-db-press",
            setNumber: 1,
            setType: "normal",
            weight: 26,
            reps: 10,
            isCompleted: true,
          },
          {
            id: "set-6",
            sessionExerciseId: "sex-2",
            sessionId: "hist-sess-1",
            exerciseId: "ex-incline-db-press",
            setNumber: 2,
            setType: "normal",
            weight: 26,
            reps: 9,
            isCompleted: true,
          },
          {
            id: "set-7",
            sessionExerciseId: "sex-2",
            sessionId: "hist-sess-1",
            exerciseId: "ex-incline-db-press",
            setNumber: 3,
            setType: "normal",
            weight: 26,
            reps: 8,
            isCompleted: true,
          },
        ],
      },
      {
        id: "sex-3",
        sessionId: "hist-sess-1",
        exerciseId: "ex-lateral-raise",
        orderInSession: 3,
        isCompleted: true,
        sets: [
          {
            id: "set-8",
            sessionExerciseId: "sex-3",
            sessionId: "hist-sess-1",
            exerciseId: "ex-lateral-raise",
            setNumber: 1,
            setType: "normal",
            weight: 10,
            reps: 12,
            isCompleted: true,
          },
          {
            id: "set-9",
            sessionExerciseId: "sex-3",
            sessionId: "hist-sess-1",
            exerciseId: "ex-lateral-raise",
            setNumber: 2,
            setType: "normal",
            weight: 10,
            reps: 12,
            isCompleted: true,
          },
        ],
      },
    ],
  },
  {
    id: "hist-sess-2",
    userId: "local-user",
    planId: "plan-ppl-hypertrophy",
    planDayId: "day-pull-1",
    phaseId: "Bulking",
    name: "Push Pull Legs (PPL) Hypertrophy • Pull A",
    startedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 48 * 60 * 1000).toISOString(),
    durationSeconds: 2880,
    status: "completed",
    notes: "RDLs felt solid in glutes and hamstrings.",
    totalVolume: 6420,
    exercises: [
      {
        id: "sex-4",
        sessionId: "hist-sess-2",
        exerciseId: "ex-barbell-deadlift",
        orderInSession: 1,
        isCompleted: true,
        sets: [
          {
            id: "set-10",
            sessionExerciseId: "sex-4",
            sessionId: "hist-sess-2",
            exerciseId: "ex-barbell-deadlift",
            setNumber: 1,
            setType: "normal",
            weight: 120,
            reps: 6,
            isCompleted: true,
          },
          {
            id: "set-11",
            sessionExerciseId: "sex-4",
            sessionId: "hist-sess-2",
            exerciseId: "ex-barbell-deadlift",
            setNumber: 2,
            setType: "normal",
            weight: 120,
            reps: 6,
            isCompleted: true,
          },
        ],
      },
      {
        id: "sex-5",
        sessionId: "hist-sess-2",
        exerciseId: "ex-barbell-row",
        orderInSession: 2,
        isCompleted: true,
        sets: [
          {
            id: "set-12",
            sessionExerciseId: "sex-5",
            sessionId: "hist-sess-2",
            exerciseId: "ex-barbell-row",
            setNumber: 1,
            setType: "normal",
            weight: 65,
            reps: 8,
            isCompleted: true,
          },
          {
            id: "set-13",
            sessionExerciseId: "sex-5",
            sessionId: "hist-sess-2",
            exerciseId: "ex-barbell-row",
            setNumber: 2,
            setType: "normal",
            weight: 65,
            reps: 8,
            isCompleted: true,
          },
        ],
      },
    ],
  },
];

const INITIAL_PRS: PersonalRecordItem[] = [
  {
    id: "pr-1",
    userId: "local-user",
    exerciseId: "ex-bench-press",
    exerciseName: "Barbell Bench Press",
    prType: "max_weight",
    value: 80,
    weight: 80,
    reps: 8,
    achievedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "pr-2",
    userId: "local-user",
    exerciseId: "ex-bench-press",
    exerciseName: "Barbell Bench Press",
    prType: "max_1rm",
    value: 101.3,
    weight: 80,
    reps: 8,
    achievedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "pr-3",
    userId: "local-user",
    exerciseId: "ex-barbell-deadlift",
    exerciseName: "Barbell Conventional Deadlift",
    prType: "max_weight",
    value: 120,
    weight: 120,
    reps: 6,
    achievedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "pr-4",
    userId: "local-user",
    exerciseId: "ex-barbell-deadlift",
    exerciseName: "Barbell Conventional Deadlift",
    prType: "max_1rm",
    value: 144.0,
    weight: 120,
    reps: 6,
    achievedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

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
      sessions: INITIAL_SESSIONS,
      personalRecords: INITIAL_PRS,

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
      storage: createJSONStorage(() => localStorage),
    }
  )
);
