"use client";

import { useState, useMemo } from "react";
import { useExerciseStore } from "@/stores/useExerciseStore";
import { MuscleGroup, Equipment, Exercise } from "@/types";
import { TARGET_MUSCLE_PARTS_BY_GROUP } from "@/lib/constants/defaultExercises";
import {
  Search,
  Plus,
  Star,
  Dumbbell,
  X,
  Edit2,
  Trash2,
  Timer,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PageHeader,
  PastelCard,
  EmptyStateCard,
} from "@/components/ui/DesignSystem";

const MUSCLE_GROUPS: { label: string; value: MuscleGroup | "all" }[] = [
  { label: "All Muscles", value: "all" },
  { label: "Chest", value: "chest" },
  { label: "Back", value: "back" },
  { label: "Shoulders", value: "shoulders" },
  { label: "Quadriceps", value: "quadriceps" },
  { label: "Hamstrings", value: "hamstrings" },
  { label: "Glutes", value: "glutes" },
  { label: "Biceps", value: "biceps" },
  { label: "Triceps", value: "triceps" },
  { label: "Calves", value: "calves" },
  { label: "Forearms", value: "forearms" },
  { label: "Abs", value: "abs" },
  { label: "Full Body", value: "full_body" },
];

const EQUIPMENT_OPTIONS: { label: string; value: Equipment | "all" }[] = [
  { label: "All Equipment", value: "all" },
  { label: "Barbell", value: "barbell" },
  { label: "Dumbbell", value: "dumbbell" },
  { label: "Cable", value: "cable" },
  { label: "Machine", value: "machine" },
  { label: "Bodyweight", value: "bodyweight" },
  { label: "Smith Machine", value: "smith_machine" },
  { label: "Other", value: "other" },
];

