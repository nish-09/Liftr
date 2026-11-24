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
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PlanExerciseRow } from "@/components/plans/PlanExerciseRow";
import { NewPlanModal, AddPlanExerciseModal } from "@/components/plans/PlanModals";

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
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");
  const activeSelectedExerciseId = selectedExerciseId || exercises[0]?.id || "";

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
    if (!currentPlan || !currentDay || !activeSelectedExerciseId) return;

    const exMeta = exercises.find((ex) => ex.id === activeSelectedExerciseId);
    addExerciseToDay(currentPlan.id, currentDay.id, activeSelectedExerciseId, {
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
          targetReps: pe.maxReps || 12,
          restDuration: pe.restDuration || exMeta?.defaultRestDuration || 120,
          notes: pe.notes || null,
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
            <h1 className="font-heading font-black text-3xl md:text-4xl text-[#171717] tracking-tight uppercase">
              WORKOUT PLANS
            </h1>
            <span className="px-2.5 py-1 rounded-lg bg-[#3155F5] text-white border-2 border-[#171717] text-xs font-mono font-bold shadow-neo-sm">
              {plans.length} Routines
            </span>
          </div>
          <p className="text-sm text-[#171717]/70 font-sans mt-1">
            Architect your multi-day splits, set rep target ranges, and configure progression parameters.
          </p>
        </div>

        <button
          onClick={() => setIsNewPlanModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#3155F5] hover:bg-[#2542C7] text-white text-xs font-mono font-black uppercase tracking-wider border-2 border-[#171717] shadow-neo cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Workout Plan</span>
        </button>
      </div>

      {/* Main Grid: Plan Selector & Plan Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Plan Cards List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-mono uppercase font-black tracking-wider text-[#171717]/70 px-1">
            Available Routines
          </div>

          {plans.length === 0 ? (
            <div className="bg-white border-2 border-[#171717] rounded-xl shadow-neo p-6 text-center space-y-3">
              <p className="text-xs font-mono font-bold text-[#171717]/70">No plans created</p>
              <button
                onClick={() => setIsNewPlanModalOpen(true)}
                className="w-full py-2 px-3 rounded-lg bg-[#E9F56A] hover:bg-[#dae852] text-[#171717] border-2 border-[#171717] text-xs font-mono font-black uppercase shadow-neo-sm cursor-pointer"
              >
                + New Plan
              </button>
            </div>
          ) : (
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
                      "p-4 rounded-xl border-2 border-[#171717] transition-all cursor-pointer relative group",
                      isSelected
                        ? "bg-[#3155F5] text-white shadow-neo"
                        : "bg-white text-[#171717] shadow-neo-sm hover:shadow-neo hover:translate-x-0.5"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={cn(
                            "text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md border-2 border-[#171717] font-black shadow-neo-sm",
                            isSelected
                              ? "bg-[#E9F56A] text-[#171717]"
                              : "bg-[#B9A5EF] text-[#171717]"
                          )}
                        >
                          {plan.phaseId || "General"}
                        </span>
                        {plan.isActive && (
                          <span
                            className={cn(
                              "text-[10px] font-mono uppercase px-2 py-0.5 rounded-md border-2 border-[#171717] flex items-center gap-1 font-black shadow-neo-sm",
                              isSelected
                                ? "bg-white text-[#171717]"
                                : "bg-[#E9F56A] text-[#171717]"
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
                            "p-1.5 rounded-md border-2 border-[#171717] transition-all shadow-neo-sm",
                            isSelected
                              ? "bg-white text-[#171717] hover:bg-[#E9F56A]"
                              : "bg-[#F5F1E8] text-[#171717] hover:bg-[#3155F5] hover:text-white"
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
                            className="p-1.5 rounded-md border-2 border-[#171717] bg-[#FF7043] text-white hover:bg-[#e85d30] transition-all shadow-neo-sm"
                            title="Delete Plan"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    <h3
                      className={cn(
                        "font-heading font-black text-base tracking-tight leading-tight uppercase",
                        isSelected ? "text-white" : "text-[#171717] group-hover:text-[#3155F5]"
                      )}
                    >
                      {plan.name}
                    </h3>

                    {plan.description && (
                      <p
                        className={cn(
                          "text-xs mt-1 line-clamp-2 font-sans",
                          isSelected ? "text-white/80" : "text-[#171717]/70"
                        )}
                      >
                        {plan.description}
                      </p>
                    )}

                    <div
                      className={cn(
                        "mt-3 pt-2.5 border-t-2 flex items-center justify-between text-xs font-mono",
                        isSelected
                          ? "border-white/20 text-white/80"
                          : "border-[#171717]/15 text-[#171717]/70"
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
                          className="px-2 py-0.5 rounded-md bg-[#E9F56A] hover:bg-[#dae852] text-[#171717] border-2 border-[#171717] text-[10px] font-mono font-black uppercase shadow-neo-sm cursor-pointer"
                        >
                          Set Active
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Active Plan Day Editor */}
        <div className="lg:col-span-8 space-y-4">
          {currentPlan ? (
            <div className="bg-white border-2 border-[#171717] rounded-xl shadow-neo p-5 space-y-5">
              {/* Plan Meta Edit Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-[#171717]/15">
                <div className="flex-1">
                  <input
                    type="text"
                    value={currentPlan.name}
                    onChange={(e) =>
                      updatePlan(currentPlan.id, { name: e.target.value })
                    }
                    className="font-heading font-black text-xl md:text-2xl text-[#171717] bg-[#F5F1E8] border-2 border-[#171717] px-3 py-1.5 rounded-lg shadow-neo-sm focus:outline-none focus:ring-2 focus:ring-[#3155F5] w-full max-w-md uppercase tracking-tight"
                  />
                  <input
                    type="text"
                    value={currentPlan.description || ""}
                    onChange={(e) =>
                      updatePlan(currentPlan.id, { description: e.target.value })
                    }
                    placeholder="Add routine notes or cadence instructions..."
                    className="text-xs text-[#171717]/80 bg-[#F5F1E8] border-2 border-[#171717] px-3 py-1 rounded-lg mt-2 shadow-neo-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#3155F5] w-full max-w-md"
                  />
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <select
                    value={currentPlan.phaseId || "Bulking"}
                    onChange={(e) =>
                      updatePlan(currentPlan.id, { phaseId: e.target.value })
                    }
                    className="px-3 py-2 rounded-lg bg-[#F5F1E8] border-2 border-[#171717] text-xs font-mono font-bold text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#3155F5] shadow-neo-sm cursor-pointer"
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
                      className="px-3 py-2 rounded-lg bg-[#E9F56A] hover:bg-[#dae852] text-[#171717] border-2 border-[#171717] text-xs font-mono font-black uppercase shadow-neo-sm cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5"
                    >
                      Make Active
                    </button>
                  )}
                </div>
              </div>

              {/* Day Tabs */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono uppercase font-black tracking-wider text-[#171717]/70">
                    Plan Split Days
                  </span>
                  <button
                    onClick={() =>
                      addDayToPlan(
                        currentPlan.id,
                        `Day ${currentPlan.days.length + 1} - Workout`
                      )
                    }
                    className="inline-flex items-center gap-1 text-xs font-mono font-bold uppercase text-[#3155F5] hover:text-[#171717] cursor-pointer"
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
                            ? "bg-[#3155F5] text-[#E9F56A] border-[#171717] shadow-neo-sm font-black"
                            : "bg-[#F5F1E8] text-[#171717]/80 border-[#171717]/30 hover:border-[#171717] hover:bg-white hover:text-[#171717] font-bold"
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
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#F5F1E8] border-2 border-[#171717] shadow-neo-sm">
                    <div>
                      <input
                        type="text"
                        value={currentDay.name}
                        onChange={(e) =>
                          updateDayName(currentPlan.id, currentDay.id, e.target.value)
                        }
                        className="font-heading font-black text-base text-[#171717] bg-white border-2 border-[#171717] px-2.5 py-1 rounded-lg shadow-neo-sm focus:outline-none focus:ring-2 focus:ring-[#3155F5] uppercase tracking-tight"
                      />
                      <div className="text-xs text-[#171717]/70 font-mono font-bold mt-1">
                        {currentDay.exercises.length} prescribed movements
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          duplicateDayInPlan(currentPlan.id, currentDay.id)
                        }
                        className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#E9F56A] border-2 border-[#171717] text-xs font-mono font-bold text-[#171717] flex items-center gap-1.5 shadow-neo-sm cursor-pointer"
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
                          className="px-3 py-1.5 rounded-lg bg-[#FF7043] text-white hover:bg-[#e85d30] border-2 border-[#171717] text-xs font-mono font-bold flex items-center gap-1.5 shadow-neo-sm cursor-pointer"
                          title="Remove Day"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleStartWorkoutFromDay(currentDay)}
                        className="px-4 py-2 rounded-lg bg-[#E9F56A] hover:bg-[#dae852] text-[#171717] border-2 border-[#171717] text-xs font-mono font-black uppercase tracking-wider shadow-neo flex items-center gap-1.5 cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5"
                      >
                        <Play className="w-3.5 h-3.5 fill-[#171717]" />
                        <span>Start Session</span>
                      </button>
                    </div>
                  </div>

                  {/* Exercise Rows */}
                  {currentDay.exercises.length === 0 ? (
                    <div className="p-8 text-center rounded-xl border-2 border-dashed border-[#171717]/30 bg-[#F5F1E8] space-y-3">
                      <p className="text-xs text-[#171717]/70 font-mono font-bold">
                        No exercises configured for this day yet.
                      </p>
                      <button
                        onClick={() => setIsAddExerciseModalOpen(true)}
                        className="px-4 py-2 rounded-lg bg-[#3155F5] text-white border-2 border-[#171717] text-xs font-mono font-bold uppercase shadow-neo-sm hover:bg-[#2542C7] cursor-pointer"
                      >
                        + Add First Movement
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {currentDay.exercises.map((pe, idx) => (
                        <PlanExerciseRow
                          key={pe.id}
                          planId={currentPlan.id}
                          dayId={currentDay.id}
                          planExercise={pe}
                          index={idx}
                          totalExercises={currentDay.exercises.length}
                          exerciseMeta={exercises.find((ex) => ex.id === pe.exerciseId)}
                          onMove={moveExerciseOrder}
                          onRemove={removeExerciseFromDay}
                          onUpdate={updatePlanExercise}
                        />
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => setIsAddExerciseModalOpen(true)}
                    className="w-full py-3 rounded-xl border-2 border-dashed border-[#171717] bg-white hover:bg-[#E9F56A] text-xs font-mono font-black uppercase tracking-wider text-[#171717] flex items-center justify-center gap-2 shadow-neo-sm transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Add Movement to {currentDay.name}</span>
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="bg-white border-2 border-[#171717] rounded-xl shadow-neo p-12 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-xl bg-[#3155F5]/10 border-2 border-[#171717] flex items-center justify-center text-[#3155F5]">
                <Plus className="w-8 h-8 stroke-[2.5]" />
              </div>
              <div className="space-y-1">
                <h3 className="font-heading font-black text-2xl text-[#171717] tracking-tight uppercase">
                  NO WORKOUT PLANS CREATED
                </h3>
                <p className="text-xs sm:text-sm text-[#171717]/70 max-w-md mx-auto font-sans leading-relaxed">
                  You haven&apos;t built any workout routines yet. Create a split (e.g. Upper / Lower, Push Pull Legs) to define target sets, rep ranges, rest intervals, and double progression increments.
                </p>
              </div>
              <button
                onClick={() => setIsNewPlanModalOpen(true)}
                className="px-6 py-3 rounded-lg bg-[#3155F5] hover:bg-[#2542C7] text-white text-xs font-heading font-black uppercase tracking-wider border-2 border-[#171717] shadow-neo cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5 inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Create First Workout Plan</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <NewPlanModal
        isOpen={isNewPlanModalOpen}
        name={newPlanName}
        phase={newPlanPhase}
        description={newPlanDesc}
        phases={PHASES}
        onNameChange={setNewPlanName}
        onPhaseChange={setNewPlanPhase}
        onDescriptionChange={setNewPlanDesc}
        onClose={() => setIsNewPlanModalOpen(false)}
        onSubmit={handleCreatePlan}
      />

      <AddPlanExerciseModal
        isOpen={isAddExerciseModalOpen}
        exercises={exercises}
        selectedExerciseId={activeSelectedExerciseId}
        onSelectExercise={setSelectedExerciseId}
        onClose={() => setIsAddExerciseModalOpen(false)}
        onSubmit={handleAddExerciseToCurrentDay}
      />
    </div>
  );
}
