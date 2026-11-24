import { Dumbbell, X } from "lucide-react";
import {
  MuscleCoverageData,
  MuscleId,
  MUSCLE_REGISTRY,
} from "@/lib/calculations/muscleHeatmap";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-cream border-2 border-dark rounded-xl shadow-neo-lg p-6 w-full max-w-lg space-y-5 relative font-sans">
        <div className="flex items-start justify-between gap-3 border-b-2 border-dark/15 pb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="w-3 h-3 rounded-full border-2 border-dark"
                style={{ backgroundColor: muscle.color }}
              />
              <span className="text-[10px] font-mono uppercase tracking-widest text-forest font-black">
                Target Muscle Group
              </span>
            </div>
            <h3 className="font-heading font-black text-2xl text-dark tracking-tight">
              {muscle.name}
            </h3>
            <span className="text-xs text-dark/70 font-mono italic font-bold">
              {muscle.anatomicalName}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border-2 border-dark bg-white hover:bg-forest hover:text-cream text-dark transition-all cursor-pointer shadow-neo-sm"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-xl bg-white border-2 border-dark shadow-neo-sm">
            <span className="text-[10px] font-mono uppercase font-black text-dark/60 block">
              Coverage
            </span>
            <span className="font-heading font-black text-2xl text-forest">
              {muscle.coveragePercentage}%
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white border-2 border-dark shadow-neo-sm">
            <span className="text-[10px] font-mono uppercase font-black text-dark/60 block">
              Completed Sets
            </span>
            <span className="font-mono text-xl font-black text-dark">
              {muscle.completedWorkingSets}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white border-2 border-dark shadow-neo-sm">
            <span className="text-[10px] font-mono uppercase font-black text-dark/60 block">
              Target Sets
            </span>
            <span className="font-mono text-xl font-black text-orange">
              {muscle.targetWorkingSets}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono uppercase font-black tracking-wider text-dark/70 block">
            Recorded Exercise Contributions
          </span>

          {muscle.contributingExercises.length === 0 ? (
            <div className="p-4 rounded-xl bg-white border-2 border-dashed border-dark/30 text-center text-xs text-dark/60 font-mono italic">
              No completed exercises targeting this muscle group in the selected {selectedDays} days timeframe.
            </div>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {muscle.contributingExercises.map((item, idx) => (
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

        <div className="p-3.5 rounded-xl bg-white border-2 border-dark shadow-neo-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-heading font-black text-dark">WEEKLY SET TARGET</div>
            <span className="text-[10px] text-dark/60 font-mono font-bold">
              Prescribed weekly working sets for {muscle.name}
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
              className="w-14 px-2 py-1 rounded bg-cream border-2 border-dark text-dark text-xs font-mono font-black text-center shadow-neo-sm"
            />
            <span className="text-xs font-mono font-bold text-dark/70">sets/wk</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-lg bg-lime hover:bg-lime/90 text-dark text-xs font-mono uppercase font-black tracking-wider border-2 border-dark shadow-neo transition-all active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
        >
          Close Details
        </button>
      </div>
    </div>
  );
}
