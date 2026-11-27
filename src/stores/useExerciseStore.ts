import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Exercise } from "@/types";
import { DEFAULT_SYSTEM_EXERCISES } from "@/lib/constants/defaultExercises";

interface ExerciseStore {
  exercises: Exercise[];
  deletedExerciseIds: string[];
  addExercise: (exercise: Omit<Exercise, "id" | "isSystem" | "isArchived">) => Exercise;
  updateExercise: (id: string, updates: Partial<Exercise>) => void;
  deleteExercise: (id: string) => void;
  toggleFavorite: (id: string) => void;
  getExerciseById: (id: string) => Exercise | undefined;
  resetToDefaults: () => void;
}

function mergeSystemAndCustom(
  storedExercises: Exercise[] = [],
  deletedExerciseIds: string[] = []
): { exercises: Exercise[]; deletedExerciseIds: string[] } {
  const deletedSet = new Set(deletedExerciseIds);
  const storedMap = new Map<string, Exercise>();
  storedExercises.forEach((ex) => storedMap.set(ex.id, ex));

  // 1. System exercises: preserve user updates, omit user deletions
  const system: Exercise[] = [];
  DEFAULT_SYSTEM_EXERCISES.forEach((sys) => {
    if (deletedSet.has(sys.id)) return;
    const userVersion = storedMap.get(sys.id);
    if (userVersion) {
      system.push(userVersion);
    } else {
      system.push(sys);
    }
  });

  // 2. Custom exercises: non-system and not deleted
  const custom = storedExercises.filter(
    (ex) => !ex.isSystem && !deletedSet.has(ex.id)
  );

  return {
    exercises: [...system, ...custom],
    deletedExerciseIds,
  };
}

export const useExerciseStore = create<ExerciseStore>()(
  persist(
    (set, get) => ({
      exercises: DEFAULT_SYSTEM_EXERCISES,
      deletedExerciseIds: [],

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
          exercises: state.exercises.filter((ex) => ex.id !== id),
          deletedExerciseIds: state.deletedExerciseIds.includes(id)
            ? state.deletedExerciseIds
            : [...state.deletedExerciseIds, id],
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
        set({
          exercises: DEFAULT_SYSTEM_EXERCISES,
          deletedExerciseIds: [],
        });
      },
    }),
    {
      name: "liftr-exercises-storage",
      version: 4,
      migrate: (persistedState: unknown) => {
        const prev = persistedState as
          | { exercises?: Exercise[]; deletedExerciseIds?: string[] }
          | undefined;
        return mergeSystemAndCustom(
          prev?.exercises || [],
          prev?.deletedExerciseIds || []
        );
      },
      merge: (persistedState: unknown, currentState: ExerciseStore) => {
        const prev = persistedState as
          | { exercises?: Exercise[]; deletedExerciseIds?: string[] }
          | undefined;
        const merged = mergeSystemAndCustom(
          prev?.exercises || [],
          prev?.deletedExerciseIds || []
        );
        return {
          ...currentState,
          ...merged,
        };
      },
      storage: createJSONStorage(() => localStorage),
    }
  )
);
