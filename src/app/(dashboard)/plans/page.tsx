"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePlanStore } from "@/stores/usePlanStore";
import { useExerciseStore } from "@/stores/useExerciseStore";
import { useWorkoutStore } from "@/stores/useWorkoutStore";
import {
  WorkoutPlanItem,
  PlanDayItem,
  PlanExerciseItem,
  SessionExerciseItem,
  SetLogItem,
} from "@/types";
import {
  CalendarDays,
  Plus,
  Copy,
  Trash2,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  Play,
  Dumbbell,
  Settings2,
  ChevronRight,
  Flame,
  Layers,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PHASES = ["Bulking", "Recomp", "Cutting", "Strength", "Custom"];

export default function PlansPage() {
  const router = useRouter();
  const {
    plans,
    createPlan,
    updatePlan,
    deletePlan,
    duplicatePlan,
    setActivePlan,
    addDayToPlan,
    removeDayFromPlan,
    duplicateDayInPlan,
    updateDayName,
    addExerciseToDay,
    removeExerciseFromDay,
    updatePlanExercise,
    moveExerciseOrder,
  } = usePlanStore();

  const { exercises } = useExerciseStore();
  const { startWorkout } = useWorkoutStore();

  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    plans[0]?.id || ""
  );
  const [selectedDayId, setSelectedDayId] = useState<string>(
    plans[0]?.days[0]?.id || ""
  );

  // New Plan Modal
  const [isNewPlanModalOpen, setIsNewPlanModalOpen] = useState(false);
  const [newPlanName, setNewPlanName] = useState("");
  const [newPlanDesc, setNewPlanDesc] = useState("");
  const [newPlanPhase, setNewPlanPhase] = useState("Bulking");

  // Add Exercise to Day Modal
  const [isAddExerciseModalOpen, setIsAddExerciseModalOpen] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(
    exercises[0]?.id || ""
  );

  const currentPlan = plans.find((p) => p.id === selectedPlanId) || plans[0];
  const currentDay =
    currentPlan?.days.find((d) => d.id === selectedDayId) || currentPlan?.days[0];

  function handleCreatePlan(e: React.FormEvent) {
    e.preventDefault();
    if (!newPlanName.trim()) return;

    const created = createPlan(newPlanName.trim(), newPlanDesc.trim(), newPlanPhase);
    setSelectedPlanId(created.id);
    setSelectedDayId(created.days[0]?.id || "");
    setIsNewPlanModalOpen(false);
    setNewPlanName("");
    setNewPlanDesc("");
  }

  function handleAddExerciseToCurrentDay(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPlan || !currentDay || !selectedExerciseId) return;

    const exMeta = exercises.find((ex) => ex.id === selectedExerciseId);
    addExerciseToDay(currentPlan.id, currentDay.id, selectedExerciseId, {
      restDuration: exMeta?.defaultRestDuration || 90,
      progressionIncrement: exMeta?.progressionIncrement || 2.5,
    });
    setIsAddExerciseModalOpen(false);
  }

  function handleStartWorkoutFromDay(day: PlanDayItem) {
    if (!currentPlan) return;

    const sessionExercises: SessionExerciseItem[] = day.exercises.map(
      (pe, exIdx) => {
        const exMeta = exercises.find((ex) => ex.id === pe.exerciseId);
        const sessionExerciseId = crypto.randomUUID();
        const sets: SetLogItem[] = Array.from({ length: pe.targetSets }).map(
          (_, sIdx) => ({
            id: crypto.randomUUID(),
            sessionExerciseId,
            sessionId: "",
            exerciseId: pe.exerciseId,
            setNumber: sIdx + 1,
            setType: "normal",
            weight: pe.defaultWeight || 0,
            reps: pe.minReps || 8,
            targetWeight: pe.defaultWeight || 0,
            targetReps: pe.maxReps || 12,
            isCompleted: false,
          })
        );

        return {
          id: sessionExerciseId,
          sessionId: "",
          exerciseId: pe.exerciseId,
          orderInSession: exIdx + 1,
          isCompleted: false,
          exercise: exMeta,
          sets,
        };
      }
    );

    startWorkout({
      name: `${currentPlan.name} • ${day.name}`,
      planId: currentPlan.id,
      planDayId: day.id,
      phaseId: currentPlan.phaseId,
      exercises: sessionExercises,
    });

    router.push("/workouts");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif italic text-3xl text-white">Workout Plans</h1>
            <span className="px-2 py-0.5 rounded bg-[#1C1C1C] border border-[#2B2B2B] text-xs font-mono text-liftr-purple">
              {plans.length} Routines
            </span>
          </div>
          <p className="text-sm text-liftr-grey mt-0.5">
            Architect your multi-day splits, set rep target ranges, and configure progression parameters.
          </p>
        </div>

        <button
          onClick={() => setIsNewPlanModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-liftr-purple hover:bg-liftr-purple-dark text-white text-sm font-medium shadow-neo cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Workout Plan</span>
        </button>
      </div>

      {/* Main Grid: Plan Selector & Plan Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Plan Cards List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-mono uppercase tracking-wider text-liftr-grey px-1">
            Available Routines
          </div>

          <div className="space-y-3">
            {plans.map((plan) => {
              const isSelected = plan.id === currentPlan?.id;
              const totalExercises = plan.days.reduce(
                (acc, d) => acc + d.exercises.length,
                0
              );

              return (
                <div
                  key={plan.id}
                  onClick={() => {
                    setSelectedPlanId(plan.id);
                    setSelectedDayId(plan.days[0]?.id || "");
                  }}
                  className={cn(
                    "bento-card p-4 cursor-pointer transition-all relative group",
                    isSelected
                      ? "border-liftr-purple shadow-neo-sm bg-[#151515]"
                      : "hover:border-[#383838]"
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-liftr-purple/15 text-liftr-purple-light border border-liftr-purple/30 font-semibold">
                        {plan.phaseId || "General"}
                      </span>
                      {plan.isActive && (
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-liftr-green/15 text-liftr-green border border-liftr-green/30 flex items-center gap-1 font-bold">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicatePlan(plan.id);
                        }}
                        className="p-1 rounded hover:bg-[#252525] text-zinc-400 hover:text-white"
                        title="Duplicate Plan"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      {plans.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePlan(plan.id);
                          }}
                          className="p-1 rounded hover:bg-liftr-coral/20 text-zinc-400 hover:text-liftr-coral"
                          title="Delete Plan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-liftr-purple-light transition-colors">
                    {plan.name}
                  </h3>

                  {plan.description && (
                    <p className="text-xs text-liftr-grey mt-1 line-clamp-2">
                      {plan.description}
                    </p>
                  )}

                  <div className="mt-3 pt-2.5 border-t border-[#1F1F1F] flex items-center justify-between text-xs font-mono text-zinc-400">
                    <span>
                      {plan.days.length} Days • {totalExercises} Exercises
                    </span>
                    {!plan.isActive && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActivePlan(plan.id);
                        }}
                        className="text-[11px] text-liftr-purple hover:underline"
                      >
                        Set Active
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Plan Day Editor */}
        <div className="lg:col-span-8 space-y-4">
          {currentPlan ? (
            <div className="bento-card p-5 space-y-5 border-border">
              {/* Plan Meta Edit Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#232323]">
                <div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={currentPlan.name}
                      onChange={(e) =>
                        updatePlan(currentPlan.id, { name: e.target.value })
                      }
                      className="text-xl font-bold text-white bg-transparent border-b border-transparent hover:border-[#383838] focus:border-liftr-purple focus:outline-none transition-colors"
                    />
                  </div>
                  <input
                    type="text"
                    value={currentPlan.description || ""}
                    onChange={(e) =>
                      updatePlan(currentPlan.id, { description: e.target.value })
                    }
                    placeholder="Add routine notes or cadence instructions..."
                    className="text-xs text-liftr-grey bg-transparent border-b border-transparent hover:border-[#383838] focus:border-liftr-purple focus:outline-none w-full mt-1"
                  />
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <select
                    value={currentPlan.phaseId || "Bulking"}
                    onChange={(e) =>
                      updatePlan(currentPlan.id, { phaseId: e.target.value })
                    }
                    className="px-2.5 py-1.5 rounded-lg bg-[#181818] border border-[#2c2c2c] text-xs font-mono text-white focus:outline-none focus:border-liftr-purple"
                  >
                    {PHASES.map((ph) => (
                      <option key={ph} value={ph}>
                        Phase: {ph}
                      </option>
                    ))}
                  </select>

                  {!currentPlan.isActive && (
                    <button
                      onClick={() => setActivePlan(currentPlan.id)}
                      className="px-3 py-1.5 rounded-lg bg-[#181818] hover:bg-[#222222] border border-[#2c2c2c] text-xs font-mono text-zinc-300"
                    >
                      Make Active
                    </button>
                  )}
                </div>
              </div>

              {/* Day Tabs */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-liftr-grey">
                    Plan Split Days
                  </span>
                  <button
                    onClick={() =>
                      addDayToPlan(
                        currentPlan.id,
                        `Day ${currentPlan.days.length + 1} - Workout`
                      )
                    }
                    className="inline-flex items-center gap-1 text-xs font-mono text-liftr-purple hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Day</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {currentPlan.days.map((day) => {
                    const isSelected = day.id === currentDay?.id;
                    return (
                      <button
                        key={day.id}
                        onClick={() => setSelectedDayId(day.id)}
                        className={cn(
                          "px-3.5 py-2 rounded-lg text-xs font-mono whitespace-nowrap transition-all border flex items-center gap-2 cursor-pointer",
                          isSelected
                            ? "bg-liftr-purple text-white border-liftr-purple shadow-neo-sm font-bold"
                            : "bg-[#181818] text-zinc-400 border-[#262626] hover:bg-[#202020] hover:text-white"
                        )}
                      >
                        <span>{day.name}</span>
                        <span className="text-[10px] opacity-75">
                          ({day.exercises.length})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Current Day Exercise List & Controls */}
              {currentDay ? (
                <div className="space-y-4 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg bg-[#171717] border border-[#262626]">
                    <div>
                      <input
                        type="text"
                        value={currentDay.name}
                        onChange={(e) =>
                          updateDayName(currentPlan.id, currentDay.id, e.target.value)
                        }
                        className="font-bold text-sm text-white bg-transparent border-b border-transparent hover:border-[#383838] focus:border-liftr-purple focus:outline-none"
                      />
                      <div className="text-xs text-liftr-grey font-mono mt-0.5">
                        {currentDay.exercises.length} prescribed movements
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          duplicateDayInPlan(currentPlan.id, currentDay.id)
                        }
                        className="px-2.5 py-1.5 rounded bg-[#202020] hover:bg-[#282828] text-xs font-mono text-zinc-300 flex items-center gap-1.5"
                        title="Duplicate Day"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Duplicate</span>
                      </button>

                      {currentPlan.days.length > 1 && (
                        <button
                          onClick={() =>
                            removeDayFromPlan(currentPlan.id, currentDay.id)
                          }
                          className="px-2.5 py-1.5 rounded hover:bg-liftr-coral/20 text-xs font-mono text-zinc-400 hover:text-liftr-coral flex items-center gap-1.5"
                          title="Remove Day"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleStartWorkoutFromDay(currentDay)}
                        className="px-3.5 py-1.5 rounded-lg bg-liftr-green hover:bg-liftr-green-light text-black text-xs font-mono font-bold shadow-neo-sm flex items-center gap-1.5 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-black" />
                        <span>Start Session</span>
                      </button>
                    </div>
                  </div>

                  {/* Exercise Rows */}
                  {currentDay.exercises.length === 0 ? (
                    <div className="p-8 text-center rounded-lg border border-dashed border-[#2b2b2b] space-y-2">
                      <p className="text-xs text-liftr-grey font-mono">
                        No exercises configured for this day yet.
                      </p>
                      <button
                        onClick={() => setIsAddExerciseModalOpen(true)}
                        className="px-3 py-1.5 rounded bg-liftr-purple text-xs font-mono text-white"
                      >
                        + Add First Exercise
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {currentDay.exercises.map((pe, idx) => {
                        const exMeta = exercises.find(
                          (ex) => ex.id === pe.exerciseId
                        );

                        return (
                          <div
                            key={pe.id}
                            className="p-3.5 rounded-lg bg-[#141414] border border-[#232323] hover:border-[#303030] transition-colors space-y-3"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-[#202020] text-zinc-400 font-mono text-xs flex items-center justify-center font-bold">
                                  {idx + 1}
                                </span>
                                <div>
                                  <h4 className="text-sm font-bold text-white leading-tight">
                                    {exMeta?.name || "Exercise"}
                                  </h4>
                                  <span className="text-[10px] font-mono uppercase text-liftr-grey">
                                    {exMeta?.primaryMuscleGroup} • {exMeta?.equipment}
                                  </span>
                                </div>
                              </div>

                              {/* Ordering & delete */}
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() =>
                                    moveExerciseOrder(
                                      currentPlan.id,
                                      currentDay.id,
                                      pe.id,
                                      "up"
                                    )
                                  }
                                  disabled={idx === 0}
                                  className="p-1 rounded hover:bg-[#202020] text-zinc-400 hover:text-white disabled:opacity-30"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() =>
                                    moveExerciseOrder(
                                      currentPlan.id,
                                      currentDay.id,
                                      pe.id,
                                      "down"
                                    )
                                  }
                                  disabled={idx === currentDay.exercises.length - 1}
                                  className="p-1 rounded hover:bg-[#202020] text-zinc-400 hover:text-white disabled:opacity-30"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() =>
                                    removeExerciseFromDay(
                                      currentPlan.id,
                                      currentDay.id,
                                      pe.id
                                    )
                                  }
                                  className="p-1 rounded hover:bg-liftr-coral/20 text-zinc-500 hover:text-liftr-coral ml-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Configuration Fields: Sets, Reps, Weight, Rest, Step */}
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 border-t border-[#1C1C1C] text-xs">
                              <div>
                                <label className="text-[10px] font-mono text-zinc-500 block mb-1">
                                  Target Sets
                                </label>
                                <input
                                  type="number"
                                  min={1}
                                  max={15}
                                  value={pe.targetSets}
                                  onChange={(e) =>
                                    updatePlanExercise(
                                      currentPlan.id,
                                      currentDay.id,
                                      pe.id,
                                      { targetSets: Number(e.target.value) }
                                    )
                                  }
                                  className="w-full px-2 py-1 rounded bg-[#1C1C1C] border border-[#2B2B2B] text-white font-mono text-xs focus:outline-none focus:border-liftr-purple"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] font-mono text-zinc-500 block mb-1">
                                  Rep Range
                                </label>
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    min={1}
                                    max={50}
                                    value={pe.minReps}
                                    onChange={(e) =>
                                      updatePlanExercise(
                                        currentPlan.id,
                                        currentDay.id,
                                        pe.id,
                                        { minReps: Number(e.target.value) }
                                      )
                                    }
                                    className="w-full px-2 py-1 rounded bg-[#1C1C1C] border border-[#2B2B2B] text-white font-mono text-xs text-center"
                                  />
                                  <span className="text-zinc-600">-</span>
                                  <input
                                    type="number"
                                    min={1}
                                    max={50}
                                    value={pe.maxReps}
                                    onChange={(e) =>
                                      updatePlanExercise(
                                        currentPlan.id,
                                        currentDay.id,
                                        pe.id,
                                        { maxReps: Number(e.target.value) }
                                      )
                                    }
                                    className="w-full px-2 py-1 rounded bg-[#1C1C1C] border border-[#2B2B2B] text-white font-mono text-xs text-center"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="text-[10px] font-mono text-zinc-500 block mb-1">
                                  Start Weight (kg)
                                </label>
                                <input
                                  type="number"
                                  min={0}
                                  step={0.5}
                                  value={pe.defaultWeight}
                                  onChange={(e) =>
                                    updatePlanExercise(
                                      currentPlan.id,
                                      currentDay.id,
                                      pe.id,
                                      { defaultWeight: Number(e.target.value) }
                                    )
                                  }
                                  className="w-full px-2 py-1 rounded bg-[#1C1C1C] border border-[#2B2B2B] text-white font-mono text-xs"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] font-mono text-zinc-500 block mb-1">
                                  Rest (sec)
                                </label>
                                <input
                                  type="number"
                                  min={15}
                                  step={15}
                                  value={pe.restDuration}
                                  onChange={(e) =>
                                    updatePlanExercise(
                                      currentPlan.id,
                                      currentDay.id,
                                      pe.id,
                                      { restDuration: Number(e.target.value) }
                                    )
                                  }
                                  className="w-full px-2 py-1 rounded bg-[#1C1C1C] border border-[#2B2B2B] text-white font-mono text-xs"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] font-mono text-zinc-500 block mb-1">
                                  Step (+kg)
                                </label>
                                <input
                                  type="number"
                                  min={0.5}
                                  step={0.5}
                                  value={pe.progressionIncrement}
                                  onChange={(e) =>
                                    updatePlanExercise(
                                      currentPlan.id,
                                      currentDay.id,
                                      pe.id,
                                      {
                                        progressionIncrement: Number(e.target.value),
                                      }
                                    )
                                  }
                                  className="w-full px-2 py-1 rounded bg-[#1C1C1C] border border-[#2B2B2B] text-white font-mono text-xs"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <button
                    onClick={() => setIsAddExerciseModalOpen(true)}
                    className="w-full py-2.5 rounded-lg border border-dashed border-[#303030] hover:border-liftr-purple/50 text-xs font-mono text-zinc-400 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-liftr-purple" />
                    <span>Add Movement to {currentDay.name}</span>
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {/* New Plan Modal */}
      {isNewPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bento-card p-6 w-full max-w-md border-2 border-border shadow-neo-purple">
            <h3 className="text-base font-bold text-white mb-4">
              Create New Workout Plan
            </h3>
            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-liftr-grey mb-1.5">
                  Plan Name *
                </label>
                <input
                  type="text"
                  required
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                  placeholder="e.g., 4-Day Upper / Lower Wave"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-[#2c2c2c] text-white text-sm focus:outline-none focus:border-liftr-purple"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-liftr-grey mb-1.5">
                  Training Phase
                </label>
                <select
                  value={newPlanPhase}
                  onChange={(e) => setNewPlanPhase(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-[#2c2c2c] text-white text-sm focus:outline-none focus:border-liftr-purple"
                >
                  {PHASES.map((ph) => (
                    <option key={ph} value={ph}>
                      {ph}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-liftr-grey mb-1.5">
                  Description / Goals
                </label>
                <textarea
                  rows={2}
                  value={newPlanDesc}
                  onChange={(e) => setNewPlanDesc(e.target.value)}
                  placeholder="Focus on compound strength and deload every 6th week..."
                  className="w-full px-3.5 py-2 rounded-lg bg-[#181818] border border-[#2c2c2c] text-white text-sm focus:outline-none focus:border-liftr-purple resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewPlanModalOpen(false)}
                  className="px-4 py-2 rounded bg-[#1C1C1C] text-xs font-mono uppercase text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-liftr-purple hover:bg-liftr-purple-dark text-white text-xs font-mono uppercase font-bold shadow-neo"
                >
                  Create Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Exercise Modal */}
      {isAddExerciseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bento-card p-6 w-full max-w-md border-2 border-border shadow-neo-purple">
            <h3 className="text-base font-bold text-white mb-4">
              Select Movement to Add
            </h3>
            <form onSubmit={handleAddExerciseToCurrentDay} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-liftr-grey mb-1.5">
                  Choose from Library
                </label>
                <select
                  value={selectedExerciseId}
                  onChange={(e) => setSelectedExerciseId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-[#2c2c2c] text-white text-sm focus:outline-none focus:border-liftr-purple"
                >
                  {exercises.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name} ({ex.primaryMuscleGroup} • {ex.equipment})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddExerciseModalOpen(false)}
                  className="px-4 py-2 rounded bg-[#1C1C1C] text-xs font-mono uppercase text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-liftr-purple hover:bg-liftr-purple-dark text-white text-xs font-mono uppercase font-bold shadow-neo"
                >
                  Add Movement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