export default function ExerciseLibraryPage() {
  const { exercises, addExercise, updateExercise, deleteExercise, toggleFavorite } =
    useExerciseStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | "all">("all");
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | "all">("all");
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);

  const [formName, setFormName] = useState("");
  const [formMuscle, setFormMuscle] = useState<MuscleGroup>("chest");
  const [formTargetPart, setFormTargetPart] = useState("");
  const [formEquipment, setFormEquipment] = useState<Equipment>("barbell");
  const [formRest, setFormRest] = useState(90);
  const [formIncrement, setFormIncrement] = useState(2.5);
  const [formDescription, setFormDescription] = useState("");

  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      const matchesSearch =
        ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.primaryMuscleGroup.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ex.targetMusclePart && ex.targetMusclePart.toLowerCase().includes(searchQuery.toLowerCase())) ||
        ex.equipment.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesMuscle =
        selectedMuscle === "all" || ex.primaryMuscleGroup === selectedMuscle;
      const matchesEquipment =
        selectedEquipment === "all" || ex.equipment === selectedEquipment;
      const matchesFavorite = !onlyFavorites || ex.isFavorite;

      return matchesSearch && matchesMuscle && matchesEquipment && matchesFavorite;
    });
  }, [exercises, searchQuery, selectedMuscle, selectedEquipment, onlyFavorites]);

  function openCreateModal() {
    setEditingExercise(null);
    setFormName("");
    setFormMuscle("chest");
    setFormTargetPart("");
    setFormEquipment("barbell");
    setFormRest(90);
    setFormIncrement(2.5);
    setFormDescription("");
    setIsModalOpen(true);
  }

  function openEditModal(ex: Exercise) {
    setEditingExercise(ex);
    setFormName(ex.name);
    setFormMuscle(ex.primaryMuscleGroup);
    setFormTargetPart(ex.targetMusclePart || "");
    setFormEquipment(ex.equipment);
    setFormRest(ex.defaultRestDuration);
    setFormIncrement(ex.progressionIncrement);
    setFormDescription(ex.description || "");
    setIsModalOpen(true);
  }

  function handleSaveExercise(e: React.FormEvent) {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingExercise) {
      updateExercise(editingExercise.id, {
        name: formName.trim(),
        primaryMuscleGroup: formMuscle,
        targetMusclePart: formTargetPart.trim() || null,
        equipment: formEquipment,
        defaultRestDuration: Number(formRest),
        progressionIncrement: Number(formIncrement),
        description: formDescription.trim(),
      });
    } else {
      addExercise({
        name: formName.trim(),
        primaryMuscleGroup: formMuscle,
        targetMusclePart: formTargetPart.trim() || null,
        secondaryMuscleGroups: [],
        equipment: formEquipment,
        weightUnit: "kg",
        defaultRestDuration: Number(formRest),
        progressionIncrement: Number(formIncrement),
        description: formDescription.trim(),
        isFavorite: false,
      });
    }

    setIsModalOpen(false);
  }

  return (
    <>
      <div className="space-y-6">
      <PageHeader
        title="Exercises"
        actions={
          <button
            onClick={openCreateModal}
            className="neo-btn min-h-[44px] px-4 py-2.5 rounded-xl bg-[#142746] text-white text-xs font-heading font-bold inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Exercise</span>
          </button>
        }
      />

      {/* Search & Filters */}
      <PastelCard tone="white" className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8993A5] absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search exercise, muscle, or equipment..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FAF9FD] border-[1.5px] border-[#142746] text-sm text-[#142746] placeholder:text-[#8993A5] focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-2">
            <select
              value={selectedEquipment}
              onChange={(e) => setSelectedEquipment(e.target.value as Equipment | "all")}
              className="flex-1 sm:flex-initial min-h-[44px] px-3 py-2 rounded-xl bg-[#FAF9FD] border-[1.5px] border-[#142746] text-xs font-bold text-[#142746] cursor-pointer focus:outline-none"
            >
              {EQUIPMENT_OPTIONS.map((eq) => (
                <option key={eq.value} value={eq.value}>
                  {eq.label}
                </option>
              ))}
            </select>

            <button
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={cn(
                "min-h-[44px] px-3.5 py-2 rounded-xl border-[1.5px] border-[#142746] text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer font-bold shrink-0",
                onlyFavorites ? "bg-[#F2FA91] text-[#142746] shadow-neo-sm" : "bg-white text-[#142746]/70"
              )}
            >
              <Star className={cn("w-3.5 h-3.5", onlyFavorites && "fill-[#F8C3B5] text-[#142746]")} />
              <span>Starred</span>
            </button>
          </div>
        </div>

        {/* Muscle group pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {MUSCLE_GROUPS.map((mg) => {
            const isSelected = selectedMuscle === mg.value;
            return (
              <button
                key={mg.value}
                onClick={() => setSelectedMuscle(mg.value)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer border-[1.5px] font-bold",
                  isSelected
                    ? "bg-[#E9FF91] text-[#142746] border-[#142746] shadow-neo-sm"
                    : "bg-[#FAF9FD] border-[#142746]/20 text-[#142746]/75 hover:border-[#142746]"
                )}
              >
                {mg.label}
              </button>
            );
          })}
        </div>
      </PastelCard>

      {/* Exercises Grid */}
      {exercises.length === 0 ? (
        <EmptyStateCard
          icon={<Dumbbell className="w-7 h-7" />}
          title="Exercise Library Is Empty"
          description="No movements currently exist in your library. Add custom exercises with rest durations and progression steps to start building plans."
          action={
            <button
              onClick={openCreateModal}
              className="neo-btn px-5 py-2.5 rounded-xl bg-[#142746] text-white text-xs font-heading font-bold inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Custom Exercise</span>
            </button>
          }
        />
      ) : filteredExercises.length === 0 ? (
        <EmptyStateCard
          icon={<Dumbbell className="w-6 h-6" />}
          title="No Exercises Match Filters"
          description="Try adjusting your search criteria, clearing the muscle filter, or create a new custom movement."
          action={
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedMuscle("all");
                  setSelectedEquipment("all");
                  setOnlyFavorites(false);
                }}
                className="neo-btn px-4 py-2 rounded-xl bg-white text-xs font-bold text-[#142746] cursor-pointer"
              >
                Reset Filters
              </button>
              <button
                onClick={openCreateModal}
                className="neo-btn px-4 py-2 rounded-xl bg-[#E9FF91] text-xs font-bold text-[#142746] cursor-pointer"
              >
                + Create Exercise
              </button>
            </div>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredExercises.map((exercise) => (
            <PastelCard
              key={exercise.id}
              tone="white"
              interactive
              className="p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[11px] font-bold uppercase tracking-wide text-[#8993A5] capitalize truncate">
                      {exercise.primaryMuscleGroup.replace("_", " ")} ·{" "}
                      {exercise.equipment.replace("_", " ")}
                    </span>
                    {!exercise.isSystem && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#F2FA91] border border-[#142746] text-[#142746] shrink-0">
                        Custom
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => toggleFavorite(exercise.id)}
                    className="p-1.5 rounded-lg hover:bg-[#F2FA91]/60 transition-colors cursor-pointer shrink-0"
                    title={exercise.isFavorite ? "Unfavorite" : "Favorite"}
                  >
                    <Star
                      className={cn(
                        "w-4 h-4",
                        exercise.isFavorite
                          ? "fill-[#F8C3B5] text-[#142746]"
                          : "text-[#8993A5]"
                      )}
                    />
                  </button>
                </div>

                <h3 className="font-heading font-extrabold text-base text-[#142746]">
                  {exercise.name}
                </h3>

                {exercise.targetMusclePart && (
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#BDF7B6]/40 border border-[#142746]/25 text-[#142746] inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#142746]" />
                      {exercise.targetMusclePart}
                    </span>
                  </div>
                )}

                {exercise.description && (
                  <p className="text-xs text-[#8993A5] mt-1 line-clamp-2 leading-relaxed">
                    {exercise.description}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[#142746]/10 flex items-center justify-between text-xs text-[#142746]">
                <div className="flex items-center gap-3 font-semibold">
                  <span className="inline-flex items-center gap-1">
                    <Timer className="w-3.5 h-3.5 text-[#8993A5]" />
                    {exercise.defaultRestDuration}s
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-[#142746]" />
                    +{exercise.progressionIncrement}kg
                  </span>
                </div>

                {!exercise.isSystem && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(exercise)}
                      className="p-1.5 rounded-lg border border-[#142746] bg-[#FAF9FD] hover:bg-[#E9FF91] cursor-pointer"
                      title="Edit Exercise"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => deleteExercise(exercise.id)}
                      className="p-1.5 rounded-lg border border-[#142746] bg-[#F8C3B5] text-[#142746] cursor-pointer"
                      title="Delete Exercise"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </PastelCard>
          ))}
        </div>
      )}
    </div>

    {/* Create / Edit Exercise Modal */}
    {isModalOpen && (
      <div className="fixed inset-0 !m-0 z-50 flex items-center justify-center p-4 bg-[#142746]/50 backdrop-blur-sm overflow-y-auto w-full h-full min-h-[100dvh]">
        <PastelCard tone="white" className="p-5 sm:p-6 w-full max-w-lg max-h-[calc(100dvh-2rem)] overflow-y-auto my-auto shadow-neo-xl">
          <div className="flex items-center justify-between mb-5 border-b border-[#142746]/15 pb-3">
            <h3 className="font-heading text-xl font-extrabold text-[#142746]">
              {editingExercise ? "Edit Exercise" : "New Custom Exercise"}
            </h3>
            <button
              onClick={() => setIsModalOpen(false)}
              className="p-1.5 rounded-xl border-[1.5px] border-[#142746] bg-[#FAF9FD] hover:bg-[#EBCBF7] text-[#142746] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSaveExercise} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#142746] mb-1.5">
                Exercise Name *
              </label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g., Incline Hammer Strength Press"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border-[1.5px] border-[#142746] text-[#142746] text-sm focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#142746] mb-1.5">
                  Primary Muscle *
                </label>
                <select
                  value={formMuscle}
                  onChange={(e) => setFormMuscle(e.target.value as MuscleGroup)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border-[1.5px] border-[#142746] text-[#142746] text-xs font-bold cursor-pointer focus:outline-none"
                >
                  {MUSCLE_GROUPS.filter((m) => m.value !== "all").map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#142746] mb-1.5">
                  Equipment *
                </label>
                <select
                  value={formEquipment}
                  onChange={(e) => setFormEquipment(e.target.value as Equipment)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border-[1.5px] border-[#142746] text-[#142746] text-xs font-bold cursor-pointer focus:outline-none"
                >
                  {EQUIPMENT_OPTIONS.filter((eq) => eq.value !== "all").map((eq) => (
                    <option key={eq.value} value={eq.value}>
                      {eq.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#142746]">
                  Target Muscle Part (Optional)
                </label>
                <span className="text-[10px] text-[#8993A5]">e.g. Upper Chest, Long Head</span>
              </div>
              <input
                type="text"
                value={formTargetPart}
                onChange={(e) => setFormTargetPart(e.target.value)}
                placeholder="Select a suggestion below or type custom..."
                className="w-full px-3.5 py-2 rounded-xl bg-white border-[1.5px] border-[#142746] text-[#142746] text-xs font-medium focus:outline-none mb-1.5"
              />
              {TARGET_MUSCLE_PARTS_BY_GROUP[formMuscle] && (
                <div className="flex flex-wrap gap-1.5">
                  {TARGET_MUSCLE_PARTS_BY_GROUP[formMuscle].map((part) => (
                    <button
                      key={part}
                      type="button"
                      onClick={() => setFormTargetPart(part)}
                      className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all cursor-pointer",
                        formTargetPart === part
                          ? "bg-[#142746] text-white border-[#142746]"
                          : "bg-[#FAF9FD] border-[#142746]/20 text-[#142746]/80 hover:border-[#142746]"
                      )}
                    >
                      {part}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#142746] mb-1.5">
                  Rest Duration (seconds)
                </label>
                <input
                  type="number"
                  min={15}
                  max={600}
                  step={15}
                  value={formRest}
                  onChange={(e) => setFormRest(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border-[1.5px] border-[#142746] text-[#142746] text-sm font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#142746] mb-1.5">
                  Increment Step (kg)
                </label>
                <input
                  type="number"
                  min={0.5}
                  max={20}
                  step={0.5}
                  value={formIncrement}
                  onChange={(e) => setFormIncrement(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border-[1.5px] border-[#142746] text-[#142746] text-sm font-bold focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#142746] mb-1.5">
                Form Notes / Description
              </label>
              <textarea
                rows={2}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Elbow tuck angle, bench inclination, cue reminders..."
                className="w-full px-3.5 py-2 rounded-xl bg-white border-[1.5px] border-[#142746] text-[#142746] text-sm resize-none focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#142746]/15">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="neo-btn px-4 py-2 rounded-xl bg-white text-[#142746] text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="neo-btn px-5 py-2 rounded-xl bg-[#142746] text-white text-xs font-bold cursor-pointer"
              >
                {editingExercise ? "Update Exercise" : "Create Exercise"}
              </button>
            </div>
          </form>
        </PastelCard>
      </div>
    )}
  </>
);
}
