export interface ProgressionInput {
  exerciseId: string;
  setNumber: number;
  minReps: number;
  maxReps: number;
  increment: number;
  previousWeight?: number | null;
  previousReps?: number | null;
  allPreviousSetsHitMax?: boolean;
  progressionEnabled?: boolean;
}

export interface ProgressionSuggestion {
  targetWeight: number;
  targetReps: number;
  explanation: string;
  reasonType: "FIRST_TIME" | "REP_PROGRESSION" | "WEIGHT_INCREASE" | "REPEAT_TARGET" | "DISABLED";
}

/**
 * Deterministic Transparent Double Progression Engine
 *
 * Rules:
 * Rule 1: Previous 10 kg x 8 reps, Range 8-12 -> Suggest 10 kg x 9 reps.
 * Rule 2: Previous 10 kg x 10 reps -> Suggest 10 kg x 11 reps.
 * Rule 3: When all prescribed working sets reach 12 reps: Previous 10 kg x 12 reps ->
 *         Suggest 12.5 kg x 8 reps (assuming 2.5 kg increment).
 * Rule 4: If user misses previous target (e.g. hit fewer than minReps or failed to progress),
 *         recommend repeating previous target.
 * Rule 5: For first-time exercises, leave inputs empty or prefill 0 and allow manual entry.
 */
export function calculateProgression(input: ProgressionInput): ProgressionSuggestion {
  const {
    minReps = 8,
    maxReps = 12,
    increment = 2.5,
    previousWeight,
    previousReps,
    allPreviousSetsHitMax = false,
    progressionEnabled = true,
  } = input;

  // If user disabled suggestions
  if (!progressionEnabled) {
    return {
      targetWeight: previousWeight || 0,
      targetReps: previousReps || minReps,
      explanation: "Progression suggestions disabled in settings.",
      reasonType: "DISABLED",
    };
  }

  // Rule 5: First-time exercise (no historical record)
  if (previousWeight === undefined || previousWeight === null || previousWeight === 0 || !previousReps) {
    return {
      targetWeight: 0,
      targetReps: minReps,
      explanation: "First time tracking this movement. Perform your baseline sets to establish targets.",
      reasonType: "FIRST_TIME",
    };
  }

  // Rule 3: All working sets hit max reps ceiling -> Increase weight, reset reps to minReps
  if (allPreviousSetsHitMax || previousReps >= maxReps) {
    const nextWeight = Number((previousWeight + increment).toFixed(2));
    return {
      targetWeight: nextWeight,
      targetReps: minReps,
      explanation: `Prescribed ceiling of ${maxReps} reps reached! Weight stepped up by +${increment} kg. Target: ${minReps} reps.`,
      reasonType: "WEIGHT_INCREASE",
    };
  }

  // Rule 4: If previous reps were below the minimum rep bracket (missed target)
  if (previousReps < minReps) {
    return {
      targetWeight: previousWeight,
      targetReps: minReps,
      explanation: `Rep floor not reached last session (${previousReps}/${minReps} reps). Repeat weight and aim for ${minReps} reps.`,
      reasonType: "REPEAT_TARGET",
    };
  }

  // Rule 1 & 2: Rep progression within the target bracket
  const nextReps = Math.min(maxReps, previousReps + 1);
  return {
    targetWeight: previousWeight,
    targetReps: nextReps,
    explanation: `Double progression active: maintain ${previousWeight} kg and push for +1 rep (${nextReps} reps).`,
    reasonType: "REP_PROGRESSION",
  };
}
