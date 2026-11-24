import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { WorkoutPlanItem, PlanDayItem, PlanExerciseItem } from "@/types";

export type TrainingPhase = "Bulking" | "Recomp" | "Cutting" | "Strength" | "Custom";

const INITIAL_PLANS: WorkoutPlanItem[] = [
  {
    id: "plan-ppl-hypertrophy",
    userId: "local-user",
    name: "Push Pull Legs (PPL) Hypertrophy",
    description: "High-yield 3-day split designed for progressive overload and muscle hypertrophy.",
    phaseId: "Bulking",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    days: [
      {
        id: "day-push-1",
        planId: "plan-ppl-hypertrophy",
        dayNumber: 1,
        name: "Push A (Chest, Shoulders & Triceps)",
        notes: "Prioritize strict bar path on bench press; keep 2 reps in reserve on flyes.",
        exercises: [
          {
            id: "pe-1",
            planDayId: "day-push-1",
            exerciseId: "ex-bench-press",
            orderInDay: 1,
            targetSets: 4,
            minReps: 6,
            maxReps: 10,
            defaultWeight: 80,
            restDuration: 120,
            progressionIncrement: 2.5,
            progressionEnabled: true,
            notes: "Touch lower chest with controlled 2-second eccentric.",
          },
          {
            id: "pe-2",
            planDayId: "day-push-1",
            exerciseId: "ex-incline-db-press",
            orderInDay: 2,
            targetSets: 3,
            minReps: 8,
            maxReps: 12,
            defaultWeight: 26,
            restDuration: 90,
            progressionIncrement: 2.0,
            progressionEnabled: true,
            notes: "30 degree bench inclination.",
          },
          {
            id: "pe-3",
            planDayId: "day-push-1",
            exerciseId: "ex-overhead-press",
            orderInDay: 3,
            targetSets: 3,
            minReps: 8,
            maxReps: 10,
            defaultWeight: 45,
            restDuration: 90,
            progressionIncrement: 2.5,
            progressionEnabled: true,
            notes: "Squeeze glutes and abs to prevent lumbar hyperextension.",
          },
          {
            id: "pe-4",
            planDayId: "day-push-1",
            exerciseId: "ex-lateral-raise",
            orderInDay: 4,
            targetSets: 4,
            minReps: 12,
            maxReps: 15,
            defaultWeight: 10,
            restDuration: 60,
            progressionIncrement: 1.0,
            progressionEnabled: true,
            notes: "Lead with elbows, slight forward torso lean.",
          },
          {
            id: "pe-5",
            planDayId: "day-push-1",
            exerciseId: "ex-tricep-pushdown",
            orderInDay: 5,
            targetSets: 3,
            minReps: 10,
            maxReps: 12,
            defaultWeight: 30,
            restDuration: 60,
            progressionIncrement: 1.25,
            progressionEnabled: true,
            notes: "Lock elbows by sides, full lockout squeeze.",
          },
        ],
      },
      {
        id: "day-pull-1",
        planId: "plan-ppl-hypertrophy",
        dayNumber: 2,
        name: "Pull A (Back, Rear Delts & Biceps)",
        notes: "Drive pull with elbows, not biceps grip.",
        exercises: [
          {
            id: "pe-6",
            planDayId: "day-pull-1",
            exerciseId: "ex-barbell-deadlift",
            orderInDay: 1,
            targetSets: 3,
            minReps: 5,
            maxReps: 8,
            defaultWeight: 120,
            restDuration: 180,
            progressionIncrement: 5.0,
            progressionEnabled: true,
            notes: "Brace hard 360 degrees before pulling slack out of the bar.",
          },
          {
            id: "pe-7",
            planDayId: "day-pull-1",
            exerciseId: "ex-barbell-row",
            orderInDay: 2,
            targetSets: 4,
            minReps: 8,
            maxReps: 10,
            defaultWeight: 65,
            restDuration: 90,
            progressionIncrement: 2.5,
            progressionEnabled: true,
          },
          {
            id: "pe-8",
            planDayId: "day-pull-1",
            exerciseId: "ex-pull-up",
            orderInDay: 3,
            targetSets: 3,
            minReps: 6,
            maxReps: 10,
            defaultWeight: 0,
            restDuration: 90,
            progressionIncrement: 1.25,
            progressionEnabled: true,
          },
          {
            id: "pe-9",
            planDayId: "day-pull-1",
            exerciseId: "ex-incline-db-curl",
            orderInDay: 4,
            targetSets: 3,
            minReps: 10,
            maxReps: 12,
            defaultWeight: 14,
            restDuration: 60,
            progressionIncrement: 1.0,
            progressionEnabled: true,
          },
        ],
      },
      {
        id: "day-legs-1",
        planId: "plan-ppl-hypertrophy",
        dayNumber: 3,
        name: "Legs A (Quads, Hamstrings & Calves)",
        notes: "Hit full depth below parallel on squats.",
        exercises: [
          {
            id: "pe-10",
            planDayId: "day-legs-1",
            exerciseId: "ex-barbell-squat",
            orderInDay: 1,
            targetSets: 4,
            minReps: 6,
            maxReps: 10,
            defaultWeight: 100,
            restDuration: 180,
            progressionIncrement: 5.0,
            progressionEnabled: true,
          },
          {
            id: "pe-11",
            planDayId: "day-legs-1",
            exerciseId: "ex-romanian-deadlift",
            orderInDay: 2,
            targetSets: 3,
            minReps: 8,
            maxReps: 12,
            defaultWeight: 75,
            restDuration: 120,
            progressionIncrement: 2.5,
            progressionEnabled: true,
          },
          {
            id: "pe-12",
            planDayId: "day-legs-1",
            exerciseId: "ex-leg-press",
            orderInDay: 3,
            targetSets: 3,
            minReps: 10,
            maxReps: 12,
            defaultWeight: 160,
            restDuration: 90,
            progressionIncrement: 5.0,
            progressionEnabled: true,
          },
          {
            id: "pe-13",
            planDayId: "day-legs-1",
            exerciseId: "ex-standing-calf-raise",
            orderInDay: 4,
            targetSets: 4,
            minReps: 12,
            maxReps: 15,
            defaultWeight: 60,
            restDuration: 60,
            progressionIncrement: 2.5,
            progressionEnabled: true,
          },
        ],
      },
    ],
  },
  {
    id: "plan-upper-lower",
    userId: "local-user",
    name: "Upper / Lower Frequency Split",
    description: "4-day athletic split providing 2x weekly frequency per muscle group.",
    phaseId: "Strength",
    isActive: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    days: [
      {
        id: "day-upper-1",
        planId: "plan-upper-lower",
        dayNumber: 1,
        name: "Upper Power",
        exercises: [
          {
            id: "pe-ul-1",
            planDayId: "day-upper-1",
            exerciseId: "ex-bench-press",
            orderInDay: 1,
            targetSets: 4,
            minReps: 5,
            maxReps: 8,
            defaultWeight: 85,
            restDuration: 150,
            progressionIncrement: 2.5,
            progressionEnabled: true,
          },
          {
            id: "pe-ul-2",
            planDayId: "day-upper-1",
            exerciseId: "ex-barbell-row",
            orderInDay: 2,
            targetSets: 4,
            minReps: 6,
            maxReps: 8,
            defaultWeight: 70,
            restDuration: 120,
            progressionIncrement: 2.5,
            progressionEnabled: true,
          },
        ],
      },
      {
        id: "day-lower-1",
        planId: "plan-upper-lower",
        dayNumber: 2,
        name: "Lower Power",
        exercises: [
          {
            id: "pe-ul-3",
            planDayId: "day-lower-1",
            exerciseId: "ex-barbell-squat",
            orderInDay: 1,
            targetSets: 4,
            minReps: 5,
            maxReps: 8,
            defaultWeight: 105,
            restDuration: 180,
            progressionIncrement: 5.0,
            progressionEnabled: true,
          },
        ],
      },
    ],
  },
];

