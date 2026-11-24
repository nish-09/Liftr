"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePlanStore } from "@/stores/usePlanStore";
import { useExerciseStore } from "@/stores/useExerciseStore";
import { useWorkoutStore } from "@/stores/useWorkoutStore";
import { PlanDayItem, SessionExerciseItem, SetLogItem } from "@/types";
import { Plus, Copy, Trash2, CheckCircle2, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { PlanExerciseRow } from "@/components/plans/PlanExerciseRow";
import { NewPlanModal, AddPlanExerciseModal } from "@/components/plans/PlanModals";
import { PageHeader, PastelCard } from "@/components/ui/DesignSystem";

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

  const [selectedPlanId, setSelectedPlanId] = useState<string>(plans[0]?.id || "");
  const [selectedDayId, setSelectedDayId] = useState<string>(plans[0]?.days[0]?.id || "");

  const [isNewPlanModalOpen, setIsNewPlanModalOpen] = useState(false);
  const [newPlanName, setNewPlanName] = useState("");
  const [newPlanDesc, setNewPlanDesc] = useState("");
  const [newPlanPhase, setNewPlanPhase] = useState("Bulking");

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

    const sessionExercises: SessionExerciseItem[] = day.exercises.map((pe, exIdx) => {
      const exMeta = exercises.find((ex) => ex.id === pe.exerciseId);
      const sessionExerciseId = crypto.randomUUID();
      const sets: SetLogItem[] = Array.from({ length: pe.targetSets }).map((_, sIdx) => ({
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
      }));

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
    });

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
      <PageHeader
        title="Workout Plans"
        actions={
          <button
            onClick={() => setIsNewPlanModalOpen(true)}
            className="neo-btn min-h-[44px] px-4 py-2.5 rounded-xl bg-[#142746] text-white text-xs font-heading font-bold inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Plan</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Plan List */}
        <div className="lg:col-span-4 min-w-0 space-y-3">

          {plans.length === 0 ? (
            <PastelCard tone="white" className="p-6 text-center space-y-3">
              <p className="text-xs font-semibold text-[#8993A5]">No plans created yet</p>
              <button
                onClick={() => setIsNewPlanModalOpen(true)}
                className="neo-btn w-full py-2.5 px-3 rounded-xl bg-[#E9FF91] text-[#142746] text-xs font-bold cursor-pointer"
              >
                + New Plan
              </button>
            </PastelCard>
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
                      "p-4 rounded-2xl border-[1.5px] border-[#142746] transition-all cursor-pointer",
                      isSelected
                        ? "bg-[#BDF7B6] shadow-neo"
                        : "bg-white hover:bg-[#FAF9FD]"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 flex-wrap text-[11px] font-bold text-[#142746]/70">
                        <span>{plan.phaseId || "General"}</span>
                        {plan.isActive && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-[#142746] text-[10px] font-bold text-[#142746]">
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
                          className="p-1.5 rounded-lg border border-[#142746] bg-white hover:bg-[#E9FF91] cursor-pointer"
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
                            className="p-1.5 rounded-lg border border-[#142746] bg-[#F8C3B5] text-[#142746] cursor-pointer"
                            title="Delete Plan"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    <h3 className="font-heading font-extrabold text-base text-[#142746]">
                      {plan.name}
                    </h3>

                    {plan.description && (
                      <p className="text-xs text-[#142746]/70 mt-1 line-clamp-2">
                        {plan.description}
                      </p>
                    )}

                    <div className="mt-3 pt-2.5 border-t border-[#142746]/15 flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#142746]/80">
                        {plan.days.length} Days • {totalExercises} Movements
                      </span>
                      {!plan.isActive && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActivePlan(plan.id);
                          }}
                          className="px-2.5 py-0.5 rounded-full bg-[#E9FF91] border border-[#142746] text-[10px] font-bold cursor-pointer"
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

        {/* Right: Active Plan Day Editor */}
        <div className="lg:col-span-8 min-w-0">
          {currentPlan ? (
            <PastelCard tone="white" className="p-5 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#142746]/15">
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={currentPlan.name}
                    onChange={(e) => updatePlan(currentPlan.id, { name: e.target.value })}
                    className="font-heading font-extrabold text-lg md:text-xl text-[#142746] bg-[#FAF9FD] border-[1.5px] border-[#142746] px-3 py-1.5 rounded-xl focus:outline-none w-full max-w-md"
                  />
                  <input
                    type="text"
                    value={currentPlan.description || ""}
                    onChange={(e) =>
                      updatePlan(currentPlan.id, { description: e.target.value })
                    }
                    placeholder="Add routine notes or cadence instructions..."
                    className="text-xs text-[#142746]/80 bg-[#FAF9FD] border-[1.5px] border-[#142746] px-3 py-1.5 rounded-xl focus:outline-none w-full max-w-md"
                  />
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <select
                    value={currentPlan.phaseId || "Bulking"}
                    onChange={(e) =>
                      updatePlan(currentPlan.id, { phaseId: e.target.value })
                    }
                    className="px-3 py-2 rounded-xl bg-[#FAF9FD] border-[1.5px] border-[#142746] text-xs font-bold text-[#142746] cursor-pointer"
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
                      className="neo-btn px-3 py-2 rounded-xl bg-[#E9FF91] text-[#142746] text-xs font-bold cursor-pointer"
                    >
                      Make Active
                    </button>
                  )}
                </div>
              </div>

              {/* Day Tabs */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#142746]">
                    Days
                  </span>
                  <button
                    onClick={() =>
                      addDayToPlan(currentPlan.id, `Day ${currentPlan.days.length + 1} - Workout`)
                    }
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#142746] underline cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Day</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {currentPlan.days.map((day) => {
                    const isSelected = day.id === currentDay?.id;
                    return (
                      <button
                        key={day.id}
                        onClick={() => setSelectedDayId(day.id)}
                        className={cn(
                          "px-3.5 py-2 rounded-xl text-xs whitespace-nowrap transition-all border-[1.5px] flex items-center gap-2 cursor-pointer font-bold",
                          isSelected
                            ? "bg-[#E9FF91] text-[#142746] border-[#142746] shadow-neo-sm"
                            : "bg-[#FAF9FD] text-[#142746]/75 border-[#142746]/25 hover:border-[#142746]"
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

              {currentDay && (
                <div className="space-y-4 pt-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#EBCBF7]/50 border-[1.5px] border-[#142746]">
                    <div className="min-w-0 flex-1">
                      <input
                        type="text"
                        value={currentDay.name}
                        onChange={(e) =>
                          updateDayName(currentPlan.id, currentDay.id, e.target.value)
                        }
                        className="w-full sm:max-w-xs font-heading font-extrabold text-base text-[#142746] bg-white border-[1.5px] border-[#142746] px-2.5 py-1.5 rounded-xl focus:outline-none"
                      />
                      <div className="text-xs text-[#142746]/70 font-semibold mt-1">
                        {currentDay.exercises.length} prescribed movements
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => duplicateDayInPlan(currentPlan.id, currentDay.id)}
                        className="neo-btn min-h-[40px] px-3 py-1.5 rounded-xl bg-white text-xs font-bold text-[#142746] flex items-center gap-1.5 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Duplicate</span>
                      </button>

                      {currentPlan.days.length > 1 && (
                        <button
                          onClick={() => removeDayFromPlan(currentPlan.id, currentDay.id)}
                          className="neo-btn min-h-[40px] px-3 py-1.5 rounded-xl bg-[#F8C3B5] text-xs font-bold text-[#142746] flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleStartWorkoutFromDay(currentDay)}
                        className="neo-btn min-h-[42px] px-4 py-2 rounded-xl bg-[#142746] text-white text-xs font-heading font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-[#E9FF91] text-[#E9FF91]" />
                        <span>Start Session</span>
                      </button>
                    </div>
                  </div>

                  {currentDay.exercises.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl border-[1.5px] border-dashed border-[#142746]/30 bg-[#FAF9FD] space-y-3">
                      <p className="text-xs text-[#8993A5] font-semibold">
                        No exercises configured for this day yet.
                      </p>
                      <button
                        onClick={() => setIsAddExerciseModalOpen(true)}
                        className="neo-btn px-4 py-2 rounded-xl bg-[#E9FF91] text-[#142746] text-xs font-bold cursor-pointer"
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
                    className="w-full py-3 rounded-2xl border-[1.5px] border-dashed border-[#142746] bg-[#FAF9FD] hover:bg-[#E9FF91] text-xs font-heading font-bold text-[#142746] flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Movement to {currentDay.name}</span>
                  </button>
                </div>
              )}
            </PastelCard>
          ) : (
            <PastelCard tone="white" className="p-12 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#EBCBF7] border-[1.5px] border-[#142746] flex items-center justify-center text-[#142746]">
                <Plus className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-heading font-extrabold text-xl text-[#142746]">
                  No Workout Plans Created
                </h3>
                <p className="text-xs sm:text-sm text-[#8993A5] max-w-md mx-auto">
                  Create a split (e.g., Upper / Lower, Push Pull Legs) to define target sets, rep ranges, rest intervals, and progression increments.
                </p>
              </div>
              <button
                onClick={() => setIsNewPlanModalOpen(true)}
                className="neo-btn px-5 py-3 rounded-xl bg-[#142746] text-white text-xs font-heading font-bold inline-flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create First Workout Plan</span>
              </button>
            </PastelCard>
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
