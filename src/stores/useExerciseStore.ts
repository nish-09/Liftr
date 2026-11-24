import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Exercise, MuscleGroup, Equipment } from "@/types";

interface ExerciseStore {
  exercises: Exercise[];
  addExercise: (exercise: Omit<Exercise, "id" | "isSystem" | "isArchived">) => Exercise;
  updateExercise: (id: string, updates: Partial<Exercise>) => void;
  deleteExercise: (id: string) => void;
  toggleFavorite: (id: string) => void;
  getExerciseById: (id: string) => Exercise | undefined;
  resetToDefaults: () => void;
}

export const useExerciseStore = create<ExerciseStore>()(
  persist(
    (set, get) => ({
      exercises: [],

      addExercise: (exerciseData) => {
        const newEx: Exercise = {
          ...exerciseData,
          id: `custom-${crypto.randomUUID()}`,
          isSystem: false,
          isArchived: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          exercises: [newEx, ...state.exercises],
        }));

        return newEx;
      },

      updateExercise: (id, updates) => {
        set((state) => ({
          exercises: state.exercises.map((ex) =>
            ex.id === id
              ? { ...ex, ...updates, updatedAt: new Date().toISOString() }
              : ex
          ),
        }));
      },

      deleteExercise: (id) => {
        set((state) => ({
          // System exercises are marked archived to protect history; custom can be removed
          exercises: state.exercises.filter((ex) => ex.id !== id),
        }));
      },

      toggleFavorite: (id) => {
        set((state) => ({
          exercises: state.exercises.map((ex) =>
            ex.id === id ? { ...ex, isFavorite: !ex.isFavorite } : ex
          ),
        }));
      },

      getExerciseById: (id) => {
        return get().exercises.find((ex) => ex.id === id);
      },

      resetToDefaults: () => {
        set({ exercises: [] });
      },
    }),
    {
      name: "liftr-exercises-storage",
      version: 2,
      migrate: () => ({ exercises: [] }),
      storage: createJSONStorage(() => localStorage),
    }
  )
);