interface PlanStore {
  plans: WorkoutPlanItem[];
  createPlan: (name: string, description?: string, phase?: string) => WorkoutPlanItem;
  updatePlan: (id: string, updates: Partial<WorkoutPlanItem>) => void;
  deletePlan: (id: string) => void;
  duplicatePlan: (id: string) => void;
  setActivePlan: (id: string) => void;
  addDayToPlan: (planId: string, dayName: string) => void;
  removeDayFromPlan: (planId: string, dayId: string) => void;
  duplicateDayInPlan: (planId: string, dayId: string) => void;
  updateDayName: (planId: string, dayId: string, name: string) => void;
  addExerciseToDay: (
    planId: string,
    dayId: string,
    exerciseId: string,
    targets?: Partial<PlanExerciseItem>
  ) => void;
  removeExerciseFromDay: (planId: string, dayId: string, planExerciseId: string) => void;
  updatePlanExercise: (
    planId: string,
    dayId: string,
    planExerciseId: string,
    updates: Partial<PlanExerciseItem>
  ) => void;
  moveExerciseOrder: (planId: string, dayId: string, planExerciseId: string, direction: "up" | "down") => void;
}

export const usePlanStore = create<PlanStore>()(
  persist(
    (set, get) => ({
      plans: INITIAL_PLANS,

      createPlan: (name, description, phase = "Bulking") => {
        const newPlan: WorkoutPlanItem = {
          id: `plan-${crypto.randomUUID()}`,
          userId: "local-user",
          name,
          description: description || "",
          phaseId: phase,
          isActive: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          days: [
            {
              id: `day-${crypto.randomUUID()}`,
              planId: "",
              dayNumber: 1,
              name: "Day 1 - Push",
              exercises: [],
            },
          ],
        };
        newPlan.days[0].planId = newPlan.id;

        set((state) => ({
          plans: [newPlan, ...state.plans],
        }));

        return newPlan;
      },

      updatePlan: (id, updates) => {
        set((state) => ({
          plans: state.plans.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          ),
        }));
      },

      deletePlan: (id) => {
        set((state) => ({
          plans: state.plans.filter((p) => p.id !== id),
        }));
      },

      duplicatePlan: (id) => {
        const original = get().plans.find((p) => p.id === id);
        if (!original) return;

        const newPlanId = `plan-${crypto.randomUUID()}`;
        const clonedDays: PlanDayItem[] = original.days.map((d, dIdx) => {
          const newDayId = `day-${crypto.randomUUID()}`;
          return {
            ...d,
            id: newDayId,
            planId: newPlanId,
            dayNumber: dIdx + 1,
            exercises: d.exercises.map((e) => ({
              ...e,
              id: `pe-${crypto.randomUUID()}`,
              planDayId: newDayId,
            })),
          };
        });

        const duplicated: WorkoutPlanItem = {
          ...original,
          id: newPlanId,
          name: `${original.name} (Copy)`,
          isActive: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          days: clonedDays,
        };

        set((state) => ({
          plans: [duplicated, ...state.plans],
        }));
      },

      setActivePlan: (id) => {
        set((state) => ({
          plans: state.plans.map((p) => ({
            ...p,
            isActive: p.id === id,
          })),
        }));
      },

      addDayToPlan: (planId, dayName) => {
        set((state) => ({
          plans: state.plans.map((p) => {
            if (p.id !== planId) return p;
            const newDay: PlanDayItem = {
              id: `day-${crypto.randomUUID()}`,
              planId,
              dayNumber: p.days.length + 1,
              name: dayName,
              exercises: [],
            };
            return {
              ...p,
              days: [...p.days, newDay],
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      removeDayFromPlan: (planId, dayId) => {
        set((state) => ({
          plans: state.plans.map((p) => {
            if (p.id !== planId) return p;
            const remaining = p.days.filter((d) => d.id !== dayId);
            const renumbered = remaining.map((d, idx) => ({ ...d, dayNumber: idx + 1 }));
            return {
              ...p,
              days: renumbered,
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      duplicateDayInPlan: (planId, dayId) => {
        set((state) => ({
          plans: state.plans.map((p) => {
            if (p.id !== planId) return p;
            const targetDay = p.days.find((d) => d.id === dayId);
            if (!targetDay) return p;

            const newDayId = `day-${crypto.randomUUID()}`;
            const clonedDay: PlanDayItem = {
              ...targetDay,
              id: newDayId,
              name: `${targetDay.name} (Copy)`,
              dayNumber: p.days.length + 1,
              exercises: targetDay.exercises.map((e) => ({
                ...e,
                id: `pe-${crypto.randomUUID()}`,
                planDayId: newDayId,
              })),
            };

            return {
              ...p,
              days: [...p.days, clonedDay],
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      updateDayName: (planId, dayId, name) => {
        set((state) => ({
          plans: state.plans.map((p) => {
            if (p.id !== planId) return p;
            return {
              ...p,
              days: p.days.map((d) => (d.id === dayId ? { ...d, name } : d)),
            };
          }),
        }));
      },

      addExerciseToDay: (planId, dayId, exerciseId, targets) => {
        set((state) => ({
          plans: state.plans.map((p) => {
            if (p.id !== planId) return p;
            return {
              ...p,
              days: p.days.map((d) => {
                if (d.id !== dayId) return d;
                const newPlanExercise: PlanExerciseItem = {
                  id: `pe-${crypto.randomUUID()}`,
                  planDayId: dayId,
                  exerciseId,
                  orderInDay: d.exercises.length + 1,
                  targetSets: targets?.targetSets ?? 3,
                  minReps: targets?.minReps ?? 8,
                  maxReps: targets?.maxReps ?? 12,
                  defaultWeight: targets?.defaultWeight ?? 0,
                  restDuration: targets?.restDuration ?? 90,
                  progressionIncrement: targets?.progressionIncrement ?? 2.5,
                  progressionEnabled: targets?.progressionEnabled ?? true,
                  notes: targets?.notes || "",
                };
                return {
                  ...d,
                  exercises: [...d.exercises, newPlanExercise],
                };
              }),
            };
          }),
        }));
      },

      removeExerciseFromDay: (planId, dayId, planExerciseId) => {
        set((state) => ({
          plans: state.plans.map((p) => {
            if (p.id !== planId) return p;
            return {
              ...p,
              days: p.days.map((d) => {
                if (d.id !== dayId) return d;
                const filtered = d.exercises.filter((e) => e.id !== planExerciseId);
                const reordered = filtered.map((e, idx) => ({ ...e, orderInDay: idx + 1 }));
                return { ...d, exercises: reordered };
              }),
            };
          }),
        }));
      },

      updatePlanExercise: (planId, dayId, planExerciseId, updates) => {
        set((state) => ({
          plans: state.plans.map((p) => {
            if (p.id !== planId) return p;
            return {
              ...p,
              days: p.days.map((d) => {
                if (d.id !== dayId) return d;
                return {
                  ...d,
                  exercises: d.exercises.map((e) =>
                    e.id === planExerciseId ? { ...e, ...updates } : e
                  ),
                };
              }),
            };
          }),
        }));
      },

      moveExerciseOrder: (planId, dayId, planExerciseId, direction) => {
        set((state) => ({
          plans: state.plans.map((p) => {
            if (p.id !== planId) return p;
            return {
              ...p,
              days: p.days.map((d) => {
                if (d.id !== dayId) return d;
                const idx = d.exercises.findIndex((e) => e.id === planExerciseId);
                if (idx < 0) return d;
                if (direction === "up" && idx === 0) return d;
                if (direction === "down" && idx === d.exercises.length - 1) return d;

                const targetIdx = direction === "up" ? idx - 1 : idx + 1;
                const newExs = [...d.exercises];
                const temp = newExs[idx];
                newExs[idx] = newExs[targetIdx];
                newExs[targetIdx] = temp;

                // Reorder numbers
                const renumbered = newExs.map((e, i) => ({ ...e, orderInDay: i + 1 }));
                return { ...d, exercises: renumbered };
              }),
            };
          }),
        }));
      },
    }),
    {
      name: "liftr-plans-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
