"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useWorkoutStore } from "@/stores/useWorkoutStore";
import { useHistoryStore } from "@/stores/useHistoryStore";
import { usePlanStore } from "@/stores/usePlanStore";
import { useExerciseStore } from "@/stores/useExerciseStore";
import { formatDuration } from "@/lib/utils";
import {
  Play,
  CalendarDays,
  Dumbbell,
  TrendingUp,
  Scale,
  Award,
  Flame,
  ArrowRight,
  Activity,
  Plus,
  History,
  Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function OverviewPage() {
  const { activeSession } = useWorkoutStore();
  const { sessions, personalRecords } = useHistoryStore();
  const { plans } = usePlanStore();
  const { exercises } = useExerciseStore();

  const activePlan = plans.find((p) => p.isActive) || plans[0];

  // Dynamic Time Greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  }, []);

  const currentDateString = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  // Compute Weekly metrics
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const workoutsThisWeek = sessions.filter(
    (s) => new Date(s.completedAt || s.startedAt).getTime() >= oneWeekAgo
  );

  const weeklyVolume = workoutsThisWeek.reduce(
    (acc, s) => acc + s.totalVolume,
    0
  );

  const avgDurationSeconds =
    sessions.length > 0
      ? Math.round(
          sessions.reduce((acc, s) => acc + s.durationSeconds, 0) /
            sessions.length
        )
      : 0;

  // Volume chart data for the last 5 sessions
  const chartData = useMemo(() => {
    return [...sessions]
      .slice(0, 5)
      .reverse()
      .map((s) => ({
        date: new Date(s.completedAt || s.startedAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        volume: s.totalVolume,
      }));
  }, [sessions]);

  return (
    <div className="space-y-6">
      {/* Editorial Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[#1E1E1E]">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-liftr-purple">
            {currentDateString}
          </span>
          <h1 className="font-serif italic text-3xl sm:text-4xl text-white mt-1">
            {greeting}, Athlete.
          </h1>
          <p className="text-xs text-liftr-grey mt-1">
            Double progression active on{" "}
            <span className="text-white font-medium">
              {activePlan?.name || "Push Pull Legs"}
            </span>
            .
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/workouts"
            className="px-4 py-2.5 rounded-lg bg-liftr-purple hover:bg-liftr-purple-dark text-white text-xs font-mono uppercase font-bold shadow-neo flex items-center gap-2 transition-all active:translate-x-0.5 active:translate-y-0.5"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Launch Workout</span>
          </Link>
          <Link
            href="/weight-tracker"
            className="px-3.5 py-2.5 rounded-lg bg-[#161616] hover:bg-[#202020] border border-[#262626] text-white text-xs font-mono uppercase flex items-center gap-1.5 transition-colors"
          >
            <Scale className="w-3.5 h-3.5 text-liftr-green" />
            <span>Log Weight</span>
          </Link>
        </div>
      </div>

      {/* Bento Grid Command Center */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Workouts this week */}
        <div className="bento-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono uppercase tracking-wider text-liftr-grey">
              Workouts / Week
            </span>
            <CalendarDays className="w-4 h-4 text-liftr-purple" />
          </div>
          <div className="my-3">
            <div className="text-3xl font-bold stat-number text-white">
              {workoutsThisWeek.length}
            </div>
            <span className="text-[11px] font-mono text-liftr-green">
              On track for weekly quota
            </span>
          </div>
          <div className="w-full bg-[#202020] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-liftr-purple h-full"
              style={{
                width: `${Math.min(100, (workoutsThisWeek.length / 4) * 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Card 2: Current Streak */}
        <div className="bento-card bento-card-coral p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono uppercase tracking-wider text-liftr-coral-light">
              Training Streak
            </span>
            <Flame className="w-4 h-4 text-liftr-coral fill-liftr-coral" />
          </div>
          <div className="my-3">
            <div className="text-3xl font-bold stat-number text-white">
              {workoutsThisWeek.length > 0 ? "3 Weeks" : "1 Day"}
            </div>
            <span className="text-[11px] font-mono text-zinc-400">
              Unbroken consistency
            </span>
          </div>
          <span className="text-[10px] font-mono text-liftr-coral uppercase font-bold">
            High momentum
          </span>
        </div>

        {/* Card 3: Weekly Training Volume */}
        <div className="bento-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono uppercase tracking-wider text-liftr-grey">
              Weekly Volume
            </span>
            <Dumbbell className="w-4 h-4 text-liftr-yellow" />
          </div>
          <div className="my-3">
            <div className="text-3xl font-bold stat-number text-liftr-yellow">
              {weeklyVolume.toLocaleString()}{" "}
              <span className="text-base font-normal">kg</span>
            </div>
            <span className="text-[11px] font-mono text-zinc-400">
              Across all working sets
            </span>
          </div>
          <Link
            href="/progress"
            className="text-[11px] font-mono text-liftr-purple hover:underline flex items-center gap-1"
          >
            <span>Analyze Volume Trend</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Card 4: Personal Records */}
        <div className="bento-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono uppercase tracking-wider text-liftr-grey">
              Personal Records
            </span>
            <Award className="w-4 h-4 text-liftr-green" />
          </div>
          <div className="my-3">
            <div className="text-3xl font-bold stat-number text-liftr-green">
              {personalRecords.length}
            </div>
            <span className="text-[11px] font-mono text-zinc-400">
              Verified milestones
            </span>
          </div>
          <Link
            href="/progress"
            className="text-[11px] font-mono text-liftr-green hover:underline flex items-center gap-1"
          >
            <span>View PR Wall</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Middle Row: Volume Trend & Quick Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Volume Trajectory Chart */}
        <div className="lg:col-span-8 bento-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">
                Recent Training Volume Trajectory
              </h3>
              <p className="text-xs text-liftr-grey font-mono mt-0.5">
                Total load lifted per session
              </p>
            </div>
            <Link
              href="/history"
              className="text-xs font-mono text-liftr-purple hover:underline"
            >
              Full History
            </Link>
          </div>

          <div className="h-56 w-full">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-zinc-500 font-mono">
                Log a workout to view volume trajectory.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="overviewVol" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8957DC" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8957DC" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis dataKey="date" stroke="#666" fontSize={11} />
                  <YAxis stroke="#666" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#181818",
                      border: "1px solid #333",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontFamily: "monospace",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="volume"
                    name="Volume (kg)"
                    stroke="#8957DC"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#overviewVol)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right: Quick Routine Launcher */}
        <div className="lg:col-span-4 bento-card p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-liftr-grey">
                Active Routine
              </span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-liftr-green/15 text-liftr-green font-bold">
                {activePlan?.phaseId || "Phase 1"}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white leading-tight">
              {activePlan?.name || "Push Pull Legs"}
            </h3>
            <p className="text-xs text-liftr-grey mt-1 line-clamp-2">
              {activePlan?.description || "High-yield progressive overload split."}
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-[#232323]">
            <div className="text-[11px] font-mono text-zinc-400">
              Days prescribed: {activePlan?.days.length || 0}
            </div>
            <Link
              href="/plans"
              className="w-full py-2.5 px-4 rounded-lg bg-[#181818] hover:bg-[#202020] border border-[#2b2b2b] text-white text-xs font-mono uppercase tracking-wider text-center block transition-colors"
            >
              Configure Routine Days
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
