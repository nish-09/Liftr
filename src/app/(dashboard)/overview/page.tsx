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
  Zap,
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
      {/* Editorial Welcome Header Banner */}
      <div className="bento-card-forest p-6 sm:p-7 rounded-xl border-2 border-[#171B16] shadow-neo-lg flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-[#D5F36A] text-[#171B16] border border-[#171B16] text-xs font-mono font-bold uppercase mb-2">
            <span>{currentDateString}</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F5F0DF] tracking-tight leading-none">
            {greeting}, Athlete.
          </h1>
          <p className="text-xs sm:text-sm text-[#B8D99A] font-mono mt-2">
            Double progression active on{" "}
            <span className="text-[#D5F36A] font-bold underline decoration-[#171B16] underline-offset-4">
              {activePlan?.name || "Push Pull Legs"}
            </span>
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/workouts"
            className="px-5 py-3 rounded-lg bg-[#D5F36A] hover:bg-[#c6e65a] text-[#171B16] text-xs font-heading font-bold uppercase tracking-wider border-2 border-[#171B16] shadow-neo flex items-center gap-2 transition-all active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-[#171B16]" />
            <span>Launch Workout</span>
          </Link>
          <Link
            href="/weight-tracker"
            className="px-4 py-3 rounded-lg bg-[#F5F0DF] hover:bg-[#eae3ce] text-[#171B16] text-xs font-heading font-bold uppercase tracking-wider border-2 border-[#171B16] shadow-neo flex items-center gap-2 transition-all active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
          >
            <Scale className="w-4 h-4 stroke-[2.5]" />
            <span>Log Weight</span>
          </Link>
        </div>
      </div>

      {/* Bento Grid Command Center: 4 Major Metric Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Workouts this week (Warm Cream) */}
        <div className="bento-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#171B16]/70 font-bold">
              Workouts / Week
            </span>
            <div className="p-1.5 rounded-md bg-[#183D2A] text-[#D5F36A] border border-[#171B16]">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-4xl font-bold stat-number text-[#171B16]">
              {workoutsThisWeek.length}
            </div>
            <span className="text-xs font-mono font-bold text-[#183D2A] mt-1 block">
              ● On track for weekly quota
            </span>
          </div>
          <div className="w-full bg-[#E5DEC7] border border-[#171B16] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#183D2A] h-full"
              style={{
                width: `${Math.min(100, (workoutsThisWeek.length / 4) * 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Card 2: Current Streak (Acid Lime) */}
        <div className="bento-card-lime p-5 flex flex-col justify-between rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#171B16] font-bold">
              Training Streak
            </span>
            <div className="p-1.5 rounded-md bg-[#183D2A] text-[#D5F36A] border border-[#171B16]">
              <Flame className="w-4 h-4 fill-[#D5F36A]" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-4xl font-bold stat-number text-[#171B16]">
              {workoutsThisWeek.length > 0 ? "3 Weeks" : "1 Day"}
            </div>
            <span className="text-xs font-mono font-semibold text-[#171B16]/80 mt-1 block">
              Consistent hypertrophic stimuli
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#183D2A] uppercase font-bold px-2 py-0.5 rounded bg-[#F5F0DF] border border-[#171B16] inline-block self-start">
            High Momentum
          </span>
        </div>

        {/* Card 3: Weekly Volume (Deep Forest Green) */}
        <div className="bento-card-forest p-5 flex flex-col justify-between rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#B8D99A] font-bold">
              Weekly Volume
            </span>
            <div className="p-1.5 rounded-md bg-[#D5F36A] text-[#171B16] border border-[#171B16]">
              <Dumbbell className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-3xl sm:text-4xl font-bold stat-number text-[#D5F36A]">
              {weeklyVolume.toLocaleString()}{" "}
              <span className="text-sm font-normal text-[#F5F0DF]">kg</span>
            </div>
            <span className="text-xs font-mono text-[#B8D99A] mt-1 block">
              Cumulative working set load
            </span>
          </div>
          <Link
            href="/progress"
            className="text-[11px] font-heading font-bold text-[#D5F36A] hover:underline flex items-center gap-1 uppercase tracking-wider"
          >
            <span>Analyze Volume Trend</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </Link>
        </div>

        {/* Card 4: Personal Records (Burnt Orange) */}
        <div className="bento-card-orange p-5 flex flex-col justify-between rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-white font-bold">
              Personal Records
            </span>
            <div className="p-1.5 rounded-md bg-[#F5F0DF] text-[#171B16] border border-[#171B16]">
              <Award className="w-4 h-4 text-[#F07845] fill-[#F07845]" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-4xl font-bold stat-number text-white">
              {personalRecords.length}
            </div>
            <span className="text-xs font-mono text-white/90 mt-1 block">
              Peak strength milestones
            </span>
          </div>
          <Link
            href="/progress"
            className="text-[11px] font-heading font-bold text-[#F5F0DF] hover:underline flex items-center gap-1 uppercase tracking-wider"
          >
            <span>View PR Wall</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </Link>
        </div>
      </div>

      {/* Middle Row: Volume Trajectory Chart & Quick Routine Launcher */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Volume Trajectory Chart (Forest Green Container) */}
        <div className="lg:col-span-8 bento-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b-2 border-[#171B16]/20 pb-3">
            <div>
              <h3 className="text-lg font-heading font-bold text-[#171B16]">
                Recent Training Volume Trajectory
              </h3>
              <p className="text-xs text-[#171B16]/70 font-mono mt-0.5">
                Total load lifted per completed session (kg)
              </p>
            </div>
            <Link
              href="/history"
              className="text-xs font-mono font-bold text-[#183D2A] hover:underline uppercase"
            >
              Full History →
            </Link>
          </div>

          <div className="h-60 w-full">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-[#171B16]/60 font-mono">
                Log a workout to view volume trajectory.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="greenVolGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#183D2A" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#D5F36A" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#D3CCA8" />
                  <XAxis dataKey="date" stroke="#171B16" fontSize={11} fontStyle="bold" />
                  <YAxis stroke="#171B16" fontSize={11} fontStyle="bold" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#F5F0DF",
                      border: "2px solid #171B16",
                      borderRadius: "6px",
                      boxShadow: "3px 3px 0px #171B16",
                      fontSize: "12px",
                      fontFamily: "monospace",
                      fontWeight: "bold",
                      color: "#171B16",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="volume"
                    name="Volume (kg)"
                    stroke="#183D2A"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#greenVolGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right: Active Routine Bento Card (Acid Lime) */}
        <div className="lg:col-span-4 bento-card-lime p-6 flex flex-col justify-between space-y-4 rounded-lg">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#171B16] font-bold">
                Active Routine
              </span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#183D2A] text-[#D5F36A] font-bold border border-[#171B16]">
                {activePlan?.phaseId || "Bulking"}
              </span>
            </div>
            <h3 className="text-2xl font-heading font-bold text-[#171B16] leading-tight">
              {activePlan?.name || "Push Pull Legs"}
            </h3>
            <p className="text-xs text-[#171B16]/80 mt-2 line-clamp-2 leading-relaxed">
              {activePlan?.description || "High-yield progressive overload split."}
            </p>
          </div>

          <div className="space-y-3 pt-3 border-t-2 border-[#171B16]/30">
            <div className="text-xs font-mono font-bold text-[#171B16]">
              Prescribed Days: {activePlan?.days.length || 0} Routine Splits
            </div>
            <Link
              href="/plans"
              className="w-full py-2.5 px-4 rounded-lg bg-[#183D2A] hover:bg-[#143323] text-[#F5F0DF] text-xs font-heading font-bold uppercase tracking-wider text-center block border-2 border-[#171B16] shadow-neo transition-transform active:translate-x-0.5 active:translate-y-0.5"
            >
              Configure Routine Days
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
