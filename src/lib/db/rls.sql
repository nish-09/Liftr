-- Liftr Row Level Security (RLS), Ownership Policies, and Least-Privilege Grants

-- Enable RLS on all 15 user/system tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_body_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE set_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_sync_operations ENABLE ROW LEVEL SECURITY;

-- Enforce least-privilege table grants
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE TRUNCATE, TRIGGER, REFERENCES ON ALL TABLES IN SCHEMA public FROM authenticated;
GRANT SELECT ON TABLE exercises TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- 1. Profiles Policies (No user-initiated delete; strict self-ownership)
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 2. User Preferences Policies
DROP POLICY IF EXISTS "Users can read own preferences" ON user_preferences;
CREATE POLICY "Users can read own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;
CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 3. User Body Profiles Policies
DROP POLICY IF EXISTS "Users can manage own body profile" ON user_body_profiles;
CREATE POLICY "Users can manage own body profile" ON user_body_profiles
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4. Weight Logs Policies
DROP POLICY IF EXISTS "Users can manage own weight logs" ON weight_logs;
CREATE POLICY "Users can manage own weight logs" ON weight_logs
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 5. Body Measurements Policies
DROP POLICY IF EXISTS "Users can manage own measurements" ON body_measurements;
CREATE POLICY "Users can manage own measurements" ON body_measurements
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 6. Exercises Policies
-- System exercises are publicly readable, never writable by ordinary users; custom exercises strictly isolated.
DROP POLICY IF EXISTS "Read system and user exercises" ON exercises;
CREATE POLICY "Read system and user exercises" ON exercises
  FOR SELECT USING (is_system = true OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Manage custom exercises" ON exercises;
CREATE POLICY "Manage custom exercises" ON exercises
  FOR ALL
  USING (is_system = false AND auth.uid() = user_id)
  WITH CHECK (is_system = false AND auth.uid() = user_id);

-- 7. Training Phases Policies
DROP POLICY IF EXISTS "Manage own training phases" ON training_phases;
CREATE POLICY "Manage own training phases" ON training_phases
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 8. Workout Plans Policies (including nested phase_id ownership validation)
DROP POLICY IF EXISTS "Manage own workout plans" ON workout_plans;
CREATE POLICY "Manage own workout plans" ON workout_plans
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND (
      phase_id IS NULL
      OR EXISTS (
        SELECT 1 FROM training_phases
        WHERE training_phases.id = workout_plans.phase_id
          AND training_phases.user_id = auth.uid()
      )
    )
  );

-- 9. Plan Days Policies
DROP POLICY IF EXISTS "Manage own plan days" ON plan_days;
CREATE POLICY "Manage own plan days" ON plan_days
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM workout_plans
      WHERE workout_plans.id = plan_days.plan_id
        AND workout_plans.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_plans
      WHERE workout_plans.id = plan_days.plan_id
        AND workout_plans.user_id = auth.uid()
    )
  );

-- 10. Plan Exercises Policies (parent plan ownership + accessible exercise ownership)
DROP POLICY IF EXISTS "Manage own plan exercises" ON plan_exercises;
CREATE POLICY "Manage own plan exercises" ON plan_exercises
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM plan_days
      JOIN workout_plans ON workout_plans.id = plan_days.plan_id
      WHERE plan_days.id = plan_exercises.plan_day_id
        AND workout_plans.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM plan_days
      JOIN workout_plans ON workout_plans.id = plan_days.plan_id
      WHERE plan_days.id = plan_exercises.plan_day_id
        AND workout_plans.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM exercises
      WHERE exercises.id = plan_exercises.exercise_id
        AND (exercises.is_system = true OR exercises.user_id = auth.uid())
    )
  );

-- 11. Workout Sessions Policies (including plan/day/phase FK ownership validation)
DROP POLICY IF EXISTS "Manage own workout sessions" ON workout_sessions;
CREATE POLICY "Manage own workout sessions" ON workout_sessions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND (
      plan_id IS NULL
      OR EXISTS (
        SELECT 1 FROM workout_plans
        WHERE workout_plans.id = workout_sessions.plan_id
          AND workout_plans.user_id = auth.uid()
      )
    )
    AND (
      plan_day_id IS NULL
      OR EXISTS (
        SELECT 1 FROM plan_days
        JOIN workout_plans ON workout_plans.id = plan_days.plan_id
        WHERE plan_days.id = workout_sessions.plan_day_id
          AND workout_plans.user_id = auth.uid()
      )
    )
    AND (
      phase_id IS NULL
      OR EXISTS (
        SELECT 1 FROM training_phases
        WHERE training_phases.id = workout_sessions.phase_id
          AND training_phases.user_id = auth.uid()
      )
    )
  );

-- 12. Session Exercises Policies (parent session ownership + exercise ownership)
DROP POLICY IF EXISTS "Manage own session exercises" ON session_exercises;
CREATE POLICY "Manage own session exercises" ON session_exercises
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM workout_sessions
      WHERE workout_sessions.id = session_exercises.session_id
        AND workout_sessions.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_sessions
      WHERE workout_sessions.id = session_exercises.session_id
        AND workout_sessions.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM exercises
      WHERE exercises.id = session_exercises.exercise_id
        AND (exercises.is_system = true OR exercises.user_id = auth.uid())
    )
  );

-- 13. Set Logs Policies (user ownership + parent session & session_exercise & exercise ownership)
DROP POLICY IF EXISTS "Manage own set logs" ON set_logs;
CREATE POLICY "Manage own set logs" ON set_logs
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM workout_sessions
      WHERE workout_sessions.id = set_logs.session_id
        AND workout_sessions.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM session_exercises
      JOIN workout_sessions ON workout_sessions.id = session_exercises.session_id
      WHERE session_exercises.id = set_logs.session_exercise_id
        AND session_exercises.session_id = set_logs.session_id
        AND workout_sessions.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM exercises
      WHERE exercises.id = set_logs.exercise_id
        AND (exercises.is_system = true OR exercises.user_id = auth.uid())
    )
  );

-- 14. Personal Records Policies (user ownership + referenced session/set_log/exercise ownership)
DROP POLICY IF EXISTS "Manage own personal records" ON personal_records;
CREATE POLICY "Manage own personal records" ON personal_records
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM exercises
      WHERE exercises.id = personal_records.exercise_id
        AND (exercises.is_system = true OR exercises.user_id = auth.uid())
    )
    AND (
      session_id IS NULL
      OR EXISTS (
        SELECT 1 FROM workout_sessions
        WHERE workout_sessions.id = personal_records.session_id
          AND workout_sessions.user_id = auth.uid()
      )
    )
    AND (
      set_log_id IS NULL
      OR EXISTS (
        SELECT 1 FROM set_logs
        WHERE set_logs.id = personal_records.set_log_id
          AND set_logs.user_id = auth.uid()
      )
    )
  );

-- 15. Offline Sync Operations Policies
DROP POLICY IF EXISTS "Manage own offline operations" ON offline_sync_operations;
CREATE POLICY "Manage own offline operations" ON offline_sync_operations
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user ON workout_sessions(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_set_logs_exercise ON set_logs(exercise_id, user_id);
CREATE INDEX IF NOT EXISTS idx_set_logs_session ON set_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_weight_logs_user ON weight_logs(user_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_body_measurements_user ON body_measurements(user_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_personal_records_user ON personal_records(user_id, exercise_id);
