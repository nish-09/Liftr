import { WorkoutSessionItem, Exercise } from "@/types";

export type MuscleId =
  | "chest"
  | "front_delts"
  | "rear_delts"
  | "biceps"
  | "triceps"
  | "forearms"
  | "upper_back"
  | "lats"
  | "lower_back"
  | "abs"
  | "obliques"
  | "quadriceps"
  | "hamstrings"
  | "glutes"
  | "calves";

export interface MuscleMeta {
  id: MuscleId;
  name: string;
  anatomicalName: string;
  view: "front" | "back" | "both";
  defaultWeeklyTarget: number; // working sets per week
  description: string;
}

export const MUSCLE_REGISTRY: Record<MuscleId, MuscleMeta> = {
  chest: {
    id: "chest",
    name: "Chest",
    anatomicalName: "Pectoralis Major & Minor",
    view: "front",
    defaultWeeklyTarget: 12,
    description: "Horizontal pressing and adduction strength across upper and mid chest.",
  },
  front_delts: {
    id: "front_delts",
    name: "Front & Lateral Shoulders",
    anatomicalName: "Anterior & Lateral Deltoids",
    view: "front",
    defaultWeeklyTarget: 10,
    description: "Vertical pressing, abduction, and overhead shoulder stability.",
  },
  rear_delts: {
    id: "rear_delts",
    name: "Rear Shoulders",
    anatomicalName: "Posterior Deltoids",
    view: "back",
    defaultWeeklyTarget: 8,
    description: "Shoulder horizontal abduction and scapular retraction health.",
  },
  biceps: {
    id: "biceps",
    name: "Biceps",
    anatomicalName: "Biceps Brachii & Brachialis",
    view: "front",
    defaultWeeklyTarget: 10,
    description: "Elbow flexion and forearm supination.",
  },
  triceps: {
    id: "triceps",
    name: "Triceps",
    anatomicalName: "Triceps Brachii (Long, Lateral, Medial)",
    view: "back",
    defaultWeeklyTarget: 10,
    description: "Elbow extension and overhead lockout power.",
  },
  forearms: {
    id: "forearms",
    name: "Forearms",
    anatomicalName: "Brachioradialis & Wrist Flexors/Extensors",
    view: "both",
    defaultWeeklyTarget: 6,
    description: "Grip strength, wrist flexion/extension, and isometric holds.",
  },
  upper_back: {
    id: "upper_back",
    name: "Upper Back",
    anatomicalName: "Trapezius & Rhomboids",
    view: "back",
    defaultWeeklyTarget: 12,
    description: "Scapular retraction, elevation, and postural thickness.",
  },
  lats: {
    id: "lats",
    name: "Lats",
    anatomicalName: "Latissimus Dorsi",
    view: "back",
    defaultWeeklyTarget: 12,
    description: "Vertical and horizontal pulling power, V-taper development.",
  },
  lower_back: {
    id: "lower_back",
    name: "Lower Back",
    anatomicalName: "Erector Spinae",
    view: "back",
    defaultWeeklyTarget: 8,
    description: "Spinal extension, hip-hinge bracing, and axial load stability.",
  },
  abs: {
    id: "abs",
    name: "Abs",
    anatomicalName: "Rectus Abdominis",
    view: "front",
    defaultWeeklyTarget: 8,
    description: "Spinal flexion, anti-extension core rigidity.",
  },
  obliques: {
    id: "obliques",
    name: "Obliques",
    anatomicalName: "External & Internal Obliques",
    view: "front",
    defaultWeeklyTarget: 6,
    description: "Rotational stability and anti-lateral flexion.",
  },
  quadriceps: {
    id: "quadriceps",
    name: "Quadriceps",
    anatomicalName: "Rectus Femoris, Vastus Lateralis/Medialis",
    view: "front",
    defaultWeeklyTarget: 12,
    description: "Knee extension and athletic propulsion.",
  },
  hamstrings: {
    id: "hamstrings",
    name: "Hamstrings",
    anatomicalName: "Biceps Femoris & Semitendinosus",
    view: "back",
    defaultWeeklyTarget: 10,
    description: "Knee flexion, hip extension, and sprinting deceleration.",
  },
  glutes: {
    id: "glutes",
    name: "Glutes",
    anatomicalName: "Gluteus Maximus & Medius",
    view: "back",
    defaultWeeklyTarget: 10,
    description: "Primary hip extension, pelvic stability, and rotational torque.",
  },
  calves: {
    id: "calves",
    name: "Calves",
    anatomicalName: "Gastrocnemius & Soleus",
    view: "both",
    defaultWeeklyTarget: 8,
    description: "Plantar flexion and ankle stability.",
  },
};

