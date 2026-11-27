"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useBodyStore } from "@/stores/useBodyStore";
import { calculateBMI } from "@/lib/calculations/strength";
import { BodyMeasurementItem, MeasurementUnit } from "@/types";
import {
  NEO_TOOLTIP_STYLE,
  CHART_GRID_COLOR,
  CHART_AXIS_COLOR,
} from "@/components/charts/chartStyles";
import { PageHeader, PastelCard, PastelBadge } from "@/components/ui/DesignSystem";
import { Plus, X, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const MEASUREMENT_TYPES: { label: string; value: BodyMeasurementItem["measurementType"] }[] = [
  { label: "Chest", value: "chest" },
  { label: "Waist", value: "waist" },
  { label: "Left Arm (Bicep)", value: "left_arm" },
  { label: "Right Arm (Bicep)", value: "right_arm" },
  { label: "Left Thigh", value: "left_thigh" },
  { label: "Right Thigh", value: "right_thigh" },
  { label: "Hips", value: "hips" },
  { label: "Shoulders", value: "shoulders" },
  { label: "Calves", value: "calves" },
  { label: "Custom Dimension", value: "custom" },
];

export default function BodyMetricsPage() {
  const {
    userBodyProfile,
    weightLogs,
    bodyMeasurements,
    updateBodyProfile,
    logMeasurement,
    deleteMeasurement,
  } = useBodyStore();

  const [activeTab, setActiveTab] = useState<"bmi" | "measurements">("bmi");
  const [isHeightModalOpen, setIsHeightModalOpen] = useState(false);
  const [formHeight, setFormHeight] = useState(
    userBodyProfile.height != null ? String(userBodyProfile.height) : ""
  );

  const [isMeasureModalOpen, setIsMeasureModalOpen] = useState(false);
  const [measureType, setMeasureType] = useState<BodyMeasurementItem["measurementType"]>("chest");
  const [measureValue, setMeasureValue] = useState("");
  const [measureUnit, setMeasureUnit] = useState<MeasurementUnit>("cm");
  const [measureDate, setMeasureDate] = useState(new Date().toISOString().split("T")[0]);
  const [measureNotes, setMeasureNotes] = useState("");
  const [customName, setCustomName] = useState("");

  const latestWeight =
    weightLogs.length > 0
      ? weightLogs[0].weight
      : userBodyProfile.startingWeight != null
      ? userBodyProfile.startingWeight
      : null;
  const currentHeightCm = userBodyProfile.height != null ? userBodyProfile.height : null;
  const hasBMIData = latestWeight != null && currentHeightCm != null && currentHeightCm > 0;

  const { bmi, category } = useMemo(() => {
    if (!hasBMIData || latestWeight == null || currentHeightCm == null) {
      return { bmi: 0, category: "Uncalculated" };
    }
    return calculateBMI(latestWeight, currentHeightCm);
  }, [hasBMIData, latestWeight, currentHeightCm]);

  const historicalBMIData = useMemo(() => {
    if (currentHeightCm == null || currentHeightCm <= 0) return [];
    return [...weightLogs]
      .reverse()
      .map((log) => {
        const heightM = currentHeightCm / 100;
        const calculated = Number((log.weight / (heightM * heightM)).toFixed(1));
        return {
          date: new Date(log.recordedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          bmi: calculated,
          weight: log.weight,
        };
      });
  }, [weightLogs, currentHeightCm]);

  function handleSaveHeight(e: React.FormEvent) {
    e.preventDefault();
    const h = parseFloat(formHeight);
    if (!isNaN(h) && h > 0) {
      updateBodyProfile({ height: h });
    }
    setIsHeightModalOpen(false);
  }

  function handleLogMeasurementSubmit(e: React.FormEvent) {
    e.preventDefault();
    const val = parseFloat(measureValue);
    if (isNaN(val) || val <= 0) return;

    logMeasurement(
      measureType,
      val,
      measureUnit,
      measureDate,
      measureNotes,
      measureType === "custom" ? customName : undefined
    );

    setIsMeasureModalOpen(false);
    setMeasureValue("");
    setMeasureNotes("");
    setCustomName("");
  }

  const minBMIScale = 15;
  const maxBMIScale = 35;
  const scalePercent = hasBMIData
    ? Math.max(0, Math.min(100, ((bmi - minBMIScale) / (maxBMIScale - minBMIScale)) * 100))
    : null;

  return (
    <>
      <div className="space-y-6">
      <PageHeader
        title="Body Metrics"
        actions={
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white border-[1.5px] border-[#142746] shadow-neo-sm w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("bmi")}
              className={cn(
                "flex-1 sm:flex-initial min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer border font-bold",
                activeTab === "bmi"
                  ? "bg-[#E9FF91] text-[#142746] border-[#142746]"
                  : "border-transparent text-[#8993A5] hover:text-[#142746]"
              )}
            >
              BMI Analysis
            </button>
            <button
              onClick={() => setActiveTab("measurements")}
              className={cn(
                "flex-1 sm:flex-initial min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer border font-bold",
                activeTab === "measurements"
                  ? "bg-[#E9FF91] text-[#142746] border-[#142746]"
                  : "border-transparent text-[#8993A5] hover:text-[#142746]"
              )}
            >
              Measurements ({bodyMeasurements.length})
            </button>
          </div>
        }
      />

      {activeTab === "bmi" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <PastelCard tone="green" className="lg:col-span-5 p-5 sm:p-6 flex flex-col justify-between space-y-5">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                  <span className="text-xs font-bold text-[#142746]/80">
                    Body Mass Index
                  </span>
                  <PastelBadge tone={hasBMIData ? "lime" : "white"}>
                    {hasBMIData ? category : "Not set"}
                  </PastelBadge>
                </div>

                <div className="my-3">
                  <div className="stat-fluid-xl stat-number text-[#142746]">
                    {hasBMIData ? bmi : "--"}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-2">
                    <span className="text-xs font-medium text-[#142746]/80">
                      {hasBMIData
                        ? `Derived from ${latestWeight} kg and ${currentHeightCm} cm`
                        : "Set height and log a weigh-in to calculate BMI."}
                    </span>
                    <button
                      onClick={() => {
                        setFormHeight(currentHeightCm != null ? String(currentHeightCm) : "");
                        setIsHeightModalOpen(true);
                      }}
                      className="min-h-[36px] text-xs font-bold text-[#142746] underline inline-flex items-center gap-1 cursor-pointer self-start shrink-0"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>{currentHeightCm != null ? "Edit Height" : "Set Height"}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-[10px] font-bold text-[#142746]/75">
                  <span>Under (&lt;18.5)</span>
                  <span>Normal (18.5–24.9)</span>
                  <span>Over (25–29.9)</span>
                  <span>Obese (30+)</span>
                </div>

                <div className="relative w-full h-3.5 rounded-full bg-white border-[1.5px] border-[#142746] overflow-hidden flex">
                  <div className="w-[17.5%] h-full bg-[#EBCBF7] border-r border-[#142746]/25" title="Underweight" />
                  <div className="w-[32%] h-full bg-[#BDF7B6] border-r border-[#142746]/25" title="Normal" />
                  <div className="w-[25%] h-full bg-[#F2FA91] border-r border-[#142746]/25" title="Overweight" />
                  <div className="w-[25.5%] h-full bg-[#F8C3B5]" title="Obesity" />
                </div>

                {scalePercent != null && (
                  <div className="relative w-full h-4">
                    <div
                      className="absolute top-0 -ml-2 transition-all duration-500 ease-out"
                      style={{ left: `${scalePercent}%` }}
                    >
                      <div className="w-4 h-4 rounded-full bg-[#142746] border-2 border-white shadow-neo-sm mx-auto" />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-[#142746]/15 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-[#142746]">
                  <span>Healthy Range</span>
                  <span>18.5 – 24.9</span>
                </div>
                <p className="text-[11px] text-[#142746]/70">
                  Weight-to-height screening only; does not distinguish muscle from body fat.
                </p>
              </div>
            </PastelCard>

            <PastelCard tone="white" className="lg:col-span-7 p-5 sm:p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-heading font-extrabold text-base text-[#142746]">
                  BMI Trend
                </h3>
                <Link
                  href="/weight-tracker"
                  className="neo-btn min-h-[40px] inline-flex items-center px-3.5 py-2 rounded-xl bg-[#E9FF91] text-[#142746] text-xs font-bold"
                >
                  Log Weight
                </Link>
              </div>

              <div className="h-[220px] sm:h-[260px] w-full min-w-0">
                {historicalBMIData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-[#8993A5] font-semibold bg-[#FAF9FD] rounded-xl border border-dashed border-[#142746]/25 p-4 text-center">
                    Add your height and at least one weigh-in to plot BMI.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historicalBMIData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} />
                      <XAxis dataKey="date" stroke={CHART_AXIS_COLOR} fontSize={11} interval="preserveStartEnd" />
                      <YAxis
                        domain={["dataMin - 1", "dataMax + 1"]}
                        stroke={CHART_AXIS_COLOR}
                        fontSize={11}
                        width={42}
                      />
                      <Tooltip contentStyle={NEO_TOOLTIP_STYLE} />
                      <Area
                        type="monotone"
                        dataKey="bmi"
                        name="BMI"
                        stroke="#142746"
                        strokeWidth={2.5}
                        fill="#EBCBF7"
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </PastelCard>
          </div>
      ) : (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="font-heading font-extrabold text-lg text-[#142746]">
              Body Measurements
            </h2>

            <button
              onClick={() => setIsMeasureModalOpen(true)}
              className="neo-btn min-h-[44px] w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#142746] text-white text-xs font-heading font-bold flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Log Measurement</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {MEASUREMENT_TYPES.filter((m) => m.value !== "custom").map((mType) => {
              const logsForType = bodyMeasurements.filter(
                (bm) => bm.measurementType === mType.value
              );
              const latest = logsForType[0];
              const previous = logsForType[1];
              const delta =
                latest && previous
                  ? Number((latest.value - previous.value).toFixed(2))
                  : null;

              return (
                <PastelCard
                  key={mType.value}
                  tone="white"
                  className="p-4 flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase text-[#142746] font-extrabold tracking-wider">
                      {mType.label}
                    </span>
                    {delta !== null && (
                      <PastelBadge
                        tone={delta > 0 ? "green" : delta < 0 ? "coral" : "white"}
                        className="text-[10px]"
                      >
                        {delta > 0 ? `+${delta}` : delta} cm
                      </PastelBadge>
                    )}
                  </div>

                  {latest ? (
                    <div>
                      <div className="text-3xl font-extrabold stat-number text-[#142746]">
                        {latest.value}{" "}
                        <span className="text-sm font-semibold text-[#8993A5]">
                          {latest.unit}
                        </span>
                      </div>
                      <span className="text-[11px] font-medium text-[#8993A5] mt-1 block">
                        Logged on {latest.recordedAt}
                        {latest.notes ? ` • ${latest.notes}` : ""}
                      </span>
                    </div>
                  ) : (
                    <div className="py-2 text-xs text-[#8993A5]">
                      No measurements logged yet.
                    </div>
                  )}

                  {latest && (
                    <div className="pt-2 border-t border-[#142746]/10 flex justify-end">
                      <button
                        onClick={() => deleteMeasurement(latest.id)}
                        className="text-[11px] font-semibold text-[#8993A5] hover:text-[#142746] underline cursor-pointer"
                      >
                        Delete latest entry
                      </button>
                    </div>
                  )}
                </PastelCard>
              );
            })}
          </div>
        </div>
      )}

      {/* Log Measurement Modal */}
      {isMeasureModalOpen && (
        <div className="fixed inset-0 !m-0 z-50 flex items-center justify-center p-4 bg-[#142746]/50 backdrop-blur-sm overflow-y-auto w-full h-full min-h-[100dvh]">
          <PastelCard tone="white" className="p-5 sm:p-6 w-full max-w-sm max-h-[calc(100dvh-2rem)] overflow-y-auto my-auto space-y-4 shadow-neo-xl">
            <div className="flex items-center justify-between border-b border-[#142746]/15 pb-3">
              <h3 className="font-heading font-extrabold text-xl text-[#142746]">
                Log Measurement
              </h3>
              <button
                onClick={() => setIsMeasureModalOpen(false)}
                className="p-1.5 rounded-xl border-[1.5px] border-[#142746] bg-[#FAF9FD] hover:bg-[#EBCBF7] text-[#142746] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLogMeasurementSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#142746] mb-1.5">
                  Measurement Zone *
                </label>
                <select
                  value={measureType}
                  onChange={(e) =>
                    setMeasureType(e.target.value as BodyMeasurementItem["measurementType"])
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border-[1.5px] border-[#142746] text-[#142746] text-xs font-bold cursor-pointer focus:outline-none"
                >
                  {MEASUREMENT_TYPES.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              {measureType === "custom" && (
                <div>
                  <label className="block text-xs font-bold text-[#142746] mb-1.5">
                    Custom Zone Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g., Neck or Forearm"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border-[1.5px] border-[#142746] text-[#142746] text-sm focus:outline-none"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#142746] mb-1.5">
                    Value *
                  </label>
                  <input
                    type="number"
                    step={0.1}
                    required
                    value={measureValue}
                    onChange={(e) => setMeasureValue(e.target.value)}
                    placeholder="e.g., 38.5"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border-[1.5px] border-[#142746] text-[#142746] text-sm font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#142746] mb-1.5">
                    Unit
                  </label>
                  <select
                    value={measureUnit}
                    onChange={(e) => setMeasureUnit(e.target.value as MeasurementUnit)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border-[1.5px] border-[#142746] text-[#142746] text-xs font-bold cursor-pointer focus:outline-none"
                  >
                    <option value="cm">Centimeters (cm)</option>
                    <option value="in">Inches (in)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#142746] mb-1.5">Date</label>
                <input
                  type="date"
                  required
                  value={measureDate}
                  onChange={(e) => setMeasureDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border-[1.5px] border-[#142746] text-[#142746] text-sm font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#142746] mb-1.5">Notes</label>
                <input
                  type="text"
                  value={measureNotes}
                  onChange={(e) => setMeasureNotes(e.target.value)}
                  placeholder="Flexed peak, morning measurement..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border-[1.5px] border-[#142746] text-[#142746] text-sm focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#142746]/15">
                <button
                  type="button"
                  onClick={() => setIsMeasureModalOpen(false)}
                  className="neo-btn px-4 py-2 rounded-xl bg-white text-[#142746] text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="neo-btn px-5 py-2 rounded-xl bg-[#142746] text-white text-xs font-bold cursor-pointer"
                >
                  Save Measurement
                </button>
              </div>
            </form>
          </PastelCard>
        </div>
      )}

      {/* Update Height Modal */}
      {isHeightModalOpen && (
        <div className="fixed inset-0 !m-0 z-50 flex items-center justify-center p-4 bg-[#142746]/50 backdrop-blur-sm overflow-y-auto w-full h-full min-h-[100dvh]">
          <PastelCard tone="white" className="p-5 sm:p-6 w-full max-w-sm max-h-[calc(100dvh-2rem)] overflow-y-auto my-auto space-y-4 shadow-neo-xl">
            <div className="flex items-center justify-between border-b border-[#142746]/15 pb-3">
              <h3 className="font-heading font-extrabold text-xl text-[#142746]">
                Update Height
              </h3>
              <button
                onClick={() => setIsHeightModalOpen(false)}
                className="p-1.5 rounded-xl border-[1.5px] border-[#142746] bg-[#FAF9FD] hover:bg-[#EBCBF7] text-[#142746] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveHeight} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#142746] mb-1.5">
                  Height (centimeters)
                </label>
                <input
                  type="number"
                  min={100}
                  max={250}
                  step={0.5}
                  required
                  value={formHeight}
                  onChange={(e) => setFormHeight(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border-[1.5px] border-[#142746] text-[#142746] text-sm font-bold focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#142746]/15">
                <button
                  type="button"
                  onClick={() => setIsHeightModalOpen(false)}
                  className="neo-btn px-4 py-2 rounded-xl bg-white text-[#142746] text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="neo-btn px-5 py-2 rounded-xl bg-[#142746] text-white text-xs font-bold cursor-pointer"
                >
                  Save Height
                </button>
              </div>
            </form>
          </PastelCard>
        </div>
      )}
    </div>
  </>
);
}
