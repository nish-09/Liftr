/**
 * Strength Calculations and Epley 1RM Formula
 */

/**
 * Calculates Estimated One Rep Max (1RM) using the Epley formula:
 * 1RM = Weight * (1 + Reps / 30)
 */
export function calculate1RM(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0;
  if (reps === 1) return weight;
  const oneRM = weight * (1 + reps / 30);
  return Number(oneRM.toFixed(1));
}

/**
 * Calculates total training volume:
 * Volume = Sum of (Weight * Reps) for completed non-warmup sets.
 */
export function calculateVolume(
  sets: { weight: number; reps: number; isCompleted: boolean; setType?: string }[]
): number {
  return sets.reduce((acc, set) => {
    if (set.isCompleted && set.setType !== "warmup") {
      return acc + (set.weight || 0) * (set.reps || 0);
    }
    return acc;
  }, 0);
}

/**
 * BMI Calculator:
 * BMI = Weight (kg) / (Height (m))^2
 */
export function calculateBMI(weightKg: number, heightCm: number): {
  bmi: number;
  category: "Underweight" | "Normal" | "Overweight" | "Obesity";
  color: string;
} {
  if (weightKg <= 0 || heightCm <= 0) {
    return { bmi: 0, category: "Normal", color: "#A1A9A8" };
  }

  const heightM = heightCm / 100;
  const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));

  if (bmi < 18.5) {
    return { bmi, category: "Underweight", color: "#E9D65B" };
  }
  if (bmi <= 24.9) {
    return { bmi, category: "Normal", color: "#60C27D" };
  }
  if (bmi <= 29.9) {
    return { bmi, category: "Overweight", color: "#E97860" };
  }
  return { bmi, category: "Obesity", color: "#E97860" };
}
