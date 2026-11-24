"use client";

import { useState, useMemo } from "react";
import {
  MuscleId,
  MuscleCoverageData,
  calculateMuscleHeatmap,
  MUSCLE_REGISTRY,
} from "@/lib/calculations/muscleHeatmap";
import { WorkoutSessionItem, Exercise } from "@/types";
import {
  Activity,
  Flame,
  Info,
  Layers,
  ChevronRight,
  X,
  Dumbbell,
  AlertTriangle,
  CheckCircle2,
  Settings2,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MuscleHeatmapProps {
  sessions: WorkoutSessionItem[];
  exercises: Exercise[];
  defaultTimeFilter?: number; // days
}

const TIME_FILTERS = [
  { label: "7 Days", value: 7 },
  { label: "30 Days", value: 30 },
  { label: "3 Months", value: 90 },
  { label: "6 Months", value: 180 },
];

const COLOR_SCALE_LEGEND = [
  { label: "0%", desc: "Untrained", color: "#2A2A2A" },
  { label: "1–24%", desc: "Muted Red", color: "#A8382B" },
  { label: "25–49%", desc: "Orange", color: "#E97860" },
  { label: "50–74%", desc: "Yellow", color: "#E9D65B" },
  { label: "75–99%", desc: "Light Green", color: "#83D19B" },
  { label: "100%+", desc: "Bright Green", color: "#60C27D" },
];

export default function MuscleHeatmap({
  sessions,
  exercises,
  defaultTimeFilter = 7,
}: MuscleHeatmapProps) {
  const [selectedDays, setSelectedDays] = useState(defaultTimeFilter);
  const [viewMode, setViewMode] = useState<"both" | "front" | "back">("both");
  const [hoveredMuscle, setHoveredMuscle] = useState<MuscleCoverageData | null>(null);
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleCoverageData | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Custom user targets stored in local state
  const [customTargets, setCustomTargets] = useState<Partial<Record<MuscleId, number>>>({});

  // Compute heatmap coverage data
  const heatmapData = useMemo(() => {
    return calculateMuscleHeatmap(sessions, exercises, selectedDays, customTargets);
  }, [sessions, exercises, selectedDays, customTargets]);

  // Identify neglected muscles (<25% coverage)
  const neglectedMuscles = useMemo(() => {
    return Object.values(heatmapData).filter((m) => m.coveragePercentage < 25);
  }, [heatmapData]);

  // Identify optimal muscles (>=75% coverage)
  const optimalMuscles = useMemo(() => {
    return Object.values(heatmapData).filter((m) => m.coveragePercentage >= 75);
  }, [heatmapData]);

  function handleMouseMove(e: React.MouseEvent) {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }

  function getFill(muscleId: MuscleId): string {
    return heatmapData[muscleId]?.color || "#2A2A2A";
  }

  function handleMuscleClick(muscleId: MuscleId) {
    if (heatmapData[muscleId]) {
      setSelectedMuscle(heatmapData[muscleId]);
    }
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

        {/* View mode toggle & Time filter pills */}
        <div className="flex flex-wrap items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center p-1 rounded-lg bg-white border-2 border-dark shadow-neo-sm">
            <button
              onClick={() => setViewMode("both")}
              className={cn(
                "px-2.5 py-1 rounded text-xs font-mono transition-all border-2",
                viewMode === "both"
                  ? "bg-forest text-lime border-dark font-black shadow-neo-sm"
                  : "border-transparent text-dark/70 hover:text-dark font-bold"
              )}
            >
              Both
            </button>
            <button
              onClick={() => setViewMode("front")}
              className={cn(
                "px-2.5 py-1 rounded text-xs font-mono transition-all border-2",
                viewMode === "front"
                  ? "bg-forest text-lime border-dark font-black shadow-neo-sm"
                  : "border-transparent text-dark/70 hover:text-dark font-bold"
              )}
            >
              Front
            </button>
            <button
              onClick={() => setViewMode("back")}
              className={cn(
                "px-2.5 py-1 rounded text-xs font-mono transition-all border-2",
                viewMode === "back"
                  ? "bg-forest text-lime border-dark font-black shadow-neo-sm"
                  : "border-transparent text-dark/70 hover:text-dark font-bold"
              )}
            >
              Back
            </button>
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
        {/* Floating Tooltip */}
        {hoveredMuscle && (
          <div
            className="pointer-events-none absolute z-40 bg-cream border-2 border-dark shadow-neo-lg rounded-xl p-3 max-w-xs text-xs font-mono space-y-1.5 transition-all duration-75 text-dark"
            style={{
              left: `${Math.min(window.innerWidth > 768 ? 650 : 250, mousePos.x + 15)}px`,
              top: `${Math.max(10, mousePos.y - 80)}px`,
            }}
          >
            <div className="flex items-center justify-between gap-2 border-b-2 border-dark/15 pb-1">
              <span className="font-heading font-black text-dark text-sm">
                {hoveredMuscle.name}
              </span>
              <span
                className="text-[10px] px-1.5 py-0.5 rounded font-black uppercase border-2 border-dark"
                style={{
                  backgroundColor: `${hoveredMuscle.color}`,
                  color: "#171B16",
                }}
              >
                {hoveredMuscle.coveragePercentage}%
              </span>
            </div>

            <div className="text-[11px] text-dark/80 font-bold">
              Completed Sets:{" "}
              <span className="font-black text-dark">
                {hoveredMuscle.completedWorkingSets}
              </span>{" "}
              / {hoveredMuscle.targetWorkingSets} target
            </div>

            <div className="text-[10px] text-dark/60 italic font-semibold">
              Status: {hoveredMuscle.statusText}
            </div>

            <div className="text-[9px] text-forest font-black pt-1 block uppercase tracking-wider">
              Click muscle for full exercise breakdown →
            </div>
          </div>
        )}

        {/* 1. FRONT VIEW SVG */}
        {(viewMode === "both" || viewMode === "front") && (
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-mono uppercase tracking-widest text-dark font-black mb-2">
              Anterior (Front View)
            </span>
            <div className="w-56 sm:w-64 md:w-72 h-[420px] relative">
              <svg
                viewBox="0 0 280 440"
                className="w-full h-full drop-shadow-sm"
              >
                {/* Body Background Silhouette / Contours */}
                <g fill="none" stroke="#171B16" strokeWidth="1.5">
                  {/* Head & Neck */}
                  <ellipse cx="140" cy="35" rx="18" ry="24" stroke="#171B16" strokeWidth="2" />
                  <path d="M132 58 L130 75 M148 58 L150 75" />
                  {/* Outer body outline */}
                  <path d="M105 85 L85 105 L65 170 L55 230 L70 232 L85 180 L95 190 L95 240 L105 320 L108 400 L125 405 L135 320 L140 250 L145 320 L155 405 L172 400 L175 320 L185 240 L185 190 L195 180 L210 232 L225 230 L215 170 L195 105 L175 85 Z" />
                </g>

                {/* --- MUSCLE GROUPS (FRONT) --- */}

                {/* 1. Front & Lateral Shoulders (Anterior & Lateral Deltoids) */}
                <g
                  className="cursor-pointer transition-all duration-150 hover:brightness-125"
                  onMouseEnter={() => setHoveredMuscle(heatmapData.front_delts)}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  onClick={() => handleMuscleClick("front_delts")}
                >
                  {/* Left Shoulder */}
                  <path
                    d="M105 85 C95 88 82 98 80 115 C78 128 82 142 90 148 C93 138 98 120 102 105 Z"
                    fill={getFill("front_delts")}
                    stroke="#1E1E1E"
                    strokeWidth="1.5"
                  />
                  {/* Right Shoulder */}
                  <path
                    d="M175 85 C185 88 198 98 200 115 C202 128 198 142 190 148 C187 138 182 120 178 105 Z"
                    fill={getFill("front_delts")}
                    stroke="#1E1E1E"
                    strokeWidth="1.5"
                  />
                </g>

                {/* 2. Chest (Pectoralis Major) */}
                <g
                  className="cursor-pointer transition-all duration-150 hover:brightness-125"
                  onMouseEnter={() => setHoveredMuscle(heatmapData.chest)}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  onClick={() => handleMuscleClick("chest")}
                >
                  {/* Left Pec */}
                  <path
                    d="M138 90 L112 92 C104 102 102 122 105 138 C115 145 132 146 138 140 Z"
                    fill={getFill("chest")}
                    stroke="#1E1E1E"
                    strokeWidth="1.5"
                  />
                  {/* Right Pec */}
                  <path
                    d="M142 90 L168 92 C176 102 178 122 175 138 C165 145 148 146 142 140 Z"
                    fill={getFill("chest")}
                    stroke="#1E1E1E"
                    strokeWidth="1.5"
                  />
                </g>

                {/* 3. Biceps */}
                <g
                  className="cursor-pointer transition-all duration-150 hover:brightness-125"
                  onMouseEnter={() => setHoveredMuscle(heatmapData.biceps)}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  onClick={() => handleMuscleClick("biceps")}
                >
                  {/* Left Bicep */}
                  <path
                    d="M86 145 C80 152 76 168 76 182 C82 184 88 182 92 175 C95 165 92 152 86 145 Z"
                    fill={getFill("biceps")}
                    stroke="#1E1E1E"
                    strokeWidth="1.5"
                  />
                  {/* Right Bicep */}
                  <path
                    d="M194 145 C200 152 204 168 204 182 C198 184 192 182 188 175 C185 165 188 152 194 145 Z"
                    fill={getFill("biceps")}
                    stroke="#1E1E1E"
                    strokeWidth="1.5"
                  />
                </g>

                {/* 4. Forearms (Front) */}
                <g
                  className="cursor-pointer transition-all duration-150 hover:brightness-125"
                  onMouseEnter={() => setHoveredMuscle(heatmapData.forearms)}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  onClick={() => handleMuscleClick("forearms")}
                >
                  {/* Left Forearm */}
                  <path
                    d="M74 186 C68 195 62 215 58 230 L68 232 C74 218 82 200 86 186 Z"
                    fill={getFill("forearms")}
                    stroke="#1E1E1E"
                    strokeWidth="1.5"
                  />
                  {/* Right Forearm */}
                  <path
                    d="M206 186 C212 195 218 215 222 230 L212 232 C206 218 198 200 194 186 Z"
                    fill={getFill("forearms")}
                    stroke="#1E1E1E"
                    strokeWidth="1.5"
                  />
                </g>

                {/* 5. Abs (Rectus Abdominis) */}
                <g
                  className="cursor-pointer transition-all duration-150 hover:brightness-125"
                  onMouseEnter={() => setHoveredMuscle(heatmapData.abs)}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  onClick={() => handleMuscleClick("abs")}
                >
                  {/* Upper Abs */}
                  <path
                    d="M128 148 H138 V165 H128 Z M142 148 H152 V165 H142 Z"
                    fill={getFill("abs")}
                    stroke="#1E1E1E"
                    strokeWidth="1.2"
                  />
                  {/* Mid Abs */}
                  <path
                    d="M128 168 H138 V186 H128 Z M142 168 H152 V186 H142 Z"
                    fill={getFill("abs")}
                    stroke="#1E1E1E"
                    strokeWidth="1.2"
                  />
                  {/* Lower Abs */}
                  <path
                    d="M129 189 H138 V212 L132 216 Z M142 189 H151 L148 216 L142 212 Z"
                    fill={getFill("abs")}
                    stroke="#1E1E1E"
                    strokeWidth="1.2"
                  />
                </g>

                {/* 6. Obliques */}
                <g
                  className="cursor-pointer transition-all duration-150 hover:brightness-125"
                  onMouseEnter={() => setHoveredMuscle(heatmapData.obliques)}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  onClick={() => handleMuscleClick("obliques")}
                >
                  {/* Left Obliques */}
                  <path
                    d="M110 148 C108 165 110 190 114 212 L125 212 C122 190 122 165 125 148 Z"
                    fill={getFill("obliques")}
                    stroke="#1E1E1E"
                    strokeWidth="1.5"
                  />
                  {/* Right Obliques */}
                  <path
                    d="M170 148 C172 165 170 190 166 212 L155 212 C158 190 158 165 155 148 Z"
                    fill={getFill("obliques")}
                    stroke="#1E1E1E"
                    strokeWidth="1.5"
                  />
                </g>

                {/* 7. Quadriceps */}
                <g
                  className="cursor-pointer transition-all duration-150 hover:brightness-125"
                  onMouseEnter={() => setHoveredMuscle(heatmapData.quadriceps)}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  onClick={() => handleMuscleClick("quadriceps")}
                >
                  {/* Left Quad */}
                  <path
                    d="M106 230 C102 260 102 285 108 316 C114 318 126 318 134 314 C136 280 136 250 134 230 Z"
                    fill={getFill("quadriceps")}
                    stroke="#1E1E1E"
                    strokeWidth="1.5"
                  />
                  {/* Right Quad */}
                  <path
                    d="M174 230 C178 260 178 285 172 316 C166 318 154 318 146 314 C144 280 144 250 146 230 Z"
                    fill={getFill("quadriceps")}
                    stroke="#1E1E1E"
                    strokeWidth="1.5"
                  />
                </g>

                {/* 8. Calves (Front Tibialis / Anterior) */}
                <g
                  className="cursor-pointer transition-all duration-150 hover:brightness-125"
                  onMouseEnter={() => setHoveredMuscle(heatmapData.calves)}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  onClick={() => handleMuscleClick("calves")}
                >
                  {/* Left Anterior Calf */}
                  <path
                    d="M109 330 C106 350 108 375 112 396 C116 398 124 398 127 394 C129 375 128 350 126 330 Z"
                    fill={getFill("calves")}
                    stroke="#1E1E1E"
                    strokeWidth="1.5"
                  />
                  {/* Right Anterior Calf */}
                  <path
                    d="M171 330 C174 350 172 375 168 396 C164 398 156 398 153 394 C151 375 152 350 154 330 Z"
                    fill={getFill("calves")}
                    stroke="#1E1E1E"
                    strokeWidth="1.5"
                  />
                </g>
              </svg>
            </div>
          </div>
        )}

        {/* 2. BACK VIEW SVG */}
        {(viewMode === "both" || viewMode === "back") && (
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-mono uppercase tracking-widest text-dark font-black mb-2">
              Posterior (Back View)
            </span>
            <div className="w-56 sm:w-64 md:w-72 h-[420px] relative">
              <svg
                viewBox="0 0 280 440"
                className="w-full h-full drop-shadow-sm"
              >
                {/* Body Background Silhouette / Contours */}
                <g fill="none" stroke="#171B16" strokeWidth="1.5">
                  {/* Head & Neck from Back */}
                  <ellipse cx="140" cy="35" rx="18" ry="24" stroke="#171B16" strokeWidth="2" />
                  <path d="M132 58 L128 75 M148 58 L152 75" />
                  {/* Outer body contour */}
                  <path d="M105 85 L85 105 L65 170 L55 230 L70 232 L85 180 L95 190 L95 240 L105 320 L108 400 L125 405 L135 320 L140 250 L145 320 L155 405 L172 400 L175 320 L185 240 L185 190 L195 180 L210 232 L225 230 L215 170 L195 105 L175 85 Z" />
                </g>

                {/* --- MUSCLE GROUPS (BACK) --- */}

                {/* 1. Upper Back (Trapezius & Rhomboids) */}
                <g
                  className="cursor-pointer transition-all duration-150 hover:brightness-125"
                  onMouseEnter={() => setHoveredMuscle(heatmapData.upper_back)}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  onClick={() => handleMuscleClick("upper_back")}
                >
                  <path
                    d="M140 75 L160 85 L168 115 L140 148 L112 115 L120 85 Z"
                    fill={getFill("upper_back")}
                    stroke="#1E1E1E"
                    strokeWidth="1.5"
                  />
                </g>

                {/* 2. Rear Shoulders (Posterior Deltoids) */}
                <g
                  className="cursor-pointer transition-all duration-150 hover:brightness-125"
                  onMouseEnter={() => setHoveredMuscle(heatmapData.rear_delts)}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  onClick={() => handleMuscleClick("rear_delts")}
                >
                  {/* Left Rear Delt */}
                  <path
                    d="M104 88 C94 92 82 102 80 118 C83 130 92 138 98 135 C104 125 106 108 108 96 Z"
                    fill={getFill("rear_delts")}
                    stroke="#1E1E1E"
                    strokeWidth="1.5"
                  />
                  {/* Right Rear Delt */}
                  <path
                    d="M176 88 C186 92 198 102 200 118 C197 130 188 138 182 135 C176 125 174 108 172 96 Z"
                    fill={getFill("rear_delts")}
                    stroke="#1E1E1E"
                    strokeWidth="1.5"
                  />
                </g>

                {/* 3. Triceps */}
                <g
                  className="cursor-pointer transition-all duration-150 hover:brightness-125"
                  onMouseEnter={() => setHoveredMuscle(heatmapData.triceps)}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  onClick={() => handleMuscleClick("triceps")}
                >
                  {/* Left Tricep */}
                  <path
                    d="M84 140 C78 150 74 166 74 180 C80 182 86 180 90 174 C93 162 90 150 84 140 Z"
                    fill={getFill("triceps")}
                    stroke="#1E1E1E"
                    strokeWidth="1.5"
                  />
                  {/* Right Tricep */}
                  <path
                    d="M196 140 C202 150 206 166 206 180 C200 182 194 180 190 174 C187 162 190 150 196 140 Z"
                    fill={getFill("triceps")}
                    stroke="#1E1E1E"
                    strokeWidth="1.5"
                  />
                </g>

                {/* 4. Lats (Latissimus Dorsi) */}
                <g
                  className="cursor-pointer transition-all duration-150 hover:brightness-125"
                  onMouseEnter={() => setHoveredMuscle(heatmapData.lats)}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  onClick={() => handleMuscleClick("lats")}
                >
                  {/* Left Lat Wing */}
                  <path
                    d="M112 120 C105 135 106 160 114 180 L132 175 L138 148 Z"
                    fill={getFill("lats")}
                    stroke="#1E1E1E"
                    strokeWidth="1.5"
                  />
                  {/* Right Lat Wing */}
                  <path
                    d="M168 120 C175 135 174 160 166 180 L148 175 L142 148 Z"
                    fill={getFill("lats")}
                    stroke="#1E1E1E"
                    strokeWidth="1.5"
                  />
                </g>

                {/* 5. Lower Back (Erector Spinae) */}
                <g
                  className="cursor-pointer transition-all duration-150 hover:brightness-125"
                  onMouseEnter={() => setHoveredMuscle(heatmapData.lower_back)}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  onClick={() => handleMuscleClick("lower_back")}
                >
                  <path
                    d="M132 178 H148 L152 216 H128 Z"
                    fill={getFill("lower_back")}
                    stroke="#1E1E1E"
                    strokeWidth="1.5"
                  />
                </g>

                {/* 6. Forearms (Back) */}
                <g
                  className="cursor-pointer transition-all duration-150 hover:brightness-125"
                  onMouseEnter={() => setHoveredMuscle(heatmapData.forearms)}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  onClick={() => handleMuscleClick("forearms")}
                >
                  {/* Left Posterior Forearm */}
                  <path
                    d="M74 186 C68 195 62 215 58 230 L68 232 C74 218 82 200 86 186 Z"
                    fill={getFill("forearms")}
                    stroke="#1E1E1E"
                    strokeWidth="1.5"
                  />
                  {/* Right Posterior Forearm */}
                  <path
                    d="M206 186 C212 195 218 215 222 230 L212 232 C206 218 198 200 194 186 Z"
                    fill={getFill("forearms")}
                    stroke="#1E1E1E"
                    strokeWidth="1.5"
                  />
                </g>

                {/* 7. Glutes (Gluteus Maximus) */}
                <g
                  className="cursor-pointer transition-all duration-150 hover:brightness-125"
                  onMouseEnter={() => setHoveredMuscle(heatmapData.glutes)}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  onClick={() => handleMuscleClick("glutes")}
                >
                  {/* Left Glute */}
                  <path
                    d="M106 218 C104 235 106 255 114 266 C124 268 135 264 139 252 L138 218 Z"
                    fill={getFill("glutes")}
                    stroke="#1E1E1E"
                    strokeWidth="1.5"
                  />
                  {/* Right Glute */}
                  <path
                    d="M174 218 C176 235 174 255 166 266 C156 268 145 264 141 252 L142 218 Z"
                    fill={getFill("glutes")}
                    stroke="#1E1E1E"
                    strokeWidth="1.5"
                  />
                </g>

                {/* 8. Hamstrings */}
                <g
                  className="cursor-pointer transition-all duration-150 hover:brightness-125"
                  onMouseEnter={() => setHoveredMuscle(heatmapData.hamstrings)}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  onClick={() => handleMuscleClick("hamstrings")}
                >
                  {/* Left Hamstring */}
                  <path
                    d="M112 270 C108 285 108 305 110 320 C118 322 128 322 134 318 C136 295 135 280 134 270 Z"
                    fill={getFill("hamstrings")}
                    stroke="#1E1E1E"
                    strokeWidth="1.5"
                  />
                  {/* Right Hamstring */}
                  <path
                    d="M168 270 C172 285 172 305 170 320 C162 322 152 322 146 318 C144 295 145 280 146 270 Z"
                    fill={getFill("hamstrings")}
                    stroke="#1E1E1E"
                    strokeWidth="1.5"
                  />
                </g>

                {/* 9. Calves (Gastrocnemius & Soleus) */}
                <g
                  className="cursor-pointer transition-all duration-150 hover:brightness-125"
                  onMouseEnter={() => setHoveredMuscle(heatmapData.calves)}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  onClick={() => handleMuscleClick("calves")}
                >
                  {/* Left Posterior Calf */}
                  <path
                    d="M108 326 C104 345 106 370 110 395 C116 398 125 398 128 394 C132 370 130 345 128 326 Z"
                    fill={getFill("calves")}
                    stroke="#1E1E1E"
                    strokeWidth="1.5"
                  />
                  {/* Right Posterior Calf */}
                  <path
                    d="M172 326 C176 345 174 370 170 395 C164 398 155 398 152 394 C148 370 150 345 152 326 Z"
                    fill={getFill("calves")}
                    stroke="#1E1E1E"
                    strokeWidth="1.5"
                  />
                </g>
              </svg>
            </div>
          </div>
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

      {/* Detailed Muscle Analytics Drawer / Modal */}
      {selectedMuscle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-cream border-3 border-dark rounded-xl shadow-neo-lg p-6 w-full max-w-lg space-y-5 relative font-sans">
            <div className="flex items-start justify-between gap-3 border-b-2 border-dark/15 pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="w-3 h-3 rounded-full border-2 border-dark"
                    style={{ backgroundColor: selectedMuscle.color }}
                  />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-forest font-black">
                    Target Muscle Group
                  </span>
                </div>
                <h3 className="font-heading font-black text-2xl text-dark tracking-tight">
                  {selectedMuscle.name}
                </h3>
                <span className="text-xs text-dark/70 font-mono italic font-bold">
                  {selectedMuscle.anatomicalName}
                </span>
              </div>

              <button
                onClick={() => setSelectedMuscle(null)}
                className="p-1.5 rounded-lg border-2 border-dark bg-white hover:bg-forest hover:text-cream text-dark transition-all cursor-pointer shadow-neo-sm"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Coverage Stats Grid */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-white border-2 border-dark shadow-neo-sm">
                <span className="text-[10px] font-mono uppercase font-black text-dark/60 block">
                  Coverage
                </span>
                <span
                  className="font-heading font-black text-2xl"
                  style={{ color: "#183D2A" }}
                >
                  {selectedMuscle.coveragePercentage}%
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white border-2 border-dark shadow-neo-sm">
                <span className="text-[10px] font-mono uppercase font-black text-dark/60 block">
                  Completed Sets
                </span>
                <span className="font-mono text-xl font-black text-dark">
                  {selectedMuscle.completedWorkingSets}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white border-2 border-dark shadow-neo-sm">
                <span className="text-[10px] font-mono uppercase font-black text-dark/60 block">
                  Target Sets
                </span>
                <span className="font-mono text-xl font-black text-orange">
                  {selectedMuscle.targetWorkingSets}
                </span>
              </div>
            </div>

            {/* Contributing Exercises Table */}
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase font-black tracking-wider text-dark/70 block">
                Recorded Exercise Contributions
              </span>

              {selectedMuscle.contributingExercises.length === 0 ? (
                <div className="p-4 rounded-xl bg-white border-2 border-dashed border-dark/30 text-center text-xs text-dark/60 font-mono italic">
                  No completed exercises targeting this muscle group in the selected {selectedDays} days timeframe.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {selectedMuscle.contributingExercises.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-white border-2 border-dark shadow-neo-sm flex items-center justify-between text-xs font-mono"
                    >
                      <div className="flex items-center gap-2">
                        <Dumbbell className="w-3.5 h-3.5 text-forest" />
                        <span className="font-bold text-dark">{item.exerciseName}</span>
                      </div>
                      <div className="flex items-center gap-3 text-dark/80 font-bold">
                        <span>{item.setsCount} sets</span>
                        <span className="text-dark/60">
                          {Math.round(item.volume).toLocaleString()} kg vol
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Target Sets Customizer */}
            <div className="p-3.5 rounded-xl bg-white border-2 border-dark shadow-neo-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-heading font-black text-dark">WEEKLY SET TARGET</div>
                <span className="text-[10px] text-dark/60 font-mono font-bold">
                  Prescribed weekly working sets for {selectedMuscle.name}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={1}
                  max={40}
                  value={
                    customTargets[selectedMuscle.muscleId] ||
                    MUSCLE_REGISTRY[selectedMuscle.muscleId].defaultWeeklyTarget
                  }
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val > 0) {
                      setCustomTargets((prev) => ({
                        ...prev,
                        [selectedMuscle.muscleId]: val,
                      }));
                    }
                  }}
                  className="w-14 px-2 py-1 rounded bg-cream border-2 border-dark text-dark text-xs font-mono font-black text-center shadow-neo-sm"
                />
                <span className="text-xs font-mono font-bold text-dark/70">sets/wk</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedMuscle(null)}
              className="w-full py-2.5 rounded-lg bg-lime hover:bg-lime/90 text-dark text-xs font-mono uppercase font-black tracking-wider border-2 border-dark shadow-neo transition-all active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
