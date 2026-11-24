"use client";

import { useState, useMemo } from "react";
import { useHistoryStore } from "@/stores/useHistoryStore";
import { useExerciseStore } from "@/stores/useExerciseStore";
import { calculate1RM } from "@/lib/calculations/strength";
import MuscleHeatmap from "@/components/analytics/MuscleHeatmap";
import {
  NEO_TOOLTIP_STYLE,
  CHART_GRID_COLOR,
  CHART_AXIS_COLOR,
} from "@/components/charts/chartStyles";
import { PageHeader, PastelCard, PastelBadge } from "@/components/ui/DesignSystem";
import { Award } from "lucide-react";
import { cn } from "@/lib/utils";
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

const TIME_FILTERS = [
  { label: "7 Days", value: 7 },
  { label: "30 Days", value: 30 },
  { label: "3 Months", value: 90 },
  { label: "All Time", value: 9999 },
];

export default function ProgressPage() {
  const { sessions, personalRecords } = useHistoryStore();
  const { exercises } = useExerciseStore();

  const [selectedTimeFilter, setSelectedTimeFilter] = useState(30);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");
  const activeExerciseId = selectedExerciseId || exercises[0]?.id || "";

  const filteredSessions = useMemo(() => {
    const cutoffDate = Date.now() - selectedTimeFilter * 24 * 60 * 60 * 1000;
    return sessions.filter(
      (s) => new Date(s.completedAt || s.startedAt).getTime() >= cutoffDate
    );
  }, [sessions, selectedTimeFilter]);

  const volumeData = useMemo(() => {
    return [...filteredSessions]
      .sort(
        (a, b) =>
          new Date(a.completedAt || a.startedAt).getTime() -
          new Date(b.completedAt || b.startedAt).getTime()
      )
      .map((s) => ({
        date: new Date(s.completedAt || s.startedAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        volume: s.totalVolume,
      }));
  }, [filteredSessions]);

  const exerciseProgressData = useMemo(() => {
    const dataPoints: { date: string; maxWeight: number; estimated1RM: number }[] = [];

    [...sessions]
      .sort(
        (a, b) =>
          new Date(a.completedAt || a.startedAt).getTime() -
          new Date(b.completedAt || b.startedAt).getTime()
      )
      .forEach((sess) => {
        const found = sess.exercises.find((e) => e.exerciseId === activeExerciseId);
        if (found) {
          let highestWeight = 0;
          let highest1RM = 0;

          found.sets.forEach((s) => {
            if (s.isCompleted && s.setType !== "warmup" && s.weight > 0) {
              if (s.weight > highestWeight) highestWeight = s.weight;
              const calc = calculate1RM(s.weight, s.reps);
              if (calc > highest1RM) highest1RM = calc;
            }
          });

          if (highestWeight > 0) {
            dataPoints.push({
              date: new Date(sess.completedAt || sess.startedAt).toLocaleDateString(
                "en-US",
                { month: "short", day: "numeric" }
              ),
              maxWeight: highestWeight,
              estimated1RM: highest1RM,
            });
          }
        }
      });

    return dataPoints;
  }, [sessions, activeExerciseId]);

  const muscleDistributionData = useMemo(() => {
    const counts: Record<string, number> = {};

    filteredSessions.forEach((sess) => {
      sess.exercises.forEach((ex) => {
        const exMeta = exercises.find((e) => e.id === ex.exerciseId);
        const muscle = exMeta?.primaryMuscleGroup || "other";
        const completedCount = ex.sets.filter(
          (s) => s.isCompleted && s.setType !== "warmup"
        ).length;
        counts[muscle] = (counts[muscle] || 0) + completedCount;
      });
    });

    return Object.entries(counts).map(([name, value]) => ({
      name: name.replace("_", " "),
      value,
    }));
  }, [filteredSessions, exercises]);

  const totalVolumeInWindow = filteredSessions.reduce(
    (acc, s) => acc + s.totalVolume,
    0
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Strength Analytics"
        subtitle="Epley 1RM trajectory, training volume distribution, and verified personal record logs."
        badge={<PastelBadge tone="lavender">Double Progression</PastelBadge>}
        actions={
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-1 p-1 rounded-xl bg-white border-[1.5px] border-[#142746] shadow-neo-sm w-full sm:w-auto">
            {TIME_FILTERS.map((tf) => (
              <button
                key={tf.value}
                onClick={() => setSelectedTimeFilter(tf.value)}
                className={cn(
                  "flex-1 sm:flex-initial min-h-[38px] px-2.5 sm:px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer border font-bold whitespace-nowrap",
                  selectedTimeFilter === tf.value
                    ? "bg-[#E9FF91] text-[#142746] border-[#142746]"
                    : "border-transparent text-[#8993A5] hover:text-[#142746]"
                )}
              >
                {tf.label}
              </button>
            ))}
          </div>
        }
      />

      {/* Top Pastel Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-4">
        <PastelCard tone="green" className="p-4 sm:p-5">
          <span className="text-[11px] font-bold uppercase text-[#142746]/70 block mb-1">
            Period Volume
          </span>
          <div className="stat-fluid-lg stat-number text-[#142746] break-words">
            {totalVolumeInWindow.toLocaleString()} kg
          </div>
          <span className="text-[11px] font-medium text-[#142746]/75 mt-1 block">
            Across {filteredSessions.length} sessions
          </span>
        </PastelCard>

        <PastelCard tone="coral" className="p-4 sm:p-5">
          <span className="text-[11px] font-bold uppercase text-[#142746]/70 block mb-1">
            Personal Records
          </span>
          <div className="stat-fluid-lg stat-number text-[#142746]">
            {personalRecords.length}
          </div>
          <span className="text-[11px] font-medium text-[#142746]/75 mt-1 block">
            Max weights &amp; 1RM records
          </span>
        </PastelCard>

        <PastelCard tone="white" className="p-4 sm:p-5">
          <span className="text-[11px] font-bold uppercase text-[#142746]/70 block mb-1">
            Workouts Logged
          </span>
          <div className="stat-fluid-lg stat-number text-[#142746]">
            {filteredSessions.length}
          </div>
          <span className="text-[11px] font-medium text-[#142746]/75 mt-1 block">
            In selected timeframe
          </span>
        </PastelCard>

        <PastelCard tone="yellow" className="p-4 sm:p-5">
          <span className="text-[11px] font-bold uppercase text-[#142746]/70 block mb-1">
            Formula Used
          </span>
          <div className="font-heading font-extrabold text-lg text-[#142746] mt-1">
            Epley 1RM
          </div>
          <span className="text-[11px] font-medium text-[#142746]/75 mt-1 block">
            Weight × (1 + Reps / 30)
          </span>
        </PastelCard>
      </div>

      {/* Interactive 2D Human Body Muscle Heatmap */}
      <MuscleHeatmap
        sessions={sessions}
        exercises={exercises}
        defaultTimeFilter={selectedTimeFilter}
      />

      {/* Volume Chart & Muscle Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <PastelCard tone="white" className="lg:col-span-7 p-5 space-y-4">
          <div>
            <h3 className="font-heading font-extrabold text-lg text-[#142746]">
              Training Volume Progression
            </h3>
            <p className="text-xs text-[#8993A5] mt-0.5">
              Accumulated working set load per session (kg)
            </p>
          </div>

          <div className="h-[220px] sm:h-[260px] w-full min-w-0">
            {volumeData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-[#8993A5] font-semibold bg-[#FAF9FD] rounded-xl border border-dashed border-[#142746]/25">
                No volume records in this timeframe.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volumeData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} />
                  <XAxis dataKey="date" stroke={CHART_AXIS_COLOR} fontSize={11} interval="preserveStartEnd" />
                  <YAxis stroke={CHART_AXIS_COLOR} fontSize={11} width={48} />
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

        <PastelCard tone="white" className="lg:col-span-5 p-5 space-y-4">
          <div>
            <h3 className="font-heading font-extrabold text-lg text-[#142746]">
              Muscle Group Distribution
            </h3>
            <p className="text-xs text-[#8993A5] mt-0.5">
              Working sets completed by anatomical zone
            </p>
          </div>

          <div className="h-[220px] sm:h-[260px] w-full min-w-0">
            {muscleDistributionData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-[#8993A5] font-semibold bg-[#FAF9FD] rounded-xl border border-dashed border-[#142746]/25">
                No working set data recorded.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={muscleDistributionData}
                  layout="vertical"
                  margin={{ top: 4, right: 12, left: 4, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} />
                  <XAxis type="number" stroke={CHART_AXIS_COLOR} fontSize={11} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke={CHART_AXIS_COLOR}
                    fontSize={11}
                    width={72}
                  />
                  <Tooltip contentStyle={NEO_TOOLTIP_STYLE} />
                  <Bar
                    dataKey="value"
                    name="Sets"
                    fill="#EBCBF7"
                    stroke="#142746"
                    strokeWidth={1.5}
                    radius={[0, 6, 6, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </PastelCard>
      </div>

      {/* Specific Exercise 1RM Tracker */}
      <PastelCard tone="white" className="p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-heading font-extrabold text-lg text-[#142746]">
              Estimated 1RM Progression
            </h3>
            <p className="text-xs text-[#8993A5] mt-0.5">
              Tracking strength milestones over time using the Epley formula
            </p>
          </div>

          <select
            value={activeExerciseId}
            onChange={(e) => setSelectedExerciseId(e.target.value)}
            disabled={exercises.length === 0}
            className="w-full sm:w-auto max-w-full min-h-[42px] px-3 py-2 rounded-xl bg-[#FAF9FD] border-[1.5px] border-[#142746] text-xs font-bold text-[#142746] cursor-pointer disabled:opacity-50 focus:outline-none"
          >
            {exercises.length === 0 ? (
              <option value="">No exercises in library</option>
            ) : (
              exercises.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="h-[220px] sm:h-[260px] w-full min-w-0">
          {exercises.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-[#8993A5] font-semibold bg-[#FAF9FD] rounded-xl border border-dashed border-[#142746]/25 p-4 text-center">
              Add movements to your exercise library and log sets to view 1RM trajectory.
            </div>
          ) : exerciseProgressData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-[#8993A5] font-semibold bg-[#FAF9FD] rounded-xl border border-dashed border-[#142746]/25 p-4 text-center">
              No historical logged sets for this movement yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={exerciseProgressData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} />
                <XAxis dataKey="date" stroke={CHART_AXIS_COLOR} fontSize={11} interval="preserveStartEnd" />
                <YAxis stroke={CHART_AXIS_COLOR} fontSize={11} width={44} />
                <Tooltip contentStyle={NEO_TOOLTIP_STYLE} />
                <Area
                  type="monotone"
                  dataKey="estimated1RM"
                  name="Est 1RM (kg)"
                  stroke="#142746"
                  strokeWidth={2.5}
                  fill="#F8C3B5"
                  fillOpacity={0.55}
                />
                <Area
                  type="monotone"
                  dataKey="maxWeight"
                  name="Max Weight (kg)"
                  stroke="#142746"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  fill="none"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </PastelCard>

      {/* Personal Records Hall of Fame */}
      <PastelCard tone="white" className="p-5 space-y-4">
        <div>
          <h3 className="font-heading font-extrabold text-lg text-[#142746] flex items-center gap-2">
            <Award className="w-5 h-5 text-[#142746]" />
            <span>Personal Records Hall of Fame</span>
          </h3>
          <p className="text-xs text-[#8993A5] mt-0.5">
            Verified peak achievements logged during completed workouts
          </p>
        </div>

        {personalRecords.length === 0 ? (
          <p className="text-xs text-[#8993A5] font-semibold">No personal records logged yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {personalRecords.map((pr) => {
              const exMeta = exercises.find((ex) => ex.id === pr.exerciseId);

              return (
                <div
                  key={pr.id}
                  className="p-3.5 rounded-2xl bg-[#FAF9FD] border-[1.5px] border-[#142746] shadow-neo-sm flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <h4 className="font-heading font-extrabold text-sm text-[#142746] truncate">
                      {exMeta?.name || pr.exerciseName || "Exercise"}
                    </h4>
                    <span className="text-[11px] font-medium text-[#8993A5] capitalize">
                      {pr.prType.replace("_", " ")}: {pr.weight} kg × {pr.reps} reps
                    </span>
                  </div>
                  <div className="px-2.5 py-1 rounded-xl bg-[#F8C3B5] border border-[#142746] font-extrabold text-xs text-[#142746] shrink-0">
                    {pr.value} kg
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </PastelCard>
    </div>
  );
}
