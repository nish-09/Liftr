"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useBodyStore } from "@/stores/useBodyStore";
import { useHistoryStore } from "@/stores/useHistoryStore";
import { calculateBMI } from "@/lib/calculations/strength";
import { BodyMeasurementItem, MeasurementUnit } from "@/types";
import {
  Activity,
  Scale,
  Ruler,
  AlertTriangle,
  Info,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Layers,
  Edit2,
  Trash2,
  Plus,
  X,
  ArrowRight,
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
  const [formHeight, setFormHeight] = useState(userBodyProfile.height || 180);

  // Measurement Modal State
  const [isMeasureModalOpen, setIsMeasureModalOpen] = useState(false);
  const [measureType, setMeasureType] = useState<BodyMeasurementItem["measurementType"]>("chest");
  const [measureValue, setMeasureValue] = useState("");
  const [measureUnit, setMeasureUnit] = useState<MeasurementUnit>("cm");
  const [measureDate, setMeasureDate] = useState(new Date().toISOString().split("T")[0]);
  const [measureNotes, setMeasureNotes] = useState("");
  const [customName, setCustomName] = useState("");

  const latestWeight =
    weightLogs.length > 0 ? weightLogs[0].weight : userBodyProfile.startingWeight || 75;
  const currentHeightCm = userBodyProfile.height || 180;

  // Calculate dynamic BMI
  const { bmi, category, color } = useMemo(() => {
    return calculateBMI(latestWeight, currentHeightCm);
  }, [latestWeight, currentHeightCm]);

  // Historical BMI data derived from weight logs
  const historicalBMIData = useMemo(() => {
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
    updateBodyProfile({ height: Number(formHeight) });
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

  // Calculate needle position percentage across a 15 - 35 BMI range
  const minBMIScale = 15;
  const maxBMIScale = 35;
  const scalePercent = Math.max(
    0,
    Math.min(100, ((bmi - minBMIScale) / (maxBMIScale - minBMIScale)) * 100)
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif italic text-3xl text-white">Body Metrics &amp; Measurements</h1>
            <span className="px-2 py-0.5 rounded bg-[#1C1C1C] border border-[#2B2B2B] text-xs font-mono text-liftr-purple">
              Biometric Engine
            </span>
          </div>
          <p className="text-sm text-liftr-grey mt-0.5">
            Dynamic BMI calculations, category classification, and circumference measurements.
          </p>
        </div>

        {/* Tab switch buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#141414] border border-[#232323]">
          <button
            onClick={() => setActiveTab("bmi")}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-mono transition-all cursor-pointer",
              activeTab === "bmi"
                ? "bg-white text-black font-bold shadow-neo-sm"
                : "text-zinc-400 hover:text-white"
            )}
          >
            BMI Analysis
          </button>
          <button
            onClick={() => setActiveTab("measurements")}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-mono transition-all cursor-pointer",
              activeTab === "measurements"
                ? "bg-white text-black font-bold shadow-neo-sm"
                : "text-zinc-400 hover:text-white"
            )}
          >
            Body Circumference ({bodyMeasurements.length})
          </button>
        </div>
      </div>

      {activeTab === "bmi" ? (
        <>
          {/* Advisory Banner: BMI Screening Disclaimer */}
          <div className="p-4 rounded-xl bg-[#141414] border border-[#262626] flex items-start gap-3">
            <Info className="w-5 h-5 text-liftr-yellow shrink-0 mt-0.5" />
            <div className="text-xs text-zinc-300 leading-relaxed">
              <span className="font-bold text-white uppercase font-mono mr-1">
                Clinical Note:
              </span>
              BMI is a screening tool based on total body mass and height. It does not measure body fat percentage or differentiate between skeletal muscle and adipose tissue. For athletes engaged in progressive resistance training, use BMI alongside body measurements, strength trajectory, and target weight management.
            </div>
          </div>

          {/* Hero Bento Cards: Current BMI + Visual Scale */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Dynamic BMI Display Card */}
            <div className="lg:col-span-5 bento-card p-6 flex flex-col justify-between space-y-6 border-border">
              <div>
                <div className="flex items-center justify-between text-zinc-400 mb-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-liftr-grey">
                    Current BMI Status
                  </span>
                  <span
                    className="text-xs font-mono font-bold uppercase px-2.5 py-1 rounded"
                    style={{
                      backgroundColor: `${color}20`,
                      color: color,
                      border: `1px solid ${color}40`,
                    }}
                  >
                    {category}
                  </span>
                </div>

                <div className="my-4">
                  <div className="text-5xl font-bold stat-number text-white">
                    {bmi}
                  </div>
                  <span className="text-xs font-mono text-zinc-400 mt-1 block">
                    Derived from {latestWeight} kg and {currentHeightCm} cm
                  </span>
                </div>
              </div>

              {/* Visual BMI Scale Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                  <span>Underweight (&lt;18.5)</span>
                  <span>Normal (18.5-24.9)</span>
                  <span>Overweight (25-29.9)</span>
                  <span>Obesity (30+)</span>
                </div>

                <div className="relative w-full h-3 rounded-full bg-[#1C1C1C] overflow-hidden flex">
                  <div className="w-[17.5%] h-full bg-[#E9D65B]/60" title="Underweight" />
                  <div className="w-[32%] h-full bg-[#60C27D]/80" title="Normal" />
                  <div className="w-[25%] h-full bg-[#E97860]/70" title="Overweight" />
                  <div className="w-[25.5%] h-full bg-[#E97860]" title="Obesity" />
                </div>

                <div className="relative w-full h-4">
                  <div
                    className="absolute top-0 -ml-2 text-center transition-all duration-500 ease-out"
                    style={{ left: `${scalePercent}%` }}
                  >
                    <div className="w-4 h-4 rounded-full bg-white border-2 border-liftr-purple shadow-neo-sm mx-auto" />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#1C1C1C] flex items-center justify-between text-xs font-mono text-zinc-400">
                <span>Healthy Target Range</span>
                <span className="text-white font-bold">18.5 — 24.9</span>
              </div>
            </div>

            {/* Right: Historical BMI Trajectory Chart */}
            <div className="lg:col-span-7 bento-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">BMI Trend Over Time</h3>
                  <p className="text-xs text-liftr-grey font-mono mt-0.5">
                    Dynamic history calculated per recorded weight log
                  </p>
                </div>
                <Link
                  href="/weight-tracker"
                  className="text-xs font-mono text-liftr-purple hover:underline"
                >
                  Log Weight
                </Link>
              </div>

              <div className="h-64 w-full">
                {historicalBMIData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-zinc-500 font-mono">
                    Log weights to visualize your BMI trajectory.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historicalBMIData}>
                      <defs>
                        <linearGradient id="bmiGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#60C27D" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#60C27D" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                      <XAxis dataKey="date" stroke="#666" fontSize={11} />
                      <YAxis domain={["dataMin - 1", "dataMax + 1"]} stroke="#666" fontSize={11} />
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
                        dataKey="bmi"
                        name="BMI"
                        stroke="#60C27D"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#bmiGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Body Measurements View */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Circumference Tracker</h2>
              <p className="text-xs text-liftr-grey font-mono">
                Track muscle growth across arms, chest, thighs, waist, and custom zones.
              </p>
            </div>

            <button
              onClick={() => setIsMeasureModalOpen(true)}
              className="px-4 py-2.5 rounded-lg bg-liftr-purple hover:bg-liftr-purple-dark text-white text-xs font-mono uppercase font-bold shadow-neo flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log Measurement</span>
            </button>
          </div>

          {/* Measurements Cards Grid */}
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
                <div
                  key={mType.value}
                  className="bento-card p-4 flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase text-liftr-grey font-bold">
                      {mType.label}
                    </span>
                    {delta !== null && (
                      <span
                        className={cn(
                          "text-[10px] font-mono px-1.5 py-0.5 rounded",
                          delta > 0
                            ? "bg-liftr-green/15 text-liftr-green"
                            : delta < 0
                            ? "bg-liftr-coral/15 text-liftr-coral"
                            : "bg-[#202020] text-zinc-400"
                        )}
                      >
                        {delta > 0 ? `+${delta}` : delta} cm
                      </span>
                    )}
                  </div>

                  {latest ? (
                    <div>
                      <div className="text-3xl font-bold stat-number text-white">
                        {latest.value}{" "}
                        <span className="text-sm font-normal text-zinc-400">
                          {latest.unit}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500 mt-1 block">
                        Logged on {latest.recordedAt}
                        {latest.notes ? ` • ${latest.notes}` : ""}
                      </span>
                    </div>
                  ) : (
                    <div className="py-2 text-xs text-zinc-600 font-mono italic">
                      No measurements logged yet.
                    </div>
                  )}

                  {latest && (
                    <div className="pt-2 border-t border-[#1F1F1F] flex justify-end">
                      <button
                        onClick={() => deleteMeasurement(latest.id)}
                        className="text-[10px] font-mono text-zinc-500 hover:text-liftr-coral"
                      >
                        Delete latest entry
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Log Measurement Modal */}
      {isMeasureModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bento-card p-6 w-full max-w-sm border-2 border-border shadow-neo-purple">
            <h3 className="text-base font-bold text-white mb-4">
              Log Circumference Measurement
            </h3>
            <form onSubmit={handleLogMeasurementSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-liftr-grey mb-1.5">
                  Measurement Zone *
                </label>
                <select
                  value={measureType}
                  onChange={(e) =>
                    setMeasureType(
                      e.target.value as BodyMeasurementItem["measurementType"]
                    )
                  }
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-[#2c2c2c] text-white text-sm focus:outline-none focus:border-liftr-purple"
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
                  <label className="block text-xs font-mono uppercase text-liftr-grey mb-1.5">
                    Custom Zone Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g., Neck or Forearm"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-[#2c2c2c] text-white text-sm focus:outline-none focus:border-liftr-purple"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-liftr-grey mb-1.5">
                    Value *
                  </label>
                  <input
                    type="number"
                    step={0.1}
                    required
                    value={measureValue}
                    onChange={(e) => setMeasureValue(e.target.value)}
                    placeholder="e.g., 38.5"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-[#2c2c2c] text-white text-sm focus:outline-none focus:border-liftr-purple font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-liftr-grey mb-1.5">
                    Unit
                  </label>
                  <select
                    value={measureUnit}
                    onChange={(e) => setMeasureUnit(e.target.value as MeasurementUnit)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-[#2c2c2c] text-white text-sm focus:outline-none focus:border-liftr-purple"
                  >
                    <option value="cm">Centimeters (cm)</option>
                    <option value="in">Inches (in)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-liftr-grey mb-1.5">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={measureDate}
                  onChange={(e) => setMeasureDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-[#2c2c2c] text-white text-sm focus:outline-none focus:border-liftr-purple font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-liftr-grey mb-1.5">
                  Notes
                </label>
                <input
                  type="text"
                  value={measureNotes}
                  onChange={(e) => setMeasureNotes(e.target.value)}
                  placeholder="Flexed peak, morning measurement..."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-[#2c2c2c] text-white text-sm focus:outline-none focus:border-liftr-purple"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMeasureModalOpen(false)}
                  className="px-4 py-2 rounded bg-[#1C1C1C] text-xs font-mono uppercase text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-liftr-purple hover:bg-liftr-purple-dark text-white text-xs font-mono uppercase font-bold shadow-neo"
                >
                  Save Measurement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Height Modal */}
      {isHeightModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bento-card p-6 w-full max-w-sm border-2 border-border shadow-neo-purple">
            <h3 className="text-base font-bold text-white mb-4">Update Height</h3>
            <form onSubmit={handleSaveHeight} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-liftr-grey mb-1.5">
                  Height (centimeters)
                </label>
                <input
                  type="number"
                  min={100}
                  max={250}
                  step={0.5}
                  required
                  value={formHeight}
                  onChange={(e) => setFormHeight(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-[#2c2c2c] text-white text-sm focus:outline-none focus:border-liftr-purple font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsHeightModalOpen(false)}
                  className="px-4 py-2 rounded bg-[#1C1C1C] text-xs font-mono uppercase text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-liftr-purple hover:bg-liftr-purple-dark text-white text-xs font-mono uppercase font-bold shadow-neo"
                >
                  Save Height
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
