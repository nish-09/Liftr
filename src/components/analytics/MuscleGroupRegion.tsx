import React from "react";
import { MuscleCoverageData, MuscleId } from "@/lib/calculations/muscleHeatmap";

interface MuscleGroupRegionProps {
  muscleId: MuscleId;
  heatmapData: Record<MuscleId, MuscleCoverageData>;
  onHover: (data: MuscleCoverageData | null) => void;
  onSelect: (muscleId: MuscleId) => void;
  children: React.ReactNode;
}

export function MuscleGroupRegion({
  muscleId,
  heatmapData,
  onHover,
  onSelect,
  children,
}: MuscleGroupRegionProps) {
  return (
    <g
      className="cursor-pointer transition-all duration-150 hover:brightness-125"
      onMouseEnter={() => onHover(heatmapData[muscleId])}
      onMouseLeave={() => onHover(null)}
      onClick={() => onSelect(muscleId)}
    >
      {children}
    </g>
  );
}
