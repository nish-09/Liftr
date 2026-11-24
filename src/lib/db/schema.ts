import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  pgEnum,
  jsonb,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const muscleGroupEnum = pgEnum("muscle_group", [
  "chest",
  "back",
  "shoulders",
  "biceps",
  "triceps",
  "forearms",
  "quadriceps",
  "hamstrings",
  "glutes",
  "calves",
  "abs",
  "full_body",
]);

export const equipmentEnum = pgEnum("equipment", [
  "barbell",
  "dumbbell",
  "cable",
  "machine",
  "bodyweight",
  "smith_machine",
  "other",
]);

export const weightUnitEnum = pgEnum("weight_unit", ["kg", "lb"]);
export const heightUnitEnum = pgEnum("height_unit", ["cm", "ft_in"]);
export const measurementUnitEnum = pgEnum("measurement_unit", ["cm", "in"]);

export const goalTypeEnum = pgEnum("goal_type", [
  "gain",
  "loss",
  "maintenance",
]);

export const setTypeEnum = pgEnum("set_type", [
  "normal",
  "warmup",
  "drop",
  "failure",
]);

export const sessionStatusEnum = pgEnum("session_status", [
  "active",
  "completed",
  "discarded",
]);

export const prTypeEnum = pgEnum("pr_type", [
  "max_weight",
  "max_reps",
  "max_1rm",
  "max_volume",
]);

export const measurementTypeEnum = pgEnum("measurement_type", [
  "chest",
  "waist",
  "left_arm",
  "right_arm",
  "left_thigh",
  "right_thigh",
  "hips",
  "shoulders",
  "calves",
  "custom",
]);

