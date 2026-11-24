import { ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { Exercise, PlanExerciseItem } from "@/types";

interface PlanExerciseRowProps {
  planId: string;
  dayId: string;
  planExercise: PlanExerciseItem;
  index: number;
  totalExercises: number;
  exerciseMeta?: Exercise;
  onMove: (planId: string, dayId: string, planExerciseId: string, direction: "up" | "down") => void;
  onRemove: (planId: string, dayId: string, planExerciseId: string) => void;
  onUpdate: (
    planId: string,
    dayId: string,
    planExerciseId: string,
    updates: Partial<PlanExerciseItem>
  ) => void;
}

export function PlanExerciseRow({
  planId,
  dayId,
  planExercise: pe,
  index,
  totalExercises,
  exerciseMeta,
  onMove,
  onRemove,
  onUpdate,
}: PlanExerciseRowProps) {
  return (
    <div className="p-3.5 rounded-xl bg-[#F5F1E8] border-2 border-[#171717] shadow-neo-sm space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-md bg-[#3155F5] text-white border-2 border-[#171717] font-mono text-xs flex items-center justify-center font-black shadow-neo-sm">
            {index + 1}
          </span>
          <div>
            <h4 className="font-heading font-black text-sm text-[#171717] leading-tight uppercase">
              {exerciseMeta?.name || "Exercise"}
            </h4>
            <span className="text-[10px] font-mono uppercase font-bold text-[#171717]/60">
              {exerciseMeta?.primaryMuscleGroup} • {exerciseMeta?.equipment}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onMove(planId, dayId, pe.id, "up")}
            disabled={index === 0}
            className="p-1 rounded border-2 border-[#171717] bg-white hover:bg-[#E9F56A] text-[#171717] disabled:opacity-30 cursor-pointer shadow-neo-sm"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onMove(planId, dayId, pe.id, "down")}
            disabled={index === totalExercises - 1}
            className="p-1 rounded border-2 border-[#171717] bg-white hover:bg-[#E9F56A] text-[#171717] disabled:opacity-30 cursor-pointer shadow-neo-sm"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onRemove(planId, dayId, pe.id)}
            className="p-1 rounded border-2 border-[#171717] bg-[#FF7043] text-white hover:bg-[#e85d30] ml-1 cursor-pointer shadow-neo-sm"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t-2 border-[#171717]/10 text-xs">
        <div>
          <label className="text-[10px] font-mono uppercase font-bold text-[#171717]/70 block mb-1">
            Target Sets
          </label>
          <input
            type="number"
            min={1}
            max={15}
            value={pe.targetSets}
            onChange={(e) =>
              onUpdate(planId, dayId, pe.id, { targetSets: Number(e.target.value) })
            }
            className="w-full px-2.5 py-1.5 rounded-lg bg-white border-2 border-[#171717] text-[#171717] font-mono font-bold text-xs focus:outline-none focus:ring-2 focus:ring-[#3155F5] shadow-neo-sm"
          />
        </div>

        <div>
          <label className="text-[10px] font-mono uppercase font-bold text-[#171717]/70 block mb-1">
            Rep Range
          </label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={1}
              max={50}
              value={pe.minReps}
              onChange={(e) =>
                onUpdate(planId, dayId, pe.id, { minReps: Number(e.target.value) })
              }
              className="w-full px-2 py-1.5 rounded-lg bg-white border-2 border-[#171717] text-[#171717] font-mono font-bold text-xs text-center focus:outline-none focus:ring-2 focus:ring-[#3155F5] shadow-neo-sm"
            />
            <span className="font-bold text-[#171717]">-</span>
            <input
              type="number"
              min={1}
              max={50}
              value={pe.maxReps}
              onChange={(e) =>
                onUpdate(planId, dayId, pe.id, { maxReps: Number(e.target.value) })
              }
              className="w-full px-2 py-1.5 rounded-lg bg-white border-2 border-[#171717] text-[#171717] font-mono font-bold text-xs text-center focus:outline-none focus:ring-2 focus:ring-[#3155F5] shadow-neo-sm"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-mono uppercase font-bold text-[#171717]/70 block mb-1">
            Start Weight (kg)
          </label>
          <input
            type="number"
            min={0}
            step={0.5}
            value={pe.defaultWeight}
            onChange={(e) =>
              onUpdate(planId, dayId, pe.id, { defaultWeight: Number(e.target.value) })
            }
            className="w-full px-2.5 py-1.5 rounded-lg bg-white border-2 border-[#171717] text-[#171717] font-mono font-bold text-xs focus:outline-none focus:ring-2 focus:ring-[#3155F5] shadow-neo-sm"
          />
        </div>

        <div>
          <label className="text-[10px] font-mono uppercase font-bold text-[#171717]/70 block mb-1">
            Rest (sec)
          </label>
          <input
            type="number"
            min={15}
            step={15}
            value={pe.restDuration}
            onChange={(e) =>
              onUpdate(planId, dayId, pe.id, { restDuration: Number(e.target.value) })
            }
            className="w-full px-2.5 py-1.5 rounded-lg bg-white border-2 border-[#171717] text-[#171717] font-mono font-bold text-xs focus:outline-none focus:ring-2 focus:ring-[#3155F5] shadow-neo-sm"
          />
        </div>

        <div>
          <label className="text-[10px] font-mono uppercase font-bold text-[#171717]/70 block mb-1">
            Step (+kg)
          </label>
          <input
            type="number"
            min={0.5}
            step={0.5}
            value={pe.progressionIncrement}
            onChange={(e) =>
              onUpdate(planId, dayId, pe.id, {
                progressionIncrement: Number(e.target.value),
              })
            }
            className="w-full px-2.5 py-1.5 rounded-lg bg-white border-2 border-[#171717] text-[#171717] font-mono font-bold text-xs focus:outline-none focus:ring-2 focus:ring-[#3155F5] shadow-neo-sm"
          />
        </div>
      </div>
    </div>
  );
}
