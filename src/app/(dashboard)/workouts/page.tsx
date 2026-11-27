"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { useWorkoutStore } from "@/stores/useWorkoutStore";
import { useHistoryStore } from "@/stores/useHistoryStore";
import { useExerciseStore } from "@/stores/useExerciseStore";
import { calculateProgression, ProgressionSuggestion } from "@/lib/progression/engine";
import { calculateVolume } from "@/lib/calculations/strength";
import { formatDuration, cn } from "@/lib/utils";
import { SetType, PersonalRecordItem, MuscleGroup } from "@/types";
import { PastelCard, PastelBadge, PageHeader } from "@/components/ui/DesignSystem";
import {
  Play,
  Check,
  Plus,
  Trash2,
  Timer,
  Award,
  ChevronRight,
  X,
  RefreshCw,
  Dumbbell,
  Flame,
  Pause,
  Search,
} from "lucide-react";

interface CompletionSummary {
  durationSeconds: number;
  totalVolume: number;
  exercisesCount: number;
  completedSetsCount: number;
  totalSetsCount: number;
  newPRs: PersonalRecordItem[];
}

export default function WorkoutsPage() {
  const {
    activeSession,
    startWorkout,
    updateSessionMeta,
    finishWorkout,
    discardWorkout,
    elapsedSeconds,
    tickElapsed,
    restTimer,
    pauseRestTimer,
    resumeRestTimer,
    addRestSeconds,
    addExerciseToWorkout,
    removeExerciseFromWorkout,
    addSetToExercise,
    deleteSetFromExercise,
    updateSet,
    toggleSetCompleted,
    syncStatus,
  } = useWorkoutStore();

  const { exercises } = useExerciseStore();
  const { addCompletedSession, getPreviousPerformance } = useHistoryStore();

  const [mounted, setMounted] = useState(false);
  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");
  const [addExerciseMuscle, setAddExerciseMuscle] = useState<MuscleGroup | "all">("all");
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionSummary, setCompletionSummary] = useState<CompletionSummary | null>(null);
  const [sessionNotes, setSessionNotes] = useState("");
  const [focusedExerciseId, setFocusedExerciseId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!activeSession) return;
    const interval = setInterval(() => {
      tickElapsed();
    }, 1000);
    return () => clearInterval(interval);
  }, [activeSession, tickElapsed]);

  if (!mounted) return null;

  let completedSetsCount = 0;
  let totalSetsCount = 0;
  let currentVolume = 0;

  if (activeSession) {
    activeSession.exercises.forEach((ex) => {
      totalSetsCount += ex.sets.length;
      completedSetsCount += ex.sets.filter((s) => s.isCompleted).length;
      currentVolume += calculateVolume(ex.sets);
    });
  }

  // Highlight user-selected exercise, or automatically highlight first incomplete movement
  const activeExerciseId =
    focusedExerciseId ||
    activeSession?.exercises.find((ex) => ex.sets.some((s) => !s.isCompleted))?.id ||
    activeSession?.exercises[0]?.id ||
    null;

  function handleStartEmptySession() {
    startWorkout({ name: "Full Body Functional Session" });
  }

  function handleAddExercise(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedExerciseId) return;
    const exMeta = exercises.find((ex) => ex.id === selectedExerciseId);
    addExerciseToWorkout(selectedExerciseId, exMeta?.name, 3);
    setIsAddExerciseOpen(false);
  }

  function handleFinishSession() {
    if (!activeSession) return;
    const finished = finishWorkout();
    if (!finished) return;

    const { newPRs } = addCompletedSession({
      ...finished,
      notes: sessionNotes || finished.notes,
    });

    setCompletionSummary({
      durationSeconds: finished.durationSeconds,
      totalVolume: finished.totalVolume,
      exercisesCount: finished.exercises.length,
      completedSetsCount,
      totalSetsCount,
      newPRs,
    });

    setShowCompletionModal(true);

    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#BDF7B6", "#E9FF91", "#EBCBF7", "#F8C3B5", "#142746"],
      });
    } catch {
      // Confetti fallback
    }
  }

  // Empty / Launcher View
  if (!activeSession) {
    return (
      <div className="space-y-6">
        <PageHeader title="Live Workout" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <PastelCard tone="lime" className="p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-white border-[1.5px] border-[#142746] flex items-center justify-center">
                <Play className="w-5 h-5 fill-[#142746] text-[#142746] ml-0.5" />
              </div>
              <div>
                <h2 className="text-xl font-heading font-extrabold text-[#142746]">
                  Empty Workout
                </h2>
                <p className="text-xs sm:text-sm text-[#142746]/75 mt-1 leading-relaxed">
                  Add exercises and log sets as you go.
                </p>
              </div>
            </div>

            <button
              onClick={handleStartEmptySession}
              className="neo-btn w-full py-3.5 px-5 rounded-xl bg-[#142746] hover:bg-[#1e3863] text-white font-heading font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-[#E9FF91] text-[#E9FF91]" />
              <span>Start Empty Workout</span>
            </button>
          </PastelCard>

          <PastelCard tone="white" className="p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-[#BDF7B6] border-[1.5px] border-[#142746] flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-[#142746]" />
              </div>
              <div>
                <h2 className="text-xl font-heading font-extrabold text-[#142746]">
                  From a Plan
                </h2>
                <p className="text-xs sm:text-sm text-[#142746]/75 mt-1 leading-relaxed">
                  Load exercises, target rep ranges, and rest durations from a routine.
                </p>
              </div>
            </div>

            <Link
              href="/plans"
              className="neo-btn w-full py-3.5 px-5 rounded-xl bg-[#E9FF91] hover:bg-[#dff67c] text-[#142746] font-heading font-bold text-sm flex items-center justify-center gap-2"
            >
              <span>Browse Plans</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </PastelCard>
        </div>
      </div>
    );
  }

  const restMins = Math.floor(restTimer.remainingSeconds / 60);
  const restSecs = restTimer.remainingSeconds % 60;
  const formattedRest = `${restMins}:${restSecs < 10 ? "0" : ""}${restSecs}`;

  return (
    <div className="space-y-5 pb-10">
      {/* Sticky Active Session Header on desktop */}
      <PastelCard
        tone="lime"
        className="p-4 sm:p-5 lg:sticky lg:top-[65px] z-20 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
      >
        <div className="min-w-0 flex-1">
          <input
            type="text"
            value={activeSession.name}
            onChange={(e) => updateSessionMeta({ name: e.target.value })}
            aria-label="Workout Name"
            className="w-full min-h-[40px] text-lg sm:text-xl font-heading font-extrabold text-[#142746] bg-transparent border-b border-transparent hover:border-[#142746]/40 focus:border-[#142746] focus:outline-none transition-colors"
          />
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#142746]/65 capitalize">
            <RefreshCw className="w-3 h-3" />
            {syncStatus}
          </span>
        </div>

        {/* Live Metrics & Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full lg:w-auto">
          <div className="flex items-center justify-between sm:justify-start gap-2.5 sm:gap-3 px-3 sm:px-3.5 py-2 rounded-xl bg-white border-[1.5px] border-[#142746] text-xs w-full sm:w-auto">
            <div>
              <span className="text-[10px] text-[#8993A5] block font-semibold">Time</span>
              <span className="font-extrabold stat-number text-[#142746]">
                {formatDuration(elapsedSeconds)}
              </span>
            </div>
            <div className="h-6 w-px bg-[#142746]/15" />
            <div>
              <span className="text-[10px] text-[#8993A5] block font-semibold">Volume</span>
              <span className="font-extrabold stat-number text-[#142746]">
                {currentVolume.toLocaleString()} kg
              </span>
            </div>
            <div className="h-6 w-px bg-[#142746]/15" />
            <div>
              <span className="text-[10px] text-[#8993A5] block font-semibold">Sets</span>
              <span className="font-extrabold stat-number text-[#142746]">
                {completedSetsCount}/{totalSetsCount}
              </span>
            </div>
          </div>

          <button
            onClick={handleFinishSession}
            className="neo-btn min-h-[44px] px-4 py-2.5 rounded-xl bg-[#142746] hover:bg-[#1e3863] text-white font-heading text-xs font-bold flex items-center justify-center gap-1.5 flex-1 sm:flex-initial cursor-pointer"
          >
            <Check className="w-4 h-4 text-[#BDF7B6] stroke-[2.5]" />
            <span>Finish Workout</span>
          </button>

          <button
            onClick={() => {
              if (confirm("Discard this active workout session?")) {
                discardWorkout();
              }
            }}
            className="neo-btn min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-[#F8C3B5] text-[#142746] cursor-pointer shrink-0"
            title="Discard Session"
            aria-label="Discard Session"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </PastelCard>

      {/* Prominent Inline Rest Timer Banner when active */}
      {(restTimer.isRunning || restTimer.remainingSeconds > 0) && (
        <PastelCard
          tone="green"
          className="px-4 py-3 flex flex-wrap items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white border-[1.5px] border-[#142746]">
              <Timer className="w-4 h-4 text-[#142746]" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-[#142746]/70 uppercase">
                Rest Timer {restTimer.setNumber ? `• Set ${restTimer.setNumber}` : ""}
              </div>
              <div className="text-xl font-extrabold stat-number text-[#142746]">
                {formattedRest}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => addRestSeconds(15)}
              className="neo-btn min-h-[42px] px-3 py-1.5 rounded-lg bg-white text-xs font-bold cursor-pointer"
            >
              +15s
            </button>
            <button
              type="button"
              onClick={() => addRestSeconds(30)}
              className="neo-btn min-h-[42px] px-3 py-1.5 rounded-lg bg-white text-xs font-bold cursor-pointer"
            >
              +30s
            </button>
            {restTimer.isRunning ? (
              <button
                type="button"
                onClick={pauseRestTimer}
                className="neo-btn min-h-[42px] px-3.5 py-1.5 rounded-lg bg-[#142746] text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
              >
                <Pause className="w-3.5 h-3.5" />
                Pause
              </button>
            ) : (
              <button
                type="button"
                onClick={resumeRestTimer}
                className="neo-btn min-h-[42px] px-3.5 py-1.5 rounded-lg bg-[#E9FF91] text-[#142746] text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-[#142746]" />
                Resume
              </button>
            )}
          </div>
        </PastelCard>
      )}

      {/* Exercise Cards */}
      <div className="space-y-5">
        {activeSession.exercises.map((sessionEx, exIdx) => {
          const exMeta =
            exercises.find((ex) => ex.id === sessionEx.exerciseId) || sessionEx.exercise;
          const isHighlighted = activeExerciseId === sessionEx.id;
          const completedInEx = sessionEx.sets.filter((s) => s.isCompleted).length;

          return (
            <PastelCard
              key={sessionEx.id}
              tone="white"
              onClick={() => setFocusedExerciseId(sessionEx.id)}
              className={cn(
                "p-4 sm:p-5 space-y-4 transition-all",
                isHighlighted && "ring-2 ring-[#142746] bg-[#FAF9FD]"
              )}
            >
              {/* Exercise Header */}
              <div className="flex items-start justify-between gap-3 border-b border-[#142746]/15 pb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={cn(
                      "w-9 h-9 rounded-xl border-[1.5px] border-[#142746] font-extrabold text-sm flex items-center justify-center shrink-0 shadow-neo-sm",
                      isHighlighted ? "bg-[#E9FF91]" : "bg-[#EBCBF7]"
                    )}
                  >
                    {exIdx + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-heading font-extrabold text-[#142746] truncate">
                        {exMeta?.name || "Exercise"}
                      </h3>
                      {isHighlighted && (
                        <PastelBadge tone="lime" className="text-[10px]">
                          Active
                        </PastelBadge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#8993A5] mt-0.5 flex-wrap">
                      <span className="capitalize font-semibold text-[#142746]">
                        {exMeta?.primaryMuscleGroup?.replace("_", " ")}
                        {exMeta?.targetMusclePart ? ` (${exMeta.targetMusclePart})` : ""}
                      </span>
                      <span>•</span>
                      <span className="capitalize">{exMeta?.equipment?.replace("_", " ")}</span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <Timer className="w-3.5 h-3.5 text-[#142746]" />
                        {sessionEx.restDuration || exMeta?.defaultRestDuration || 90}s rest
                      </span>
                      <span>•</span>
                      <span className="font-bold text-[#142746]">
                        {completedInEx}/{sessionEx.sets.length} sets
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeExerciseFromWorkout(sessionEx.id);
                  }}
                  className="p-2 rounded-xl hover:bg-[#F8C3B5] border border-transparent hover:border-[#142746] text-[#8993A5] hover:text-[#142746] transition-colors cursor-pointer"
                  title="Remove Exercise"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Desktop Table Layout */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b-[1.5px] border-[#142746] text-[#8993A5] text-[11px] uppercase font-bold tracking-wider">
                      <th className="py-2 px-2 w-14 text-center">Set</th>
                      <th className="py-2 px-2 min-w-[120px]">Previous</th>
                      <th className="py-2 px-2 min-w-[160px]">Today&apos;s Target</th>
                      <th className="py-2 px-2 min-w-[130px]">Weight (kg)</th>
                      <th className="py-2 px-2 min-w-[115px]">Reps</th>
                      <th className="py-2 px-2 w-16 text-center">Done</th>
                      <th className="py-2 px-1 w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#142746]/10">
                    {sessionEx.sets.map((setLog) => {
                      const prevPerformance = getPreviousPerformance(
                        sessionEx.exerciseId,
                        setLog.setNumber,
                        activeSession.planDayId
                      );
                      const progression: ProgressionSuggestion = calculateProgression({
                        exerciseId: sessionEx.exerciseId,
                        setNumber: setLog.setNumber,
                        minReps: 8,
                        maxReps: 12,
                        increment: exMeta?.progressionIncrement || 2.5,
                        previousWeight: prevPerformance?.previousWeight,
                        previousReps: prevPerformance?.previousReps,
                        progressionEnabled: true,
                      });
                      const isCompleted = setLog.isCompleted;

                      return (
                        <tr
                          key={setLog.id}
                          className={cn(
                            "transition-colors",
                            isCompleted ? "bg-[#BDF7B6]/45" : "hover:bg-[#FAF9FD]"
                          )}
                        >
                          <td className="py-2.5 px-2 text-center">
                            <select
                              value={setLog.setType}
                              onChange={(e) =>
                                updateSet(sessionEx.id, setLog.id, {
                                  setType: e.target.value as SetType,
                                })
                              }
                              className={cn(
                                "text-xs font-bold rounded-lg px-2 py-1 border-[1.5px] border-[#142746] cursor-pointer",
                                setLog.setType === "warmup"
                                  ? "bg-[#EBCBF7]"
                                  : setLog.setType === "drop"
                                  ? "bg-[#F8C3B5]"
                                  : "bg-white"
                              )}
                            >
                              <option value="normal">{setLog.setNumber}</option>
                              <option value="warmup">W</option>
                              <option value="drop">D</option>
                            </select>
                          </td>

                          <td className="py-2.5 px-2 text-[#142746]/80 font-semibold">
                            {prevPerformance ? (
                              <span>
                                {prevPerformance.previousWeight} kg × {prevPerformance.previousReps}
                              </span>
                            ) : (
                              <span className="text-[#8993A5]">—</span>
                            )}
                          </td>

                          <td className="py-2.5 px-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-[#142746]">
                                {progression.targetWeight > 0
                                  ? `${progression.targetWeight} kg × ${progression.targetReps}`
                                  : `${progression.targetReps} reps`}
                              </span>
                              {progression.reasonType === "WEIGHT_INCREASE" && (
                                <span
                                  className="text-[10px] px-2 py-0.5 rounded-full bg-[#E9FF91] border border-[#142746] font-bold"
                                  title={progression.explanation}
                                >
                                  +Weight
                                </span>
                              )}
                              {progression.reasonType === "REP_PROGRESSION" && (
                                <span
                                  className="text-[10px] px-2 py-0.5 rounded-full bg-[#BDF7B6] border border-[#142746] font-bold"
                                  title={progression.explanation}
                                >
                                  +1 Rep
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-2.5 px-2">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  updateSet(sessionEx.id, setLog.id, {
                                    weight: Math.max(0, Number((setLog.weight - 2.5).toFixed(2))),
                                  })
                                }
                                className="w-7 h-8 rounded-lg bg-white hover:bg-[#E9FF91] text-[#142746] font-bold border border-[#142746] cursor-pointer"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                step={0.5}
                                min={0}
                                value={setLog.weight === 0 ? "" : setLog.weight}
                                onChange={(e) =>
                                  updateSet(sessionEx.id, setLog.id, {
                                    weight: Number(e.target.value) || 0,
                                  })
                                }
                                placeholder="0"
                                className="w-16 px-2 py-1.5 rounded-lg bg-white border-[1.5px] border-[#142746] text-[#142746] text-center font-bold text-xs focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  updateSet(sessionEx.id, setLog.id, {
                                    weight: Number((setLog.weight + 2.5).toFixed(2)),
                                  })
                                }
                                className="w-7 h-8 rounded-lg bg-white hover:bg-[#E9FF91] text-[#142746] font-bold border border-[#142746] cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </td>

                          <td className="py-2.5 px-2">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  updateSet(sessionEx.id, setLog.id, {
                                    reps: Math.max(0, setLog.reps - 1),
                                  })
                                }
                                className="w-7 h-8 rounded-lg bg-white hover:bg-[#E9FF91] text-[#142746] font-bold border border-[#142746] cursor-pointer"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min={0}
                                value={setLog.reps === 0 ? "" : setLog.reps}
                                onChange={(e) =>
                                  updateSet(sessionEx.id, setLog.id, {
                                    reps: parseInt(e.target.value, 10) || 0,
                                  })
                                }
                                placeholder="0"
                                className="w-14 px-2 py-1.5 rounded-lg bg-white border-[1.5px] border-[#142746] text-[#142746] text-center font-bold text-xs focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  updateSet(sessionEx.id, setLog.id, { reps: setLog.reps + 1 })
                                }
                                className="w-7 h-8 rounded-lg bg-white hover:bg-[#E9FF91] text-[#142746] font-bold border border-[#142746] cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </td>

                          <td className="py-2.5 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => toggleSetCompleted(sessionEx.id, setLog.id)}
                              className={cn(
                                "w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer mx-auto border-[1.5px] border-[#142746]",
                                isCompleted
                                  ? "bg-[#BDF7B6] text-[#142746] shadow-neo-sm"
                                  : "bg-white text-transparent hover:bg-[#E9FF91]/40"
                              )}
                            >
                              <Check className="w-4 h-4 stroke-[3]" />
                            </button>
                          </td>

                          <td className="py-2.5 px-1 text-center">
                            <button
                              type="button"
                              onClick={() => deleteSetFromExercise(sessionEx.id, setLog.id)}
                              className="p-1.5 rounded-lg text-[#8993A5] hover:text-[#142746] hover:bg-[#F8C3B5] cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile & Tablet Card Set View (Touch-friendly) */}
              <div className="lg:hidden space-y-3">
                {sessionEx.sets.map((setLog) => {
                  const prevPerformance = getPreviousPerformance(
                    sessionEx.exerciseId,
                    setLog.setNumber,
                    activeSession.planDayId
                  );
                  const progression = calculateProgression({
                    exerciseId: sessionEx.exerciseId,
                    setNumber: setLog.setNumber,
                    minReps: 8,
                    maxReps: 12,
                    increment: exMeta?.progressionIncrement || 2.5,
                    previousWeight: prevPerformance?.previousWeight,
                    previousReps: prevPerformance?.previousReps,
                    progressionEnabled: true,
                  });
                  const isCompleted = setLog.isCompleted;

                  return (
                    <div
                      key={setLog.id}
                      className={cn(
                        "p-3.5 rounded-2xl border-[1.5px] border-[#142746] space-y-3 transition-colors",
                        isCompleted ? "bg-[#BDF7B6]/60" : "bg-white"
                      )}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2 min-w-0">
                          <select
                            value={setLog.setType}
                            onChange={(e) =>
                              updateSet(sessionEx.id, setLog.id, {
                                setType: e.target.value as SetType,
                              })
                            }
                            className="min-h-[40px] text-xs font-bold rounded-lg px-2.5 py-1.5 border-[1.5px] border-[#142746] bg-white"
                          >
                            <option value="normal">Set {setLog.setNumber}</option>
                            <option value="warmup">Warmup</option>
                            <option value="drop">Drop</option>
                          </select>
                          <div className="text-xs text-[#8993A5] font-medium flex flex-wrap items-center gap-x-2">
                            {prevPerformance && (
                              <span>
                                Prev:{" "}
                                <strong className="text-[#142746]">
                                  {prevPerformance.previousWeight}kg × {prevPerformance.previousReps}
                                </strong>
                              </span>
                            )}
                            <span>
                              Target:{" "}
                              <strong className="text-[#142746]">
                                {progression.targetWeight > 0
                                  ? `${progression.targetWeight}kg × ${progression.targetReps}`
                                  : `${progression.targetReps} reps`}
                              </strong>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 ml-auto">
                          <button
                            type="button"
                            onClick={() => toggleSetCompleted(sessionEx.id, setLog.id)}
                            className={cn(
                              "min-h-[44px] px-3.5 py-2 rounded-xl border-[1.5px] border-[#142746] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer",
                              isCompleted ? "bg-[#142746] text-[#BDF7B6]" : "bg-[#E9FF91] text-[#142746]"
                            )}
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                            {isCompleted ? "Done" : "Complete"}
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteSetFromExercise(sessionEx.id, setLog.id)}
                            aria-label="Delete Set"
                            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl border border-[#142746]/25 text-[#8993A5] hover:bg-[#F8C3B5] hover:text-[#142746]"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-3">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-[#8993A5] block mb-1">
                            Weight (kg)
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                updateSet(sessionEx.id, setLog.id, {
                                  weight: Math.max(0, Number((setLog.weight - 2.5).toFixed(2))),
                                })
                              }
                              className="w-11 h-11 shrink-0 rounded-xl bg-white border-[1.5px] border-[#142746] font-bold text-base cursor-pointer"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              inputMode="decimal"
                              step={0.5}
                              min={0}
                              value={setLog.weight === 0 ? "" : setLog.weight}
                              onChange={(e) =>
                                updateSet(sessionEx.id, setLog.id, {
                                  weight: Number(e.target.value) || 0,
                                })
                              }
                              placeholder="0"
                              className="w-full min-w-0 h-11 rounded-xl bg-white border-[1.5px] border-[#142746] text-center font-bold text-sm"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                updateSet(sessionEx.id, setLog.id, {
                                  weight: Number((setLog.weight + 2.5).toFixed(2)),
                                })
                              }
                              className="w-11 h-11 shrink-0 rounded-xl bg-white border-[1.5px] border-[#142746] font-bold text-base cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold uppercase text-[#8993A5] block mb-1">
                            Reps
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                updateSet(sessionEx.id, setLog.id, {
                                  reps: Math.max(0, setLog.reps - 1),
                                })
                              }
                              className="w-11 h-11 shrink-0 rounded-xl bg-white border-[1.5px] border-[#142746] font-bold text-base cursor-pointer"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              inputMode="numeric"
                              min={0}
                              value={setLog.reps === 0 ? "" : setLog.reps}
                              onChange={(e) =>
                                updateSet(sessionEx.id, setLog.id, {
                                  reps: parseInt(e.target.value, 10) || 0,
                                })
                              }
                              placeholder="0"
                              className="w-full min-w-0 h-11 rounded-xl bg-white border-[1.5px] border-[#142746] text-center font-bold text-sm"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                updateSet(sessionEx.id, setLog.id, { reps: setLog.reps + 1 })
                              }
                              className="w-11 h-11 shrink-0 rounded-xl bg-white border-[1.5px] border-[#142746] font-bold text-base cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Set Actions */}
              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#142746]/15">
                <button
                  type="button"
                  onClick={() => addSetToExercise(sessionEx.id, "normal")}
                  className="neo-btn px-3.5 py-2 rounded-xl bg-[#142746] text-white text-xs font-heading font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Set</span>
                </button>
                <button
                  type="button"
                  onClick={() => addSetToExercise(sessionEx.id, "warmup")}
                  className="neo-btn px-3 py-2 rounded-xl bg-[#EBCBF7] text-[#142746] text-xs font-bold cursor-pointer"
                >
                  + Warmup Set
                </button>
                <button
                  type="button"
                  onClick={() => addSetToExercise(sessionEx.id, "drop")}
                  className="neo-btn px-3 py-2 rounded-xl bg-[#F8C3B5] text-[#142746] text-xs font-bold cursor-pointer"
                >
                  + Drop Set
                </button>
              </div>
            </PastelCard>
          );
        })}

        {/* Add Exercise & Finish Session Footer */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setIsAddExerciseOpen(true)}
            className="flex-1 min-h-[48px] py-3.5 px-4 rounded-2xl border-[1.5px] border-dashed border-[#142746] bg-[#FAF9FD] hover:bg-[#E9FF91] text-[#142746] font-heading font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Exercise</span>
          </button>

          <button
            onClick={handleFinishSession}
            className="neo-btn lg:hidden min-h-[48px] py-3.5 px-5 rounded-2xl bg-[#142746] text-white font-heading font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4 text-[#BDF7B6] stroke-[2.5]" />
            <span>Finish &amp; Save Workout</span>
          </button>
        </div>
      </div>

      {/* Add Movement Modal */}
      {isAddExerciseOpen && (
        <div className="fixed inset-0 !m-0 z-50 flex items-center justify-center p-4 bg-[#142746]/50 backdrop-blur-sm overflow-y-auto w-full h-full min-h-[100dvh]">
          <PastelCard tone="white" className="p-5 sm:p-6 w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto my-auto space-y-4 shadow-neo-xl">
            <h3 className="text-lg font-heading font-extrabold text-[#142746]">
              Add Exercise to Live Session
            </h3>
            <form onSubmit={handleAddExercise} className="space-y-4">
              {exercises.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#FAF9FD] border-[1.5px] border-[#142746] text-center space-y-2">
                  <p className="text-xs text-[#8993A5]">
                    No exercises found in your library. Add custom exercises first.
                  </p>
                  <Link
                    href="/exercises"
                    className="neo-btn inline-block px-3 py-1.5 rounded-lg bg-[#E9FF91] text-[#142746] text-xs font-bold"
                  >
                    Go to Exercise Library →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#142746]">
                      Filter by Muscle Group
                    </label>
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                      {(
                        [
                          { label: "All", value: "all" },
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
                        ] as const
                      ).map((mg) => {
                        const isSelected = addExerciseMuscle === mg.value;
                        const count =
                          mg.value === "all"
                            ? exercises.length
                            : exercises.filter((e) => e.primaryMuscleGroup === mg.value).length;
                        return (
                          <button
                            key={mg.value}
                            type="button"
                            onClick={() => setAddExerciseMuscle(mg.value)}
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

                  <div>
                    <label className="block text-xs font-bold text-[#142746] mb-1.5">
                      Select Exercise *
                    </label>
                    <select
                      value={selectedExerciseId}
                      onChange={(e) => setSelectedExerciseId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border-[1.5px] border-[#142746] text-[#142746] text-xs font-bold cursor-pointer focus:outline-none"
                    >
                      <option value="">-- Choose Exercise --</option>
                      {exercises
                        .filter(
                          (ex) =>
                            addExerciseMuscle === "all" ||
                            ex.primaryMuscleGroup === addExerciseMuscle
                        )
                        .map((ex) => (
                          <option key={ex.id} value={ex.id}>
                            {ex.name} — {ex.primaryMuscleGroup.replace("_", " ")}
                            {ex.targetMusclePart ? ` (${ex.targetMusclePart})` : ""} • {ex.equipment}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddExerciseOpen(false)}
                  className="neo-btn px-4 py-2 rounded-xl bg-white text-xs font-bold text-[#142746] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedExerciseId}
                  className="neo-btn px-5 py-2 rounded-xl bg-[#142746] text-white text-xs font-bold disabled:opacity-40 cursor-pointer"
                >
                  Add Exercise
                </button>
              </div>
            </form>
          </PastelCard>
        </div>
      )}

      {/* Workout Completion Summary Modal */}
      {showCompletionModal && completionSummary && (
        <div className="fixed inset-0 !m-0 z-50 flex items-center justify-center p-4 bg-[#142746]/55 backdrop-blur-sm overflow-y-auto w-full h-full min-h-[100dvh]">
          <PastelCard tone="green" className="p-5 sm:p-8 w-full max-w-lg max-h-[calc(100dvh-2rem)] overflow-y-auto my-auto space-y-6 shadow-neo-xl">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#E9FF91] border-[1.5px] border-[#142746] flex items-center justify-center text-[#142746] shadow-neo-sm">
                <Award className="w-7 h-7 stroke-[2.2]" />
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#142746]">
                Workout Completed
              </h2>
              <p className="text-xs text-[#142746]/75">
                Saved to your workout history.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl bg-white border-[1.5px] border-[#142746]">
                <span className="text-[10px] font-bold uppercase text-[#8993A5] block">
                  Duration
                </span>
                <span className="text-base font-extrabold stat-number text-[#142746]">
                  {formatDuration(completionSummary.durationSeconds)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white border-[1.5px] border-[#142746]">
                <span className="text-[10px] font-bold uppercase text-[#8993A5] block">
                  Volume
                </span>
                <span className="text-base font-extrabold stat-number text-[#142746]">
                  {completionSummary.totalVolume.toLocaleString()} kg
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white border-[1.5px] border-[#142746]">
                <span className="text-[10px] font-bold uppercase text-[#8993A5] block">
                  Sets Logged
                </span>
                <span className="text-base font-extrabold stat-number text-[#142746]">
                  {completionSummary.completedSetsCount}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white border-[1.5px] border-[#142746]">
                <span className="text-[10px] font-bold uppercase text-[#8993A5] block">
                  Movements
                </span>
                <span className="text-base font-extrabold stat-number text-[#142746]">
                  {completionSummary.exercisesCount}
                </span>
              </div>
            </div>

            {completionSummary.newPRs.length > 0 && (
              <div className="p-4 rounded-xl bg-[#F8C3B5] border-[1.5px] border-[#142746] text-[#142746] space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase">
                  <Flame className="w-4 h-4" />
                  <span>Personal Records Broken!</span>
                </div>
                <div className="space-y-1">
                  {completionSummary.newPRs.map((pr) => (
                    <div key={pr.id} className="text-xs flex items-center justify-between">
                      <span className="capitalize font-medium">{pr.prType.replace("_", " ")}</span>
                      <span className="font-extrabold">{pr.value} kg</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setShowCompletionModal(false);
                setSessionNotes("");
              }}
              className="neo-btn w-full py-3.5 rounded-xl bg-[#142746] text-white font-heading text-sm font-bold cursor-pointer"
            >
              Continue to Dashboard
            </button>
          </PastelCard>
        </div>
      )}
    </div>
  );
}
