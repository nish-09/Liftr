"use client";

import { useState, useMemo } from "react";
import { useBodyStore } from "@/stores/useBodyStore";
import { GoalType, WeightLogItem } from "@/types";
import {
  Scale,
  Plus,
  Trash2,
  Target,
  Edit2,
  X,
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
          <div className="flex items-center gap-3">
            <h1 className="font-heading font-black text-3xl md:text-4xl text-dark tracking-tight">
              WEIGHT TRACKER
            </h1>
            <span className="px-2.5 py-1 rounded bg-forest text-cream border-2 border-dark text-xs font-mono font-bold shadow-neo-sm">
              {weightLogs.length} Checkpoints
            </span>
          </div>
          <p className="text-sm text-dark/70 font-sans mt-1">
            Body weight trajectory, progressive surplus/deficit tracking, and target milestones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTargetModalOpen(true)}
            className="px-4 py-2.5 rounded-lg bg-white hover:bg-cream border-2 border-dark text-xs font-mono uppercase font-bold text-dark shadow-neo-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Target className="w-4 h-4 text-forest stroke-[2.5]" />
            <span>Target Config</span>
          </button>

          <button
            onClick={() => {
              setLogWeightValue(String(currentWeight));
              setLogDate(new Date().toISOString().split("T")[0]);
              setLogError(null);
              setIsLogModalOpen(true);
            }}
            className="px-5 py-2.5 rounded-lg bg-lime hover:bg-lime/90 text-dark border-2 border-dark text-xs font-mono uppercase font-black tracking-wider shadow-neo flex items-center gap-1.5 cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Log Weight</span>
          </button>
        </div>
      </div>

      {/* Prominent Bento Hero Card: Target Progress */}
      <div className="bg-forest text-cream border-2 border-dark rounded-xl shadow-neo p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-lime font-black">
              Goal Objective
            </span>
            <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded bg-lime text-dark border-2 border-dark font-black shadow-neo-sm">
              {userBodyProfile.goalType.toUpperCase()}
            </span>
          </div>

          <span className="text-xs font-mono font-bold text-cream/80">
            {progressPercent}% Journey Completed
          </span>
        </div>

        {/* Big Numbers Display */}
        <div className="flex flex-wrap items-baseline gap-4 sm:gap-6">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl sm:text-6xl font-heading font-black text-cream tracking-tight">
              {currentWeight}
            </span>
            <span className="text-lg font-mono font-bold text-cream/70">kg</span>
          </div>

          <div className="flex items-center text-lime font-mono text-2xl font-black">
            →
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-5xl sm:text-6xl font-heading font-black text-lime tracking-tight">
              {targetWeight}
            </span>
            <span className="text-lg font-mono font-bold text-cream/70">kg</span>
          </div>

          <div className="sm:ml-auto px-4 py-2 rounded-xl bg-cream text-dark border-2 border-dark shadow-neo-sm font-mono">
            <span className="text-dark/60 block text-[10px] uppercase font-black">Remaining</span>
            <span className="font-heading font-black text-lg text-orange">
              {userBodyProfile.goalType === "gain" ? "+" : "-"}
              {remainingWeight} kg
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-forest-dark border-2 border-dark h-3 rounded-full overflow-hidden shadow-neo-sm">
          <div
            className="bg-lime h-full transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Metrics Row: Starting, Target, Net, Rate */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-cream border-2 border-dark rounded-xl shadow-neo p-4">
          <span className="text-[10px] font-mono uppercase font-black text-dark/70 block mb-1">
            Starting Baseline
          </span>
          <div className="text-2xl font-heading font-black text-dark tracking-tight">
            {startWeight} kg
          </div>
          <span className="text-[11px] font-mono font-bold text-dark/60 mt-1 block">
            Initial weigh-in
          </span>
        </div>

        <div className="bg-cream border-2 border-dark rounded-xl shadow-neo p-4">
          <span className="text-[10px] font-mono uppercase font-black text-dark/70 block mb-1">
            Total Net Shift
          </span>
          <div
            className={cn(
              "text-2xl font-heading font-black tracking-tight",
              totalChange >= 0 ? "text-forest" : "text-orange"
            )}
          >
            {totalChange > 0 ? `+${totalChange}` : totalChange} kg
          </div>
          <span className="text-[11px] font-mono font-bold text-dark/60 mt-1 block">
            Since tracking began
          </span>
        </div>

        <div className="bg-cream border-2 border-dark rounded-xl shadow-neo p-4">
          <span className="text-[10px] font-mono uppercase font-black text-dark/70 block mb-1">
            Weekly Cadence
          </span>
          <div className="text-2xl font-heading font-black text-orange tracking-tight">
            {weeklyChangeRate > 0 ? `+${weeklyChangeRate}` : weeklyChangeRate} kg
          </div>
          <span className="text-[11px] font-mono font-bold text-dark/60 mt-1 block">
            Rate per 7 days
          </span>
        </div>

        <div className="bg-cream border-2 border-dark rounded-xl shadow-neo p-4">
          <span className="text-[10px] font-mono uppercase font-black text-dark/70 block mb-1">
            Target Horizon
          </span>
          <div className="text-sm font-mono font-black text-dark mt-1 truncate">
            {userBodyProfile.targetDate || "Not configured"}
          </div>
          <span className="text-[10px] font-mono font-bold text-dark/60 mt-1 block">
            Goal target date
          </span>
        </div>
      </div>

      {/* Weight History Chart with Target Line */}
      <div className="bg-cream border-2 border-dark rounded-xl shadow-neo p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-heading font-black text-lg text-dark tracking-tight">
              WEIGHT TRAJECTORY &amp; TARGET
            </h3>
            <p className="text-xs text-dark/70 font-mono font-bold mt-0.5">
              Historical body weight with target milestone guideline
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-white border-2 border-dark shadow-neo-sm overflow-x-auto">
            {TIME_FILTERS.map((tf) => (
              <button
                key={tf.value}
                onClick={() => setSelectedTimeFilter(tf.value)}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-mono transition-all border-2 cursor-pointer",
                  selectedTimeFilter === tf.value
                    ? "bg-forest text-lime border-dark font-black shadow-neo-sm"
                    : "border-transparent text-dark/70 hover:text-dark font-bold"
                )}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-64 w-full">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-dark/60 font-mono font-bold">
              No weight records in this timeframe.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D5F36A" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#D5F36A" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#171B16" opacity={0.15} />
                <XAxis dataKey="date" stroke="#171B16" fontSize={11} tick={{ fill: "#171B16", fontWeight: "bold" }} />
                <YAxis
                  domain={["dataMin - 2", "dataMax + 2"]}
                  stroke="#171B16"
                  fontSize={11}
                  tick={{ fill: "#171B16", fontWeight: "bold" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#F5F0DF",
                    border: "2px solid #171B16",
                    borderRadius: "8px",
                    boxShadow: "3px 3px 0px #171B16",
                    fontSize: "12px",
                    fontFamily: "monospace",
                    fontWeight: "bold",
                    color: "#171B16",
                  }}
                />
                <ReferenceLine
                  y={targetWeight}
                  stroke="#F07845"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  label={{
                    value: `Target: ${targetWeight} kg`,
                    fill: "#F07845",
                    fontSize: 11,
                    fontWeight: "bold",
                    position: "insideTopRight",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="weight"
                  name="Weight (kg)"
                  stroke="#183D2A"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#weightGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Historical Weight Entries Table */}
      <div className="bg-cream border-2 border-dark rounded-xl shadow-neo p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-black text-lg text-dark tracking-tight">LOG ARCHIVE</h3>
          <span className="text-xs font-mono font-bold text-dark/60">
            {weightLogs.length} total entries
          </span>
        </div>

        <div className="space-y-2">
          {weightLogs.map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-xl bg-white border-2 border-dark shadow-neo-sm flex items-center justify-between gap-3 text-xs font-mono"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-forest text-cream border-2 border-dark flex items-center justify-center font-bold shadow-neo-sm">
                  <Scale className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <div className="font-heading font-black text-dark text-base">
                    {log.weight} {log.unit}
                  </div>
                  <span className="text-[10px] text-dark/60 font-bold">
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

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => openEditLog(log)}
                  className="p-1.5 rounded-md border-2 border-dark bg-white hover:bg-forest hover:text-cream text-dark transition-all shadow-neo-sm cursor-pointer"
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
                  className="p-1.5 rounded-md border-2 border-dark bg-orange text-cream hover:bg-orange/90 transition-all shadow-neo-sm cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-cream border-3 border-dark rounded-xl shadow-neo-lg p-6 w-full max-w-sm relative font-sans space-y-4">
            <div className="flex items-center justify-between border-b-2 border-dark/15 pb-3">
              <h3 className="font-heading font-black text-xl text-dark tracking-tight">LOG BODY WEIGHT</h3>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="p-1.5 rounded-lg border-2 border-dark bg-white hover:bg-forest hover:text-cream text-dark transition-all cursor-pointer shadow-neo-sm"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {logError && (
              <div className="p-3 rounded-lg bg-orange/20 border-2 border-orange text-dark text-xs font-mono font-bold">
                {logError}
              </div>
            )}

            <form onSubmit={handleLogWeightSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase font-bold text-dark mb-1.5">
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
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white border-2 border-dark text-dark text-sm focus:outline-none focus:ring-2 focus:ring-forest font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase font-bold text-dark mb-1.5">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white border-2 border-dark text-dark text-sm focus:outline-none focus:ring-2 focus:ring-forest font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase font-bold text-dark mb-1.5">
                  Notes / Conditions
                </label>
                <input
                  type="text"
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  placeholder="Fasting morning weigh-in..."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white border-2 border-dark text-dark text-sm focus:outline-none focus:ring-2 focus:ring-forest font-sans"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t-2 border-dark/15">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg bg-white border-2 border-dark hover:bg-cream text-dark text-xs font-mono font-bold uppercase transition-all shadow-neo-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-lime hover:bg-lime/90 text-dark text-xs font-mono uppercase font-black tracking-wider border-2 border-dark shadow-neo cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-cream border-3 border-dark rounded-xl shadow-neo-lg p-6 w-full max-w-md relative font-sans space-y-4">
            <div className="flex items-center justify-between border-b-2 border-dark/15 pb-3">
              <h3 className="font-heading font-black text-xl text-dark tracking-tight">TARGET WEIGHT SETUP</h3>
              <button
                onClick={() => setIsTargetModalOpen(false)}
                className="p-1.5 rounded-lg border-2 border-dark bg-white hover:bg-forest hover:text-cream text-dark transition-all cursor-pointer shadow-neo-sm"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            <form onSubmit={handleSaveTargetProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase font-bold text-dark mb-1.5">
                    Starting (kg)
                  </label>
                  <input
                    type="number"
                    step={0.1}
                    required
                    value={startWeightVal}
                    onChange={(e) => setStartWeightVal(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white border-2 border-dark text-dark text-sm focus:outline-none focus:ring-2 focus:ring-forest font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase font-bold text-dark mb-1.5">
                    Target (kg)
                  </label>
                  <input
                    type="number"
                    step={0.1}
                    required
                    value={targetWeightVal}
                    onChange={(e) => setTargetWeightVal(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white border-2 border-dark text-dark text-sm focus:outline-none focus:ring-2 focus:ring-forest font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase font-bold text-dark mb-1.5">
                  Goal Trajectory
                </label>
                <select
                  value={goalTypeVal}
                  onChange={(e) => setGoalTypeVal(e.target.value as GoalType)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white border-2 border-dark text-dark text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-forest cursor-pointer"
                >
                  <option value="gain">Weight Gain (Hypertrophy / Bulk)</option>
                  <option value="loss">Weight Loss (Cut / Leaning)</option>
                  <option value="maintenance">Maintenance (Body Recomposition)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase font-bold text-dark mb-1.5">
                  Target Arrival Date
                </label>
                <input
                  type="date"
                  value={targetDateVal}
                  onChange={(e) => setTargetDateVal(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white border-2 border-dark text-dark text-sm focus:outline-none focus:ring-2 focus:ring-forest font-mono font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t-2 border-dark/15">
                <button
                  type="button"
                  onClick={() => setIsTargetModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg bg-white border-2 border-dark hover:bg-cream text-dark text-xs font-mono font-bold uppercase transition-all shadow-neo-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-lime hover:bg-lime/90 text-dark text-xs font-mono uppercase font-black tracking-wider border-2 border-dark shadow-neo cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-cream border-3 border-dark rounded-xl shadow-neo-lg p-6 w-full max-w-sm relative font-sans space-y-4">
            <div className="flex items-center justify-between border-b-2 border-dark/15 pb-3">
              <h3 className="font-heading font-black text-xl text-dark tracking-tight">EDIT WEIGHT ENTRY</h3>
              <button
                onClick={() => setEditingLog(null)}
                className="p-1.5 rounded-lg border-2 border-dark bg-white hover:bg-forest hover:text-cream text-dark transition-all cursor-pointer shadow-neo-sm"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            <form onSubmit={handleSaveEditLog} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase font-bold text-dark mb-1.5">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  step={0.1}
                  required
                  value={editWeightVal}
                  onChange={(e) => setEditWeightVal(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white border-2 border-dark text-dark text-sm focus:outline-none focus:ring-2 focus:ring-forest font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase font-bold text-dark mb-1.5">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={editDateVal}
                  onChange={(e) => setEditDateVal(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white border-2 border-dark text-dark text-sm focus:outline-none focus:ring-2 focus:ring-forest font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase font-bold text-dark mb-1.5">
                  Notes
                </label>
                <input
                  type="text"
                  value={editNotesVal}
                  onChange={(e) => setEditNotesVal(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white border-2 border-dark text-dark text-sm focus:outline-none focus:ring-2 focus:ring-forest font-sans"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t-2 border-dark/15">
                <button
                  type="button"
                  onClick={() => setEditingLog(null)}
                  className="px-4 py-2.5 rounded-lg bg-white border-2 border-dark hover:bg-cream text-dark text-xs font-mono font-bold uppercase transition-all shadow-neo-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-lime hover:bg-lime/90 text-dark text-xs font-mono uppercase font-black tracking-wider border-2 border-dark shadow-neo cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5"
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
