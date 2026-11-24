"use client";

import { useState, useMemo } from "react";
import { useExerciseStore } from "@/stores/useExerciseStore";
import { MuscleGroup, Equipment, Exercise } from "@/types";
import {
  Search,
  Plus,
  Star,
  Dumbbell,
  SlidersHorizontal,
  Flame,
  Check,
  X,
  Edit2,
  Trash2,
  Timer,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formMuscle, setFormMuscle] = useState<MuscleGroup>("chest");
  const [formEquipment, setFormEquipment] = useState<Equipment>("barbell");
  const [formRest, setFormRest] = useState(90);
  const [formIncrement, setFormIncrement] = useState(2.5);
  const [formDescription, setFormDescription] = useState("");

  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      const matchesSearch =
        ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.primaryMuscleGroup.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
        equipment: formEquipment,
        defaultRestDuration: Number(formRest),
        progressionIncrement: Number(formIncrement),
        description: formDescription.trim(),
      });
    } else {
      addExercise({
        name: formName.trim(),
        primaryMuscleGroup: formMuscle,
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
    <div className="space-y-6">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-serif italic text-3xl text-white">Exercise Library</span>
            <span className="px-2 py-0.5 rounded bg-[#1C1C1C] border border-[#2B2B2B] text-xs font-mono text-liftr-purple">
              {filteredExercises.length} Movements
            </span>
          </div>
          <p className="text-sm text-liftr-grey mt-0.5">
            Standard biomechanics library with progressive overload calibrations.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-liftr-purple hover:bg-liftr-purple-dark text-white text-sm font-medium shadow-neo cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Custom Exercise</span>
        </button>
      </div>

      {/* Bento Controls Container */}
      <div className="bento-card p-4 space-y-3">
        {/* Search input + equipment + favorite filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search exercise, muscle, or equipment..."
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#181818] border border-[#2c2c2c] text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-liftr-purple transition-colors font-sans"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={selectedEquipment}
              onChange={(e) => setSelectedEquipment(e.target.value as Equipment | "all")}
              className="px-3 py-2 rounded-lg bg-[#181818] border border-[#2c2c2c] text-xs font-mono text-white focus:outline-none focus:border-liftr-purple cursor-pointer"
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
                "px-3 py-2 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer",
                onlyFavorites
                  ? "bg-liftr-yellow/20 border-liftr-yellow text-liftr-yellow font-bold"
                  : "bg-[#181818] border-[#2c2c2c] text-zinc-400 hover:text-white"
              )}
            >
              <Star className={cn("w-3.5 h-3.5", onlyFavorites ? "fill-liftr-yellow" : "")} />
              <span>Starred</span>
            </button>
          </div>
        </div>

        {/* Muscle group horizontal pill tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {MUSCLE_GROUPS.map((mg) => {
            const isSelected = selectedMuscle === mg.value;
            return (
              <button
                key={mg.value}
                onClick={() => setSelectedMuscle(mg.value)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-mono whitespace-nowrap transition-all cursor-pointer",
                  isSelected
                    ? "bg-white text-black font-bold shadow-neo-sm"
                    : "bg-[#161616] text-zinc-400 hover:bg-[#202020] hover:text-white"
                )}
              >
                {mg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Exercises Grid */}
      {filteredExercises.length === 0 ? (
        <div className="bento-card p-12 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-xl bg-[#1C1C1C] flex items-center justify-center text-zinc-500">
            <Dumbbell className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Exercises Found</h3>
          <p className="text-xs text-liftr-grey max-w-sm mx-auto">
            Try adjusting your search criteria, clearing the muscle filter, or create a new custom exercise.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedMuscle("all");
              setSelectedEquipment("all");
              setOnlyFavorites(false);
            }}
            className="px-4 py-2 rounded-lg bg-[#202020] text-xs font-mono text-white hover:bg-[#2A2A2A] transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredExercises.map((exercise) => {
            return (
              <div
                key={exercise.id}
                className="bento-card p-4 hover:border-liftr-purple/40 transition-all flex flex-col justify-between group relative"
              >
                <div>
                  {/* Top row badges */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-liftr-purple/15 text-liftr-purple-light border border-liftr-purple/30 font-semibold">
                        {exercise.primaryMuscleGroup}
                      </span>
                      <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#1C1C1C] text-zinc-400 border border-[#2B2B2B]">
                        {exercise.equipment}
                      </span>
                      {!exercise.isSystem && (
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-liftr-green/15 text-liftr-green border border-liftr-green/30">
                          Custom
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => toggleFavorite(exercise.id)}
                      className="p-1 rounded hover:bg-[#202020] text-zinc-500 hover:text-liftr-yellow transition-colors cursor-pointer"
                      title={exercise.isFavorite ? "Unfavorite" : "Favorite"}
                    >
                      <Star
                        className={cn(
                          "w-4 h-4",
                          exercise.isFavorite
                            ? "fill-liftr-yellow text-liftr-yellow"
                            : "text-zinc-600"
                        )}
                      />
                    </button>
                  </div>

                  {/* Exercise Title */}
                  <h3 className="text-base font-bold text-white group-hover:text-liftr-purple-light transition-colors">
                    {exercise.name}
                  </h3>

                  {exercise.description && (
                    <p className="text-xs text-liftr-grey mt-1 line-clamp-2 leading-relaxed">
                      {exercise.description}
                    </p>
                  )}
                </div>

                {/* Footer Metrics */}
                <div className="mt-4 pt-3 border-t border-[#1F1F1F] flex items-center justify-between text-xs text-zinc-400 font-mono">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1" title="Default Rest">
                      <Timer className="w-3.5 h-3.5 text-liftr-grey" />
                      {exercise.defaultRestDuration}s
                    </span>
                    <span className="flex items-center gap-1" title="Progression Increment">
                      <Zap className="w-3.5 h-3.5 text-liftr-yellow" />
                      +{exercise.progressionIncrement}kg
                    </span>
                  </div>

                  {!exercise.isSystem && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(exercise)}
                        className="p-1 rounded hover:bg-[#202020] text-zinc-400 hover:text-white"
                        title="Edit Exercise"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteExercise(exercise.id)}
                        className="p-1 rounded hover:bg-liftr-coral/20 text-zinc-400 hover:text-liftr-coral"
                        title="Delete Exercise"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Exercise Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bento-card p-6 w-full max-w-lg border-2 border-border shadow-neo-purple relative">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white font-sans">
                {editingExercise ? "Edit Exercise" : "Add Custom Exercise"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded hover:bg-[#202020] text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExercise} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-liftr-grey mb-1.5">
                  Exercise Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g., Incline Hammer Strength Press"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-[#2c2c2c] text-white text-sm focus:outline-none focus:border-liftr-purple"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-liftr-grey mb-1.5">
                    Primary Muscle *
                  </label>
                  <select
                    value={formMuscle}
                    onChange={(e) => setFormMuscle(e.target.value as MuscleGroup)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-[#2c2c2c] text-white text-sm focus:outline-none focus:border-liftr-purple cursor-pointer"
                  >
                    {MUSCLE_GROUPS.filter((m) => m.value !== "all").map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-liftr-grey mb-1.5">
                    Equipment *
                  </label>
                  <select
                    value={formEquipment}
                    onChange={(e) => setFormEquipment(e.target.value as Equipment)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-[#2c2c2c] text-white text-sm focus:outline-none focus:border-liftr-purple cursor-pointer"
                  >
                    {EQUIPMENT_OPTIONS.filter((eq) => eq.value !== "all").map((eq) => (
                      <option key={eq.value} value={eq.value}>
                        {eq.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-liftr-grey mb-1.5">
                    Rest Duration (seconds)
                  </label>
                  <input
                    type="number"
                    min={15}
                    max={600}
                    step={15}
                    value={formRest}
                    onChange={(e) => setFormRest(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-[#2c2c2c] text-white text-sm focus:outline-none focus:border-liftr-purple font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-liftr-grey mb-1.5">
                    Increment Step (kg)
                  </label>
                  <input
                    type="number"
                    min={0.5}
                    max={20}
                    step={0.5}
                    value={formIncrement}
                    onChange={(e) => setFormIncrement(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-[#2c2c2c] text-white text-sm focus:outline-none focus:border-liftr-purple font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-liftr-grey mb-1.5">
                  Form Notes / Description
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Elbow tuck angle, bench inclination, cue reminders..."
                  className="w-full px-3.5 py-2 rounded-lg bg-[#181818] border border-[#2c2c2c] text-white text-sm focus:outline-none focus:border-liftr-purple resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg bg-[#1C1C1C] hover:bg-[#252525] text-zinc-300 text-xs font-mono uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-liftr-purple hover:bg-liftr-purple-dark text-white text-xs font-mono uppercase font-bold shadow-neo cursor-pointer"
                >
                  {editingExercise ? "Update Exercise" : "Create Exercise"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
