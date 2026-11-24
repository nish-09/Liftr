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
import { PastelCard, PastelBadge } from "@/components/ui/DesignSystem";
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
  { label: "0%", color: "#EEF2F7" },
  { label: "1–24%", color: "#F8C3B5" },
  { label: "25–49%", color: "#F2FA91" },
  { label: "50–74%", color: "#EBCBF7" },
  { label: "75–99%", color: "#E9FF91" },
  { label: "100%+", color: "#BDF7B6" },
];

export function getPastelCoverageColor(coveragePercent: number): string {
  if (coveragePercent <= 0) return "#EEF2F7";
  if (coveragePercent < 25) return "#F8C3B5";
  if (coveragePercent < 50) return "#F2FA91";
  if (coveragePercent < 75) return "#EBCBF7";
  if (coveragePercent < 100) return "#E9FF91";
  return "#BDF7B6";
}

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
    const raw = calculateMuscleHeatmap(sessions, exercises, selectedDays, customTargets);
    const mapped = { ...raw };
    (Object.keys(mapped) as MuscleId[]).forEach((id) => {
      mapped[id] = {
        ...mapped[id],
        color: getPastelCoverageColor(mapped[id].rawCoveragePercentage),
      };
    });
    return mapped;
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
    return heatmapData[muscleId]?.color || "#EEF2F7";
  }

  return (
    <PastelCard tone="white" className="p-5 sm:p-6 space-y-5 relative">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#142746]/15">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="font-heading font-extrabold text-lg text-[#142746] flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#142746]" />
              <span>Muscle Coverage Heatmap</span>
            </h3>
            <PastelBadge tone="green">15 Groups</PastelBadge>
          </div>
          <p className="text-xs text-[#8993A5] mt-1">
            Hypertrophic stimulus mapping based on completed working sets vs weekly targets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex flex-wrap items-center p-1 rounded-xl bg-[#FAF9FD] border-[1.5px] border-[#142746]">
            {(["both", "front", "back"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  "min-h-[36px] px-2.5 py-1 rounded-lg text-xs transition-all border capitalize font-bold cursor-pointer",
                  viewMode === mode
                    ? "bg-[#E9FF91] text-[#142746] border-[#142746]"
                    : "border-transparent text-[#8993A5] hover:text-[#142746]"
                )}
              >
                {mode}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center p-1 rounded-xl bg-[#FAF9FD] border-[1.5px] border-[#142746]">
            {TIME_FILTERS.map((tf) => (
              <button
                key={tf.value}
                onClick={() => setSelectedDays(tf.value)}
                className={cn(
                  "min-h-[36px] px-2.5 py-1 rounded-lg text-xs transition-all border font-bold cursor-pointer whitespace-nowrap",
                  selectedDays === tf.value
                    ? "bg-[#BDF7B6] text-[#142746] border-[#142746]"
                    : "border-transparent text-[#8993A5] hover:text-[#142746]"
                )}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Coverage Summary Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3.5 rounded-2xl bg-[#BDF7B6]/45 border-[1.5px] border-[#142746] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#142746]" />
            <span className="text-xs font-bold text-[#142746]">Optimal Coverage (≥75%)</span>
          </div>
          <span className="text-xs font-extrabold text-[#142746]">
            {optimalMuscles.length} / 15 Groups
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#F8C3B5]/45 border-[1.5px] border-[#142746] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-[#142746]" />
            <span className="text-xs font-bold text-[#142746]">Under-Trained (&lt;25%)</span>
          </div>
          <span className="text-xs font-extrabold text-[#142746]">
            {neglectedMuscles.length} Groups
          </span>
        </div>
      </div>

      {/* SVG Canvas */}
      <div
        onMouseMove={handleMouseMove}
        className="relative bg-[#FAF9FD] border-[1.5px] border-[#142746] rounded-2xl p-4 sm:p-6 overflow-hidden flex flex-col md:flex-row items-center justify-around gap-6 select-none"
      >
        {hoveredMuscle && (
          <div
            className="pointer-events-none absolute z-40 bg-white border-[1.5px] border-[#142746] shadow-neo rounded-2xl p-3 max-w-xs text-xs space-y-1.5 text-[#142746]"
            style={{
              left: `${Math.min(Math.max(12, mousePos.containerWidth - 240), mousePos.x + 15)}px`,
              top: `${Math.max(10, mousePos.y - 80)}px`,
            }}
          >
            <div className="flex items-center justify-between gap-2 border-b border-[#142746]/15 pb-1">
              <span className="font-heading font-extrabold text-sm">{hoveredMuscle.name}</span>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-extrabold border border-[#142746]"
                style={{ backgroundColor: hoveredMuscle.color }}
              >
                {hoveredMuscle.coveragePercentage}%
              </span>
            </div>
            <div className="text-[11px] font-medium">
              Completed: <strong>{hoveredMuscle.completedWorkingSets}</strong> /{" "}
              {hoveredMuscle.targetWorkingSets} sets
            </div>
            <div className="text-[10px] text-[#8993A5]">
              Click muscle to inspect breakdown →
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

      {/* Legend */}
      <div className="bg-[#FAF9FD] border-[1.5px] border-[#142746] rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="space-y-0.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#142746] block">
            Training Coverage (% of Target):
          </span>
          <span className="text-[10px] text-[#8993A5] block">
            Tap or click any muscle region to inspect sets &amp; customize weekly target
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {COLOR_SCALE_LEGEND.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span
                className="w-3.5 h-3.5 rounded border border-[#142746]"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[#142746] font-semibold text-[11px]">{item.label}</span>
            </div>
          ))}
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
    </PastelCard>
  );
}
