import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Exercise } from "@/types";
import { DEFAULT_SYSTEM_EXERCISES } from "@/lib/constants/defaultExercises";

interface ExerciseStore {
  exercises: Exercise[];
  addExercise: (exercise: Omit<Exercise, "id" | "isSystem" | "isArchived">) => Exercise;
  updateExercise: (id: string, updates: Partial<Exercise>) => void;
  deleteExercise: (id: string) => void;
  toggleFavorite: (id: string) => void;
  getExerciseById: (id: string) => Exercise | undefined;
  resetToDefaults: () => void;
}

function mergeSystemAndCustom(storedExercises: Exercise[] = []): Exercise[] {
  const custom = storedExercises.filter((e) => !e.isSystem);
  const favMap = new Map<string, boolean>();
  storedExercises.forEach((e) => {
    if (e.isSystem && e.isFavorite !== undefined) {
      favMap.set(e.id, e.isFavorite);
    }
  });

  const system = DEFAULT_SYSTEM_EXERCISES.map((sys) => ({
    ...sys,
    isFavorite: favMap.has(sys.id) ? favMap.get(sys.id)! : sys.isFavorite,
  }));

  return [...system, ...custom];
}

export const useExerciseStore = create<ExerciseStore>()(
  persist(
    (set, get) => ({
      exercises: DEFAULT_SYSTEM_EXERCISES,

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
          // System exercises are protected; custom exercises can be removed
          exercises: state.exercises.filter((ex) => ex.id !== id || ex.isSystem),
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
        set({ exercises: DEFAULT_SYSTEM_EXERCISES });
      },
    }),
    {
      name: "liftr-exercises-storage",
      version: 3,
      migrate: (persistedState: unknown) => {
        const prev = persistedState as { exercises?: Exercise[] } | undefined;
        return {
          exercises: mergeSystemAndCustom(prev?.exercises || []),
        };
      },
      merge: (persistedState: unknown, currentState: ExerciseStore) => {
        const prev = persistedState as { exercises?: Exercise[] } | undefined;
        return {
          ...currentState,
          exercises: mergeSystemAndCustom(prev?.exercises || []),
        };
      },
      storage: createJSONStorage(() => localStorage),
    }
  )
);
