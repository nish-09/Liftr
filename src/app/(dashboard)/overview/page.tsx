"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useWorkoutStore } from "@/stores/useWorkoutStore";
import { useHistoryStore } from "@/stores/useHistoryStore";
import { usePlanStore } from "@/stores/usePlanStore";
import { useExerciseStore } from "@/stores/useExerciseStore";
import {
  Play,
  CalendarDays,
  Dumbbell,
  Scale,
  Award,
  Flame,
  ArrowRight,
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

  // Dynamic Streak Calculation from real session history
  const { streakCount, streakUnit, streakStatus } = useMemo(() => {
    if (sessions.length === 0) {
      return { streakCount: 0, streakUnit: "Days", streakStatus: "No Active Streak" };
    }

    const workoutDates = Array.from(
      new Set(sessions.map((s) => (s.completedAt || s.startedAt).split("T")[0]))
    ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    if (workoutDates[0] !== today && workoutDates[0] !== yesterday) {
      return { streakCount: 0, streakUnit: "Days", streakStatus: "Streak Inactive" };
    }

    let streak = 1;
    let currentDate = new Date(workoutDates[0]);

    for (let i = 1; i < workoutDates.length; i++) {
      const prevExpectedDate = new Date(currentDate);
      prevExpectedDate.setDate(prevExpectedDate.getDate() - 1);
      const prevExpectedStr = prevExpectedDate.toISOString().split("T")[0];

      if (workoutDates[i] === prevExpectedStr) {
        streak++;
        currentDate = prevExpectedDate;
      } else {
        break;
      }
    }

    return {
      streakCount: streak,
      streakUnit: streak === 1 ? "Day" : "Days",
      streakStatus: streak > 2 ? "High Momentum" : "Active Streak",
    };
  }, [sessions]);

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
      {/* Editorial Welcome Header Banner in Electric Blue */}
      <div className="bento-card-electric p-6 sm:p-7 rounded-xl border-2 border-[#171717] shadow-neo-lg flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-[#E9F56A] text-[#171717] border border-[#171717] text-xs font-mono font-black uppercase mb-2 shadow-neo-sm">
            <span>{currentDateString}</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-none uppercase">
            {greeting}, Athlete.
          </h1>
          <p className="text-xs sm:text-sm text-white/90 font-mono mt-2">
            {activePlan ? (
              <>
                Double progression active on{" "}
                <span className="text-[#E9F56A] font-black underline decoration-white underline-offset-4">
                  {activePlan.name}
                </span>
              </>
            ) : (
              "No active workout routine set. Create or activate a plan to track overload."
            )}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/workouts"
            className="px-5 py-3 rounded-lg bg-[#E9F56A] hover:bg-[#dae852] text-[#171717] text-xs font-heading font-black uppercase tracking-wider border-2 border-[#171717] shadow-neo flex items-center gap-2 transition-all active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-[#171717]" />
            <span>Launch Workout</span>
          </Link>
          <Link
            href="/weight-tracker"
            className="px-4 py-3 rounded-lg bg-white hover:bg-[#F5F1E8] text-[#171717] text-xs font-heading font-black uppercase tracking-wider border-2 border-[#171717] shadow-neo flex items-center gap-2 transition-all active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
          >
            <Scale className="w-4 h-4 stroke-[2.5]" />
            <span>Log Weight</span>
          </Link>
        </div>
      </div>

      {/* Bento Grid Command Center: 4 Major Metric Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Workouts this week (Pure White) */}
        <div className="bento-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#171717]/70 font-bold">
              Workouts / Week
            </span>
            <div className="p-1.5 rounded-lg bg-[#3155F5] text-[#E9F56A] border border-[#171717] shadow-neo-sm">
              <CalendarDays className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-4xl font-bold stat-number text-[#171717]">
              {workoutsThisWeek.length}
            </div>
            <span className="text-xs font-mono font-bold text-[#3155F5] mt-1 block">
              {workoutsThisWeek.length > 0
                ? "● On track for weekly quota"
                : "○ No sessions completed this week"}
            </span>
          </div>
          <div className="w-full bg-[#F5F1E8] border border-[#171717] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#3155F5] h-full"
              style={{
                width: `${Math.min(100, (workoutsThisWeek.length / 4) * 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Card 2: Current Streak (Acid Yellow) */}
        <div className="bento-card-acid p-5 flex flex-col justify-between rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#171717] font-black">
              Training Streak
            </span>
            <div className="p-1.5 rounded-lg bg-[#3155F5] text-[#E9F56A] border border-[#171717] shadow-neo-sm">
              <Flame className="w-4 h-4 fill-[#E9F56A]" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-4xl font-bold stat-number text-[#171717]">
              {streakCount}{" "}
              <span className="text-xl font-mono font-bold">{streakUnit}</span>
            </div>
            <span className="text-xs font-mono font-semibold text-[#171717]/80 mt-1 block">
              {streakCount > 0
                ? "Consistent hypertrophic stimuli"
                : "Complete a session to begin streak"}
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#171717] uppercase font-black px-2 py-0.5 rounded bg-white border border-[#171717] inline-block self-start shadow-neo-sm">
            {streakStatus}
          </span>
        </div>

        {/* Card 3: Weekly Volume (Electric Blue) */}
        <div className="bento-card-electric p-5 flex flex-col justify-between rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-white/90 font-bold">
              Weekly Volume
            </span>
            <div className="p-1.5 rounded-lg bg-[#E9F56A] text-[#171717] border border-[#171717] shadow-neo-sm">
              <Dumbbell className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-3xl sm:text-4xl font-bold stat-number text-[#E9F56A]">
              {weeklyVolume.toLocaleString()}{" "}
              <span className="text-sm font-normal text-white">kg</span>
            </div>
            <span className="text-xs font-mono text-white/80 mt-1 block">
              {weeklyVolume > 0
                ? "Cumulative working set load"
                : "No sets logged this week"}
            </span>
          </div>
          <Link
            href="/progress"
            className="text-[11px] font-heading font-black text-[#E9F56A] hover:underline flex items-center gap-1 uppercase tracking-wider"
          >
            <span>Analyze Volume Trend</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </Link>
        </div>

        {/* Card 4: Personal Records (Signal Orange) */}
        <div className="bento-card-orange p-5 flex flex-col justify-between rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-white font-black">
              Personal Records
            </span>
            <div className="p-1.5 rounded-lg bg-white text-[#FF7043] border border-[#171717] shadow-neo-sm">
              <Award className="w-4 h-4 text-[#FF7043] fill-[#FF7043]" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-4xl font-bold stat-number text-white">
              {personalRecords.length}
            </div>
            <span className="text-xs font-mono text-white/90 mt-1 block">
              {personalRecords.length > 0
                ? "Peak strength milestones"
                : "No PRs recorded yet"}
            </span>
          </div>
          <Link
            href="/progress"
            className="text-[11px] font-heading font-black text-white hover:underline flex items-center gap-1 uppercase tracking-wider"
          >
            <span>View PR Wall</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </Link>
        </div>
      </div>

      {/* Middle Row: Volume Trajectory Chart & Quick Routine Launcher */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Volume Trajectory Chart (Pure White Container) */}
        <div className="lg:col-span-8 bento-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b-2 border-[#171717]/15 pb-3">
            <div>
              <h3 className="text-lg font-heading font-black text-[#171717] uppercase tracking-tight">
                Recent Training Volume Trajectory
              </h3>
              <p className="text-xs text-[#171717]/70 font-mono mt-0.5">
                Total load lifted per completed session (kg)
              </p>
            </div>
            <Link
              href="/history"
              className="text-xs font-mono font-bold text-[#3155F5] hover:underline uppercase"
            >
              Full History →
            </Link>
          </div>

          <div className="h-60 w-full">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-[#171717]/60 font-mono">
                Log a workout to view volume trajectory.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3155F5" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#E9F56A" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2DAC9" />
                  <XAxis dataKey="date" stroke="#171717" fontSize={11} fontStyle="bold" />
                  <YAxis stroke="#171717" fontSize={11} fontStyle="bold" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      border: "2px solid #171717",
                      borderRadius: "8px",
                      boxShadow: "4px 4px 0px #171717",
                      fontSize: "12px",
                      fontFamily: "monospace",
                      fontWeight: "bold",
                      color: "#171717",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="volume"
                    name="Volume (kg)"
                    stroke="#3155F5"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#volGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right: Active Routine Bento Card (Acid Yellow) */}
        <div className="lg:col-span-4 bento-card-acid p-6 flex flex-col justify-between space-y-4 rounded-xl">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#171717] font-black">
                Active Routine
              </span>
              {activePlan && (
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-[#3155F5] text-white font-black border border-[#171717] shadow-neo-sm">
                  {activePlan.phaseId || "Bulking"}
                </span>
              )}
            </div>
            <h3 className="text-2xl font-heading font-black text-[#171717] leading-tight uppercase">
              {activePlan ? activePlan.name : "No Active Routine"}
            </h3>
            <p className="text-xs text-[#171717]/80 mt-2 line-clamp-2 leading-relaxed font-sans">
              {activePlan
                ? activePlan.description || "Routine split active."
                : "No workout split currently active. Build a plan to track volume & double progression."}
            </p>
          </div>

          <div className="space-y-3 pt-3 border-t-2 border-[#171717]/20">
            <div className="text-xs font-mono font-bold text-[#171717]">
              Prescribed Days: {activePlan ? `${activePlan.days.length} Routine Splits` : "0 Routine Splits"}
            </div>
            <Link
              href="/plans"
              className="w-full py-2.5 px-4 rounded-lg bg-[#3155F5] hover:bg-[#2542C7] text-white text-xs font-heading font-black uppercase tracking-wider text-center block border-2 border-[#171717] shadow-neo transition-transform active:translate-x-0.5 active:translate-y-0.5"
            >
              {activePlan ? "Configure Routine Days" : "Create First Workout Plan"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
