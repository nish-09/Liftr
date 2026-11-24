"use client";

import { useState, useMemo } from "react";
import { useBodyStore } from "@/stores/useBodyStore";
import { GoalType, WeightLogItem } from "@/types";
import { Scale, Plus, Trash2, Target, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  NEO_TOOLTIP_STYLE,
  CHART_GRID_COLOR,
  CHART_AXIS_COLOR,
} from "@/components/charts/chartStyles";
import { PageHeader, PastelCard } from "@/components/ui/DesignSystem";
import {
  LogWeightModal,
  TargetWeightModal,
  EditWeightModal,
} from "@/components/body/WeightTrackerModals";
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

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [logWeightValue, setLogWeightValue] = useState("");
  const [logDate, setLogDate] = useState(new Date().toISOString().split("T")[0]);
  const [logNotes, setLogNotes] = useState("");
  const [logError, setLogError] = useState<string | null>(null);

  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [targetWeightVal, setTargetWeightVal] = useState(
    userBodyProfile.targetWeight != null ? String(userBodyProfile.targetWeight) : ""
  );
  const [startWeightVal, setStartWeightVal] = useState(
    userBodyProfile.startingWeight != null ? String(userBodyProfile.startingWeight) : ""
  );
  const [targetDateVal, setTargetDateVal] = useState(userBodyProfile.targetDate || "");
  const [goalTypeVal, setGoalTypeVal] = useState<GoalType>(
    userBodyProfile.goalType || "gain"
  );

  const [editingLog, setEditingLog] = useState<WeightLogItem | null>(null);
  const [editWeightVal, setEditWeightVal] = useState("");
  const [editDateVal, setEditDateVal] = useState("");
  const [editNotesVal, setEditNotesVal] = useState("");

  const hasLogs = weightLogs.length > 0;
  const currentWeight = hasLogs
    ? weightLogs[0].weight
    : userBodyProfile.startingWeight != null
    ? userBodyProfile.startingWeight
    : null;
  const startWeight =
    userBodyProfile.startingWeight != null
      ? userBodyProfile.startingWeight
      : hasLogs
      ? weightLogs[weightLogs.length - 1].weight
      : null;
  const targetWeight =
    userBodyProfile.targetWeight != null ? userBodyProfile.targetWeight : null;

  const filteredLogs = useMemo(() => {
    const cutoff = Date.now() - selectedTimeFilter * 24 * 60 * 60 * 1000;
    return weightLogs.filter((w) => new Date(w.recordedAt).getTime() >= cutoff);
  }, [weightLogs, selectedTimeFilter]);

  const chartData = useMemo(() => {
    return [...filteredLogs]
      .reverse()
      .map((w) => ({
        date: new Date(w.recordedAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        weight: w.weight,
        ...(targetWeight != null ? { target: targetWeight } : {}),
      }));
  }, [filteredLogs, targetWeight]);

  const totalChange =
    currentWeight != null && startWeight != null
      ? Number((currentWeight - startWeight).toFixed(2))
      : null;
  const remainingWeight =
    currentWeight != null && targetWeight != null
      ? Number(Math.abs(targetWeight - currentWeight).toFixed(2))
      : null;

  const totalGoalDelta =
    targetWeight != null && startWeight != null
      ? Math.abs(targetWeight - startWeight)
      : null;
  const currentProgressDelta =
    currentWeight != null && startWeight != null
      ? Math.abs(currentWeight - startWeight)
      : null;
  const progressPercent =
    totalGoalDelta != null && totalGoalDelta > 0 && currentProgressDelta != null
      ? Math.min(100, Math.round((currentProgressDelta / totalGoalDelta) * 100))
      : 0;

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
    return Number(((diffKg / diffDays) * 7).toFixed(2));
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
    const sWeight = parseFloat(startWeightVal);
    const tWeight = parseFloat(targetWeightVal);
    updateBodyProfile({
      startingWeight: !isNaN(sWeight) && sWeight > 0 ? sWeight : null,
      targetWeight: !isNaN(tWeight) && tWeight > 0 ? tWeight : null,
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
      <PageHeader
        title="Weight Tracker"
        actions={
          <>
            <button
              onClick={() => setIsTargetModalOpen(true)}
              className="neo-btn min-h-[44px] px-4 py-2.5 rounded-xl bg-white text-xs font-bold text-[#142746] inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Target className="w-4 h-4" />
              <span>Set Target</span>
            </button>

            <button
              onClick={() => {
                setLogWeightValue(currentWeight != null ? String(currentWeight) : "");
                setLogDate(new Date().toISOString().split("T")[0]);
                setLogError(null);
                setIsLogModalOpen(true);
              }}
              className="neo-btn min-h-[44px] px-4 py-2.5 rounded-xl bg-[#142746] text-white text-xs font-heading font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log Weight</span>
            </button>
          </>
        }
      />

      {/* Target Weight Card */}
      {currentWeight == null || targetWeight == null ? (
        <PastelCard tone="lime" className="p-6 space-y-4">
          <div>
            <h2 className="text-xl font-heading font-extrabold text-[#142746]">
              Set Starting &amp; Target Weight
            </h2>
            <p className="text-xs sm:text-sm text-[#142746]/75 mt-1 max-w-xl">
              Add your first weigh-in and target weight to track progress and weekly rate.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setLogWeightValue("");
                setLogDate(new Date().toISOString().split("T")[0]);
                setLogError(null);
                setIsLogModalOpen(true);
              }}
              className="neo-btn min-h-[44px] px-4 py-2.5 rounded-xl bg-[#142746] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log Weight</span>
            </button>
            <button
              onClick={() => setIsTargetModalOpen(true)}
              className="neo-btn min-h-[44px] px-4 py-2.5 rounded-xl bg-white text-[#142746] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Target className="w-4 h-4" />
              <span>Set Target</span>
            </button>
          </div>
        </PastelCard>
      ) : (
        <PastelCard tone="lime" className="p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold capitalize text-[#142746]">
              Goal: {userBodyProfile.goalType}
            </span>
            <span className="text-xs font-bold text-[#142746]">
              {progressPercent}% complete
            </span>
          </div>

          <div className="flex flex-wrap items-baseline gap-3 sm:gap-6">
            <div className="flex items-baseline gap-1.5">
              <span className="stat-fluid-xl stat-number text-[#142746]">
                {currentWeight}
              </span>
              <span className="text-base font-bold text-[#142746]/70">kg</span>
            </div>

            <div className="text-xl sm:text-2xl font-bold text-[#142746]">→</div>

            <div className="flex items-baseline gap-1.5">
              <span className="stat-fluid-xl stat-number text-[#142746]">
                {targetWeight}
              </span>
              <span className="text-base font-bold text-[#142746]/70">kg</span>
            </div>

            <div className="w-full sm:w-auto sm:ml-auto px-4 py-2 rounded-2xl bg-white border-[1.5px] border-[#142746] shadow-neo-sm flex sm:block items-center justify-between">
              <span className="text-[#8993A5] block text-[10px] uppercase font-bold">
                Remaining
              </span>
              <span className="font-heading font-extrabold text-lg text-[#142746]">
                {userBodyProfile.goalType === "gain" ? "+" : "-"}
                {remainingWeight} kg
              </span>
            </div>
          </div>

          <div className="w-full bg-white border-[1.5px] border-[#142746] h-3 rounded-full overflow-hidden">
            <div
              className="bg-[#142746] h-full transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </PastelCard>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-4">
        <PastelCard tone="white" className="p-4 sm:p-5">
          <span className="text-xs font-bold text-[#8993A5] block mb-1">
            Starting Weight
          </span>
          <div className="stat-fluid-lg stat-number text-[#142746]">
            {startWeight != null ? `${startWeight} kg` : "--"}
          </div>
        </PastelCard>

        <PastelCard tone="green" className="p-4 sm:p-5">
          <span className="text-xs font-bold text-[#142746]/75 block mb-1">
            Total Change
          </span>
          <div className="stat-fluid-lg stat-number text-[#142746]">
            {totalChange != null
              ? totalChange > 0
                ? `+${totalChange} kg`
                : `${totalChange} kg`
              : "--"}
          </div>
        </PastelCard>

        <PastelCard tone="coral" className="p-4 sm:p-5">
          <span className="text-xs font-bold text-[#142746]/75 block mb-1">
            Weekly Rate
          </span>
          <div className="stat-fluid-lg stat-number text-[#142746]">
            {weeklyChangeRate !== 0
              ? weeklyChangeRate > 0
                ? `+${weeklyChangeRate} kg`
                : `${weeklyChangeRate} kg`
              : "--"}
          </div>
        </PastelCard>

        <PastelCard tone="yellow" className="p-4 sm:p-5">
          <span className="text-xs font-bold text-[#142746]/75 block mb-1">
            Target Date
          </span>
          <div className="text-base sm:text-lg font-extrabold text-[#142746] mt-1 break-words">
            {userBodyProfile.targetDate || "Not set"}
          </div>
        </PastelCard>
      </div>

      {/* Weight History Chart */}
      <PastelCard tone="white" className="p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h3 className="font-heading font-extrabold text-base text-[#142746]">
            Weight History (kg)
          </h3>

          <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-[#FAF9FD] border-[1.5px] border-[#142746] w-full md:w-auto">
            {TIME_FILTERS.map((tf) => (
              <button
                key={tf.value}
                onClick={() => setSelectedTimeFilter(tf.value)}
                className={cn(
                  "flex-1 sm:flex-initial min-h-[36px] px-2.5 sm:px-3 py-1 rounded-lg text-xs transition-all border cursor-pointer font-bold whitespace-nowrap",
                  selectedTimeFilter === tf.value
                    ? "bg-[#E9FF91] text-[#142746] border-[#142746]"
                    : "border-transparent text-[#8993A5] hover:text-[#142746]"
                )}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[220px] sm:h-[260px] w-full min-w-0">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-[#8993A5] font-semibold bg-[#FAF9FD] rounded-xl border border-dashed border-[#142746]/25 p-4 text-center">
              No weight records in this timeframe.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} />
                <XAxis dataKey="date" stroke={CHART_AXIS_COLOR} fontSize={11} interval="preserveStartEnd" />
                <YAxis
                  domain={["dataMin - 2", "dataMax + 2"]}
                  stroke={CHART_AXIS_COLOR}
                  fontSize={11}
                  width={44}
                />
                <Tooltip contentStyle={NEO_TOOLTIP_STYLE} />
                {targetWeight != null && (
                  <ReferenceLine
                    y={targetWeight}
                    stroke="#142746"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    label={{
                      value: `Target: ${targetWeight} kg`,
                      fill: "#142746",
                      fontSize: 11,
                      fontWeight: "bold",
                      position: "insideTopRight",
                    }}
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="weight"
                  name="Weight (kg)"
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

      {/* Weight History Table */}
      <PastelCard tone="white" className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-extrabold text-lg text-[#142746]">Weight History</h3>
          <span className="text-xs font-semibold text-[#8993A5]">
            {weightLogs.length} total entries
          </span>
        </div>

        {weightLogs.length === 0 ? (
          <div className="bg-[#FAF9FD] border border-dashed border-[#142746]/25 rounded-2xl p-8 text-center space-y-2">
            <Scale className="w-8 h-8 text-[#8993A5] mx-auto" />
            <div className="font-heading font-extrabold text-sm text-[#142746]">
              No Weight Checkpoints Recorded
            </div>
            <p className="text-xs text-[#8993A5] max-w-sm mx-auto">
              Log your body weight regularly to track weekly rate of change and checkpoints.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {weightLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-2xl bg-[#FAF9FD] border-[1.5px] border-[#142746]/25 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 shrink-0 rounded-xl bg-[#BDF7B6] text-[#142746] border-[1.5px] border-[#142746] flex items-center justify-center">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-heading font-extrabold text-[#142746] text-base">
                      {log.weight} {log.unit}
                    </div>
                    <span className="text-[11px] text-[#8993A5] font-medium block truncate">
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

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => openEditLog(log)}
                    className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg border border-[#142746] bg-white hover:bg-[#E9FF91] cursor-pointer"
                    title="Edit Entry"
                    aria-label="Edit Entry"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Delete this weight log entry?")) {
                        deleteWeightLog(log.id);
                      }
                    }}
                    className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg border border-[#142746] bg-[#F8C3B5] text-[#142746] cursor-pointer"
                    title="Delete Entry"
                    aria-label="Delete Entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </PastelCard>

      <LogWeightModal
        isOpen={isLogModalOpen}
        weightValue={logWeightValue}
        dateValue={logDate}
        notesValue={logNotes}
        error={logError}
        onWeightChange={setLogWeightValue}
        onDateChange={setLogDate}
        onNotesChange={setLogNotes}
        onClose={() => setIsLogModalOpen(false)}
        onSubmit={handleLogWeightSubmit}
      />

      <TargetWeightModal
        isOpen={isTargetModalOpen}
        startWeight={startWeightVal}
        targetWeight={targetWeightVal}
        goalType={goalTypeVal}
        targetDate={targetDateVal}
        onStartWeightChange={setStartWeightVal}
        onTargetWeightChange={setTargetWeightVal}
        onGoalTypeChange={setGoalTypeVal}
        onTargetDateChange={setTargetDateVal}
        onClose={() => setIsTargetModalOpen(false)}
        onSubmit={handleSaveTargetProfile}
      />

      <EditWeightModal
        editingLog={editingLog}
        weightValue={editWeightVal}
        dateValue={editDateVal}
        notesValue={editNotesVal}
        onWeightChange={setEditWeightVal}
        onDateChange={setEditDateVal}
        onNotesChange={setEditNotesVal}
        onClose={() => setEditingLog(null)}
        onSubmit={handleSaveEditLog}
      />
    </div>
  );
}
