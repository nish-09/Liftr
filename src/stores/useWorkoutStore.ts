import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { WorkoutSessionItem, SessionExerciseItem, SetLogItem, SetType } from "@/types";
import { calculateVolume } from "@/lib/calculations/strength";

interface RestTimerState {
  remainingSeconds: number;
  totalSeconds: number;
  isRunning: boolean;
  exerciseName?: string;
  setNumber?: number;
}

interface WorkoutStore {
  // Active session
  activeSession: WorkoutSessionItem | null;
  syncStatus: "synced" | "pending" | "syncing" | "offline" | "error";
  elapsedSeconds: number;

  // Rest Timer
  restTimer: RestTimerState;

  // Actions
  startWorkout: (session: Partial<WorkoutSessionItem> & { name: string }) => void;
  updateSessionMeta: (updates: Partial<WorkoutSessionItem>) => void;
  finishWorkout: () => WorkoutSessionItem | null;
  discardWorkout: () => void;
  tickElapsed: () => void;

  // Exercise and Set logging
  addExerciseToWorkout: (exerciseId: string, exerciseName?: string, defaultSets?: number) => void;
  removeExerciseFromWorkout: (sessionExerciseId: string) => void;
  addSetToExercise: (sessionExerciseId: string, setType?: SetType) => void;
  deleteSetFromExercise: (sessionExerciseId: string, setId: string) => void;
  updateSet: (sessionExerciseId: string, setId: string, updates: Partial<SetLogItem>) => void;
  toggleSetCompleted: (sessionExerciseId: string, setId: string) => void;

  // Rest Timer Actions
  startRestTimer: (seconds: number, exerciseName?: string, setNumber?: number) => void;
  pauseRestTimer: () => void;
  resumeRestTimer: () => void;
  resetRestTimer: () => void;
  addRestSeconds: (seconds: number) => void;
  tickRestTimer: () => void;

