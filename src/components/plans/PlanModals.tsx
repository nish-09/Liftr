import Link from "next/link";
import { X } from "lucide-react";
import { Exercise } from "@/types";
import { PastelCard } from "@/components/ui/DesignSystem";

interface NewPlanModalProps {
  isOpen: boolean;
  name: string;
  phase: string;
  description: string;
  phases: string[];
  onNameChange: (val: string) => void;
  onPhaseChange: (val: string) => void;
  onDescriptionChange: (val: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function NewPlanModal({
  isOpen,
  name,
  phase,
  description,
  phases,
  onNameChange,
  onPhaseChange,
  onDescriptionChange,
  onClose,
  onSubmit,
}: NewPlanModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 !m-0 z-50 flex items-center justify-center p-4 bg-[#142746]/50 backdrop-blur-sm overflow-y-auto w-full h-full min-h-[100dvh]">
      <PastelCard tone="white" className="p-5 sm:p-6 w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto my-auto shadow-neo-xl">
        <div className="flex items-center justify-between mb-4 border-b border-[#142746]/15 pb-3">
          <h3 className="font-heading font-extrabold text-xl text-[#142746]">
            Create New Workout Plan
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl border-[1.5px] border-[#142746] bg-[#FAF9FD] hover:bg-[#EBCBF7] text-[#142746] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#142746] mb-1.5">Plan Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="e.g., 4-Day Upper / Lower Wave"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border-[1.5px] border-[#142746] text-[#142746] text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#142746] mb-1.5">
              Training Phase
            </label>
            <select
              value={phase}
              onChange={(e) => onPhaseChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border-[1.5px] border-[#142746] text-[#142746] text-xs font-bold cursor-pointer focus:outline-none"
            >
              {phases.map((ph) => (
                <option key={ph} value={ph}>
                  {ph}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#142746] mb-1.5">
              Description / Goals
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Focus on compound strength and deload every 6th week..."
              className="w-full px-3.5 py-2 rounded-xl bg-white border-[1.5px] border-[#142746] text-[#142746] text-sm resize-none focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#142746]/15">
            <button
              type="button"
              onClick={onClose}
              className="neo-btn px-4 py-2 rounded-xl bg-white text-[#142746] text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="neo-btn px-5 py-2 rounded-xl bg-[#142746] text-white text-xs font-bold cursor-pointer"
            >
              Create Plan
            </button>
          </div>
        </form>
      </PastelCard>
    </div>
  );
}

interface AddPlanExerciseModalProps {
  isOpen: boolean;
  exercises: Exercise[];
  selectedExerciseId: string;
  onSelectExercise: (id: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function AddPlanExerciseModal({
  isOpen,
  exercises,
  selectedExerciseId,
  onSelectExercise,
  onClose,
  onSubmit,
}: AddPlanExerciseModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 !m-0 z-50 flex items-center justify-center p-4 bg-[#142746]/50 backdrop-blur-sm overflow-y-auto w-full h-full min-h-[100dvh]">
      <PastelCard tone="white" className="p-5 sm:p-6 w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto my-auto shadow-neo-xl">
        <div className="flex items-center justify-between mb-4 border-b border-[#142746]/15 pb-3">
          <h3 className="font-heading font-extrabold text-xl text-[#142746]">
            Select Movement to Add
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl border-[1.5px] border-[#142746] bg-[#FAF9FD] hover:bg-[#EBCBF7] text-[#142746] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {exercises.length === 0 ? (
            <div className="p-4 rounded-xl bg-[#FAF9FD] border-[1.5px] border-[#142746] text-center space-y-2">
              <p className="text-xs text-[#8993A5]">
                No exercises found in your library. Add exercises in the Exercise Library first.
              </p>
              <Link
                href="/exercises"
                className="neo-btn inline-block px-3 py-1.5 rounded-lg bg-[#E9FF91] text-[#142746] text-xs font-bold"
              >
                Go to Exercise Library →
              </Link>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-[#142746] mb-1.5">
                Choose from Library
              </label>
              <select
                value={selectedExerciseId}
                onChange={(e) => onSelectExercise(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border-[1.5px] border-[#142746] text-[#142746] text-xs font-bold cursor-pointer focus:outline-none"
              >
                {exercises.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name} ({ex.primaryMuscleGroup}{ex.targetMusclePart ? ` • ${ex.targetMusclePart}` : ""} • {ex.equipment})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-[#142746]/15">
            <button
              type="button"
              onClick={onClose}
              className="neo-btn px-4 py-2 rounded-xl bg-white text-[#142746] text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={exercises.length === 0}
              className="neo-btn px-5 py-2 rounded-xl bg-[#142746] text-white text-xs font-bold disabled:opacity-40 cursor-pointer"
            >
              Add Movement
            </button>
          </div>
        </form>
      </PastelCard>
    </div>
  );
}
