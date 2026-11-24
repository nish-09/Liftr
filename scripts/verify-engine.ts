import { calculateProgression } from "../src/lib/progression/engine";
import { calculate1RM, calculateBMI, calculateVolume } from "../src/lib/calculations/strength";

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

  console.log(`\nTests Summary: ${passed} passed, ${failed} failed.\n`);
  if (failed > 0) process.exit(1);
}

runTests();
