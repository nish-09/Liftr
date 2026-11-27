import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { X, Search, Dumbbell } from "lucide-react";
import { Exercise, MuscleGroup } from "@/types";
import { PastelCard } from "@/components/ui/DesignSystem";
import { cn } from "@/lib/utils";

const PLAN_MUSCLE_GROUPS: { label: string; value: MuscleGroup | "all" }[] = [
  { label: "All Muscles", value: "all" },
  { label: "Chest", value: "chest" },
  { label: "Back", value: "back" },
  { label: "Shoulders", value: "shoulders" },
  { label: "Biceps", value: "biceps" },
  { label: "Triceps", value: "triceps" },
  { label: "Forearms", value: "forearms" },
  { label: "Quads", value: "quadriceps" },
  { label: "Hamstrings", value: "hamstrings" },
  { label: "Glutes", value: "glutes" },
  { label: "Calves", value: "calves" },
  { label: "Abs", value: "abs" },
  { label: "Full Body", value: "full_body" },
];

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
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      const matchesMuscle =
        selectedMuscle === "all" || ex.primaryMuscleGroup === selectedMuscle;
      const matchesSearch =
        !searchQuery.trim() ||
        ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ex.targetMusclePart &&
          ex.targetMusclePart.toLowerCase().includes(searchQuery.toLowerCase())) ||
        ex.equipment.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesMuscle && matchesSearch;
    });
  }, [exercises, selectedMuscle, searchQuery]);

  // When filtered exercises change, ensure selected exercise is valid
  useEffect(() => {
    if (filteredExercises.length > 0) {
      const isCurrentlySelectedInList = filteredExercises.some(
        (ex) => ex.id === selectedExerciseId
      );
      if (!isCurrentlySelectedInList && filteredExercises[0]) {
        onSelectExercise(filteredExercises[0].id);
      }
    }
  }, [filteredExercises, selectedExerciseId, onSelectExercise]);

  const selectedExercise = useMemo(() => {
    return exercises.find((ex) => ex.id === selectedExerciseId);
  }, [exercises, selectedExerciseId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 !m-0 z-50 flex items-center justify-center p-4 bg-[#142746]/50 backdrop-blur-sm overflow-y-auto w-full h-full min-h-[100dvh]">
      <PastelCard tone="white" className="p-5 sm:p-6 w-full max-w-lg max-h-[calc(100dvh-2rem)] overflow-y-auto my-auto shadow-neo-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#142746]/15 pb-3">
          <div>
            <h3 className="font-heading font-extrabold text-xl text-[#142746]">
              Select Movement to Add
            </h3>
            <p className="text-xs text-[#8993A5] mt-0.5">
              Filter by muscle group or search to quickly find exercises.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl border-[1.5px] border-[#142746] bg-[#FAF9FD] hover:bg-[#EBCBF7] text-[#142746] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

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
          <form onSubmit={onSubmit} className="space-y-4">
            {/* Filter by Muscle Group */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#142746]">
                  Filter by Muscle Group
                </label>
                <span className="text-[11px] text-[#8993A5] font-semibold">
                  {filteredExercises.length} movement{filteredExercises.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Muscle Group Quick Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
                {PLAN_MUSCLE_GROUPS.map((mg) => {
                  const isSelected = selectedMuscle === mg.value;
                  const count =
                    mg.value === "all"
                      ? exercises.length
                      : exercises.filter((e) => e.primaryMuscleGroup === mg.value).length;

                  return (
                    <button
                      key={mg.value}
                      type="button"
                      onClick={() => setSelectedMuscle(mg.value)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-xs whitespace-nowrap transition-all cursor-pointer border-[1.5px] font-bold shrink-0",
                        isSelected
                          ? "bg-[#E9FF91] text-[#142746] border-[#142746] shadow-neo-xs"
                          : "bg-[#FAF9FD] border-[#142746]/20 text-[#142746]/75 hover:border-[#142746]"
                      )}
                    >
                      {mg.label} {count > 0 ? `(${count})` : ""}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#8993A5] absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, target head, or equipment..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF9FD] border-[1.5px] border-[#142746]/30 text-xs text-[#142746] placeholder:text-[#8993A5] focus:outline-none focus:border-[#142746]"
              />
            </div>

            {/* Exercise Select Dropdown */}
            <div>
              <label className="block text-xs font-bold text-[#142746] mb-1.5">
                Choose Movement *
              </label>
              {filteredExercises.length === 0 ? (
                <div className="p-3.5 rounded-xl bg-[#FAF9FD] border-[1.5px] border-[#142746]/20 text-center space-y-1">
                  <p className="text-xs text-[#8993A5]">No movements found for this filter.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMuscle("all");
                      setSearchQuery("");
                    }}
                    className="text-xs text-[#142746] font-bold underline cursor-pointer"
                  >
                    Reset Filter to All
                  </button>
                </div>
              ) : (
                <select
                  value={selectedExerciseId}
                  onChange={(e) => onSelectExercise(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border-[1.5px] border-[#142746] text-[#142746] text-xs font-bold cursor-pointer focus:outline-none"
                >
                  {filteredExercises.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name} — {ex.primaryMuscleGroup.replace("_", " ")}
                      {ex.targetMusclePart ? ` (${ex.targetMusclePart})` : ""} • {ex.equipment}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Selected Movement Preview Card */}
            {selectedExercise && (
              <div className="p-3 rounded-xl bg-[#FAF9FD] border border-[#142746]/20 flex items-center justify-between text-xs text-[#142746]">
                <div className="flex items-center gap-2 min-w-0">
                  <Dumbbell className="w-4 h-4 text-[#142746] shrink-0" />
                  <span className="font-bold truncate">{selectedExercise.name}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {selectedExercise.targetMusclePart && (
                    <span className="px-2 py-0.5 rounded-md bg-[#BDF7B6]/50 border border-[#142746]/30 text-[10px] font-bold">
                      {selectedExercise.targetMusclePart}
                    </span>
                  )}
                  <span className="text-[10px] uppercase font-semibold text-[#8993A5]">
                    {selectedExercise.equipment}
                  </span>
                </div>
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
                disabled={filteredExercises.length === 0}
                className="neo-btn px-5 py-2 rounded-xl bg-[#142746] text-white text-xs font-bold disabled:opacity-40 cursor-pointer"
              >
                Add Movement
              </button>
            </div>
          </form>
        )}
      </PastelCard>
    </div>
  );
}
