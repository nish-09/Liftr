import { calculateProgression } from "../src/lib/progression/engine";
import { calculate1RM, calculateBMI, calculateVolume } from "../src/lib/calculations/strength";
import {
  getCoverageColor,
  calculateMuscleHeatmap,
  getExerciseMuscleContributions,
} from "../src/lib/calculations/muscleHeatmap";
import { Exercise, WorkoutSessionItem } from "../src/types";

function runTests() {
  console.log("=== RUNNING LIFTR VERIFICATION TESTS ===\n");
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  // --- Progressive Overload Rule Tests ---

  // Rule 1: Previous 10 kg x 8 reps, Target range 8-12 -> Suggest 10 kg x 9 reps
  const rule1 = calculateProgression({
    exerciseId: "test-ex",
    setNumber: 1,
    minReps: 8,
    maxReps: 12,
    increment: 2.5,
    previousWeight: 10,
    previousReps: 8,
    allPreviousSetsHitMax: false,
    progressionEnabled: true,
  });
  assert(
    rule1.targetWeight === 10 && rule1.targetReps === 9 && rule1.reasonType === "REP_PROGRESSION",
    "Rule 1: Previous 10kg x 8 reps suggests 10kg x 9 reps"
  );

  // Rule 2: Previous 10 kg x 10 reps -> Suggest 10 kg x 11 reps
  const rule2 = calculateProgression({
    exerciseId: "test-ex",
    setNumber: 1,
    minReps: 8,
    maxReps: 12,
    increment: 2.5,
    previousWeight: 10,
    previousReps: 10,
    allPreviousSetsHitMax: false,
    progressionEnabled: true,
  });
  assert(
    rule2.targetWeight === 10 && rule2.targetReps === 11 && rule2.reasonType === "REP_PROGRESSION",
    "Rule 2: Previous 10kg x 10 reps suggests 10kg x 11 reps"
  );

  // Rule 3: All working sets reach 12 reps -> Suggest 12.5 kg x 8 reps (+2.5 kg increment)
  const rule3 = calculateProgression({
    exerciseId: "test-ex",
    setNumber: 1,
    minReps: 8,
    maxReps: 12,
    increment: 2.5,
    previousWeight: 10,
    previousReps: 12,
    allPreviousSetsHitMax: true,
    progressionEnabled: true,
  });
  assert(
    rule3.targetWeight === 12.5 && rule3.targetReps === 8 && rule3.reasonType === "WEIGHT_INCREASE",
    "Rule 3: Reaching rep ceiling (12 reps) increases weight by +2.5kg to 12.5kg x 8 reps"
  );

  // Rule 4: Missed previous target (e.g. hit 6 reps when min is 8) -> Repeat target
  const rule4 = calculateProgression({
    exerciseId: "test-ex",
    setNumber: 1,
    minReps: 8,
    maxReps: 12,
    increment: 2.5,
    previousWeight: 10,
    previousReps: 6,
    allPreviousSetsHitMax: false,
    progressionEnabled: true,
  });
  assert(
    rule4.targetWeight === 10 && rule4.targetReps === 8 && rule4.reasonType === "REPEAT_TARGET",
    "Rule 4: Missed rep floor recommends repeating previous weight at 8 reps"
  );

  // Rule 5: First-time exercise -> 0kg target allowing manual entry
  const rule5 = calculateProgression({
    exerciseId: "new-ex",
    setNumber: 1,
    minReps: 8,
    maxReps: 12,
    increment: 2.5,
    previousWeight: null,
    previousReps: null,
    allPreviousSetsHitMax: false,
    progressionEnabled: true,
  });
  assert(
    rule5.targetWeight === 0 && rule5.reasonType === "FIRST_TIME",
    "Rule 5: First-time exercise establishes baseline with open manual entry"
  );

  // --- Strength & 1RM Calculations ---
  // Epley Formula: 1RM = Weight * (1 + Reps / 30)
  // For 100 kg x 10 reps -> 100 * (1 + 10 / 30) = 133.3 kg
  const epleyTest = calculate1RM(100, 10);
  assert(epleyTest === 133.3, "Epley 1RM: 100kg x 10 reps equals 133.3kg");

  // Single rep test
  const singleRep = calculate1RM(140, 1);
  assert(singleRep === 140, "Epley 1RM: 1 rep equals exact weight");

  // Volume Calculation: sum of weight * reps for completed non-warmup sets
  const volumeTest = calculateVolume([
    { weight: 100, reps: 5, isCompleted: true, setType: "normal" }, // 500
    { weight: 50, reps: 10, isCompleted: true, setType: "warmup" }, // 0 (excluded)
    { weight: 80, reps: 8, isCompleted: false, setType: "normal" }, // 0 (incomplete)
    { weight: 80, reps: 8, isCompleted: true, setType: "normal" }, // 640
  ]);
  assert(volumeTest === 1140, "Training Volume: accurately computes completed working sets (1140 kg)");

  // --- BMI Calculations ---
  // Weight 80 kg, Height 180 cm -> 80 / (1.80^2) = 24.7 (Normal)
  const bmiNormal = calculateBMI(80, 180);
  assert(
    bmiNormal.bmi === 24.7 && bmiNormal.category === "Normal",
    "BMI: 80kg at 180cm equals 24.7 (Normal category)"
  );

  // Underweight: 50 kg at 180 cm -> 15.4
  const bmiUnder = calculateBMI(50, 180);
  assert(
    bmiUnder.bmi === 15.4 && bmiUnder.category === "Underweight",
    "BMI: 50kg at 180cm equals Underweight"
  );

  // Overweight: 90 kg at 180 cm -> 27.8
  const bmiOver = calculateBMI(90, 180);
  assert(
    bmiOver.bmi === 27.8 && bmiOver.category === "Overweight",
    "BMI: 90kg at 180cm equals Overweight"
  );

  // --- Muscle Heatmap Calculation Tests ---

  // Color Coding Scale checks
  const colGrey = getCoverageColor(0);
  assert(colGrey.color === "#2A2A2A", "Heatmap Color: 0% maps to Grey (#2A2A2A)");

  const colMutedRed = getCoverageColor(15);
  assert(colMutedRed.color === "#A8382B", "Heatmap Color: 15% maps to Muted Red (#A8382B)");

  const colOrange = getCoverageColor(35);
  assert(colOrange.color === "#E97860", "Heatmap Color: 35% maps to Orange (#E97860)");

  const colYellow = getCoverageColor(60);
  assert(colYellow.color === "#E9D65B", "Heatmap Color: 60% maps to Yellow (#E9D65B)");

  const colLightGreen = getCoverageColor(85);
  assert(colLightGreen.color === "#83D19B", "Heatmap Color: 85% maps to Light Green (#83D19B)");

  const colBrightGreen = getCoverageColor(115);
  assert(colBrightGreen.color === "#60C27D", "Heatmap Color: 115% maps to Bright Green (#60C27D)");

  // Primary & Secondary Exercise Mapping Test
  const mockBenchPress: Exercise = {
    id: "ex-bench-test",
    name: "Barbell Bench Press",
    primaryMuscleGroup: "chest",
    secondaryMuscleGroups: ["triceps", "shoulders"],
    equipment: "barbell",
    weightUnit: "kg",
    defaultRestDuration: 120,
    progressionIncrement: 2.5,
    isSystem: true,
    isFavorite: true,
    isArchived: false,
  };

  const benchContrib = getExerciseMuscleContributions(mockBenchPress);
  const chestFactor = benchContrib.find((c) => c.muscleId === "chest")?.factor;
  const tricepFactor = benchContrib.find((c) => c.muscleId === "triceps")?.factor;
  const frontDeltFactor = benchContrib.find((c) => c.muscleId === "front_delts")?.factor;

  assert(chestFactor === 1.0, "Muscle Mapping: Primary chest gets 1.0 full contribution");
  assert(tricepFactor === 0.5, "Muscle Mapping: Secondary tricep gets 0.5 fractional contribution");
  assert(frontDeltFactor === 0.5, "Muscle Mapping: Secondary front deltoid gets 0.5 fractional contribution");

  // Full Session Heatmap Calculation with Warmup Exclusion Test
  const mockSession: WorkoutSessionItem = {
    id: "test-sess-heatmap",
    userId: "test-user",
    name: "Chest & Arms Session",
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    durationSeconds: 3600,
    status: "completed",
    totalVolume: 5000,
    exercises: [
      {
        id: "sex-test-1",
        sessionId: "test-sess-heatmap",
        exerciseId: "ex-bench-test",
        orderInSession: 1,
        isCompleted: true,
        sets: [
          {
            id: "s-warmup",
            sessionExerciseId: "sex-test-1",
            sessionId: "test-sess-heatmap",
            exerciseId: "ex-bench-test",
            setNumber: 1,
            setType: "warmup", // MUST BE EXCLUDED
            weight: 40,
            reps: 10,
            isCompleted: true,
          },
          {
            id: "s-work-1",
            sessionExerciseId: "sex-test-1",
            sessionId: "test-sess-heatmap",
            exerciseId: "ex-bench-test",
            setNumber: 2,
            setType: "normal", // 1.0 chest set
            weight: 80,
            reps: 8,
            isCompleted: true,
          },
          {
            id: "s-work-2",
            sessionExerciseId: "sex-test-1",
            sessionId: "test-sess-heatmap",
            exerciseId: "ex-bench-test",
            setNumber: 3,
            setType: "normal", // 1.0 chest set
            weight: 80,
            reps: 8,
            isCompleted: true,
          },
        ],
      },
    ],
  };

  // Run 7-day period calculation with weekly target of 12 sets for chest
  const heatmapResult = calculateMuscleHeatmap(
    [mockSession],
    [mockBenchPress],
    7,
    { chest: 12 }
  );

  // 2 completed working sets on chest out of target 12 = (2 / 12) * 100 = 16.7% (capped display 17%, Muted Red)
  const chestCoverage = heatmapResult.chest;
  assert(
    chestCoverage.completedWorkingSets === 2,
    "Heatmap: Accurately counts 2 completed working sets, excluding warmup"
  );
  assert(
    chestCoverage.targetWorkingSets === 12,
    "Heatmap: Target working sets equals 12"
  );
  assert(
    chestCoverage.coveragePercentage === 17,
    "Heatmap: Coverage percentage rounded to 17%"
  );
  assert(
    chestCoverage.color === "#A8382B",
    "Heatmap: 17% coverage assigned Muted Red color (#A8382B)"
  );

  console.log(`\nTests Summary: ${passed} passed, ${failed} failed.\n`);
  if (failed > 0) process.exit(1);
}

runTests();