export interface MuscleCoverageData {
  muscleId: MuscleId;
  name: string;
  anatomicalName: string;
  view: "front" | "back" | "both";
  completedWorkingSets: number;
  targetWorkingSets: number;
  coveragePercentage: number; // capped at 100 for display
  rawCoveragePercentage: number; // uncapped
  color: string;
  statusText: string;
  contributingExercises: { exerciseName: string; setsCount: number; volume: number }[];
}

/**
 * Returns color code based on training coverage percentage:
 * - Grey: 0% (No training recorded)
 * - Muted red: 1–24%
 * - Orange: 25–49%
 * - Yellow: 50–74%
 * - Light green: 75–99%
 * - Bright green: 100%+
 */
export function getCoverageColor(coveragePercent: number): {
  color: string;
  statusText: string;
} {
  if (coveragePercent <= 0) {
    return { color: "#2A2A2A", statusText: "No Training Recorded" };
  }
  if (coveragePercent < 25) {
    return { color: "#A8382B", statusText: "Neglected / Under-Stimulated" };
  }
  if (coveragePercent < 50) {
    return { color: "#E97860", statusText: "Low Coverage" };
  }
  if (coveragePercent < 75) {
    return { color: "#E9D65B", statusText: "Moderate Volume" };
  }
  if (coveragePercent < 100) {
    return { color: "#83D19B", statusText: "Near Target" };
  }
  return { color: "#60C27D", statusText: "Target Achieved" };
}

/**
 * Maps an exercise to the fine-grained MuscleId targets with primary (1.0) and secondary (0.5) weights
 */
