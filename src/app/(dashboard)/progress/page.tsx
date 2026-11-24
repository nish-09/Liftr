"use client";

import { useState, useMemo } from "react";
import { useHistoryStore } from "@/stores/useHistoryStore";
import { useExerciseStore } from "@/stores/useExerciseStore";
import { calculate1RM } from "@/lib/calculations/strength";
import MuscleHeatmap from "@/components/analytics/MuscleHeatmap";
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
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(
    exercises[0]?.id || ""
  );

  // Filter sessions by selected time window
  const filteredSessions = useMemo(() => {
    const cutoffDate = Date.now() - selectedTimeFilter * 24 * 60 * 60 * 1000;
    return sessions.filter(
      (s) => new Date(s.completedAt || s.startedAt).getTime() >= cutoffDate
    );
  }, [sessions, selectedTimeFilter]);

  // Volume Progression over time
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

  // Exercise 1RM / Strength progression for selected exercise
  const exerciseProgressData = useMemo(() => {
    const dataPoints: { date: string; maxWeight: number; estimated1RM: number }[] = [];

    [...sessions]
      .sort(
        (a, b) =>
          new Date(a.completedAt || a.startedAt).getTime() -
          new Date(b.completedAt || b.startedAt).getTime()
      )
      .forEach((sess) => {
        const found = sess.exercises.find((e) => e.exerciseId === selectedExerciseId);
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
  }, [sessions, selectedExerciseId]);

  // Muscle group working set distribution
  const muscleDistributionData = useMemo(() => {
    const counts: Record<string, number> = {};

    filteredSessions.forEach((sess) => {
      sess.exercises.forEach((ex) => {
        const exMeta = exercises.find((e) => e.id === ex.exerciseId);
        const muscle = exMeta?.primaryMuscleGroup || "other";
        const completedCount = ex.sets.filter((s) => s.isCompleted && s.setType !== "warmup").length;
        counts[muscle] = (counts[muscle] || 0) + completedCount;
      });
    });

    return Object.entries(counts).map(([name, value]) => ({
      name: name.replace("_", " "),
      value,
    }));
  }, [filteredSessions, exercises]);

  // Aggregate stats
  const totalVolumeInWindow = filteredSessions.reduce(
    (acc, s) => acc + s.totalVolume,
    0
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading font-black text-3xl md:text-4xl text-[#171717] tracking-tight uppercase">
              STRENGTH ANALYTICS
            </h1>
            <span className="px-2.5 py-1 rounded-lg bg-[#3155F5] text-white border-2 border-[#171717] text-xs font-mono font-bold shadow-neo-sm">
              Double Progression Engine
            </span>
          </div>
          <p className="text-sm text-[#171717]/70 font-sans mt-1">
            Epley 1RM trajectory, training volume distribution, and verified personal record logs.
          </p>
        </div>

        {/* Time Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white border-2 border-[#171717] shadow-neo-sm">
          {TIME_FILTERS.map((tf) => (
            <button
              key={tf.value}
              onClick={() => setSelectedTimeFilter(tf.value)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer border-2",
                selectedTimeFilter === tf.value
                  ? "bg-[#3155F5] text-[#E9F56A] border-[#171717] font-black shadow-neo-sm"
                  : "border-transparent text-[#171717]/70 hover:text-[#171717] font-bold"
              )}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top Bento Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border-2 border-[#171717] rounded-xl shadow-neo p-4">
          <span className="text-[10px] font-mono uppercase font-black text-[#171717]/70 block mb-1">
            Period Volume
          </span>
          <div className="font-heading font-black text-2xl md:text-3xl text-[#3155F5] tracking-tight">
            {totalVolumeInWindow.toLocaleString()} kg
          </div>
          <span className="text-[11px] font-mono font-bold text-[#171717]/60 mt-1 block">
            Across {filteredSessions.length} completed sessions
          </span>
        </div>

        <div className="bg-white border-2 border-[#171717] rounded-xl shadow-neo p-4">
          <span className="text-[10px] font-mono uppercase font-black text-[#171717]/70 block mb-1">
            Personal Records
          </span>
          <div className="font-heading font-black text-2xl md:text-3xl text-[#FF7043] tracking-tight">
            {personalRecords.length}
          </div>
          <span className="text-[11px] font-mono font-bold text-[#171717]/60 mt-1 block">
            Max weights &amp; 1RM records
          </span>
        </div>

        <div className="bg-white border-2 border-[#171717] rounded-xl shadow-neo p-4">
          <span className="text-[10px] font-mono uppercase font-black text-[#171717]/70 block mb-1">
            Workouts Logged
          </span>
          <div className="font-heading font-black text-2xl md:text-3xl text-[#171717] tracking-tight">
            {filteredSessions.length}
          </div>
          <span className="text-[11px] font-mono font-bold text-[#171717]/60 mt-1 block">
            In selected timeframe
          </span>
        </div>

        <div className="bg-white border-2 border-[#171717] rounded-xl shadow-neo p-4">
          <span className="text-[10px] font-mono uppercase font-black text-[#171717]/70 block mb-1">
            Formula Used
          </span>
          <div className="font-heading font-black text-lg text-[#171717] mt-1">
            Epley 1RM
          </div>
          <span className="text-[10px] font-mono font-bold text-[#171717]/60 mt-1 block">
            Weight × (1 + Reps / 30)
          </span>
        </div>
      </div>

      {/* Interactive 2D Human Body Muscle Heatmap */}
      <MuscleHeatmap
        sessions={sessions}
        exercises={exercises}
        defaultTimeFilter={selectedTimeFilter}
      />

      {/* Volume Chart & Strength Progression Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Overall Volume Chart */}
        <div className="lg:col-span-7 bg-white border-2 border-[#171717] rounded-xl shadow-neo p-5 space-y-4">
          <div>
            <h3 className="font-heading font-black text-lg text-[#171717] tracking-tight uppercase">
              TRAINING VOLUME PROGRESSION
            </h3>
            <p className="text-xs text-[#171717]/70 font-mono font-bold mt-0.5">
              Accumulated working set load per session (kg)
            </p>
          </div>

          <div className="h-64 w-full">
            {volumeData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-[#171717]/60 font-mono font-bold">
                No volume records in this timeframe.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volumeData}>
                  <defs>
                    <linearGradient id="volGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3155F5" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#E9F56A" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#171717" opacity={0.15} />
                  <XAxis dataKey="date" stroke="#171717" fontSize={11} tick={{ fill: "#171717", fontWeight: "bold" }} />
                  <YAxis stroke="#171717" fontSize={11} tick={{ fill: "#171717", fontWeight: "bold" }} />
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
                    fill="url(#volGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right: Muscle Group Balance */}
        <div className="lg:col-span-5 bg-white border-2 border-[#171717] rounded-xl shadow-neo p-5 space-y-4">
          <div>
            <h3 className="font-heading font-black text-lg text-[#171717] tracking-tight uppercase">
              MUSCLE GROUP DISTRIBUTION
            </h3>
            <p className="text-xs text-[#171717]/70 font-mono font-bold mt-0.5">
              Working sets completed by anatomical zone
            </p>
          </div>

          <div className="h-64 w-full">
            {muscleDistributionData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-[#171717]/60 font-mono font-bold">
                No working set data recorded.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={muscleDistributionData}
                  layout="vertical"
                  margin={{ left: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#171717" opacity={0.15} />
                  <XAxis type="number" stroke="#171717" fontSize={11} tick={{ fill: "#171717", fontWeight: "bold" }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#171717"
                    fontSize={11}
                    width={80}
                    tick={{ fill: "#171717", fontWeight: "bold" }}
                  />
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
                  <Bar dataKey="value" name="Sets" fill="#3155F5" stroke="#171717" strokeWidth={2} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Specific Exercise 1RM Tracker */}
      <div className="bg-white border-2 border-[#171717] rounded-xl shadow-neo p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-heading font-black text-lg text-[#171717] tracking-tight uppercase">
              ESTIMATED 1RM PROGRESSION
            </h3>
            <p className="text-xs text-[#171717]/70 font-mono font-bold mt-0.5">
              Tracking strength milestones over time using Epley formula
            </p>
          </div>

          <select
            value={selectedExerciseId}
            onChange={(e) => setSelectedExerciseId(e.target.value)}
            disabled={exercises.length === 0}
            className="px-3 py-2 rounded-lg bg-[#F5F1E8] border-2 border-[#171717] text-xs font-mono font-bold text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#3155F5] shadow-neo-sm cursor-pointer disabled:opacity-50"
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

        <div className="h-64 w-full">
          {exercises.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-[#171717]/60 font-mono font-bold">
              Add movements to your exercise library and log sets to view 1RM trajectory.
            </div>
          ) : exerciseProgressData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-[#171717]/60 font-mono font-bold">
              No historical logged sets for this movement yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={exerciseProgressData}>
                <defs>
                  <linearGradient id="strengthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF7043" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#FF7043" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#171717" opacity={0.15} />
                <XAxis dataKey="date" stroke="#171717" fontSize={11} tick={{ fill: "#171717", fontWeight: "bold" }} />
                <YAxis stroke="#171717" fontSize={11} tick={{ fill: "#171717", fontWeight: "bold" }} />
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
                  dataKey="estimated1RM"
                  name="Est 1RM (kg)"
                  stroke="#FF7043"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#strengthGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="maxWeight"
                  name="Max Weight (kg)"
                  stroke="#3155F5"
                  strokeWidth={3}
                  fill="none"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Personal Records Archive Grid */}
      <div className="bg-white border-2 border-[#171717] rounded-xl shadow-neo p-5 space-y-4">
        <div>
          <h3 className="font-heading font-black text-lg text-[#171717] tracking-tight flex items-center gap-2 uppercase">
            <Award className="w-5 h-5 text-[#FF7043] stroke-[2.5]" />
            <span>PERSONAL RECORDS HALL OF FAME</span>
          </h3>
          <p className="text-xs text-[#171717]/70 font-mono font-bold mt-0.5">
            Verified peak achievements logged during completed workouts
          </p>
        </div>

        {personalRecords.length === 0 ? (
          <p className="text-xs text-[#171717]/60 font-mono font-bold">No personal records logged yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {personalRecords.map((pr) => {
              const exMeta = exercises.find((ex) => ex.id === pr.exerciseId);

              return (
                <div
                  key={pr.id}
                  className="p-3.5 rounded-xl bg-[#F5F1E8] border-2 border-[#171717] shadow-neo-sm flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-heading font-black text-sm text-[#171717] uppercase">
                      {exMeta?.name || pr.exerciseName || "Exercise"}
                    </h4>
                    <span className="text-[10px] font-mono uppercase font-bold text-[#171717]/60">
                      {pr.prType.replace("_", " ")}: {pr.weight} kg × {pr.reps} reps
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-heading font-black text-lg text-[#FF7043]">
                      {pr.value} kg
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