  // Sync
  setSyncStatus: (status: "synced" | "pending" | "syncing" | "offline" | "error") => void;
}

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    (set, get) => ({
      activeSession: null,
      syncStatus: "synced",
      elapsedSeconds: 0,
      restTimer: {
        remainingSeconds: 0,
        totalSeconds: 0,
        isRunning: false,
      },

      startWorkout: (sessionData) => {
        const id = sessionData.id || crypto.randomUUID();
        const newSession: WorkoutSessionItem = {
          id,
          userId: sessionData.userId || "local-user",
          planId: sessionData.planId || null,
          planDayId: sessionData.planDayId || null,
          phaseId: sessionData.phaseId || null,
          name: sessionData.name || "Live Workout Session",
          startedAt: sessionData.startedAt || new Date().toISOString(),
          durationSeconds: 0,
          status: "active",
          notes: sessionData.notes || "",
          totalVolume: 0,
          idempotencyKey: `sess_${id}_${Date.now()}`,
          exercises: sessionData.exercises || [],
        };

        set({
          activeSession: newSession,
          elapsedSeconds: 0,
          syncStatus: "pending",
        });
      },

      updateSessionMeta: (updates) => {
        const { activeSession } = get();
        if (!activeSession) return;
        set({
          activeSession: { ...activeSession, ...updates },
          syncStatus: "pending",
        });
      },

      finishWorkout: () => {
        const { activeSession, elapsedSeconds } = get();
        if (!activeSession) return null;

        const totalVol = activeSession.exercises.reduce(
          (sum, ex) => sum + calculateVolume(ex.sets),
          0
        );

        const completedSession: WorkoutSessionItem = {
          ...activeSession,
          completedAt: new Date().toISOString(),
          durationSeconds: elapsedSeconds,
          status: "completed",
          totalVolume: totalVol,
        };

        set({
          activeSession: null,
          elapsedSeconds: 0,
          syncStatus: "synced",
          restTimer: {
            remainingSeconds: 0,
            totalSeconds: 0,
            isRunning: false,
          },
        });

        return completedSession;
      },

      discardWorkout: () => {
        set({
          activeSession: null,
          elapsedSeconds: 0,
          restTimer: {
            remainingSeconds: 0,
            totalSeconds: 0,
            isRunning: false,
          },
        });
      },

      tickElapsed: () => {
        const { activeSession } = get();
        if (!activeSession) return;
        set((state) => ({ elapsedSeconds: state.elapsedSeconds + 1 }));
      },

      addExerciseToWorkout: (exerciseId, exerciseName, defaultSets = 3) => {
        const { activeSession } = get();
        if (!activeSession) return;

        const sessionExerciseId = crypto.randomUUID();
        const initialSets: SetLogItem[] = Array.from({ length: defaultSets }).map((_, idx) => ({
          id: crypto.randomUUID(),
          sessionExerciseId,
          sessionId: activeSession.id,
          exerciseId,
          setNumber: idx + 1,
          setType: "normal",
          weight: 0,
          reps: 0,
          isCompleted: false,
        }));

        const newExercise: SessionExerciseItem = {
          id: sessionExerciseId,
          sessionId: activeSession.id,
          exerciseId,
          orderInSession: activeSession.exercises.length + 1,
          isCompleted: false,
          sets: initialSets,
        };

        set({
          activeSession: {
            ...activeSession,
            exercises: [...activeSession.exercises, newExercise],
          },
          syncStatus: "pending",
        });
      },

      removeExerciseFromWorkout: (sessionExerciseId) => {
        const { activeSession } = get();
        if (!activeSession) return;

        set({
          activeSession: {
            ...activeSession,
            exercises: activeSession.exercises.filter((ex) => ex.id !== sessionExerciseId),
          },
          syncStatus: "pending",
        });
      },

      addSetToExercise: (sessionExerciseId, setType = "normal") => {
        const { activeSession } = get();
        if (!activeSession) return;

        const updatedExercises = activeSession.exercises.map((ex) => {
          if (ex.id !== sessionExerciseId) return ex;

          const lastSet = ex.sets[ex.sets.length - 1];
          const newSet: SetLogItem = {
            id: crypto.randomUUID(),
            sessionExerciseId,
            sessionId: activeSession.id,
            exerciseId: ex.exerciseId,
            setNumber: ex.sets.length + 1,
            setType,
            weight: lastSet ? lastSet.weight : 0,
            reps: lastSet ? lastSet.reps : 0,
            isCompleted: false,
          };

          return {
            ...ex,
            sets: [...ex.sets, newSet],
          };
        });

        set({
          activeSession: { ...activeSession, exercises: updatedExercises },
          syncStatus: "pending",
        });
      },

      deleteSetFromExercise: (sessionExerciseId, setId) => {
        const { activeSession } = get();
        if (!activeSession) return;

        const updatedExercises = activeSession.exercises.map((ex) => {
          if (ex.id !== sessionExerciseId) return ex;
          const filteredSets = ex.sets.filter((s) => s.id !== setId);
          // Re-index set numbers
          const renumbered = filteredSets.map((s, idx) => ({
            ...s,
            setNumber: idx + 1,
          }));
          return {
            ...ex,
            sets: renumbered,
          };
        });

        set({
          activeSession: { ...activeSession, exercises: updatedExercises },
          syncStatus: "pending",
        });
      },

      updateSet: (sessionExerciseId, setId, updates) => {
        const { activeSession } = get();
        if (!activeSession) return;

        const updatedExercises = activeSession.exercises.map((ex) => {
          if (ex.id !== sessionExerciseId) return ex;
          return {
            ...ex,
            sets: ex.sets.map((s) => (s.id === setId ? { ...s, ...updates } : s)),
          };
        });

        set({
          activeSession: { ...activeSession, exercises: updatedExercises },
          syncStatus: "pending",
        });
      },

      toggleSetCompleted: (sessionExerciseId, setId) => {
        const { activeSession } = get();
        if (!activeSession) return;

        let shouldStartTimer = false;
        let completedSetNum: number | undefined;

        const updatedExercises = activeSession.exercises.map((ex) => {
          if (ex.id !== sessionExerciseId) return ex;
          return {
            ...ex,
            sets: ex.sets.map((s) => {
              if (s.id === setId) {
                const nextStatus = !s.isCompleted;
                if (nextStatus) {
                  shouldStartTimer = true;
                  completedSetNum = s.setNumber;
                }
                return { ...s, isCompleted: nextStatus };
              }
              return s;
            }),
          };
        });

        set({
          activeSession: { ...activeSession, exercises: updatedExercises },
          syncStatus: "pending",
        });

        if (shouldStartTimer) {
          get().startRestTimer(90, undefined, completedSetNum);
        }
      },

      startRestTimer: (seconds, exerciseName, setNumber) => {
        set({
          restTimer: {
            remainingSeconds: seconds,
            totalSeconds: seconds,
            isRunning: true,
            exerciseName,
            setNumber,
          },
        });
      },

      pauseRestTimer: () => {
        set((state) => ({
          restTimer: { ...state.restTimer, isRunning: false },
        }));
      },

      resumeRestTimer: () => {
        set((state) => ({
          restTimer: { ...state.restTimer, isRunning: true },
        }));
      },

      resetRestTimer: () => {
        set({
          restTimer: {
            remainingSeconds: 0,
            totalSeconds: 0,
            isRunning: false,
          },
        });
      },

      addRestSeconds: (seconds) => {
        set((state) => ({
          restTimer: {
            ...state.restTimer,
            remainingSeconds: state.restTimer.remainingSeconds + seconds,
            totalSeconds: state.restTimer.totalSeconds + seconds,
          },
        }));
      },

      tickRestTimer: () => {
        const { restTimer } = get();
        if (!restTimer.isRunning || restTimer.remainingSeconds <= 0) return;

        const newRemaining = restTimer.remainingSeconds - 1;
        if (newRemaining <= 0) {
          // Timer finished
          if (typeof window !== "undefined") {
            try {
              if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
            } catch {
              // Ignore vibration failure
            }
          }
          set({
            restTimer: {
              ...restTimer,
              remainingSeconds: 0,
              isRunning: false,
            },
          });
        } else {
          set({
            restTimer: {
              ...restTimer,
              remainingSeconds: newRemaining,
            },
          });
        }
      },

      setSyncStatus: (status) => set({ syncStatus: status }),
    }),
    {
      name: "liftr-workout-storage",
      version: 2,
      migrate: () => ({
        activeSession: null,
        syncStatus: "synced",
        elapsedSeconds: 0,
        restTimer: {
          remainingSeconds: 0,
          totalSeconds: 0,
          isRunning: false,
        },
      }),
      storage: createJSONStorage(() => localStorage),
    }
  )
);
