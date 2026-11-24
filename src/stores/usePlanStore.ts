import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getActiveClientUserId } from "@/lib/offline/db";
import { WorkoutPlanItem, PlanDayItem, PlanExerciseItem } from "@/types";

export type TrainingPhase = "Bulking" | "Recomp" | "Cutting" | "Strength" | "Custom";


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
      plans: [],

      createPlan: (name, description, phase = "Bulking") => {
        const newPlan: WorkoutPlanItem = {
          id: `plan-${crypto.randomUUID()}`,
          userId: getActiveClientUserId(),
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
      version: 2,
      migrate: () => ({ plans: [] }),
      storage: createJSONStorage(() => localStorage),
    }
  )
);
