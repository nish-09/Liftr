-- Liftr Row Level Security (RLS) and Security Policies

-- Enable RLS on all tables
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

-- 1. Profiles Policies
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 2. User Preferences Policies
CREATE POLICY "Users can read own preferences" ON userPreferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON userPreferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON userPreferences
  FOR UPDATE USING (auth.uid() = user_id);

-- 3. User Body Profiles Policies
CREATE POLICY "Users can manage own body profile" ON user_body_profiles
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4. Weight Logs Policies
CREATE POLICY "Users can manage own weight logs" ON weight_logs
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 5. Body Measurements Policies
CREATE POLICY "Users can manage own measurements" ON body_measurements
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 6. Exercises Policies (System exercises readable by all, custom exercises isolated to user)
CREATE POLICY "Read system and user exercises" ON exercises
  FOR SELECT USING (is_system = true OR auth.uid() = user_id);

CREATE POLICY "Manage custom exercises" ON exercises
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 7. Training Phases Policies
CREATE POLICY "Manage own training phases" ON training_phases
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 8. Workout Plans Policies
CREATE POLICY "Manage own workout plans" ON workout_plans
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 9. Plan Days Policies
CREATE POLICY "Manage own plan days" ON plan_days
  FOR ALL USING (
    EXISTS (SELECT 1 FROM workout_plans WHERE workout_plans.id = plan_days.plan_id AND workout_plans.user_id = auth.uid())
  );

-- 10. Plan Exercises Policies
CREATE POLICY "Manage own plan exercises" ON plan_exercises
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM plan_days 
      JOIN workout_plans ON workout_plans.id = plan_days.plan_id 
      WHERE plan_days.id = plan_exercises.plan_day_id AND workout_plans.user_id = auth.uid()
    )
  );

-- 11. Workout Sessions Policies
CREATE POLICY "Manage own workout sessions" ON workout_sessions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 12. Session Exercises Policies
CREATE POLICY "Manage own session exercises" ON session_exercises
  FOR ALL USING (
    EXISTS (SELECT 1 FROM workout_sessions WHERE workout_sessions.id = session_exercises.session_id AND workout_sessions.user_id = auth.uid())
  );

-- 13. Set Logs Policies
CREATE POLICY "Manage own set logs" ON set_logs
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 14. Personal Records Policies
CREATE POLICY "Manage own personal records" ON personal_records
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 15. Offline Sync Operations Policies
CREATE POLICY "Manage own offline operations" ON offline_sync_operations
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user ON workout_sessions(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_set_logs_exercise ON set_logs(exercise_id, user_id);
CREATE INDEX IF NOT EXISTS idx_set_logs_session ON set_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_weight_logs_user ON weight_logs(user_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_body_measurements_user ON body_measurements(user_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_personal_records_user ON personal_records(user_id, exercise_id);
