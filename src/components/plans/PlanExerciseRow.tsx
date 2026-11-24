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
    <div className="p-4 rounded-2xl bg-[#FAF9FD] border-[1.5px] border-[#142746] space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-7 h-7 rounded-xl bg-[#E9FF91] text-[#142746] border-[1.5px] border-[#142746] text-xs flex items-center justify-center font-extrabold shrink-0">
            {index + 1}
          </span>
          <div className="min-w-0">
            <h4 className="font-heading font-extrabold text-sm text-[#142746] truncate">
              {exerciseMeta?.name || "Exercise"}
            </h4>
            <span className="text-[11px] font-medium capitalize text-[#8993A5]">
              {exerciseMeta?.primaryMuscleGroup?.replace("_", " ")} •{" "}
              {exerciseMeta?.equipment?.replace("_", " ")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onMove(planId, dayId, pe.id, "up")}
            disabled={index === 0}
            aria-label="Move Up"
            className="min-w-[38px] min-h-[38px] flex items-center justify-center rounded-lg border-[1.5px] border-[#142746] bg-white hover:bg-[#E9FF91] text-[#142746] disabled:opacity-30 cursor-pointer"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onMove(planId, dayId, pe.id, "down")}
            disabled={index === totalExercises - 1}
            aria-label="Move Down"
            className="min-w-[38px] min-h-[38px] flex items-center justify-center rounded-lg border-[1.5px] border-[#142746] bg-white hover:bg-[#E9FF91] text-[#142746] disabled:opacity-30 cursor-pointer"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onRemove(planId, dayId, pe.id)}
            aria-label="Remove Exercise"
            className="min-w-[38px] min-h-[38px] flex items-center justify-center rounded-lg border-[1.5px] border-[#142746] bg-[#F8C3B5] text-[#142746] ml-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2.5 pt-2.5 border-t border-[#142746]/10 text-xs">
        <div>
          <label className="text-[10px] font-bold uppercase text-[#8993A5] block mb-1">
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
            className="w-full px-2.5 py-1.5 rounded-xl bg-white border-[1.5px] border-[#142746] text-[#142746] font-bold text-xs focus:outline-none"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase text-[#8993A5] block mb-1">
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
              className="w-full px-2 py-1.5 rounded-xl bg-white border-[1.5px] border-[#142746] text-[#142746] font-bold text-xs text-center focus:outline-none"
            />
            <span className="font-bold text-[#142746]">-</span>
            <input
              type="number"
              min={1}
              max={50}
              value={pe.maxReps}
              onChange={(e) =>
                onUpdate(planId, dayId, pe.id, { maxReps: Number(e.target.value) })
              }
              className="w-full px-2 py-1.5 rounded-xl bg-white border-[1.5px] border-[#142746] text-[#142746] font-bold text-xs text-center focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase text-[#8993A5] block mb-1">
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
            className="w-full px-2.5 py-1.5 rounded-xl bg-white border-[1.5px] border-[#142746] text-[#142746] font-bold text-xs focus:outline-none"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase text-[#8993A5] block mb-1">
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
            className="w-full px-2.5 py-1.5 rounded-xl bg-white border-[1.5px] border-[#142746] text-[#142746] font-bold text-xs focus:outline-none"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase text-[#8993A5] block mb-1">
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
            className="w-full px-2.5 py-1.5 rounded-xl bg-white border-[1.5px] border-[#142746] text-[#142746] font-bold text-xs focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
