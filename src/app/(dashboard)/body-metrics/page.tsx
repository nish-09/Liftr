"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useBodyStore } from "@/stores/useBodyStore";
import { calculateBMI } from "@/lib/calculations/strength";
import { BodyMeasurementItem, MeasurementUnit } from "@/types";
import { NEO_TOOLTIP_STYLE } from "@/components/charts/chartStyles";
import {
  Info,
  Plus,
  X,
  Edit2,
  Trash2,
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
  const [formHeight, setFormHeight] = useState(
    userBodyProfile.height != null ? String(userBodyProfile.height) : ""
  );

  // Measurement Modal State
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

  // Calculate dynamic BMI
  const { bmi, category } = useMemo(() => {
    if (!hasBMIData || latestWeight == null || currentHeightCm == null) {
      return { bmi: 0, category: "Uncalculated", color: "#A1A9A8" };
    }
    return calculateBMI(latestWeight, currentHeightCm);
  }, [hasBMIData, latestWeight, currentHeightCm]);

  // Historical BMI data derived from weight logs
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

  // Calculate needle position percentage across a 15 - 35 BMI range
  const minBMIScale = 15;
  const maxBMIScale = 35;
  const scalePercent = hasBMIData
    ? Math.max(0, Math.min(100, ((bmi - minBMIScale) / (maxBMIScale - minBMIScale)) * 100))
    : null;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading font-black text-3xl md:text-4xl text-dark tracking-tight">
              BODY METRICS &amp; MEASUREMENTS
            </h1>
            <span className="px-2.5 py-1 rounded bg-forest text-cream border-2 border-dark text-xs font-mono font-bold shadow-neo-sm">
              Biometric Engine
            </span>
          </div>
          <p className="text-sm text-dark/70 font-sans mt-1">
            Dynamic BMI calculations, category classification, and circumference measurements.
          </p>
        </div>

        {/* Tab switch buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white border-2 border-dark shadow-neo-sm">
          <button
            onClick={() => setActiveTab("bmi")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer border-2",
              activeTab === "bmi"
                ? "bg-forest text-lime border-dark font-black shadow-neo-sm"
                : "border-transparent text-dark/70 hover:text-dark font-bold"
            )}
          >
            BMI Analysis
          </button>
          <button
            onClick={() => setActiveTab("measurements")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer border-2",
              activeTab === "measurements"
                ? "bg-forest text-lime border-dark font-black shadow-neo-sm"
                : "border-transparent text-dark/70 hover:text-dark font-bold"
            )}
          >
            Body Circumference ({bodyMeasurements.length})
          </button>
        </div>
      </div>

      {activeTab === "bmi" ? (
        <>
          {/* Advisory Banner: BMI Screening Disclaimer */}
          <div className="p-4 rounded-xl bg-white border-2 border-dark shadow-neo-sm flex items-start gap-3">
            <Info className="w-5 h-5 text-forest shrink-0 mt-0.5 stroke-[2.5]" />
            <div className="text-xs text-dark/80 leading-relaxed font-sans">
              <span className="font-black text-dark uppercase font-mono mr-1">
                Clinical Note:
              </span>
              BMI is a screening tool based on total body mass and height. It does not measure body fat percentage or differentiate between skeletal muscle and adipose tissue. For athletes engaged in progressive resistance training, use BMI alongside body measurements, strength trajectory, and target weight management.
            </div>
          </div>

          {/* Hero Bento Cards: Current BMI + Visual Scale */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Dynamic BMI Display Card */}
            <div className="lg:col-span-5 bg-cream border-2 border-dark rounded-xl shadow-neo p-6 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between text-dark/70 mb-2">
                  <span className="text-xs font-mono uppercase font-black tracking-wider text-dark/80">
                    Current BMI Status
                  </span>
                  <span
                    className={cn(
                      "text-xs font-mono font-black uppercase px-2.5 py-1 rounded border-2 border-dark shadow-neo-sm",
                      hasBMIData ? "bg-lime text-dark" : "bg-white text-dark/60"
                    )}
                  >
                    {hasBMIData ? category : "NOT CONFIGURED"}
                  </span>
                </div>

                <div className="my-4">
                  <div className="text-6xl font-heading font-black text-forest tracking-tight">
                    {hasBMIData ? bmi : "--"}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-2">
                    <span className="text-xs font-mono font-bold text-dark/70">
                      {hasBMIData
                        ? `Derived from ${latestWeight} kg and ${currentHeightCm} cm`
                        : "Configure height and log a weigh-in to calculate BMI."}
                    </span>
                    <button
                      onClick={() => {
                        setFormHeight(currentHeightCm != null ? String(currentHeightCm) : "");
                        setIsHeightModalOpen(true);
                      }}
                      className="text-xs font-mono font-black text-forest hover:text-dark flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>{currentHeightCm != null ? "Edit Height" : "Set Height"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Visual BMI Scale Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono font-bold text-dark/70">
                  <span>Under (&lt;18.5)</span>
                  <span>Normal (18.5-24.9)</span>
                  <span>Over (25-29.9)</span>
                  <span>Obese (30+)</span>
                </div>

                <div className="relative w-full h-3.5 rounded-full bg-white border-2 border-dark overflow-hidden flex shadow-neo-sm">
                  <div className="w-[17.5%] h-full bg-lavender border-r border-dark/20" title="Underweight" />
                  <div className="w-[32%] h-full bg-lime border-r border-dark/20" title="Normal" />
                  <div className="w-[25%] h-full bg-orange/60 border-r border-dark/20" title="Overweight" />
                  <div className="w-[25.5%] h-full bg-orange" title="Obesity" />
                </div>

                {scalePercent != null && (
                  <div className="relative w-full h-4">
                    <div
                      className="absolute top-0 -ml-2 text-center transition-all duration-500 ease-out"
                      style={{ left: `${scalePercent}%` }}
                    >
                      <div className="w-4 h-4 rounded-full bg-forest border-2 border-dark shadow-neo-sm mx-auto" />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t-2 border-dark/15 flex items-center justify-between text-xs font-mono font-bold text-dark/70">
                <span>Healthy Target Range</span>
                <span className="text-forest font-black">18.5 — 24.9</span>
              </div>
            </div>

            {/* Right: Historical BMI Trajectory Chart */}
            <div className="lg:col-span-7 bg-cream border-2 border-dark rounded-xl shadow-neo p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-black text-lg text-dark tracking-tight">BMI TREND OVER TIME</h3>
                  <p className="text-xs text-dark/70 font-mono font-bold mt-0.5">
                    Dynamic history calculated per recorded weight log
                  </p>
                </div>
                <Link
                  href="/weight-tracker"
                  className="px-3 py-1.5 rounded-lg bg-lime hover:bg-lime/90 text-dark border-2 border-dark text-xs font-mono font-black uppercase shadow-neo-sm cursor-pointer"
                >
                  Log Weight
                </Link>
              </div>

              <div className="h-64 w-full">
                {historicalBMIData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-dark/60 font-mono font-bold">
                    Log weights to visualize your BMI trajectory.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historicalBMIData}>
                      <defs>
                        <linearGradient id="bmiGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3155F5" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#E9F56A" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#171717" opacity={0.15} />
                      <XAxis dataKey="date" stroke="#171717" fontSize={11} tick={{ fill: "#171717", fontWeight: "bold" }} />
                      <YAxis domain={["dataMin - 1", "dataMax + 1"]} stroke="#171717" fontSize={11} tick={{ fill: "#171717", fontWeight: "bold" }} />
                      <Tooltip contentStyle={NEO_TOOLTIP_STYLE} />
                      <Area
                        type="monotone"
                        dataKey="bmi"
                        name="BMI"
                        stroke="#3155F5"
                        strokeWidth={3}
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
              <h2 className="font-heading font-black text-xl text-dark tracking-tight">CIRCUMFERENCE TRACKER</h2>
              <p className="text-xs text-dark/70 font-sans mt-0.5">
                Track muscle growth across arms, chest, thighs, waist, and custom zones.
              </p>
            </div>

            <button
              onClick={() => setIsMeasureModalOpen(true)}
              className="px-4 py-2.5 rounded-lg bg-forest hover:bg-forest/90 text-cream text-xs font-mono uppercase font-bold tracking-wider shadow-neo border-2 border-dark flex items-center gap-1.5 cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
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
                  className="bg-cream border-2 border-dark rounded-xl shadow-neo p-4 flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase text-dark font-black tracking-wider">
                      {mType.label}
                    </span>
                    {delta !== null && (
                      <span
                        className={cn(
                          "text-[10px] font-mono px-2 py-0.5 rounded border-2 border-dark font-black shadow-neo-sm",
                          delta > 0
                            ? "bg-lime text-dark"
                            : delta < 0
                            ? "bg-orange text-cream"
                            : "bg-white text-dark/70"
                        )}
                      >
                        {delta > 0 ? `+${delta}` : delta} cm
                      </span>
                    )}
                  </div>

                  {latest ? (
                    <div>
                      <div className="text-3xl font-heading font-black text-dark tracking-tight">
                        {latest.value}{" "}
                        <span className="text-sm font-mono font-bold text-dark/60">
                          {latest.unit}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-dark/60 mt-1 block">
                        Logged on {latest.recordedAt}
                        {latest.notes ? ` • ${latest.notes}` : ""}
                      </span>
                    </div>
                  ) : (
                    <div className="py-2 text-xs text-dark/50 font-mono italic">
                      No measurements logged yet.
                    </div>
                  )}

                  {latest && (
                    <div className="pt-2 border-t-2 border-dark/10 flex justify-end">
                      <button
                        onClick={() => deleteMeasurement(latest.id)}
                        className="text-[10px] font-mono font-bold text-dark/60 hover:text-orange cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-cream border-2 border-dark rounded-xl shadow-neo-lg p-6 w-full max-w-sm relative font-sans space-y-4">
            <div className="flex items-center justify-between border-b-2 border-dark/15 pb-3">
              <h3 className="font-heading font-black text-xl text-dark tracking-tight">
                LOG MEASUREMENT
              </h3>
              <button
                onClick={() => setIsMeasureModalOpen(false)}
                className="p-1.5 rounded-lg border-2 border-dark bg-white hover:bg-forest hover:text-cream text-dark transition-all cursor-pointer shadow-neo-sm"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            <form onSubmit={handleLogMeasurementSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase font-bold text-dark mb-1.5">
                  Measurement Zone *
                </label>
                <select
                  value={measureType}
                  onChange={(e) =>
                    setMeasureType(
                      e.target.value as BodyMeasurementItem["measurementType"]
                    )
                  }
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white border-2 border-dark text-dark text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-forest cursor-pointer"
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
                  <label className="block text-xs font-mono uppercase font-bold text-dark mb-1.5">
                    Custom Zone Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g., Neck or Forearm"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white border-2 border-dark text-dark text-sm focus:outline-none focus:ring-2 focus:ring-forest font-sans"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase font-bold text-dark mb-1.5">
                    Value *
                  </label>
                  <input
                    type="number"
                    step={0.1}
                    required
                    value={measureValue}
                    onChange={(e) => setMeasureValue(e.target.value)}
                    placeholder="e.g., 38.5"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white border-2 border-dark text-dark text-sm focus:outline-none focus:ring-2 focus:ring-forest font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase font-bold text-dark mb-1.5">
                    Unit
                  </label>
                  <select
                    value={measureUnit}
                    onChange={(e) => setMeasureUnit(e.target.value as MeasurementUnit)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white border-2 border-dark text-dark text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-forest cursor-pointer"
                  >
                    <option value="cm">Centimeters (cm)</option>
                    <option value="in">Inches (in)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase font-bold text-dark mb-1.5">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={measureDate}
                  onChange={(e) => setMeasureDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white border-2 border-dark text-dark text-sm focus:outline-none focus:ring-2 focus:ring-forest font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase font-bold text-dark mb-1.5">
                  Notes
                </label>
                <input
                  type="text"
                  value={measureNotes}
                  onChange={(e) => setMeasureNotes(e.target.value)}
                  placeholder="Flexed peak, morning measurement..."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white border-2 border-dark text-dark text-sm focus:outline-none focus:ring-2 focus:ring-forest font-sans"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t-2 border-dark/15">
                <button
                  type="button"
                  onClick={() => setIsMeasureModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg bg-white border-2 border-dark hover:bg-cream text-dark text-xs font-mono font-bold uppercase transition-all shadow-neo-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-lime hover:bg-lime/90 text-dark text-xs font-mono uppercase font-black tracking-wider border-2 border-dark shadow-neo cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-cream border-2 border-dark rounded-xl shadow-neo-lg p-6 w-full max-w-sm relative font-sans space-y-4">
            <div className="flex items-center justify-between border-b-2 border-dark/15 pb-3">
              <h3 className="font-heading font-black text-xl text-dark tracking-tight">UPDATE HEIGHT</h3>
              <button
                onClick={() => setIsHeightModalOpen(false)}
                className="p-1.5 rounded-lg border-2 border-dark bg-white hover:bg-forest hover:text-cream text-dark transition-all cursor-pointer shadow-neo-sm"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            <form onSubmit={handleSaveHeight} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase font-bold text-dark mb-1.5">
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
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white border-2 border-dark text-dark text-sm focus:outline-none focus:ring-2 focus:ring-forest font-mono font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t-2 border-dark/15">
                <button
                  type="button"
                  onClick={() => setIsHeightModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg bg-white border-2 border-dark hover:bg-cream text-dark text-xs font-mono font-bold uppercase transition-all shadow-neo-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-lime hover:bg-lime/90 text-dark text-xs font-mono uppercase font-black tracking-wider border-2 border-dark shadow-neo cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5"
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
