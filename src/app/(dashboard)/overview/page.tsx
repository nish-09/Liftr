"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useHistoryStore } from "@/stores/useHistoryStore";
import { usePlanStore } from "@/stores/usePlanStore";
import { useBodyStore } from "@/stores/useBodyStore";
import { useDashboardUser } from "@/components/common/UserContext";
import { calculateBMI } from "@/lib/calculations/strength";
import { formatDuration } from "@/lib/utils";
import {
  NEO_TOOLTIP_STYLE,
  CHART_GRID_COLOR,
  CHART_AXIS_COLOR,
} from "@/components/charts/chartStyles";
import { PastelCard } from "@/components/ui/DesignSystem";
import {
  Play,
  CalendarDays,
  Dumbbell,
  Scale,
  Award,
  Flame,
  ArrowRight,
  Search,
  Target,
  Activity,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function OverviewPage() {
  const { displayName } = useDashboardUser();
  const { sessions, personalRecords } = useHistoryStore();
  const { plans } = usePlanStore();
  const { userBodyProfile, weightLogs } = useBodyStore();

  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const activePlan = plans.find((p) => p.isActive) || plans[0];

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  // Weekly metrics
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const workoutsThisWeek = useMemo(
    () =>
      sessions.filter(
        (s) => new Date(s.completedAt || s.startedAt).getTime() >= oneWeekAgo
      ),
    [sessions, oneWeekAgo]
  );

  const weeklyVolume = useMemo(
    () => workoutsThisWeek.reduce((acc, s) => acc + s.totalVolume, 0),
    [workoutsThisWeek]
  );

  // Dynamic streak
  const { streakCount, streakStatus } = useMemo(() => {
    if (sessions.length === 0) {
      return { streakCount: 0, streakStatus: "No active streak" };
    }
    const workoutDates = Array.from(
      new Set(sessions.map((s) => (s.completedAt || s.startedAt).split("T")[0]))
    ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    if (workoutDates[0] !== today && workoutDates[0] !== yesterday) {
      return { streakCount: 0, streakStatus: "Streak inactive" };
    }

    let streak = 1;
    const currentDate = new Date(workoutDates[0]);
    for (let i = 1; i < workoutDates.length; i++) {
      currentDate.setDate(currentDate.getDate() - 1);
      if (workoutDates[i] === currentDate.toISOString().split("T")[0]) {
        streak++;
      } else {
        break;
      }
    }

    return {
      streakCount: streak,
      streakStatus: streak > 2 ? "High momentum" : "Active streak",
    };
  }, [sessions]);

  // Strength volume chart data (last 7 sessions)
  const volumeChartData = useMemo(() => {
    return [...sessions]
      .slice(0, 7)
      .reverse()
      .map((s) => ({
        date: new Date(s.completedAt || s.startedAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        volume: s.totalVolume,
      }));
  }, [sessions]);

  // Weekly 7-day activity bars (real working sets completed per weekday)
  const weeklyActivityData = useMemo(() => {
    const days: { label: string; sets: number }[] = [];
    for (let offset = 6; offset >= 0; offset--) {
      const d = new Date(Date.now() - offset * 86400000);
      const iso = d.toISOString().split("T")[0];
      const setsCount = sessions
        .filter((s) => (s.completedAt || s.startedAt).split("T")[0] === iso)
        .reduce(
          (acc, s) =>
            acc +
            s.exercises.reduce(
              (eAcc, ex) => eAcc + ex.sets.filter((st) => st.isCompleted).length,
              0
            ),
          0
        );
      days.push({
        label: d.toLocaleDateString("en-US", { weekday: "short" }),
        sets: setsCount,
      });
    }
    return days;
  }, [sessions]);

  const recentWorkouts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = q
      ? sessions.filter((s) => s.name.toLowerCase().includes(q))
      : sessions;
    return list.slice(0, 4);
  }, [sessions, searchQuery]);

  // Body composition snapshot
  const currentWeight =
    weightLogs[0]?.weight ?? userBodyProfile.startingWeight ?? null;
  const startWeight =
    userBodyProfile.startingWeight ??
    (weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight : null);
  const targetWeight = userBodyProfile.targetWeight ?? null;
  const heightCm = userBodyProfile.height ?? null;
  const bmiData =
    currentWeight != null && heightCm != null && heightCm > 0
      ? calculateBMI(currentWeight, heightCm)
      : null;

  const targetProgressPct =
    currentWeight != null && startWeight != null && targetWeight != null
      ? (() => {
          const span = Math.abs(targetWeight - startWeight);
          if (span <= 0) return 100;
          return Math.min(100, Math.round((Math.abs(currentWeight - startWeight) / span) * 100));
        })()
      : 0;

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* Greeting Header + Search + Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-heading text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#142746] tracking-tight break-words">
            {greeting}, {displayName}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full lg:w-auto">
          <div className="relative w-full sm:w-56">
            <Search className="w-4 h-4 text-[#8993A5] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search workouts..."
              className="w-full min-h-[44px] pl-9 pr-3 py-2 rounded-xl bg-white border-[1.5px] border-[#142746] text-xs text-[#142746] placeholder:text-[#8993A5] focus:outline-none focus:ring-2 focus:ring-[#142746]/30"
            />
          </div>

          <Link
            href="/workouts"
            className="neo-btn min-h-[44px] px-4 py-2 rounded-xl bg-[#142746] text-white text-xs font-heading font-bold inline-flex items-center justify-center gap-1.5 flex-1 sm:flex-initial"
          >
            <Play className="w-3.5 h-3.5 fill-[#E9FF91] text-[#E9FF91]" />
            <span>Start Workout</span>
          </Link>

          <Link
            href="/weight-tracker"
            className="neo-btn min-h-[44px] px-3.5 py-2 rounded-xl bg-[#E9FF91] text-[#142746] text-xs font-heading font-bold inline-flex items-center justify-center gap-1.5 flex-1 sm:flex-initial"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Log Weight</span>
          </Link>
        </div>
      </div>

      {/* Four Primary Pastel Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-4">
        <PastelCard tone="white" interactive className="p-4 sm:p-5 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#142746]/80">Workouts (7d)</span>
            <CalendarDays className="w-4 h-4 text-[#142746] shrink-0" />
          </div>
          <div className="stat-fluid-lg stat-number text-[#142746] break-words">
            {workoutsThisWeek.length}
          </div>
          <div className="w-full h-2 rounded-full bg-[#FAF9FD] border border-[#142746] overflow-hidden">
            <div
              className="h-full bg-[#142746] transition-all duration-500"
              style={{ width: `${Math.min(100, (workoutsThisWeek.length / 4) * 100)}%` }}
            />
          </div>
        </PastelCard>

        <PastelCard tone="lime" interactive className="p-4 sm:p-5 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#142746]/80">Streak</span>
            <Flame className="w-4 h-4 text-[#142746] fill-[#F8C3B5] shrink-0" />
          </div>
          <div className="stat-fluid-lg stat-number text-[#142746] break-words">
            {streakCount}{" "}
            <span className="text-base font-bold">{streakCount === 1 ? "Day" : "Days"}</span>
          </div>
          <span className="text-xs font-semibold text-[#142746]/75 truncate">
            {activePlan ? activePlan.name : "No active plan"}
          </span>
        </PastelCard>

        <PastelCard tone="green" interactive className="p-4 sm:p-5 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#142746]/80">Weekly Volume</span>
            <Dumbbell className="w-4 h-4 text-[#142746] shrink-0" />
          </div>
          <div className="stat-fluid-lg stat-number text-[#142746] break-words">
            {weeklyVolume.toLocaleString()} <span className="text-base font-bold">kg</span>
          </div>
          <Link
            href="/progress"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#142746] hover:underline"
          >
            <span>Analytics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </PastelCard>

        <PastelCard tone="coral" interactive className="p-4 sm:p-5 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#142746]/80">Personal Records</span>
            <Award className="w-4 h-4 text-[#142746] shrink-0" />
          </div>
          <div className="stat-fluid-lg stat-number text-[#142746] break-words">
            {personalRecords.length}
          </div>
          <Link
            href="/progress"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#142746] hover:underline"
          >
            <span>View PRs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </PastelCard>
      </div>

      {/* Main Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Strength Progression Volume Chart */}
        <PastelCard tone="white" className="lg:col-span-7 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#142746]/10 pb-3">
            <h3 className="font-heading font-extrabold text-base text-[#142746]">
              Session Volume (kg)
            </h3>
            <Link
              href="/progress"
              className="text-xs font-bold text-[#142746] hover:underline"
            >
              Details →
            </Link>
          </div>

          <div className="h-[210px] sm:h-[240px] w-full min-w-0">
            {volumeChartData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center gap-2 bg-[#FAF9FD] rounded-xl border border-dashed border-[#142746]/25 p-4">
                <p className="text-xs font-semibold text-[#8993A5]">
                  No completed workouts yet.
                </p>
                <Link
                  href="/workouts"
                  className="text-xs font-bold text-[#142746] underline"
                >
                  Start Workout
                </Link>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volumeChartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} />
                  <XAxis dataKey="date" stroke={CHART_AXIS_COLOR} fontSize={11} interval="preserveStartEnd" />
                  <YAxis stroke={CHART_AXIS_COLOR} fontSize={11} width={44} />
                  <Tooltip contentStyle={NEO_TOOLTIP_STYLE} />
                  <Area
                    type="monotone"
                    dataKey="volume"
                    name="Volume (kg)"
                    stroke="#142746"
                    strokeWidth={2.5}
                    fill="#BDF7B6"
                    fillOpacity={0.65}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </PastelCard>

        {/* Weekly Training Activity (Sets Completed per Day) */}
        <PastelCard tone="white" className="lg:col-span-5 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#142746]/10 pb-3">
            <h3 className="font-heading font-extrabold text-base text-[#142746]">
              Weekly Sets
            </h3>
            <span className="text-xs font-bold text-[#8993A5]">Last 7 days</span>
          </div>

          <div className="h-[210px] sm:h-[240px] w-full min-w-0">
            {sessions.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center bg-[#FAF9FD] rounded-xl border border-dashed border-[#142746]/25 p-4 text-xs font-semibold text-[#8993A5]">
                No sets logged in the last 7 days.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyActivityData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} />
                  <XAxis dataKey="label" stroke={CHART_AXIS_COLOR} fontSize={11} />
                  <YAxis stroke={CHART_AXIS_COLOR} fontSize={11} allowDecimals={false} width={34} />
                  <Tooltip contentStyle={NEO_TOOLTIP_STYLE} />
                  <Bar
                    dataKey="sets"
                    name="Sets"
                    fill="#EBCBF7"
                    stroke="#142746"
                    strokeWidth={1.5}
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </PastelCard>

        {/* Recent Workouts Card */}
        <PastelCard tone="white" className="lg:col-span-7 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#142746]/10 pb-3">
            <h3 className="font-heading font-extrabold text-base text-[#142746]">
              Recent Workouts
            </h3>
            <Link href="/history" className="text-xs font-bold text-[#142746] hover:underline">
              History →
            </Link>
          </div>

          {recentWorkouts.length === 0 ? (
            <div className="py-8 text-center rounded-xl bg-[#FAF9FD] border border-dashed border-[#142746]/25 text-xs font-semibold text-[#8993A5]">
              {searchQuery
                ? "No workouts match your search."
                : "No recent workouts logged yet."}
            </div>
          ) : (
            <div className="space-y-2">
              {recentWorkouts.map((sess) => {
                const dateLabel = new Date(
                  sess.completedAt || sess.startedAt
                ).toLocaleDateString("en-US", { month: "short", day: "numeric" });
                return (
                  <Link
                    key={sess.id}
                    href="/history"
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#FAF9FD] hover:bg-[#E9FF91]/45 border border-[#142746]/20 hover:border-[#142746] transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="font-heading font-bold text-sm text-[#142746] truncate">
                        {sess.name}
                      </div>
                      <div className="text-xs text-[#8993A5] mt-0.5">
                        {dateLabel} · {sess.exercises.length} exercises
                        {sess.durationSeconds > 0 && ` · ${formatDuration(sess.durationSeconds)}`}
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-[#BDF7B6] border border-[#142746] text-xs font-bold text-[#142746] shrink-0">
                      {sess.totalVolume.toLocaleString()} kg
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </PastelCard>

        {/* Body Weight & BMI Summary */}
        <div className="lg:col-span-5 space-y-4">
          <PastelCard tone="yellow" className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#142746]/80 flex items-center gap-1.5">
                <Target className="w-4 h-4" />
                Target Weight
              </span>
              <Link href="/weight-tracker" className="text-xs font-bold text-[#142746] underline">
                Manage
              </Link>
            </div>

            {currentWeight == null && targetWeight == null ? (
              <p className="text-xs text-[#142746]/75">
                No weight logs or target set yet.
              </p>
            ) : (
              <>
                <div className="flex items-baseline gap-2.5 font-heading font-extrabold text-2xl text-[#142746]">
                  <span>{currentWeight != null ? `${currentWeight} kg` : "--"}</span>
                  <span className="text-sm text-[#8993A5]">→</span>
                  <span>{targetWeight != null ? `${targetWeight} kg` : "--"}</span>
                  <span className="ml-auto text-xs font-bold">{targetProgressPct}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-white border border-[#142746] overflow-hidden">
                  <div
                    className="h-full bg-[#142746] transition-all duration-500"
                    style={{ width: `${targetProgressPct}%` }}
                  />
                </div>
              </>
            )}
          </PastelCard>

          <PastelCard tone="white" className="p-5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <span className="text-xs font-bold text-[#8993A5] flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-[#142746]" />
                BMI
              </span>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="stat-fluid-lg stat-number text-[#142746]">
                  {bmiData ? bmiData.bmi : "--"}
                </span>
                <span className="text-xs font-bold text-[#142746]/75">
                  {bmiData ? bmiData.category : "Not set"}
                </span>
              </div>
              {heightCm && (
                <p className="text-xs text-[#8993A5]">Height {heightCm} cm</p>
              )}
            </div>

            <Link
              href="/body-metrics"
              className="neo-btn min-h-[40px] inline-flex items-center px-3.5 py-2 rounded-xl bg-[#BDF7B6] text-[#142746] text-xs font-heading font-bold shrink-0"
            >
              Metrics →
            </Link>
          </PastelCard>
        </div>
      </div>
    </div>
  );
}
