"use client";

import { useState, useMemo } from "react";
import {
  MuscleId,
  MuscleCoverageData,
  calculateMuscleHeatmap,
} from "@/lib/calculations/muscleHeatmap";
import { WorkoutSessionItem, Exercise } from "@/types";
import { Activity, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnteriorBodySvg } from "./AnteriorBodySvg";
import { PosteriorBodySvg } from "./PosteriorBodySvg";
import { MuscleDetailModal } from "./MuscleDetailModal";

interface MuscleHeatmapProps {
  sessions: WorkoutSessionItem[];
  exercises: Exercise[];
  defaultTimeFilter?: number;
}

const TIME_FILTERS = [
  { label: "7 Days", value: 7 },
  { label: "30 Days", value: 30 },
  { label: "3 Months", value: 90 },
  { label: "6 Months", value: 180 },
];

const COLOR_SCALE_LEGEND = [
  { label: "0%", color: "#2A2A2A" },
  { label: "1–24%", color: "#A8382B" },
  { label: "25–49%", color: "#E97860" },
  { label: "50–74%", color: "#E9D65B" },
  { label: "75–99%", color: "#83D19B" },
  { label: "100%+", color: "#60C27D" },
];

export default function MuscleHeatmap({
  sessions,
  exercises,
  defaultTimeFilter = 7,
}: MuscleHeatmapProps) {
  const [selectedDays, setSelectedDays] = useState(defaultTimeFilter);
  const [viewMode, setViewMode] = useState<"both" | "front" | "back">("both");
  const [hoveredMuscle, setHoveredMuscle] = useState<MuscleCoverageData | null>(null);
  const [selectedMuscleId, setSelectedMuscleId] = useState<MuscleId | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, containerWidth: 800 });
  const [customTargets, setCustomTargets] = useState<Partial<Record<MuscleId, number>>>({});

  const heatmapData = useMemo(() => {
    return calculateMuscleHeatmap(sessions, exercises, selectedDays, customTargets);
  }, [sessions, exercises, selectedDays, customTargets]);

  const neglectedMuscles = useMemo(
    () => Object.values(heatmapData).filter((m) => m.coveragePercentage < 25),
    [heatmapData]
  );

  const optimalMuscles = useMemo(
    () => Object.values(heatmapData).filter((m) => m.coveragePercentage >= 75),
    [heatmapData]
  );

  const selectedMuscle = selectedMuscleId ? heatmapData[selectedMuscleId] : null;

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      containerWidth: rect.width,
    });
  }

  function getFill(muscleId: MuscleId): string {
    return heatmapData[muscleId]?.color || "#2A2A2A";
  }

  return (
    <div className="bg-cream border-2 border-dark rounded-xl shadow-neo p-5 sm:p-6 space-y-6 relative">
      {/* Header with Title and Time / View Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b-2 border-dark/15">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="font-heading font-black text-xl text-dark flex items-center gap-2 tracking-tight">
              <Activity className="w-5 h-5 text-forest stroke-[2.5]" />
              <span>MUSCLE HEATMAP – 2D ANATOMICAL VISUALIZATION</span>
            </h3>
            <span className="px-2.5 py-1 rounded bg-forest text-cream border-2 border-dark text-xs font-mono font-bold shadow-neo-sm">
              15 Muscle Groups
            </span>
          </div>
          <p className="text-xs text-dark/70 font-sans mt-1">
            Real-time hypertrophic stimulus mapping based on completed working sets vs weekly volume targets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center p-1 rounded-lg bg-white border-2 border-dark shadow-neo-sm">
            {(["both", "front", "back"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  "px-2.5 py-1 rounded text-xs font-mono transition-all border-2 capitalize",
                  viewMode === mode
                    ? "bg-forest text-lime border-dark font-black shadow-neo-sm"
                    : "border-transparent text-dark/70 hover:text-dark font-bold"
                )}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Time Filter Pills */}
          <div className="flex items-center p-1 rounded-lg bg-white border-2 border-dark shadow-neo-sm">
            {TIME_FILTERS.map((tf) => (
              <button
                key={tf.value}
                onClick={() => setSelectedDays(tf.value)}
                className={cn(
                  "px-2.5 py-1 rounded text-xs font-mono transition-all border-2 cursor-pointer",
                  selectedDays === tf.value
                    ? "bg-forest text-lime border-dark font-black shadow-neo-sm"
                    : "border-transparent text-dark/70 hover:text-dark font-bold"
                )}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Imbalance & Coverage Summary Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3.5 rounded-xl bg-white border-2 border-dark shadow-neo-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-forest animate-pulse" />
            <span className="text-xs font-mono font-bold text-dark">Stimulated Muscles (≥75%):</span>
          </div>
          <span className="text-xs font-mono font-black text-forest">
            {optimalMuscles.length} / 15 Groups
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border-2 border-dark shadow-neo-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-orange stroke-[2.5]" />
            <span className="text-xs font-mono font-bold text-dark">Under-Trained (&lt;25%):</span>
          </div>
          <span className="text-xs font-mono font-black text-orange">
            {neglectedMuscles.length} Groups
          </span>
        </div>
      </div>

      {/* Main SVG Visualization Canvas Container */}
      <div
        onMouseMove={handleMouseMove}
        className="relative bg-white border-2 border-dark rounded-xl p-4 sm:p-6 shadow-neo overflow-hidden flex flex-col md:flex-row items-center justify-around gap-6 select-none"
      >
        {hoveredMuscle && (
          <div
            className="pointer-events-none absolute z-40 bg-cream border-2 border-dark shadow-neo-lg rounded-xl p-3 max-w-xs text-xs font-mono space-y-1.5 transition-all duration-75 text-dark"
            style={{
              left: `${Math.min(Math.max(12, mousePos.containerWidth - 240), mousePos.x + 15)}px`,
              top: `${Math.max(10, mousePos.y - 80)}px`,
            }}
          >
            <div className="flex items-center justify-between gap-2 border-b-2 border-dark/15 pb-1">
              <span className="font-heading font-black text-dark text-sm">
                {hoveredMuscle.name}
              </span>
              <span
                className="text-[10px] px-1.5 py-0.5 rounded font-black uppercase border-2 border-dark"
                style={{ backgroundColor: hoveredMuscle.color, color: "#171717" }}
              >
                {hoveredMuscle.coveragePercentage}%
              </span>
            </div>

            <div className="text-[11px] text-dark/80 font-bold">
              Completed Sets:{" "}
              <span className="font-black text-dark">{hoveredMuscle.completedWorkingSets}</span> /{" "}
              {hoveredMuscle.targetWorkingSets} target
            </div>

            <div className="text-[10px] text-dark/60 italic font-semibold">
              Status: {hoveredMuscle.statusText}
            </div>

            <div className="text-[9px] text-forest font-black pt-1 block uppercase tracking-wider">
              Click muscle for full exercise breakdown →
            </div>
          </div>
        )}

        {(viewMode === "both" || viewMode === "front") && (
          <AnteriorBodySvg
            heatmapData={heatmapData}
            getFill={getFill}
            onHover={setHoveredMuscle}
            onSelect={setSelectedMuscleId}
          />
        )}

        {(viewMode === "both" || viewMode === "back") && (
          <PosteriorBodySvg
            heatmapData={heatmapData}
            getFill={getFill}
            onHover={setHoveredMuscle}
            onSelect={setSelectedMuscleId}
          />
        )}
      </div>

      {/* Color Scale Legend */}
      <div className="pt-2">
        <div className="bg-white border-2 border-dark rounded-xl p-3.5 shadow-neo-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          <span className="text-[10px] uppercase text-dark font-black tracking-wider">
            Training Coverage (% of Target):
          </span>
          <div className="flex flex-wrap items-center gap-3">
            {COLOR_SCALE_LEGEND.map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <span
                  className="w-3.5 h-3.5 rounded-sm border-2 border-dark shadow-neo-sm"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-dark font-bold text-[11px]">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedMuscle && (
        <MuscleDetailModal
          muscle={selectedMuscle}
          selectedDays={selectedDays}
          customTargetValue={customTargets[selectedMuscle.muscleId]}
          onUpdateTarget={(muscleId, val) =>
            setCustomTargets((prev) => ({ ...prev, [muscleId]: val }))
          }
          onClose={() => setSelectedMuscleId(null)}
        />
      )}
    </div>
  );
}
