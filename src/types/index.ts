export type MuscleGroup =
  | "chest"
  | "back"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "forearms"
  | "quadriceps"
  | "hamstrings"
  | "glutes"
  | "calves"
  | "abs"
  | "full_body";

export type Equipment =
  | "barbell"
  | "dumbbell"
  | "cable"
  | "machine"
  | "bodyweight"
  | "smith_machine"
  | "other";

export type WeightUnit = "kg" | "lb";
export type HeightUnit = "cm" | "ft_in";
export type MeasurementUnit = "cm" | "in";
export type SetType = "normal" | "warmup" | "drop" | "failure";
export type GoalType = "gain" | "loss" | "maintenance";
export type SessionStatus = "active" | "completed" | "discarded";

export interface Exercise {
  id: string;
  userId?: string | null;
  name: string;
  primaryMuscleGroup: MuscleGroup;
  secondaryMuscleGroups: string[];
  equipment: Equipment;
  weightUnit: WeightUnit;
  defaultRestDuration: number; // in seconds
  progressionIncrement: number;
  description?: string | null;
  isSystem: boolean;
  isFavorite: boolean;
  isArchived: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SetLogItem {
  id: string;
  sessionExerciseId: string;
  sessionId: string;
  exerciseId: string;
  setNumber: number;
  setType: SetType;
  weight: number;
  reps: number;
  isCompleted: boolean;
  rpe?: number | null;
  previousWeight?: number | null;
  previousReps?: number | null;
  targetWeight?: number | null;
  targetReps?: number | null;
  notes?: string | null;
}

export interface SessionExerciseItem {
  id: string;
  sessionId: string;
  exerciseId: string;
  orderInSession: number;
  notes?: string | null;
  isCompleted: boolean;
  exercise?: Exercise;
  sets: SetLogItem[];
}

export interface WorkoutSessionItem {
  id: string;
  userId: string;
  planId?: string | null;
  planDayId?: string | null;
  phaseId?: string | null;
  name: string;
  startedAt: string;
  completedAt?: string | null;
  durationSeconds: number;
  status: SessionStatus;
  notes?: string | null;
  totalVolume: number;
  idempotencyKey?: string | null;
  exercises: SessionExerciseItem[];
}

export interface PlanExerciseItem {
  id: string;
  planDayId: string;
  exerciseId: string;
  orderInDay: number;
  targetSets: number;
  minReps: number;
  maxReps: number;
  defaultWeight: number;
  restDuration: number;
  progressionIncrement: number;
  progressionEnabled: boolean;
  notes?: string | null;
  exercise?: Exercise;
}

export interface PlanDayItem {
  id: string;
  planId: string;
  dayNumber: number;
  name: string;
  notes?: string | null;
  exercises: PlanExerciseItem[];
}

export interface WorkoutPlanItem {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  phaseId?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  days: PlanDayItem[];
}

export interface WeightLogItem {
  id: string;
  userId: string;
  weight: number;
  unit: WeightUnit;
  recordedAt: string;
  notes?: string | null;
}

export interface BodyMeasurementItem {
  id: string;
  userId: string;
  measurementType:
    | "chest"
    | "waist"
    | "left_arm"
    | "right_arm"
    | "left_thigh"
    | "right_thigh"
    | "hips"
    | "shoulders"
    | "calves"
    | "custom";
  customName?: string | null;
  value: number;
  unit: MeasurementUnit;
  recordedAt: string;
  notes?: string | null;
}

export interface UserBodyProfile {
  id: string;
  userId: string;
  height?: number | null; // in cm
  heightUnit: HeightUnit;
  startingWeight?: number | null;
  targetWeight?: number | null;
  targetDate?: string | null;
  goalType: GoalType;
}

export interface UserPreferences {
  id: string;
  userId: string;
  weightUnit: WeightUnit;
  dateFormat: string;
  timeZone: string;
  defaultRestDuration: number;
  defaultRepRangeMin: number;
  defaultRepRangeMax: number;
  defaultProgressionIncrement: number;
  progressionSuggestionsEnabled: boolean;
  timerSoundEnabled: boolean;
  timerVibrateEnabled: boolean;
  browserNotificationsEnabled: boolean;
}

export interface PersonalRecordItem {
  id: string;
  userId: string;
  exerciseId: string;
  exerciseName?: string;
  prType: "max_weight" | "max_reps" | "max_1rm" | "max_volume";
  value: number;
  weight: number;
  reps: number;
  achievedAt: string;
}
