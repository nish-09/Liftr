"use client";

import { useState, useMemo } from "react";
import { useBodyStore } from "@/stores/useBodyStore";
import { WeightUnit, GoalType, WeightLogItem } from "@/types";
import {
  Scale,
  Plus,
  Trash2,
  Calendar,
  TrendingUp,
  ArrowRight,
  Target,
  Edit2,
  AlertCircle,
  X,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

const TIME_FILTERS = [
  { label: "7 Days", value: 7 },
  { label: "30 Days", value: 30 },
  { label: "3 Months", value: 90 },
  { label: "6 Months", value: 180 },
  { label: "1 Year", value: 365 },
  { label: "All Time", value: 9999 },
];

export default function WeightTrackerPage() {
  const {
    userBodyProfile,
    weightLogs,
    logWeight,
    updateWeightLog,
    deleteWeightLog,
    updateBodyProfile,
  } = useBodyStore();

  const [selectedTimeFilter, setSelectedTimeFilter] = useState(30);

  // Log Modal State
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [logWeightValue, setLogWeightValue] = useState("");
  const [logDate, setLogDate] = useState(new Date().toISOString().split("T")[0]);
  const [logNotes, setLogNotes] = useState("");
  const [logError, setLogError] = useState<string | null>(null);

  // Target Settings Modal State
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [targetWeightVal, setTargetWeightVal] = useState(
    userBodyProfile.targetWeight || 85
  );
  const [startWeightVal, setStartWeightVal] = useState(
    userBodyProfile.startingWeight || 78.5
  );
  const [targetDateVal, setTargetDateVal] = useState(
    userBodyProfile.targetDate || ""
  );
  const [goalTypeVal, setGoalTypeVal] = useState<GoalType>(
    userBodyProfile.goalType || "gain"
  );

  // Edit Log State
  const [editingLog, setEditingLog] = useState<WeightLogItem | null>(null);
  const [editWeightVal, setEditWeightVal] = useState("");
  const [editDateVal, setEditDateVal] = useState("");
  const [editNotesVal, setEditNotesVal] = useState("");

  const currentWeight =
    weightLogs.length > 0 ? weightLogs[0].weight : userBodyProfile.startingWeight || 78.5;
  const startWeight = userBodyProfile.startingWeight || 78.5;
  const targetWeight = userBodyProfile.targetWeight || 85.0;

  // Filter weight logs by time
  const filteredLogs = useMemo(() => {
    const cutoff = Date.now() - selectedTimeFilter * 24 * 60 * 60 * 1000;
    return weightLogs.filter((w) => new Date(w.recordedAt).getTime() >= cutoff);
  }, [weightLogs, selectedTimeFilter]);

  // Chart data sorted chronologically
  const chartData = useMemo(() => {
    return [...filteredLogs]
      .reverse()
      .map((w) => ({
        date: new Date(w.recordedAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        weight: w.weight,
        target: targetWeight,
      }));
  }, [filteredLogs, targetWeight]);

  // Trajectory Calculations
  const totalChange = Number((currentWeight - startWeight).toFixed(2));
  const remainingWeight = Number(Math.abs(targetWeight - currentWeight).toFixed(2));

  const totalGoalDelta = Math.abs(targetWeight - startWeight);
  const currentProgressDelta = Math.abs(currentWeight - startWeight);
  const progressPercent =
    totalGoalDelta > 0
      ? Math.min(100, Math.round((currentProgressDelta / totalGoalDelta) * 100))
      : 100;

  // Calculate average weekly change
  const weeklyChangeRate = useMemo(() => {
    if (weightLogs.length < 2) return 0;
    const oldest = weightLogs[weightLogs.length - 1];
    const newest = weightLogs[0];
    const diffDays = Math.max(
      1,
      (new Date(newest.recordedAt).getTime() - new Date(oldest.recordedAt).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const diffKg = newest.weight - oldest.weight;
    const weeklyRate = (diffKg / diffDays) * 7;
    return Number(weeklyRate.toFixed(2));
  }, [weightLogs]);

  function handleLogWeightSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLogError(null);
    const numWeight = parseFloat(logWeightValue);
    if (isNaN(numWeight) || numWeight <= 0) return;

    const res = logWeight(numWeight, "kg", logDate, logNotes, false);
    if (!res.success) {
      setLogError(res.error || "Failed to log weight.");
      return;
    }

    setIsLogModalOpen(false);
    setLogWeightValue("");
    setLogNotes("");
  }

  function handleSaveTargetProfile(e: React.FormEvent) {
    e.preventDefault();
    updateBodyProfile({
      startingWeight: Number(startWeightVal),
      targetWeight: Number(targetWeightVal),
      targetDate: targetDateVal || null,
      goalType: goalTypeVal,
    });
    setIsTargetModalOpen(false);
  }

  function openEditLog(log: WeightLogItem) {
    setEditingLog(log);
    setEditWeightVal(String(log.weight));
    setEditDateVal(log.recordedAt);
    setEditNotesVal(log.notes || "");
  }

  function handleSaveEditLog(e: React.FormEvent) {
    e.preventDefault();
    if (!editingLog) return;
    const num = parseFloat(editWeightVal);
    if (isNaN(num) || num <= 0) return;

    updateWeightLog(editingLog.id, {
      weight: num,
      recordedAt: editDateVal,
      notes: editNotesVal,
    });

    setEditingLog(null);
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif italic text-3xl text-white">Weight Tracker</h1>
            <span className="px-2 py-0.5 rounded bg-[#1C1C1C] border border-[#2B2B2B] text-xs font-mono text-liftr-purple">
              {weightLogs.length} Checkpoints
            </span>
          </div>
          <p className="text-sm text-liftr-grey mt-0.5">
            Body weight trajectory, progressive surplus/deficit tracking, and target milestones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTargetModalOpen(true)}
            className="px-3.5 py-2.5 rounded-lg bg-[#181818] hover:bg-[#202020] border border-[#2B2B2B] text-xs font-mono uppercase text-zinc-300 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Target className="w-3.5 h-3.5 text-liftr-yellow" />
            <span>Target Config</span>
          </button>

          <button
            onClick={() => {
              setLogWeightValue(String(currentWeight));
              setLogDate(new Date().toISOString().split("T")[0]);
              setLogError(null);
              setIsLogModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-lg bg-liftr-green hover:bg-liftr-green-light text-black text-xs font-mono uppercase font-bold shadow-neo flex items-center gap-1.5 cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Log Weight</span>
          </button>
        </div>
      </div>

      {/* Prominent Bento Hero Card: Target Progress */}
      <div className="bento-card p-6 bg-gradient-to-r from-[#14121A] to-[#121212] border-liftr-purple/40 shadow-neo space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-liftr-purple font-bold">
              Goal Objective
            </span>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-liftr-purple/20 text-liftr-purple-light border border-liftr-purple/30 font-semibold">
              {userBodyProfile.goalType.toUpperCase()}
            </span>
          </div>

          <span className="text-xs font-mono text-zinc-400">
            {progressPercent}% Journey Completed
          </span>
        </div>

        {/* Big Numbers Display */}
        <div className="flex flex-wrap items-baseline gap-4 sm:gap-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-bold stat-number text-white">
              {currentWeight}
            </span>
            <span className="text-lg font-mono text-zinc-400">kg</span>
          </div>

          <div className="flex items-center text-zinc-500 font-mono text-xl">
            →
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-bold stat-number text-liftr-yellow">
              {targetWeight}
            </span>
            <span className="text-lg font-mono text-zinc-400">kg</span>
          </div>

          <div className="sm:ml-auto px-3.5 py-1.5 rounded-lg bg-[#1C1C1C] border border-[#2D2D2D] text-xs font-mono">
            <span className="text-zinc-400 block text-[10px] uppercase">Remaining</span>
            <span className="font-bold text-liftr-coral">
              {userBodyProfile.goalType === "gain" ? "+" : "-"}
              {remainingWeight} kg
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#202020] h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-liftr-purple to-liftr-yellow h-full transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Metrics Row: Starting, Target, Net, Rate */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bento-card p-4">
          <span className="text-[10px] font-mono uppercase text-liftr-grey block mb-1">
            Starting Baseline
          </span>
          <div className="text-2xl font-bold stat-number text-white">
            {startWeight} kg
          </div>
          <span className="text-[11px] font-mono text-zinc-500 mt-1 block">
            Initial weigh-in
          </span>
        </div>

        <div className="bento-card p-4">
          <span className="text-[10px] font-mono uppercase text-liftr-grey block mb-1">
            Total Net Shift
          </span>
          <div
            className={cn(
              "text-2xl font-bold stat-number",
              totalChange >= 0 ? "text-liftr-green" : "text-liftr-coral"
            )}
          >
            {totalChange > 0 ? `+${totalChange}` : totalChange} kg
          </div>
          <span className="text-[11px] font-mono text-zinc-500 mt-1 block">
            Since tracking began
          </span>
        </div>

        <div className="bento-card p-4">
          <span className="text-[10px] font-mono uppercase text-liftr-grey block mb-1">
            Weekly Cadence
          </span>
          <div className="text-2xl font-bold stat-number text-liftr-yellow">
            {weeklyChangeRate > 0 ? `+${weeklyChangeRate}` : weeklyChangeRate} kg
          </div>
          <span className="text-[11px] font-mono text-zinc-500 mt-1 block">
            Rate per 7 days
          </span>
        </div>

        <div className="bento-card p-4">
          <span className="text-[10px] font-mono uppercase text-liftr-grey block mb-1">
            Target Horizon
          </span>
          <div className="text-sm font-mono font-bold text-white mt-1 truncate">
            {userBodyProfile.targetDate || "Not configured"}
          </div>
          <span className="text-[10px] font-mono text-zinc-500 mt-1 block">
            Goal target date
          </span>
        </div>
      </div>

      {/* Weight History Chart with Target Line */}
      <div className="bento-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white">Weight Trajectory &amp; Target</h3>
            <p className="text-xs text-liftr-grey font-mono mt-0.5">
              Historical body weight with target milestone guideline
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#141414] border border-[#232323] overflow-x-auto">
            {TIME_FILTERS.map((tf) => (
              <button
                key={tf.value}
                onClick={() => setSelectedTimeFilter(tf.value)}
                className={cn(
                  "px-2.5 py-1 rounded text-xs font-mono transition-colors whitespace-nowrap cursor-pointer",
                  selectedTimeFilter === tf.value
                    ? "bg-white text-black font-bold"
                    : "text-zinc-400 hover:text-white"
                )}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-64 w-full">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-zinc-500 font-mono">
              No weight records in this timeframe.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8957DC" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8957DC" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="date" stroke="#666" fontSize={11} />
                <YAxis
                  domain={["dataMin - 2", "dataMax + 2"]}
                  stroke="#666"
                  fontSize={11}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#181818",
                    border: "1px solid #333",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontFamily: "monospace",
                  }}
                />
                <ReferenceLine
                  y={targetWeight}
                  stroke="#E9D65B"
                  strokeDasharray="4 4"
                  label={{
                    value: `Target: ${targetWeight} kg`,
                    fill: "#E9D65B",
                    fontSize: 10,
                    position: "insideTopRight",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="weight"
                  name="Weight (kg)"
                  stroke="#8957DC"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#weightGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Historical Weight Entries Table */}
      <div className="bento-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Log Archive</h3>
          <span className="text-xs font-mono text-zinc-500">
            {weightLogs.length} total entries
          </span>
        </div>

        <div className="divide-y divide-[#1C1C1C]">
          {weightLogs.map((log) => (
            <div
              key={log.id}
              className="py-3 flex items-center justify-between gap-3 text-xs font-mono"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#181818] border border-[#282828] flex items-center justify-center text-liftr-purple">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm">
                    {log.weight} {log.unit}
                  </div>
                  <span className="text-[10px] text-zinc-500">
                    {new Date(log.recordedAt).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                    {log.notes && ` • ${log.notes}`}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditLog(log)}
                  className="p-1.5 rounded hover:bg-[#202020] text-zinc-400 hover:text-white"
                  title="Edit Entry"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (confirm("Delete this weight log entry?")) {
                      deleteWeightLog(log.id);
                    }
                  }}
                  className="p-1.5 rounded hover:bg-liftr-coral/20 text-zinc-400 hover:text-liftr-coral"
                  title="Delete Entry"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Log Weight Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bento-card p-6 w-full max-w-sm border-2 border-border shadow-neo-purple">
            <h3 className="text-base font-bold text-white mb-4">Log Body Weight</h3>
            {logError && (
              <div className="mb-4 p-3 rounded bg-liftr-coral/15 border border-liftr-coral/30 text-liftr-coral text-xs font-mono">
                {logError}
              </div>
            )}
            <form onSubmit={handleLogWeightSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-liftr-grey mb-1.5">
                  Weight (kg) *
                </label>
                <input
                  type="number"
                  step={0.1}
                  min={30}
                  max={300}
                  required
                  value={logWeightValue}
                  onChange={(e) => setLogWeightValue(e.target.value)}
                  placeholder="e.g., 80.5"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-[#2c2c2c] text-white text-sm focus:outline-none focus:border-liftr-purple font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-liftr-grey mb-1.5">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-[#2c2c2c] text-white text-sm focus:outline-none focus:border-liftr-purple font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-liftr-grey mb-1.5">
                  Notes / Conditions
                </label>
                <input
                  type="text"
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  placeholder="Fasting morning weigh-in..."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-[#2c2c2c] text-white text-sm focus:outline-none focus:border-liftr-purple"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 rounded bg-[#1C1C1C] text-xs font-mono uppercase text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-liftr-green hover:bg-liftr-green-light text-black text-xs font-mono uppercase font-bold shadow-neo"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Target Settings Modal */}
      {isTargetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bento-card p-6 w-full max-w-md border-2 border-border shadow-neo-yellow">
            <h3 className="text-base font-bold text-white mb-4">Target Weight Setup</h3>
            <form onSubmit={handleSaveTargetProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-liftr-grey mb-1.5">
                    Starting (kg)
                  </label>
                  <input
                    type="number"
                    step={0.1}
                    required
                    value={startWeightVal}
                    onChange={(e) => setStartWeightVal(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-[#2c2c2c] text-white text-sm focus:outline-none focus:border-liftr-yellow font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-liftr-grey mb-1.5">
                    Target (kg)
                  </label>
                  <input
                    type="number"
                    step={0.1}
                    required
                    value={targetWeightVal}
                    onChange={(e) => setTargetWeightVal(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-[#2c2c2c] text-white text-sm focus:outline-none focus:border-liftr-yellow font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-liftr-grey mb-1.5">
                  Goal Trajectory
                </label>
                <select
                  value={goalTypeVal}
                  onChange={(e) => setGoalTypeVal(e.target.value as GoalType)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-[#2c2c2c] text-white text-sm focus:outline-none focus:border-liftr-yellow"
                >
                  <option value="gain">Weight Gain (Hypertrophy / Bulk)</option>
                  <option value="loss">Weight Loss (Cut / Leaning)</option>
                  <option value="maintenance">Maintenance (Body Recomposition)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-liftr-grey mb-1.5">
                  Target Arrival Date
                </label>
                <input
                  type="date"
                  value={targetDateVal}
                  onChange={(e) => setTargetDateVal(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-[#2c2c2c] text-white text-sm focus:outline-none focus:border-liftr-yellow font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTargetModalOpen(false)}
                  className="px-4 py-2 rounded bg-[#1C1C1C] text-xs font-mono uppercase text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-liftr-yellow hover:bg-liftr-yellow-light text-black text-xs font-mono uppercase font-bold shadow-neo"
                >
                  Update Goals
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Weight Log Modal */}
      {editingLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bento-card p-6 w-full max-w-sm border-2 border-border shadow-neo-purple">
            <h3 className="text-base font-bold text-white mb-4">Edit Weight Entry</h3>
            <form onSubmit={handleSaveEditLog} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-liftr-grey mb-1.5">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  step={0.1}
                  required
                  value={editWeightVal}
                  onChange={(e) => setEditWeightVal(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-[#2c2c2c] text-white text-sm focus:outline-none focus:border-liftr-purple font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-liftr-grey mb-1.5">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={editDateVal}
                  onChange={(e) => setEditDateVal(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-[#2c2c2c] text-white text-sm focus:outline-none focus:border-liftr-purple font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-liftr-grey mb-1.5">
                  Notes
                </label>
                <input
                  type="text"
                  value={editNotesVal}
                  onChange={(e) => setEditNotesVal(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-[#2c2c2c] text-white text-sm focus:outline-none focus:border-liftr-purple"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingLog(null)}
                  className="px-4 py-2 rounded bg-[#1C1C1C] text-xs font-mono uppercase text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-liftr-purple hover:bg-liftr-purple-dark text-white text-xs font-mono uppercase font-bold shadow-neo"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