export function getExerciseMuscleContributions(
  exercise: Exercise
): { muscleId: MuscleId; factor: number }[] {
  const name = exercise.name.toLowerCase();
  const primary = exercise.primaryMuscleGroup;
  const secondary = exercise.secondaryMuscleGroups || [];

  const results: { muscleId: MuscleId; factor: number }[] = [];

  // 1. High-precision name-based matching for composite compound movements
  if (name.includes("bench press") || name.includes("chest flye") || name.includes("push up")) {
    results.push({ muscleId: "chest", factor: 1.0 });
    results.push({ muscleId: "front_delts", factor: 0.5 });
    results.push({ muscleId: "triceps", factor: 0.5 });
    return results;
  }

  if (name.includes("overhead press") || name.includes("military press") || name.includes("shoulder press")) {
    results.push({ muscleId: "front_delts", factor: 1.0 });
    results.push({ muscleId: "triceps", factor: 0.5 });
    results.push({ muscleId: "upper_back", factor: 0.3 });
    return results;
  }

  if (name.includes("lateral raise")) {
    results.push({ muscleId: "front_delts", factor: 1.0 });
    return results;
  }

  if (name.includes("face pull") || name.includes("rear delt")) {
    results.push({ muscleId: "rear_delts", factor: 1.0 });
    results.push({ muscleId: "upper_back", factor: 0.5 });
    return results;
  }

  if (name.includes("deadlift") || name.includes("rdl") || name.includes("romanian")) {
    results.push({ muscleId: "hamstrings", factor: 1.0 });
    results.push({ muscleId: "glutes", factor: 0.8 });
    results.push({ muscleId: "lower_back", factor: 1.0 });
    results.push({ muscleId: "upper_back", factor: 0.5 });
    results.push({ muscleId: "forearms", factor: 0.4 });
    return results;
  }

  if (name.includes("squat") || name.includes("leg press") || name.includes("leg extension")) {
    results.push({ muscleId: "quadriceps", factor: 1.0 });
    results.push({ muscleId: "glutes", factor: 0.5 });
    return results;
  }

  if (name.includes("hip thrust") || name.includes("glute bridge")) {
    results.push({ muscleId: "glutes", factor: 1.0 });
    results.push({ muscleId: "hamstrings", factor: 0.5 });
    return results;
  }

  if (name.includes("leg curl")) {
    results.push({ muscleId: "hamstrings", factor: 1.0 });
    return results;
  }

  if (name.includes("pull-up") || name.includes("pulldown") || name.includes("chin-up")) {
    results.push({ muscleId: "lats", factor: 1.0 });
    results.push({ muscleId: "upper_back", factor: 0.5 });
    results.push({ muscleId: "biceps", factor: 0.5 });
    results.push({ muscleId: "forearms", factor: 0.4 });
    return results;
  }

  if (name.includes("row")) {
    results.push({ muscleId: "upper_back", factor: 1.0 });
    results.push({ muscleId: "lats", factor: 0.8 });
    results.push({ muscleId: "biceps", factor: 0.5 });
    results.push({ muscleId: "rear_delts", factor: 0.5 });
    return results;
  }

  if (name.includes("bicep") || name.includes("curl") && !name.includes("leg") && !name.includes("wrist")) {
    results.push({ muscleId: "biceps", factor: 1.0 });
    results.push({ muscleId: "forearms", factor: 0.4 });
    return results;
  }

  if (name.includes("tricep") || name.includes("pushdown") || name.includes("skull crusher")) {
    results.push({ muscleId: "triceps", factor: 1.0 });
    return results;
  }

  if (name.includes("calf") || name.includes("calves")) {
    results.push({ muscleId: "calves", factor: 1.0 });
    return results;
  }

  if (name.includes("crunch") || name.includes("leg raise") || name.includes("plank")) {
    results.push({ muscleId: "abs", factor: 1.0 });
    results.push({ muscleId: "obliques", factor: 0.5 });
    return results;
  }

  if (name.includes("wrist") || name.includes("forearm")) {
    results.push({ muscleId: "forearms", factor: 1.0 });
    return results;
  }

  // 2. Fallback to Primary Muscle Group
  switch (primary) {
    case "chest":
      results.push({ muscleId: "chest", factor: 1.0 });
      break;
    case "back":
      results.push({ muscleId: "upper_back", factor: 0.6 });
      results.push({ muscleId: "lats", factor: 0.6 });
      results.push({ muscleId: "lower_back", factor: 0.4 });
      break;
    case "shoulders":
      results.push({ muscleId: "front_delts", factor: 0.7 });
      results.push({ muscleId: "rear_delts", factor: 0.5 });
      break;
    case "biceps":
      results.push({ muscleId: "biceps", factor: 1.0 });
      break;
    case "triceps":
      results.push({ muscleId: "triceps", factor: 1.0 });
      break;
    case "forearms":
      results.push({ muscleId: "forearms", factor: 1.0 });
      break;
    case "quadriceps":
      results.push({ muscleId: "quadriceps", factor: 1.0 });
      break;
    case "hamstrings":
      results.push({ muscleId: "hamstrings", factor: 1.0 });
      break;
    case "glutes":
      results.push({ muscleId: "glutes", factor: 1.0 });
      break;
    case "calves":
      results.push({ muscleId: "calves", factor: 1.0 });
      break;
    case "abs":
      results.push({ muscleId: "abs", factor: 1.0 });
      break;
    case "full_body":
      results.push({ muscleId: "chest", factor: 0.4 });
      results.push({ muscleId: "upper_back", factor: 0.4 });
      results.push({ muscleId: "quadriceps", factor: 0.4 });
      results.push({ muscleId: "hamstrings", factor: 0.4 });
      break;
  }

  // 3. Add Secondary muscles
  secondary.forEach((sec) => {
    switch (sec) {
      case "triceps":
        if (!results.some((r) => r.muscleId === "triceps")) results.push({ muscleId: "triceps", factor: 0.5 });
        break;
      case "biceps":
        if (!results.some((r) => r.muscleId === "biceps")) results.push({ muscleId: "biceps", factor: 0.5 });
        break;
      case "shoulders":
        if (!results.some((r) => r.muscleId === "front_delts")) results.push({ muscleId: "front_delts", factor: 0.5 });
        break;
      case "back":
        if (!results.some((r) => r.muscleId === "upper_back")) results.push({ muscleId: "upper_back", factor: 0.5 });
        break;
      case "forearms":
        if (!results.some((r) => r.muscleId === "forearms")) results.push({ muscleId: "forearms", factor: 0.5 });
        break;
      case "glutes":
        if (!results.some((r) => r.muscleId === "glutes")) results.push({ muscleId: "glutes", factor: 0.5 });
        break;
      case "hamstrings":
        if (!results.some((r) => r.muscleId === "hamstrings")) results.push({ muscleId: "hamstrings", factor: 0.5 });
        break;
      case "abs":
        if (!results.some((r) => r.muscleId === "abs")) results.push({ muscleId: "abs", factor: 0.5 });
        break;
    }
  });

  return results;
}

