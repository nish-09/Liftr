import { Dumbbell, X } from "lucide-react";
import {
  MuscleCoverageData,
  MuscleId,
  MUSCLE_REGISTRY,
} from "@/lib/calculations/muscleHeatmap";
import { PastelCard } from "@/components/ui/DesignSystem";

interface MuscleDetailModalProps {
  muscle: MuscleCoverageData;
  selectedDays: number;
  customTargetValue?: number;
  onUpdateTarget: (muscleId: MuscleId, target: number) => void;
  onClose: () => void;
}

export function MuscleDetailModal({
  muscle,
  selectedDays,
  customTargetValue,
  onUpdateTarget,
  onClose,
}: MuscleDetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#142746]/50 backdrop-blur-sm overflow-y-auto">
      <PastelCard tone="white" className="p-5 sm:p-6 w-full max-w-lg max-h-[calc(100dvh-2rem)] overflow-y-auto my-auto space-y-5 shadow-neo-xl">
        <div className="flex items-start justify-between gap-3 border-b border-[#142746]/15 pb-3">
          <div className="flex items-center gap-2.5">
            <span
              className="w-3.5 h-3.5 rounded-full border border-[#142746] shrink-0"
              style={{ backgroundColor: muscle.color }}
            />
            <div>
              <h3 className="font-heading font-extrabold text-xl text-[#142746]">
                {muscle.name}
              </h3>
              <span className="text-xs text-[#8993A5] font-medium">{muscle.anatomicalName}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl border-[1.5px] border-[#142746] bg-[#FAF9FD] hover:bg-[#EBCBF7] text-[#142746] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 min-[360px]:grid-cols-3 gap-2.5 sm:gap-3 text-center">
          <div className="p-3 rounded-2xl bg-[#EBCBF7]/60 border-[1.5px] border-[#142746]">
            <span className="text-[10px] uppercase font-bold text-[#142746]/70 block">
              Coverage
            </span>
            <span className="font-extrabold text-2xl stat-number text-[#142746]">
              {muscle.coveragePercentage}%
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-[#BDF7B6]/60 border-[1.5px] border-[#142746]">
            <span className="text-[10px] uppercase font-bold text-[#142746]/70 block">
              Completed Sets
            </span>
            <span className="font-extrabold text-xl stat-number text-[#142746]">
              {muscle.completedWorkingSets}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-[#F2FA91]/70 border-[1.5px] border-[#142746]">
            <span className="text-[10px] uppercase font-bold text-[#142746]/70 block">
              Target Sets
            </span>
            <span className="font-extrabold text-xl stat-number text-[#142746]">
              {muscle.targetWorkingSets}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase font-bold tracking-wider text-[#8993A5] block">
            Recorded Exercise Contributions
          </span>

          {muscle.contributingExercises.length === 0 ? (
            <div className="p-4 rounded-xl bg-[#FAF9FD] border border-dashed border-[#142746]/30 text-center text-xs text-[#8993A5]">
              No completed exercises targeting this muscle group in the selected {selectedDays} days timeframe.
            </div>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {muscle.contributingExercises.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-[#FAF9FD] border border-[#142746]/25 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Dumbbell className="w-3.5 h-3.5 text-[#142746]" />
                    <span className="font-bold text-[#142746]">{item.exerciseName}</span>
                  </div>
                  <div className="flex items-center gap-3 font-semibold text-[#142746]">
                    <span>{item.setsCount} sets</span>
                    <span className="text-[#8993A5]">
                      {Math.round(item.volume).toLocaleString()} kg
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-3.5 rounded-2xl bg-[#FAF9FD] border-[1.5px] border-[#142746] flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-heading font-extrabold text-[#142746]">
              Weekly Set Target
            </div>
            <span className="text-[11px] text-[#8993A5]">
              Prescribed working sets for {muscle.name}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={1}
              max={40}
              value={customTargetValue || MUSCLE_REGISTRY[muscle.muscleId].defaultWeeklyTarget}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val > 0) {
                  onUpdateTarget(muscle.muscleId, val);
                }
              }}
              className="w-14 px-2 py-1 rounded-lg bg-white border-[1.5px] border-[#142746] text-[#142746] text-xs font-bold text-center"
            />
            <span className="text-xs font-semibold text-[#8993A5]">sets/wk</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="neo-btn w-full py-2.5 rounded-xl bg-[#142746] text-white text-xs font-heading font-bold cursor-pointer"
        >
          Close Details
        </button>
      </PastelCard>
    </div>
  );
}
