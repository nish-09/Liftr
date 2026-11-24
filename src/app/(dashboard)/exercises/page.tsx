"use client";

import { useState, useMemo } from "react";
import { useExerciseStore } from "@/stores/useExerciseStore";
import { MuscleGroup, Equipment, Exercise } from "@/types";
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
          <div className="flex items-center gap-3">
            <h1 className="font-heading font-black text-3xl md:text-4xl text-[#171717] tracking-tight uppercase">
              EXERCISE LIBRARY
            </h1>
            <span className="px-2.5 py-1 rounded-lg bg-[#3155F5] text-white border-2 border-[#171717] text-xs font-mono font-bold shadow-neo-sm">
              {filteredExercises.length} Movements
            </span>
          </div>
          <p className="text-sm text-[#171717]/70 font-sans mt-1">
            Standard biomechanics library with progressive overload calibrations.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#3155F5] hover:bg-[#2542C7] text-white text-xs font-mono font-black uppercase tracking-wider border-2 border-[#171717] shadow-neo cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Custom Exercise</span>
        </button>
      </div>

      {/* Bento Controls Container */}
      <div className="bg-white border-2 border-[#171717] rounded-xl shadow-neo p-4 space-y-3">
        {/* Search input + equipment + favorite filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#171717]/50 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search exercise, muscle, or equipment..."
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#F5F1E8] border-2 border-[#171717] text-sm text-[#171717] placeholder:text-[#171717]/40 focus:outline-none focus:ring-2 focus:ring-[#3155F5] transition-colors font-sans"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={selectedEquipment}
              onChange={(e) => setSelectedEquipment(e.target.value as Equipment | "all")}
              className="px-3 py-2 rounded-lg bg-[#F5F1E8] border-2 border-[#171717] text-xs font-mono font-bold text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#3155F5] cursor-pointer shadow-neo-sm"
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
                "px-3 py-2 rounded-lg border-2 border-[#171717] text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer shadow-neo-sm",
                onlyFavorites
                  ? "bg-[#E9F56A] text-[#171717] font-black"
                  : "bg-[#F5F1E8] text-[#171717]/70 hover:text-[#171717]"
              )}
            >
              <Star className={cn("w-3.5 h-3.5", onlyFavorites ? "fill-[#FF7043] text-[#FF7043]" : "")} />
              <span className="font-bold">Starred</span>
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
                  "px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all cursor-pointer border-2",
                  isSelected
                    ? "bg-[#3155F5] text-[#E9F56A] border-[#171717] font-black shadow-neo-sm"
                    : "bg-[#F5F1E8] border-[#171717]/20 text-[#171717]/80 hover:border-[#171717] hover:bg-white hover:text-[#171717]"
                )}
              >
                {mg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Exercises Grid */}
      {exercises.length === 0 ? (
        <div className="bg-white border-2 border-[#171717] rounded-xl shadow-neo p-12 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-xl bg-[#3155F5]/10 border-2 border-[#171717] flex items-center justify-center text-[#3155F5]">
            <Dumbbell className="w-8 h-8 stroke-[2.5]" />
          </div>
          <div className="space-y-1">
            <h3 className="font-heading text-2xl font-black text-[#171717] tracking-tight uppercase">
              EXERCISE LIBRARY IS EMPTY
            </h3>
            <p className="text-xs sm:text-sm text-[#171717]/70 max-w-md mx-auto font-sans leading-relaxed">
              No movements currently exist in your library. Add custom exercises with target rest times, progression increments, and muscle group classifications to start building routines and logging sets.
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="px-6 py-3 rounded-lg bg-[#3155F5] hover:bg-[#2542C7] text-white text-xs font-heading font-black uppercase tracking-wider border-2 border-[#171717] shadow-neo cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5 inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create Custom Exercise</span>
          </button>
        </div>
      ) : filteredExercises.length === 0 ? (
        <div className="bg-white border-2 border-[#171717] rounded-xl shadow-neo p-12 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-xl bg-[#3155F5]/10 border-2 border-[#171717] flex items-center justify-center text-[#171717]">
            <Dumbbell className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h3 className="font-heading text-lg font-black text-[#171717] tracking-tight uppercase">NO EXERCISES MATCH FILTERS</h3>
          <p className="text-xs text-[#171717]/70 max-w-sm mx-auto font-sans">
            Try adjusting your search criteria, clearing the muscle filter, or create a new custom exercise.
          </p>
          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedMuscle("all");
                setSelectedEquipment("all");
                setOnlyFavorites(false);
              }}
              className="px-4 py-2 rounded-lg bg-[#3155F5] text-xs font-mono font-bold text-white border-2 border-[#171717] shadow-neo-sm hover:bg-[#2542C7] transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 rounded-lg bg-[#E9F56A] text-xs font-mono font-black text-[#171717] border-2 border-[#171717] shadow-neo-sm hover:bg-[#dae852] transition-colors cursor-pointer"
            >
              + Create Exercise
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredExercises.map((exercise) => {
            return (
              <div
                key={exercise.id}
                className="bg-white border-2 border-[#171717] rounded-xl shadow-neo hover:shadow-neo-lg transition-all p-4 flex flex-col justify-between group relative"
              >
                <div>
                  {/* Top row badges */}
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#3155F5] text-white border-2 border-[#171717] font-bold shadow-neo-sm">
                        {exercise.primaryMuscleGroup}
                      </span>
                      <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#B9A5EF] text-[#171717] border-2 border-[#171717] font-bold shadow-neo-sm">
                        {exercise.equipment}
                      </span>
                      {!exercise.isSystem && (
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded-md bg-[#E9F56A] text-[#171717] border-2 border-[#171717] font-black shadow-neo-sm">
                          Custom
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => toggleFavorite(exercise.id)}
                      className="p-1 rounded-md border-2 border-transparent hover:border-[#171717] hover:bg-[#F5F1E8] text-[#171717]/40 hover:text-[#FF7043] transition-all cursor-pointer"
                      title={exercise.isFavorite ? "Unfavorite" : "Favorite"}
                    >
                      <Star
                        className={cn(
                          "w-4 h-4",
                          exercise.isFavorite
                            ? "fill-[#FF7043] text-[#FF7043]"
                            : "text-[#171717]/40"
                        )}
                      />
                    </button>
                  </div>

                  {/* Exercise Title */}
                  <h3 className="font-heading font-black text-lg text-[#171717] tracking-tight group-hover:text-[#3155F5] transition-colors uppercase">
                    {exercise.name}
                  </h3>

                  {exercise.description && (
                    <p className="text-xs text-[#171717]/70 mt-1 line-clamp-2 leading-relaxed font-sans">
                      {exercise.description}
                    </p>
                  )}
                </div>

                {/* Footer Metrics */}
                <div className="mt-4 pt-3 border-t-2 border-[#171717]/15 flex items-center justify-between text-xs text-[#171717]/80 font-mono">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 font-bold" title="Default Rest">
                      <Timer className="w-3.5 h-3.5 text-[#3155F5]" />
                      {exercise.defaultRestDuration}s
                    </span>
                    <span className="flex items-center gap-1 font-bold text-[#3155F5]" title="Progression Increment">
                      <Zap className="w-3.5 h-3.5 text-[#FF7043]" />
                      +{exercise.progressionIncrement}kg
                    </span>
                  </div>

                  {!exercise.isSystem && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(exercise)}
                        className="p-1.5 rounded-md border-2 border-[#171717] bg-[#F5F1E8] hover:bg-[#3155F5] hover:text-white text-[#171717] transition-all cursor-pointer shadow-neo-sm"
                        title="Edit Exercise"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => deleteExercise(exercise.id)}
                        className="p-1.5 rounded-md border-2 border-[#171717] bg-[#FF7043] text-white hover:bg-[#e85d30] transition-all cursor-pointer shadow-neo-sm"
                        title="Delete Exercise"
                      >
                        <Trash2 className="w-3 h-3" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white border-2 border-[#171717] rounded-xl shadow-neo-lg p-6 w-full max-w-lg relative">
            <div className="flex items-center justify-between mb-5 border-b-2 border-[#171717]/15 pb-3">
              <h3 className="font-heading text-xl font-black text-[#171717] tracking-tight uppercase">
                {editingExercise ? "EDIT EXERCISE" : "NEW CUSTOM EXERCISE"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg border-2 border-[#171717] bg-[#F5F1E8] hover:bg-[#3155F5] hover:text-white text-[#171717] transition-all cursor-pointer shadow-neo-sm"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            <form onSubmit={handleSaveExercise} className="space-y-4 font-sans">
              <div>
                <label className="block text-xs font-mono uppercase font-black text-[#171717] mb-1.5">
                  Exercise Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g., Incline Hammer Strength Press"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#F5F1E8] border-2 border-[#171717] text-[#171717] text-sm focus:outline-none focus:ring-2 focus:ring-[#3155F5] font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase font-black text-[#171717] mb-1.5">
                    Primary Muscle *
                  </label>
                  <select
                    value={formMuscle}
                    onChange={(e) => setFormMuscle(e.target.value as MuscleGroup)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#F5F1E8] border-2 border-[#171717] text-[#171717] text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#3155F5] cursor-pointer"
                  >
                    {MUSCLE_GROUPS.filter((m) => m.value !== "all").map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase font-black text-[#171717] mb-1.5">
                    Equipment *
                  </label>
                  <select
                    value={formEquipment}
                    onChange={(e) => setFormEquipment(e.target.value as Equipment)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#F5F1E8] border-2 border-[#171717] text-[#171717] text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#3155F5] cursor-pointer"
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
                  <label className="block text-xs font-mono uppercase font-black text-[#171717] mb-1.5">
                    Rest Duration (seconds)
                  </label>
                  <input
                    type="number"
                    min={15}
                    max={600}
                    step={15}
                    value={formRest}
                    onChange={(e) => setFormRest(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#F5F1E8] border-2 border-[#171717] text-[#171717] text-sm focus:outline-none focus:ring-2 focus:ring-[#3155F5] font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase font-black text-[#171717] mb-1.5">
                    Increment Step (kg)
                  </label>
                  <input
                    type="number"
                    min={0.5}
                    max={20}
                    step={0.5}
                    value={formIncrement}
                    onChange={(e) => setFormIncrement(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#F5F1E8] border-2 border-[#171717] text-[#171717] text-sm focus:outline-none focus:ring-2 focus:ring-[#3155F5] font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase font-black text-[#171717] mb-1.5">
                  Form Notes / Description
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Elbow tuck angle, bench inclination, cue reminders..."
                  className="w-full px-3.5 py-2 rounded-lg bg-[#F5F1E8] border-2 border-[#171717] text-[#171717] text-sm focus:outline-none focus:ring-2 focus:ring-[#3155F5] resize-none font-sans"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t-2 border-[#171717]/15">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg bg-[#F5F1E8] border-2 border-[#171717] hover:bg-white text-[#171717] text-xs font-mono font-bold uppercase transition-all shadow-neo-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-[#3155F5] hover:bg-[#2542C7] text-white text-xs font-mono uppercase font-black tracking-wider border-2 border-[#171717] shadow-neo cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5"
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
