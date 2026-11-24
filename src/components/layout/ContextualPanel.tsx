"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Flame,
  Calendar as CalendarIcon,
  CheckSquare,
  Square,
  Dumbbell,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Target,
  Activity,
  Award,
  TrendingUp,
  Scale,
  Star,
  ChevronRight,
  Layers,
  X,
} from "lucide-react";
import { useHistoryStore } from "@/stores/useHistoryStore";
import { usePlanStore } from "@/stores/usePlanStore";
import { useWorkoutStore } from "@/stores/useWorkoutStore";
import { useBodyStore } from "@/stores/useBodyStore";
import { useExerciseStore } from "@/stores/useExerciseStore";
import { calculateBMI, calculateVolume } from "@/lib/calculations/strength";
import { calculateMuscleHeatmap } from "@/lib/calculations/muscleHeatmap";
import { formatDuration, cn } from "@/lib/utils";

interface ContextualPanelProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export default function ContextualPanel({
  isOpenMobile = false,
  onCloseMobile,
}: ContextualPanelProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  const { sessions, personalRecords } = useHistoryStore();
  const { plans } = usePlanStore();
  const {
    activeSession,
    elapsedSeconds,
    restTimer,
    pauseRestTimer,
    resumeRestTimer,
    resetRestTimer,
    addRestSeconds,
  } = useWorkoutStore();
  const { userBodyProfile, weightLogs, bodyMeasurements } = useBodyStore();
  const { exercises } = useExerciseStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const activePlan = plans.find((p) => p.isActive) || plans[0];

  // Shared Streak & Calendar data for Overview
  const { calendarDays, monthLabel, workoutDateSet, streakCount } = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const dateSet = new Set(
      sessions.map((s) => (s.completedAt || s.startedAt).split("T")[0])
    );

    const cells: { day: number | null; dateStr: string | null }[] = [];
    for (let i = 0; i < firstDay; i++) cells.push({ day: null, dateStr: null });
    for (let d = 1; d <= daysInMonth; d++) {
      const mm = String(month + 1).padStart(2, "0");
      const dd = String(d).padStart(2, "0");
      cells.push({ day: d, dateStr: `${year}-${mm}-${dd}` });
    }

    // Streak calculation
    let streak = 0;
    if (sessions.length > 0) {
      const dates = Array.from(dateSet).sort(
        (a, b) => new Date(b).getTime() - new Date(a).getTime()
      );
      const today = now.toISOString().split("T")[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      if (dates[0] === today || dates[0] === yesterday) {
        streak = 1;
        let cursor = new Date(dates[0]);
        for (let i = 1; i < dates.length; i++) {
          cursor.setDate(cursor.getDate() - 1);
          if (dates[i] === cursor.toISOString().split("T")[0]) {
            streak++;
          } else {
            break;
          }
        }
      }
    }

    return {
      calendarDays: cells,
      monthLabel: now.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      workoutDateSet: dateSet,
      streakCount: streak,
    };
  }, [sessions]);

  // Daily checklist state synced with actual today's activity + optional manual toggle
  const todayStr = new Date().toISOString().split("T")[0];
  const loggedWorkoutToday = workoutDateSet.has(todayStr);
  const loggedWeightToday = weightLogs.some((w) => w.recordedAt === todayStr);
  const [extraChecks, setExtraChecks] = useState<Record<string, boolean>>({
    hydration: false,
    mobility: false,
  });

  // Heatmap summary for Strength Analytics panel
  const muscleSummary = useMemo(() => {
    const map = calculateMuscleHeatmap(sessions, exercises, 30);
    const list = Object.values(map);
    const topTrained = [...list]
      .filter((m) => m.completedWorkingSets > 0)
      .sort((a, b) => b.coveragePercentage - a.coveragePercentage)
      .slice(0, 3);
    const needsAttention = list
      .filter((m) => m.coveragePercentage < 50)
      .slice(0, 3);
    return { topTrained, needsAttention };
  }, [sessions, exercises]);

  function renderPanelBody() {
    if (!mounted) {
      return (
        <div className="space-y-3">
          <div className="h-28 rounded-2xl bg-white/60 border-[1.5px] border-[#142746]/20 animate-pulse" />
          <div className="h-36 rounded-2xl bg-white/60 border-[1.5px] border-[#142746]/20 animate-pulse" />
        </div>
      );
    }

    // 1. LIVE WORKOUT CONTEXT
    if (pathname.startsWith("/workouts")) {
      const completedSets = activeSession
        ? activeSession.exercises.reduce(
            (sum, ex) => sum + ex.sets.filter((s) => s.isCompleted).length,
            0
          )
        : 0;
      const totalSets = activeSession
        ? activeSession.exercises.reduce((sum, ex) => sum + ex.sets.length, 0)
        : 0;
      const liveVol = activeSession
        ? activeSession.exercises.reduce((sum, ex) => sum + calculateVolume(ex.sets), 0)
        : 0;

      const restMins = Math.floor(restTimer.remainingSeconds / 60);
      const restSecs = restTimer.remainingSeconds % 60;
      const restDisplay = `${restMins}:${restSecs < 10 ? "0" : ""}${restSecs}`;

      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-heading font-extrabold uppercase tracking-wider text-[#142746]">
              Session Monitor
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#E9FF91] border-[1.5px] border-[#142746] text-[10px] font-bold">
              {activeSession ? "Live" : "Standby"}
            </span>
          </div>

          {/* Rest Timer Card */}
          <div className="p-4 rounded-2xl bg-white border-[1.5px] border-[#142746] shadow-neo-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8993A5] flex items-center gap-1.5">
                <Timer className="w-3.5 h-3.5 text-[#142746]" />
                Rest Timer
              </span>
              {restTimer.setNumber && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBCBF7] border border-[#142746]">
                  Set {restTimer.setNumber}
                </span>
              )}
            </div>
            <div className="text-3xl font-extrabold stat-number text-[#142746]">
              {restDisplay}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => addRestSeconds(15)}
                className="flex-1 py-1.5 rounded-lg bg-[#E9FF91] hover:bg-[#dff67c] border-[1.5px] border-[#142746] text-[11px] font-bold cursor-pointer"
              >
                +15s
              </button>
              <button
                type="button"
                onClick={() => addRestSeconds(30)}
                className="flex-1 py-1.5 rounded-lg bg-[#EBCBF7] hover:bg-[#e1b9f1] border-[1.5px] border-[#142746] text-[11px] font-bold cursor-pointer"
              >
                +30s
              </button>
              {restTimer.isRunning ? (
                <button
                  type="button"
                  onClick={pauseRestTimer}
                  className="p-1.5 rounded-lg bg-[#142746] text-white border-[1.5px] border-[#142746] cursor-pointer"
                  title="Pause Timer"
                >
                  <Pause className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={resumeRestTimer}
                  disabled={restTimer.remainingSeconds <= 0}
                  className="p-1.5 rounded-lg bg-[#BDF7B6] text-[#142746] border-[1.5px] border-[#142746] disabled:opacity-40 cursor-pointer"
                  title="Resume Timer"
                >
                  <Play className="w-3.5 h-3.5 fill-[#142746]" />
                </button>
              )}
              <button
                type="button"
                onClick={resetRestTimer}
                className="p-1.5 rounded-lg bg-[#F8C3B5] text-[#142746] border-[1.5px] border-[#142746] cursor-pointer"
                title="Reset Timer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {activeSession ? (
            <>
              <div className="p-4 rounded-2xl bg-[#E9FF91] border-[1.5px] border-[#142746] shadow-neo-sm space-y-2.5">
                <div className="text-[11px] font-bold uppercase text-[#142746]/70">
                  Active Summary
                </div>
                <div className="font-heading font-extrabold text-sm text-[#142746]">
                  {activeSession.name}
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="p-2 rounded-xl bg-white border border-[#142746]">
                    <div className="text-[10px] text-[#8993A5] font-semibold">Time</div>
                    <div className="text-xs font-extrabold">{formatDuration(elapsedSeconds)}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-[#142746]">
                    <div className="text-[10px] text-[#8993A5] font-semibold">Sets</div>
                    <div className="text-xs font-extrabold">
                      {completedSets}/{totalSets}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-[#142746]">
                    <div className="text-[10px] text-[#8993A5] font-semibold">Volume</div>
                    <div className="text-xs font-extrabold">{liveVol} kg</div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border-[1.5px] border-[#142746] shadow-neo-sm space-y-2.5">
                <div className="text-xs font-heading font-extrabold text-[#142746]">
                  Exercise Progress
                </div>
                {activeSession.exercises.length === 0 ? (
                  <p className="text-xs text-[#8993A5]">No movements added yet.</p>
                ) : (
                  <div className="space-y-1.5">
                    {activeSession.exercises.map((ex, idx) => {
                      const exMeta = exercises.find((e) => e.id === ex.exerciseId) || ex.exercise;
                      const done = ex.sets.filter((s) => s.isCompleted).length;
                      const allDone = ex.sets.length > 0 && done === ex.sets.length;
                      return (
                        <div
                          key={ex.id}
                          className={cn(
                            "flex items-center justify-between px-2.5 py-2 rounded-xl border text-xs",
                            allDone
                              ? "bg-[#BDF7B6]/50 border-[#142746] font-bold"
                              : "bg-[#FAF9FD] border-[#142746]/25"
                          )}
                        >
                          <span className="truncate pr-2">
                            {idx + 1}. {exMeta?.name || "Exercise"}
                          </span>
                          <span className="font-bold shrink-0">
                            {done}/{ex.sets.length}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-4 rounded-2xl bg-white border-[1.5px] border-[#142746] shadow-neo-sm space-y-2">
              <div className="text-xs font-heading font-extrabold text-[#142746]">
                Ready to Train
              </div>
              <p className="text-xs text-[#8993A5] leading-relaxed">
                Start an empty live workout or launch a split day from your active plan. Auto-rest countdown begins as soon as you check off a set.
              </p>
              <Link
                href="/plans"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#142746] underline underline-offset-2 pt-1"
              >
                Open Workout Plans <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      );
    }

    // 2. BODY METRICS & WEIGHT TRACKER CONTEXT
    if (pathname.startsWith("/body-metrics") || pathname.startsWith("/weight-tracker")) {
      const currentW = weightLogs[0]?.weight ?? userBodyProfile.startingWeight ?? null;
      const targetW = userBodyProfile.targetWeight ?? null;
      const startW =
        userBodyProfile.startingWeight ??
        (weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight : null);
      const heightCm = userBodyProfile.height ?? null;
      const bmiRes =
        currentW != null && heightCm != null && heightCm > 0
          ? calculateBMI(currentW, heightCm)
          : null;

      let goalPct = 0;
      if (currentW != null && targetW != null && startW != null) {
        const span = Math.abs(targetW - startW);
        if (span > 0) {
          goalPct = Math.min(100, Math.round((Math.abs(currentW - startW) / span) * 100));
        }
      }

      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-heading font-extrabold uppercase tracking-wider text-[#142746]">
              Body Composition Snapshot
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#E9FF91] border-[1.5px] border-[#142746] shadow-neo-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase text-[#142746]/70 flex items-center gap-1">
                <Target className="w-3.5 h-3.5" />
                Target Weight
              </span>
              <span className="text-[11px] font-bold">{goalPct}%</span>
            </div>
            <div className="flex items-baseline gap-2 font-heading font-extrabold text-xl text-[#142746]">
              <span>{currentW != null ? `${currentW} kg` : "--"}</span>
              <span className="text-sm text-[#8993A5]">→</span>
              <span>{targetW != null ? `${targetW} kg` : "--"}</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-white border border-[#142746] overflow-hidden">
              <div
                className="h-full bg-[#142746] transition-all duration-500"
                style={{ width: `${goalPct}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border-[1.5px] border-[#142746] shadow-neo-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase text-[#8993A5]">BMI Status</span>
              <span className="px-2 py-0.5 rounded-full bg-[#EBCBF7] border border-[#142746] text-[10px] font-bold">
                {bmiRes ? bmiRes.category : "Unset"}
              </span>
            </div>
            <div className="text-3xl font-extrabold stat-number text-[#142746]">
              {bmiRes ? bmiRes.bmi : "--"}
            </div>
            <p className="text-[11px] text-[#8993A5]">
              {heightCm ? `Height: ${heightCm} cm` : "Configure height in Body Metrics"}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border-[1.5px] border-[#142746] shadow-neo-sm space-y-2.5">
            <div className="text-xs font-heading font-extrabold text-[#142746] flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5" />
              Recent Measurements
            </div>
            {bodyMeasurements.length === 0 ? (
              <p className="text-xs text-[#8993A5]">No circumference logs yet.</p>
            ) : (
              <div className="space-y-1.5">
                {bodyMeasurements.slice(0, 4).map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between text-xs py-1 border-b border-[#142746]/10 last:border-0"
                  >
                    <span className="capitalize font-medium text-[#142746]">
                      {m.customName || m.measurementType.replace("_", " ")}
                    </span>
                    <span className="font-bold">
                      {m.value} {m.unit}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    // 3. STRENGTH ANALYTICS CONTEXT
    if (pathname.startsWith("/progress")) {
      const weekAgo = Date.now() - 7 * 86400000;
      const weeklySessions = sessions.filter(
        (s) => new Date(s.completedAt || s.startedAt).getTime() >= weekAgo
      ).length;

      return (
        <div className="space-y-4">
          <div className="text-xs font-heading font-extrabold uppercase tracking-wider text-[#142746]">
            Performance Insights
          </div>

          <div className="p-4 rounded-2xl bg-[#F2FA91] border-[1.5px] border-[#142746] shadow-neo-sm space-y-1">
            <span className="text-[11px] font-bold uppercase text-[#142746]/70 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Training Frequency
            </span>
            <div className="text-3xl font-extrabold stat-number text-[#142746]">
              {weeklySessions}{" "}
              <span className="text-sm font-semibold text-[#142746]/70">sessions / 7d</span>
            </div>
            <p className="text-[11px] text-[#142746]/80">
              {sessions.length} total completed workouts
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border-[1.5px] border-[#142746] shadow-neo-sm space-y-2.5">
            <div className="text-xs font-heading font-extrabold text-[#142746] flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              Top Trained (30d)
            </div>
            {muscleSummary.topTrained.length === 0 ? (
              <p className="text-xs text-[#8993A5]">Log sets to analyze muscle coverage.</p>
            ) : (
              <div className="space-y-1.5">
                {muscleSummary.topTrained.map((m) => (
                  <div
                    key={m.muscleId}
                    className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-xl bg-[#E9FF91]/60 border border-[#142746]"
                  >
                    <span className="font-semibold">{m.name}</span>
                    <span className="font-extrabold">{m.coveragePercentage}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-[#F8C3B5] border-[1.5px] border-[#142746] shadow-neo-sm space-y-2">
            <div className="text-xs font-heading font-extrabold text-[#142746] flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              PR Summary
            </div>
            <div className="text-2xl font-extrabold stat-number text-[#142746]">
              {personalRecords.length} Records
            </div>
            <p className="text-[11px] text-[#142746]/80">
              Verified peak weights and Epley 1RMs.
            </p>
          </div>
        </div>
      );
    }

    // 4. PLANS / EXERCISES / HISTORY / SETTINGS / NUTRITION
    if (pathname.startsWith("/exercises")) {
      const favorites = exercises.filter((e) => e.isFavorite);
      return (
        <div className="space-y-4">
          <div className="text-xs font-heading font-extrabold uppercase tracking-wider text-[#142746]">
            Library Overview
          </div>
          <div className="p-4 rounded-2xl bg-[#E9FF91] border-[1.5px] border-[#142746] shadow-neo-sm space-y-1">
            <div className="text-[11px] font-bold uppercase text-[#142746]/70">Total Movements</div>
            <div className="text-3xl font-extrabold stat-number">{exercises.length}</div>
          </div>
          <div className="p-4 rounded-2xl bg-white border-[1.5px] border-[#142746] shadow-neo-sm space-y-2">
            <div className="text-xs font-heading font-extrabold flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 fill-[#F8C3B5]" />
              Starred Favorites ({favorites.length})
            </div>
            {favorites.length === 0 ? (
              <p className="text-xs text-[#8993A5]">Star exercises for quick access.</p>
            ) : (
              <div className="space-y-1.5">
                {favorites.slice(0, 5).map((ex) => (
                  <div
                    key={ex.id}
                    className="text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-[#FAF9FD] border border-[#142746]/25 truncate"
                  >
                    {ex.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (pathname.startsWith("/plans")) {
      return (
        <div className="space-y-4">
          <div className="text-xs font-heading font-extrabold uppercase tracking-wider text-[#142746]">
            Routine Summary
          </div>
          <div className="p-4 rounded-2xl bg-[#EBCBF7] border-[1.5px] border-[#142746] shadow-neo-sm space-y-1.5">
            <div className="text-[11px] font-bold uppercase text-[#142746]/70">Active Plan</div>
            <div className="font-heading font-extrabold text-base text-[#142746]">
              {activePlan ? activePlan.name : "No Active Routine"}
            </div>
            <div className="text-xs font-medium text-[#142746]/80">
              {activePlan ? `${activePlan.days.length} split days configured` : "Select or create a routine"}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white border-[1.5px] border-[#142746] shadow-neo-sm space-y-2">
            <div className="text-xs font-heading font-extrabold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Double Progression Guide
            </div>
            <p className="text-xs text-[#8993A5] leading-relaxed">
              Hit the top of your prescribed rep range across sets to automatically unlock your next weight step in Live Workout.
            </p>
          </div>
        </div>
      );
    }

    // 5. DEFAULT / OVERVIEW CONTEXT (Calendar, Streak, Upcoming Plan, Daily Checklist)
    return (
      <div className="space-y-4">
        {/* Streak Card */}
        <div className="p-4 rounded-2xl bg-[#E9FF91] border-[1.5px] border-[#142746] shadow-neo-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#142746]/70 block">
              Current Streak
            </span>
            <div className="text-2xl font-extrabold stat-number text-[#142746]">
              {streakCount} {streakCount === 1 ? "Day" : "Days"}
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-white border-[1.5px] border-[#142746] flex items-center justify-center shadow-neo-sm">
            <Flame className="w-5 h-5 text-[#142746] fill-[#F8C3B5]" />
          </div>
        </div>

        {/* Monthly Workout Calendar */}
        <div className="p-4 rounded-2xl bg-white border-[1.5px] border-[#142746] shadow-neo-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-heading font-extrabold text-[#142746] flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5" />
              {monthLabel}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBCBF7] border border-[#142746]">
              {workoutDateSet.size} Logged
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-[#8993A5]">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <div key={i}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[11px]">
            {calendarDays.map((cell, idx) => {
              if (!cell.day || !cell.dateStr) {
                return <div key={idx} className="h-7" />;
              }
              const isWorkoutDay = workoutDateSet.has(cell.dateStr);
              const isToday = cell.dateStr === todayStr;

              return (
                <div
                  key={cell.dateStr}
                  className={cn(
                    "h-7 rounded-lg flex items-center justify-center font-semibold transition-colors",
                    isWorkoutDay
                      ? "bg-[#BDF7B6] border border-[#142746] text-[#142746] font-extrabold"
                      : isToday
                      ? "bg-[#EBCBF7] border border-[#142746] text-[#142746] font-bold"
                      : "text-[#142746]/75"
                  )}
                >
                  {cell.day}
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Planned Workouts */}
        <div className="p-4 rounded-2xl bg-white border-[1.5px] border-[#142746] shadow-neo-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-heading font-extrabold text-[#142746] flex items-center gap-1.5">
              <Dumbbell className="w-3.5 h-3.5" />
              Upcoming Splits
            </span>
            <Link href="/plans" className="text-[11px] font-bold text-[#142746] underline">
              Plans
            </Link>
          </div>
          {!activePlan || activePlan.days.length === 0 ? (
            <p className="text-xs text-[#8993A5]">
              No active routine yet. Create a plan to see your upcoming training days.
            </p>
          ) : (
            <div className="space-y-1.5">
              {activePlan.days.slice(0, 3).map((day) => (
                <Link
                  key={day.id}
                  href="/plans"
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#FAF9FD] hover:bg-[#E9FF91]/60 border border-[#142746]/25 text-xs transition-colors"
                >
                  <span className="font-bold text-[#142746] truncate pr-2">{day.name}</span>
                  <span className="text-[10px] font-semibold text-[#8993A5] shrink-0">
                    {day.exercises.length} ex
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Daily Fitness Checklist */}
        <div className="p-4 rounded-2xl bg-[#F2FA91] border-[1.5px] border-[#142746] shadow-neo-sm space-y-2.5">
          <div className="text-xs font-heading font-extrabold text-[#142746]">
            Daily Checklist
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-2 font-semibold text-[#142746]">
              {loggedWorkoutToday ? (
                <CheckSquare className="w-4 h-4 shrink-0" />
              ) : (
                <Square className="w-4 h-4 shrink-0 text-[#142746]/50" />
              )}
              <span className={cn(loggedWorkoutToday && "line-through opacity-70")}>
                Complete training session
              </span>
            </div>
            <div className="flex items-center gap-2 font-semibold text-[#142746]">
              {loggedWeightToday ? (
                <CheckSquare className="w-4 h-4 shrink-0" />
              ) : (
                <Square className="w-4 h-4 shrink-0 text-[#142746]/50" />
              )}
              <span className={cn(loggedWeightToday && "line-through opacity-70")}>
                Log morning weigh-in
              </span>
            </div>
            {(
              [
                { key: "hydration", label: "3L Hydration target" },
                { key: "mobility", label: "10m Post-session mobility" },
              ] as const
            ).map((item) => {
              const checked = extraChecks[item.key];
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() =>
                    setExtraChecks((prev) => ({ ...prev, [item.key]: !prev[item.key] }))
                  }
                  className="flex items-center gap-2 font-semibold text-[#142746] w-full text-left cursor-pointer"
                >
                  {checked ? (
                    <CheckSquare className="w-4 h-4 shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 shrink-0 text-[#142746]/50" />
                  )}
                  <span className={cn(checked && "line-through opacity-70")}>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Persistent Contextual Right Panel */}
      <aside className="hidden xl:flex w-72 2xl:w-80 shrink-0 flex-col bg-[#BDF7B6] border-l-[1.5px] border-[#142746] p-4 2xl:p-5 overflow-y-auto xl:sticky xl:top-0 xl:h-screen">
        {renderPanelBody()}
      </aside>

      {/* Tablet/Mobile Slide-Over Collapsible Drawer */}
      {isOpenMobile && (
        <div className="xl:hidden fixed inset-0 z-50 flex justify-end bg-[#142746]/45 backdrop-blur-sm">
          <aside className="w-[min(20rem,92vw)] h-full bg-[#BDF7B6] border-l-[1.5px] border-[#142746] p-4 sm:p-5 overflow-y-auto shadow-neo-xl">
            <div className="flex items-center justify-between pb-4 mb-4 border-b-[1.5px] border-[#142746]/20">
              <span className="font-heading font-extrabold text-sm text-[#142746] uppercase">
                Insights Panel
              </span>
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg bg-white border-[1.5px] border-[#142746] text-[#142746] cursor-pointer"
                aria-label="Close panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {renderPanelBody()}
          </aside>
        </div>
      )}
    </>
  );
}