/**
 * Calculates complete 2D Muscle Heatmap training coverage for all 15 muscle groups
 */
export function calculateMuscleHeatmap(
  sessions: WorkoutSessionItem[],
  exercises: Exercise[],
  daysInPeriod: number = 7,
  customWeeklyTargets?: Partial<Record<MuscleId, number>>
): Record<MuscleId, MuscleCoverageData> {
  const weeks = Math.max(1, daysInPeriod / 7);

  // Initialize accumulators
  const setsMap: Record<MuscleId, number> = {
    chest: 0,
    front_delts: 0,
    rear_delts: 0,
    biceps: 0,
    triceps: 0,
    forearms: 0,
    upper_back: 0,
    lats: 0,
    lower_back: 0,
    abs: 0,
    obliques: 0,
    quadriceps: 0,
    hamstrings: 0,
    glutes: 0,
    calves: 0,
  };

  const exerciseMap: Record<
    MuscleId,
    Record<string, { exerciseName: string; setsCount: number; volume: number }>
  > = {
    chest: {},
    front_delts: {},
    rear_delts: {},
    biceps: {},
    triceps: {},
    forearms: {},
    upper_back: {},
    lats: {},
    lower_back: {},
    abs: {},
    obliques: {},
    quadriceps: {},
    hamstrings: {},
    glutes: {},
    calves: {},
  };

  // Traverse sessions and completed non-warmup sets
  sessions.forEach((session) => {
    if (session.status !== "completed") return;

    session.exercises.forEach((sessEx) => {
      const exMeta = exercises.find((e) => e.id === sessEx.exerciseId);
      if (!exMeta) return;

      const completedSets = sessEx.sets.filter((s) => s.isCompleted && s.setType !== "warmup");
      if (completedSets.length === 0) return;

      const contributions = getExerciseMuscleContributions(exMeta);

      contributions.forEach(({ muscleId, factor }) => {
        const weightedSets = completedSets.length * factor;
        setsMap[muscleId] += weightedSets;

        const volume = completedSets.reduce((acc, s) => acc + (s.weight || 0) * (s.reps || 0), 0) * factor;

        if (!exerciseMap[muscleId][exMeta.id]) {
          exerciseMap[muscleId][exMeta.id] = {
            exerciseName: exMeta.name,
            setsCount: 0,
            volume: 0,
          };
        }
        exerciseMap[muscleId][exMeta.id].setsCount += completedSets.length;
        exerciseMap[muscleId][exMeta.id].volume += volume;
      });
    });
  });

  // Build result map
  const result = {} as Record<MuscleId, MuscleCoverageData>;

  (Object.keys(MUSCLE_REGISTRY) as MuscleId[]).forEach((id) => {
    const meta = MUSCLE_REGISTRY[id];
    const weeklyTarget = customWeeklyTargets?.[id] || meta.defaultWeeklyTarget;
    const targetWorkingSets = Number((weeklyTarget * weeks).toFixed(1));
    const completedWorkingSets = Number(setsMap[id].toFixed(1));

    const rawCoverage =
      targetWorkingSets > 0
        ? Number(((completedWorkingSets / targetWorkingSets) * 100).toFixed(1))
        : 0;

    const coveragePercentage = Math.min(100, Math.round(rawCoverage));
    const { color, statusText } = getCoverageColor(rawCoverage);

    const contributingExercises = Object.values(exerciseMap[id]).sort(
      (a, b) => b.setsCount - a.setsCount
    );

    result[id] = {
      muscleId: id,
      name: meta.name,
      anatomicalName: meta.anatomicalName,
      view: meta.view,
      completedWorkingSets,
      targetWorkingSets,
      coveragePercentage,
      rawCoveragePercentage: rawCoverage,
      color,
      statusText,
      contributingExercises,
    };
  });

  return result;
}
