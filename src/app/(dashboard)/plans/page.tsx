"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePlanStore } from "@/stores/usePlanStore";
import { useExerciseStore } from "@/stores/useExerciseStore";
import { useWorkoutStore } from "@/stores/useWorkoutStore";
import {
  PlanDayItem,
  SessionExerciseItem,
  SetLogItem,
} from "@/types";
import {
  Plus,
  Copy,
  Trash2,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  Play,
  X,
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
          <div className="flex items-center gap-3">
            <h1 className="font-heading font-black text-3xl md:text-4xl text-dark tracking-tight">
              WORKOUT PLANS
            </h1>
            <span className="px-2.5 py-1 rounded bg-forest text-cream border-2 border-dark text-xs font-mono font-bold shadow-neo-sm">
              {plans.length} Routines
            </span>
          </div>
          <p className="text-sm text-dark/70 font-sans mt-1">
            Architect your multi-day splits, set rep target ranges, and configure progression parameters.
          </p>
        </div>

        <button
          onClick={() => setIsNewPlanModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-forest hover:bg-forest/90 text-cream text-xs font-mono font-bold uppercase tracking-wider border-2 border-dark shadow-neo cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Workout Plan</span>
        </button>
      </div>

      {/* Main Grid: Plan Selector & Plan Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Plan Cards List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-mono uppercase font-black tracking-wider text-dark/70 px-1">
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
                    "p-4 rounded-xl border-2 border-dark transition-all cursor-pointer relative group",
                    isSelected
                      ? "bg-forest text-cream shadow-neo"
                      : "bg-cream text-dark shadow-neo-sm hover:shadow-neo hover:translate-x-0.5"
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={cn(
                          "text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border-2 border-dark font-black shadow-neo-sm",
                          isSelected
                            ? "bg-lime text-dark"
                            : "bg-lavender text-dark"
                        )}
                      >
                        {plan.phaseId || "General"}
                      </span>
                      {plan.isActive && (
                        <span
                          className={cn(
                            "text-[10px] font-mono uppercase px-2 py-0.5 rounded border-2 border-dark flex items-center gap-1 font-black shadow-neo-sm",
                            isSelected
                              ? "bg-cream text-dark"
                              : "bg-lime text-dark"
                          )}
                        >
                          <CheckCircle2 className="w-3 h-3 stroke-[2.5]" /> Active
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicatePlan(plan.id);
                        }}
                        className={cn(
                          "p-1.5 rounded-md border-2 border-dark transition-all shadow-neo-sm",
                          isSelected
                            ? "bg-cream text-dark hover:bg-white"
                            : "bg-white text-dark hover:bg-forest hover:text-cream"
                        )}
                        title="Duplicate Plan"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      {plans.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePlan(plan.id);
                          }}
                          className="p-1.5 rounded-md border-2 border-dark bg-orange text-cream hover:bg-orange/90 transition-all shadow-neo-sm"
                          title="Delete Plan"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3
                    className={cn(
                      "font-heading font-black text-base tracking-tight leading-tight",
                      isSelected ? "text-cream" : "text-dark group-hover:text-forest"
                    )}
                  >
                    {plan.name}
                  </h3>

                  {plan.description && (
                    <p
                      className={cn(
                        "text-xs mt-1 line-clamp-2 font-sans",
                        isSelected ? "text-cream/80" : "text-dark/70"
                      )}
                    >
                      {plan.description}
                    </p>
                  )}

                  <div
                    className={cn(
                      "mt-3 pt-2.5 border-t-2 flex items-center justify-between text-xs font-mono",
                      isSelected
                        ? "border-cream/20 text-cream/80"
                        : "border-dark/15 text-dark/70"
                    )}
                  >
                    <span className="font-bold">
                      {plan.days.length} Days • {totalExercises} Movements
                    </span>
                    {!plan.isActive && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActivePlan(plan.id);
                        }}
                        className="px-2 py-0.5 rounded bg-lime hover:bg-lime/90 text-dark border-2 border-dark text-[10px] font-mono font-black uppercase shadow-neo-sm cursor-pointer"
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
            <div className="bg-cream border-2 border-dark rounded-xl shadow-neo p-5 space-y-5">
              {/* Plan Meta Edit Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-dark/15">
                <div className="flex-1">
                  <input
                    type="text"
                    value={currentPlan.name}
                    onChange={(e) =>
                      updatePlan(currentPlan.id, { name: e.target.value })
                    }
                    className="font-heading font-black text-xl md:text-2xl text-dark bg-white border-2 border-dark px-3 py-1.5 rounded-lg shadow-neo-sm focus:outline-none focus:ring-2 focus:ring-forest w-full max-w-md"
                  />
                  <input
                    type="text"
                    value={currentPlan.description || ""}
                    onChange={(e) =>
                      updatePlan(currentPlan.id, { description: e.target.value })
                    }
                    placeholder="Add routine notes or cadence instructions..."
                    className="text-xs text-dark/80 bg-white border-2 border-dark px-3 py-1 rounded-lg mt-2 shadow-neo-sm font-sans focus:outline-none focus:ring-2 focus:ring-forest w-full max-w-md"
                  />
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <select
                    value={currentPlan.phaseId || "Bulking"}
                    onChange={(e) =>
                      updatePlan(currentPlan.id, { phaseId: e.target.value })
                    }
                    className="px-3 py-2 rounded-lg bg-white border-2 border-dark text-xs font-mono font-bold text-dark focus:outline-none focus:ring-2 focus:ring-forest shadow-neo-sm cursor-pointer"
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
                      className="px-3 py-2 rounded-lg bg-lime hover:bg-lime/90 text-dark border-2 border-dark text-xs font-mono font-black uppercase shadow-neo-sm cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5"
                    >
                      Make Active
                    </button>
                  )}
                </div>
              </div>

              {/* Day Tabs */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono uppercase font-black tracking-wider text-dark/70">
                    Plan Split Days
                  </span>
                  <button
                    onClick={() =>
                      addDayToPlan(
                        currentPlan.id,
                        `Day ${currentPlan.days.length + 1} - Workout`
                      )
                    }
                    className="inline-flex items-center gap-1 text-xs font-mono font-bold uppercase text-forest hover:text-dark cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
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
                          "px-3.5 py-2 rounded-lg text-xs font-mono whitespace-nowrap transition-all border-2 flex items-center gap-2 cursor-pointer",
                          isSelected
                            ? "bg-forest text-lime border-dark shadow-neo-sm font-black"
                            : "bg-white text-dark/80 border-dark/30 hover:border-dark hover:bg-white hover:text-dark font-bold"
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
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-white border-2 border-dark shadow-neo-sm">
                    <div>
                      <input
                        type="text"
                        value={currentDay.name}
                        onChange={(e) =>
                          updateDayName(currentPlan.id, currentDay.id, e.target.value)
                        }
                        className="font-heading font-black text-base text-dark bg-cream border-2 border-dark px-2.5 py-1 rounded-lg shadow-neo-sm focus:outline-none focus:ring-2 focus:ring-forest"
                      />
                      <div className="text-xs text-dark/70 font-mono font-bold mt-1">
                        {currentDay.exercises.length} prescribed movements
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          duplicateDayInPlan(currentPlan.id, currentDay.id)
                        }
                        className="px-3 py-1.5 rounded-lg bg-cream hover:bg-white border-2 border-dark text-xs font-mono font-bold text-dark flex items-center gap-1.5 shadow-neo-sm cursor-pointer"
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
                          className="px-3 py-1.5 rounded-lg bg-orange text-cream hover:bg-orange/90 border-2 border-dark text-xs font-mono font-bold flex items-center gap-1.5 shadow-neo-sm cursor-pointer"
                          title="Remove Day"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleStartWorkoutFromDay(currentDay)}
                        className="px-4 py-2 rounded-lg bg-lime hover:bg-lime/90 text-dark border-2 border-dark text-xs font-mono font-black uppercase tracking-wider shadow-neo flex items-center gap-1.5 cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5"
                      >
                        <Play className="w-3.5 h-3.5 fill-dark" />
                        <span>Start Session</span>
                      </button>
                    </div>
                  </div>

                  {/* Exercise Rows */}
                  {currentDay.exercises.length === 0 ? (
                    <div className="p-8 text-center rounded-xl border-2 border-dashed border-dark/30 bg-white/50 space-y-3">
                      <p className="text-xs text-dark/70 font-mono font-bold">
                        No exercises configured for this day yet.
                      </p>
                      <button
                        onClick={() => setIsAddExerciseModalOpen(true)}
                        className="px-4 py-2 rounded-lg bg-forest text-cream border-2 border-dark text-xs font-mono font-bold uppercase shadow-neo-sm hover:bg-forest/90 cursor-pointer"
                      >
                        + Add First Movement
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {currentDay.exercises.map((pe, idx) => {
                        const exMeta = exercises.find(
                          (ex) => ex.id === pe.exerciseId
                        );

                        return (
                          <div
                            key={pe.id}
                            className="p-3.5 rounded-xl bg-white border-2 border-dark shadow-neo-sm space-y-3"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5">
                                <span className="w-6 h-6 rounded-md bg-forest text-cream border-2 border-dark font-mono text-xs flex items-center justify-center font-black shadow-neo-sm">
                                  {idx + 1}
                                </span>
                                <div>
                                  <h4 className="font-heading font-black text-sm text-dark leading-tight">
                                    {exMeta?.name || "Exercise"}
                                  </h4>
                                  <span className="text-[10px] font-mono uppercase font-bold text-dark/60">
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
                                  className="p-1 rounded border-2 border-dark bg-cream hover:bg-white text-dark disabled:opacity-30 cursor-pointer"
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
                                  className="p-1 rounded border-2 border-dark bg-cream hover:bg-white text-dark disabled:opacity-30 cursor-pointer"
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
                                  className="p-1 rounded border-2 border-dark bg-orange text-cream hover:bg-orange/90 ml-1 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Configuration Fields: Sets, Reps, Weight, Rest, Step */}
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t-2 border-dark/10 text-xs">
                              <div>
                                <label className="text-[10px] font-mono uppercase font-bold text-dark/70 block mb-1">
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
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-cream border-2 border-dark text-dark font-mono font-bold text-xs focus:outline-none focus:ring-2 focus:ring-forest shadow-neo-sm"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] font-mono uppercase font-bold text-dark/70 block mb-1">
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
                                    className="w-full px-2 py-1.5 rounded-lg bg-cream border-2 border-dark text-dark font-mono font-bold text-xs text-center focus:outline-none focus:ring-2 focus:ring-forest shadow-neo-sm"
                                  />
                                  <span className="font-bold text-dark">-</span>
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
                                    className="w-full px-2 py-1.5 rounded-lg bg-cream border-2 border-dark text-dark font-mono font-bold text-xs text-center focus:outline-none focus:ring-2 focus:ring-forest shadow-neo-sm"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="text-[10px] font-mono uppercase font-bold text-dark/70 block mb-1">
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
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-cream border-2 border-dark text-dark font-mono font-bold text-xs focus:outline-none focus:ring-2 focus:ring-forest shadow-neo-sm"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] font-mono uppercase font-bold text-dark/70 block mb-1">
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
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-cream border-2 border-dark text-dark font-mono font-bold text-xs focus:outline-none focus:ring-2 focus:ring-forest shadow-neo-sm"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] font-mono uppercase font-bold text-dark/70 block mb-1">
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
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-cream border-2 border-dark text-dark font-mono font-bold text-xs focus:outline-none focus:ring-2 focus:ring-forest shadow-neo-sm"
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
                    className="w-full py-3 rounded-xl border-2 border-dashed border-dark bg-cream hover:bg-white text-xs font-mono font-bold uppercase tracking-wider text-dark flex items-center justify-center gap-2 shadow-neo-sm transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-cream border-3 border-dark rounded-xl shadow-neo-lg p-6 w-full max-w-md relative font-sans">
            <div className="flex items-center justify-between mb-4 border-b-2 border-dark/15 pb-3">
              <h3 className="font-heading font-black text-xl text-dark tracking-tight">
                CREATE NEW WORKOUT PLAN
              </h3>
              <button
                onClick={() => setIsNewPlanModalOpen(false)}
                className="p-1.5 rounded-lg border-2 border-dark bg-white hover:bg-forest hover:text-cream text-dark transition-all cursor-pointer shadow-neo-sm"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase font-bold text-dark mb-1.5">
                  Plan Name *
                </label>
                <input
                  type="text"
                  required
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                  placeholder="e.g., 4-Day Upper / Lower Wave"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white border-2 border-dark text-dark text-sm focus:outline-none focus:ring-2 focus:ring-forest font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase font-bold text-dark mb-1.5">
                  Training Phase
                </label>
                <select
                  value={newPlanPhase}
                  onChange={(e) => setNewPlanPhase(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white border-2 border-dark text-dark text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-forest cursor-pointer"
                >
                  {PHASES.map((ph) => (
                    <option key={ph} value={ph}>
                      {ph}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase font-bold text-dark mb-1.5">
                  Description / Goals
                </label>
                <textarea
                  rows={2}
                  value={newPlanDesc}
                  onChange={(e) => setNewPlanDesc(e.target.value)}
                  placeholder="Focus on compound strength and deload every 6th week..."
                  className="w-full px-3.5 py-2 rounded-lg bg-white border-2 border-dark text-dark text-sm focus:outline-none focus:ring-2 focus:ring-forest resize-none font-sans"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t-2 border-dark/15">
                <button
                  type="button"
                  onClick={() => setIsNewPlanModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg bg-white border-2 border-dark hover:bg-cream text-dark text-xs font-mono font-bold uppercase transition-all shadow-neo-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-lime hover:bg-lime/90 text-dark text-xs font-mono uppercase font-black tracking-wider border-2 border-dark shadow-neo cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-cream border-3 border-dark rounded-xl shadow-neo-lg p-6 w-full max-w-md relative font-sans">
            <div className="flex items-center justify-between mb-4 border-b-2 border-dark/15 pb-3">
              <h3 className="font-heading font-black text-xl text-dark tracking-tight">
                SELECT MOVEMENT TO ADD
              </h3>
              <button
                onClick={() => setIsAddExerciseModalOpen(false)}
                className="p-1.5 rounded-lg border-2 border-dark bg-white hover:bg-forest hover:text-cream text-dark transition-all cursor-pointer shadow-neo-sm"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            <form onSubmit={handleAddExerciseToCurrentDay} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase font-bold text-dark mb-1.5">
                  Choose from Library
                </label>
                <select
                  value={selectedExerciseId}
                  onChange={(e) => setSelectedExerciseId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white border-2 border-dark text-dark text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-forest cursor-pointer"
                >
                  {exercises.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name} ({ex.primaryMuscleGroup} • {ex.equipment})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t-2 border-dark/15">
                <button
                  type="button"
                  onClick={() => setIsAddExerciseModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg bg-white border-2 border-dark hover:bg-cream text-dark text-xs font-mono font-bold uppercase transition-all shadow-neo-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-lime hover:bg-lime/90 text-dark text-xs font-mono uppercase font-black tracking-wider border-2 border-dark shadow-neo cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5"
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
