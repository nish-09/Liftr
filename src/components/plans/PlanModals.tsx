import Link from "next/link";
import { X } from "lucide-react";
import { Exercise } from "@/types";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border-2 border-[#171717] rounded-xl shadow-neo-lg p-6 w-full max-w-md relative font-sans">
        <div className="flex items-center justify-between mb-4 border-b-2 border-[#171717]/15 pb-3">
          <h3 className="font-heading font-black text-xl text-[#171717] tracking-tight uppercase">
            CREATE NEW WORKOUT PLAN
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border-2 border-[#171717] bg-[#F5F1E8] hover:bg-[#3155F5] hover:text-white text-[#171717] transition-all cursor-pointer shadow-neo-sm"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase font-black text-[#171717] mb-1.5">
              Plan Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="e.g., 4-Day Upper / Lower Wave"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#F5F1E8] border-2 border-[#171717] text-[#171717] text-sm focus:outline-none focus:ring-2 focus:ring-[#3155F5] font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase font-black text-[#171717] mb-1.5">
              Training Phase
            </label>
            <select
              value={phase}
              onChange={(e) => onPhaseChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#F5F1E8] border-2 border-[#171717] text-[#171717] text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#3155F5] cursor-pointer"
            >
              {phases.map((ph) => (
                <option key={ph} value={ph}>
                  {ph}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase font-black text-[#171717] mb-1.5">
              Description / Goals
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Focus on compound strength and deload every 6th week..."
              className="w-full px-3.5 py-2 rounded-lg bg-[#F5F1E8] border-2 border-[#171717] text-[#171717] text-sm focus:outline-none focus:ring-2 focus:ring-[#3155F5] resize-none font-sans"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t-2 border-[#171717]/15">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg bg-[#F5F1E8] border-2 border-[#171717] hover:bg-white text-[#171717] text-xs font-mono font-bold uppercase transition-all shadow-neo-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-[#3155F5] hover:bg-[#2542C7] text-white text-xs font-mono uppercase font-black tracking-wider border-2 border-[#171717] shadow-neo cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5"
            >
              Create Plan
            </button>
          </div>
        </form>
      </div>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border-2 border-[#171717] rounded-xl shadow-neo-lg p-6 w-full max-w-md relative font-sans">
        <div className="flex items-center justify-between mb-4 border-b-2 border-[#171717]/15 pb-3">
          <h3 className="font-heading font-black text-xl text-[#171717] tracking-tight uppercase">
            SELECT MOVEMENT TO ADD
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border-2 border-[#171717] bg-[#F5F1E8] hover:bg-[#3155F5] hover:text-white text-[#171717] transition-all cursor-pointer shadow-neo-sm"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {exercises.length === 0 ? (
            <div className="p-4 rounded-lg bg-[#F5F1E8] border-2 border-[#171717] text-center space-y-2">
              <p className="text-xs text-[#171717]/80 font-mono">
                No exercises found in your library. Add custom exercises in the Exercise Library before adding them to routines.
              </p>
              <Link
                href="/exercises"
                className="inline-block px-3 py-1.5 rounded-md bg-[#3155F5] text-white text-xs font-mono font-bold border border-[#171717]"
              >
                Go to Exercise Library →
              </Link>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-mono uppercase font-black text-[#171717] mb-1.5">
                Choose from Library
              </label>
              <select
                value={selectedExerciseId}
                onChange={(e) => onSelectExercise(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#F5F1E8] border-2 border-[#171717] text-[#171717] text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#3155F5] cursor-pointer"
              >
                {exercises.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name} ({ex.primaryMuscleGroup} • {ex.equipment})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t-2 border-[#171717]/15">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg bg-[#F5F1E8] border-2 border-[#171717] hover:bg-white text-[#171717] text-xs font-mono font-bold uppercase transition-all shadow-neo-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={exercises.length === 0}
              className="px-5 py-2.5 rounded-lg bg-[#3155F5] hover:bg-[#2542C7] text-white text-xs font-mono uppercase font-black tracking-wider border-2 border-[#171717] shadow-neo cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-40"
            >
              Add Movement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