// 1. Profiles Table
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().notNull(),
  email: text("email").notNull(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  experienceLevel: text("experience_level").default("intermediate"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 2. User Preferences
export const userPreferences = pgTable("user_preferences", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull().unique(),
  weightUnit: weightUnitEnum("weight_unit").default("kg").notNull(),
  dateFormat: text("date_format").default("YYYY-MM-DD").notNull(),
  timeZone: text("time_zone").default("UTC").notNull(),
  defaultRestDuration: integer("default_rest_duration").default(90).notNull(), // seconds
  defaultRepRangeMin: integer("default_rep_range_min").default(8).notNull(),
  defaultRepRangeMax: integer("default_rep_range_max").default(12).notNull(),
  defaultProgressionIncrement: numeric("default_progression_increment", { precision: 5, scale: 2 }).default("2.5").notNull(),
  progressionSuggestionsEnabled: boolean("progression_suggestions_enabled").default(true).notNull(),
  timerSoundEnabled: boolean("timer_sound_enabled").default(true).notNull(),
  timerVibrateEnabled: boolean("timer_vibrate_enabled").default(true).notNull(),
  browserNotificationsEnabled: boolean("browser_notifications_enabled").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 3. User Body Profiles
export const userBodyProfiles = pgTable("user_body_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull().unique(),
  height: numeric("height", { precision: 5, scale: 2 }), // in cm
  heightUnit: heightUnitEnum("height_unit").default("cm").notNull(),
  startingWeight: numeric("starting_weight", { precision: 5, scale: 2 }),
  targetWeight: numeric("target_weight", { precision: 5, scale: 2 }),
  targetDate: date("target_date"),
  goalType: goalTypeEnum("goal_type").default("gain").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 4. Weight Logs
export const weightLogs = pgTable("weight_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  weight: numeric("weight", { precision: 5, scale: 2 }).notNull(),
  unit: weightUnitEnum("unit").default("kg").notNull(),
  recordedAt: date("recorded_at").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 5. Body Measurements
export const bodyMeasurements = pgTable("body_measurements", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  measurementType: measurementTypeEnum("measurement_type").notNull(),
  customName: text("custom_name"),
  value: numeric("value", { precision: 5, scale: 2 }).notNull(),
  unit: measurementUnitEnum("unit").default("cm").notNull(),
  recordedAt: date("recorded_at").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 6. Exercises
export const exercises = pgTable("exercises", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }), // null if system exercise
  name: text("name").notNull(),
  primaryMuscleGroup: muscleGroupEnum("primary_muscle_group").notNull(),
  secondaryMuscleGroups: jsonb("secondary_muscle_groups").$type<string[]>().default([]).notNull(),
  equipment: equipmentEnum("equipment").notNull(),
  weightUnit: weightUnitEnum("weight_unit").default("kg").notNull(),
  defaultRestDuration: integer("default_rest_duration").default(90).notNull(),
  progressionIncrement: numeric("progression_increment", { precision: 5, scale: 2 }).default("2.5").notNull(),
  description: text("description"),
  isSystem: boolean("is_system").default(false).notNull(),
  isFavorite: boolean("is_favorite").default(false).notNull(),
  isArchived: boolean("is_archived").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 7. Training Phases
export const trainingPhases = pgTable("training_phases", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(), // Bulking, Recomp, Cutting, Strength, Custom
  description: text("description"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  isActive: boolean("is_active").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 8. Workout Plans
export const workoutPlans = pgTable("workout_plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  phaseId: uuid("phase_id").references(() => trainingPhases.id, { onDelete: "set null" }),
  isActive: boolean("is_active").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 9. Plan Days
export const planDays = pgTable("plan_days", {
  id: uuid("id").defaultRandom().primaryKey(),
  planId: uuid("plan_id").references(() => workoutPlans.id, { onDelete: "cascade" }).notNull(),
  dayNumber: integer("day_number").notNull(),
  name: text("name").notNull(), // e.g., "Push A - Chest & Triceps"
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 10. Plan Exercises
export const planExercises = pgTable("plan_exercises", {
  id: uuid("id").defaultRandom().primaryKey(),
  planDayId: uuid("plan_day_id").references(() => planDays.id, { onDelete: "cascade" }).notNull(),
  exerciseId: uuid("exercise_id").references(() => exercises.id, { onDelete: "restrict" }).notNull(),
  orderInDay: integer("order_in_day").notNull(),
  targetSets: integer("target_sets").default(3).notNull(),
  minReps: integer("min_reps").default(8).notNull(),
  maxReps: integer("max_reps").default(12).notNull(),
  defaultWeight: numeric("default_weight", { precision: 5, scale: 2 }).default("0").notNull(),
  restDuration: integer("rest_duration").default(90).notNull(),
  progressionIncrement: numeric("progression_increment", { precision: 5, scale: 2 }).default("2.5").notNull(),
  progressionEnabled: boolean("progression_enabled").default(true).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 11. Workout Sessions
export const workoutSessions = pgTable("workout_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  planId: uuid("plan_id").references(() => workoutPlans.id, { onDelete: "set null" }),
  planDayId: uuid("plan_day_id").references(() => planDays.id, { onDelete: "set null" }),
  phaseId: uuid("phase_id").references(() => trainingPhases.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  durationSeconds: integer("duration_seconds").default(0).notNull(),
  status: sessionStatusEnum("status").default("active").notNull(),
  notes: text("notes"),
  totalVolume: numeric("total_volume", { precision: 10, scale: 2 }).default("0").notNull(),
  idempotencyKey: text("idempotency_key").unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 12. Session Exercises
export const sessionExercises = pgTable("session_exercises", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id").references(() => workoutSessions.id, { onDelete: "cascade" }).notNull(),
  exerciseId: uuid("exercise_id").references(() => exercises.id, { onDelete: "restrict" }).notNull(),
  orderInSession: integer("order_in_session").notNull(),
  notes: text("notes"),
  isCompleted: boolean("is_completed").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 13. Set Logs (Each set is an independent row)
export const setLogs = pgTable("set_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionExerciseId: uuid("session_exercise_id").references(() => sessionExercises.id, { onDelete: "cascade" }).notNull(),
  sessionId: uuid("session_id").references(() => workoutSessions.id, { onDelete: "cascade" }).notNull(),
  exerciseId: uuid("exercise_id").references(() => exercises.id, { onDelete: "restrict" }).notNull(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  setNumber: integer("set_number").notNull(),
  setType: setTypeEnum("set_type").default("normal").notNull(),
  weight: numeric("weight", { precision: 6, scale: 2 }).notNull(),
  reps: integer("reps").notNull(),
  isCompleted: boolean("is_completed").default(false).notNull(),
  rpe: numeric("rpe", { precision: 3, scale: 1 }),
  previousWeight: numeric("previous_weight", { precision: 6, scale: 2 }),
  previousReps: integer("previous_reps"),
  targetWeight: numeric("target_weight", { precision: 6, scale: 2 }),
  targetReps: integer("target_reps"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 14. Personal Records
export const personalRecords = pgTable("personal_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  exerciseId: uuid("exercise_id").references(() => exercises.id, { onDelete: "cascade" }).notNull(),
  setLogId: uuid("set_log_id").references(() => setLogs.id, { onDelete: "cascade" }),
  sessionId: uuid("session_id").references(() => workoutSessions.id, { onDelete: "cascade" }),
  prType: prTypeEnum("pr_type").notNull(),
  value: numeric("value", { precision: 8, scale: 2 }).notNull(),
  weight: numeric("weight", { precision: 6, scale: 2 }).notNull(),
  reps: integer("reps").notNull(),
  achievedAt: timestamp("achieved_at", { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 15. Offline Sync Operations
export const offlineSyncOperations = pgTable("offline_sync_operations", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  clientOperationId: text("client_operation_id").notNull().unique(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  action: text("action").notNull(), // create, update, delete
  payload: jsonb("payload").notNull(),
  status: text("status").default("pending").notNull(), // pending, synced, failed
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  syncedAt: timestamp("synced_at", { withTimezone: true }),
});

// Relations
export const profilesRelations = relations(profiles, ({ one, many }) => ({
  preferences: one(userPreferences, {
    fields: [profiles.id],
    references: [userPreferences.userId],
  }),
  bodyProfile: one(userBodyProfiles, {
    fields: [profiles.id],
    references: [userBodyProfiles.userId],
  }),
  weightLogs: many(weightLogs),
  bodyMeasurements: many(bodyMeasurements),
  workoutSessions: many(workoutSessions),
  workoutPlans: many(workoutPlans),
  personalRecords: many(personalRecords),
}));

export const workoutPlansRelations = relations(workoutPlans, ({ one, many }) => ({
  user: one(profiles, {
    fields: [workoutPlans.userId],
    references: [profiles.id],
  }),
  phase: one(trainingPhases, {
    fields: [workoutPlans.phaseId],
    references: [trainingPhases.id],
  }),
  days: many(planDays),
}));

export const planDaysRelations = relations(planDays, ({ one, many }) => ({
  plan: one(workoutPlans, {
    fields: [planDays.planId],
    references: [workoutPlans.id],
  }),
  exercises: many(planExercises),
}));

export const planExercisesRelations = relations(planExercises, ({ one }) => ({
  planDay: one(planDays, {
    fields: [planExercises.planDayId],
    references: [planDays.id],
  }),
  exercise: one(exercises, {
    fields: [planExercises.exerciseId],
    references: [exercises.id],
  }),
}));

export const workoutSessionsRelations = relations(workoutSessions, ({ one, many }) => ({
  user: one(profiles, {
    fields: [workoutSessions.userId],
    references: [profiles.id],
  }),
  plan: one(workoutPlans, {
    fields: [workoutSessions.planId],
    references: [workoutPlans.id],
  }),
  exercises: many(sessionExercises),
  setLogs: many(setLogs),
}));

export const sessionExercisesRelations = relations(sessionExercises, ({ one, many }) => ({
  session: one(workoutSessions, {
    fields: [sessionExercises.sessionId],
    references: [workoutSessions.id],
  }),
  exercise: one(exercises, {
    fields: [sessionExercises.exerciseId],
    references: [exercises.id],
  }),
  sets: many(setLogs),
}));

export const setLogsRelations = relations(setLogs, ({ one }) => ({
  sessionExercise: one(sessionExercises, {
    fields: [setLogs.sessionExerciseId],
    references: [sessionExercises.id],
  }),
  session: one(workoutSessions, {
    fields: [setLogs.sessionId],
    references: [workoutSessions.id],
  }),
  exercise: one(exercises, {
    fields: [setLogs.exerciseId],
    references: [exercises.id],
  }),
}));
