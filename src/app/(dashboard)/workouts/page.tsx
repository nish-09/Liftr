"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { useWorkoutStore } from "@/stores/useWorkoutStore";
import { useHistoryStore } from "@/stores/useHistoryStore";
import { useExerciseStore } from "@/stores/useExerciseStore";
import { usePlanStore } from "@/stores/usePlanStore";
import { calculateProgression, ProgressionSuggestion } from "@/lib/progression/engine";
import { calculateVolume } from "@/lib/calculations/strength";
import { formatDuration, cn } from "@/lib/utils";
import { SetType, PersonalRecordItem } from "@/types";
import {
  Play,
  Check,
  Plus,
  Trash2,
  Timer,
  Award,
  ChevronDown,
  X,
  RefreshCw,
  Dumbbell,
  Flame,
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
    addExerciseToWorkout,
    removeExerciseFromWorkout,
    addSetToExercise,
    deleteSetFromExercise,
    updateSet,
    toggleSetCompleted,
    syncStatus,
  } = useWorkoutStore();

  const { exercises } = useExerciseStore();
  const { plans } = usePlanStore();
  const { addCompletedSession, getPreviousPerformance } = useHistoryStore();

  const [mounted, setMounted] = useState(false);
  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionSummary, setCompletionSummary] = useState<CompletionSummary | null>(null);
  const [sessionNotes, setSessionNotes] = useState("");

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

  function handleStartEmptySession() {
    startWorkout({
      name: "Full Body Functional Session",
    });
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
        colors: ["#3155F5", "#E9F56A", "#FF7043", "#B9A5EF"],
      });
    } catch {
      // Confetti fallback
    }
  }

  // If no workout is active, show the Quick Start & Plan Day Launcher
  if (!activeSession) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-3xl sm:text-4xl font-black text-[#171717] uppercase tracking-tight">
            Live Workout Command
          </h1>
          <p className="text-sm text-[#171717]/80 font-mono mt-0.5">
            Real-time double progression set logging with automated weight stepping and rest tracking.
          </p>
        </div>

        {/* Start Workout Bento Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quick Start Card (Electric Blue) */}
          <div className="bento-card-electric p-6 sm:p-7 flex flex-col justify-between space-y-6 rounded-xl border-2 border-[#171717] shadow-neo-lg">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-lg bg-[#E9F56A] border-2 border-[#171717] flex items-center justify-center text-[#171717] shadow-neo-sm">
                <Play className="w-6 h-6 fill-[#171717] ml-0.5" />
              </div>
              <div>
                <h2 className="text-2xl font-heading font-black text-white uppercase tracking-tight">
                  Start Empty Workout
                </h2>
                <p className="text-xs text-white/90 font-mono mt-1 leading-relaxed">
                  Build your workout on the fly. Select movements from your library, log sets, and test PRs with transparent double progression suggestions.
                </p>
              </div>
            </div>

            <button
              onClick={handleStartEmptySession}
              className="w-full py-3.5 px-6 rounded-lg bg-[#E9F56A] hover:bg-[#dae852] text-[#171717] font-heading font-black text-sm uppercase tracking-wider border-2 border-[#171717] shadow-neo flex items-center justify-center gap-2 transition-all active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-[#171717]" />
              <span>Launch Live Workout</span>
            </button>
          </div>

          {/* Start From Plan Card (Pure White) */}
          <div className="bento-card p-6 sm:p-7 flex flex-col justify-between space-y-6 rounded-xl border-2 border-[#171717] shadow-neo-lg">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-lg bg-[#3155F5] border-2 border-[#171717] flex items-center justify-center text-[#E9F56A] shadow-neo-sm">
                <Dumbbell className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-heading font-black text-[#171717] uppercase tracking-tight">
                  Start From Workout Plan
                </h2>
                <p className="text-xs text-[#171717]/75 font-mono mt-1 leading-relaxed">
                  Choose a prescribed training day from your custom routines to auto-populate targets, rep ranges, and historical baseline weights.
                </p>
              </div>
            </div>

            <Link
              href="/plans"
              className="w-full py-3.5 px-6 rounded-lg bg-[#3155F5] hover:bg-[#2542C7] text-white font-heading font-black text-xs uppercase tracking-wider text-center border-2 border-[#171717] shadow-neo flex items-center justify-center gap-2 transition-all active:translate-x-0.5 active:translate-y-0.5"
            >
              <span>Browse Workout Plans</span>
              <ChevronDown className="w-4 h-4 -rotate-90 text-[#E9F56A]" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Sticky Active Session Header Bar (Electric Blue) */}
      <div className="bento-card-electric p-4 sm:p-5 border-2 border-[#171717] shadow-neo-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-16 z-20 rounded-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E9F56A] border border-[#171717] animate-ping" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#E9F56A] font-black">
              Active Session
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#2542C7] text-white border border-[#171717] flex items-center gap-1 font-bold">
              <RefreshCw className="w-2.5 h-2.5 text-[#E9F56A]" />
              {syncStatus}
            </span>
          </div>

          <input
            type="text"
            value={activeSession.name}
            onChange={(e) => updateSessionMeta({ name: e.target.value })}
            className="text-lg sm:text-xl font-heading font-black text-white bg-transparent border-b-2 border-transparent hover:border-[#E9F56A]/50 focus:border-[#E9F56A] focus:outline-none transition-colors uppercase tracking-tight"
          />
        </div>

        {/* Live Metrics: Duration, Volume, Sets, Finish */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 px-3.5 py-1.5 rounded-lg bg-[#2542C7] border-2 border-[#171717] text-xs font-mono text-white shadow-neo-sm">
            <div>
              <span className="text-[10px] text-white/70 block uppercase font-bold">Time</span>
              <span className="font-bold text-white">{formatDuration(elapsedSeconds)}</span>
            </div>
            <div>
              <span className="text-[10px] text-white/70 block uppercase font-bold">Volume</span>
              <span className="font-bold text-[#E9F56A]">{currentVolume.toLocaleString()} kg</span>
            </div>
            <div>
              <span className="text-[10px] text-white/70 block uppercase font-bold">Sets</span>
              <span className="font-bold text-[#E9F56A]">
                {completedSetsCount}/{totalSetsCount}
              </span>
            </div>
          </div>

          <button
            onClick={handleFinishSession}
            className="px-4 py-2.5 rounded-lg bg-[#E9F56A] hover:bg-[#dae852] text-[#171717] font-heading text-xs uppercase font-black border-2 border-[#171717] shadow-neo cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-1.5"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Finish</span>
          </button>

          <button
            onClick={() => {
              if (confirm("Discard this active workout session?")) {
                discardWorkout();
              }
            }}
            className="p-2.5 rounded-lg bg-[#FF7043] hover:bg-[#e85d30] text-white border-2 border-[#171717] shadow-neo-sm transition-all cursor-pointer"
            title="Discard Session"
          >
            <Trash2 className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Exercise Cards (Pure White) */}
      <div className="space-y-5">
        {activeSession.exercises.map((sessionEx, exIdx) => {
          const exMeta =
            exercises.find((ex) => ex.id === sessionEx.exerciseId) || sessionEx.exercise;

          return (
            <div
              key={sessionEx.id}
              className="bento-card p-5 border-2 border-[#171717] shadow-neo rounded-xl space-y-4"
            >
              {/* Exercise Header */}
              <div className="flex items-start justify-between gap-3 border-b-2 border-[#171717]/15 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#3155F5] text-[#E9F56A] border-2 border-[#171717] font-mono text-sm font-black flex items-center justify-center shadow-neo-sm">
                    {exIdx + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-heading font-black text-[#171717] uppercase tracking-tight">
                      {exMeta?.name || "Exercise"}
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-mono text-[#171717]/80 mt-0.5">
                      <span className="uppercase font-black text-[#171717] px-1.5 py-0.5 rounded bg-[#E9F56A] border border-[#171717]">
                        {exMeta?.primaryMuscleGroup}
                      </span>
                      <span>•</span>
                      <span className="capitalize font-semibold">{exMeta?.equipment}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-semibold">
                        <Timer className="w-3.5 h-3.5 text-[#3155F5]" />
                        {exMeta?.defaultRestDuration || 90}s rest
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => removeExerciseFromWorkout(sessionEx.id)}
                  className="p-1.5 rounded-md hover:bg-[#FF7043] hover:text-white border border-transparent hover:border-[#171717] text-[#171717]/60 transition-colors"
                  title="Remove Exercise"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Set Logging Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b-2 border-[#171717] text-[#171717] text-[10px] uppercase font-black tracking-wider">
                      <th className="py-2 px-2 w-14 text-center">Set</th>
                      <th className="py-2 px-2 min-w-[130px]">Previous Session</th>
                      <th className="py-2 px-2 min-w-[160px]">Target Today</th>
                      <th className="py-2 px-2 min-w-[120px]">Weight (kg)</th>
                      <th className="py-2 px-2 min-w-[100px]">Reps</th>
                      <th className="py-2 px-2 w-16 text-center">Done</th>
                      <th className="py-2 px-1 w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-[#171717]/15">
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
                            isCompleted ? "bg-[#E9F56A]/25 font-bold" : "hover:bg-[#F5F1E8]"
                          )}
                        >
                          {/* Set number badge & type selector */}
                          <td className="py-2.5 px-2 text-center">
                            <select
                              value={setLog.setType}
                              onChange={(e) =>
                                updateSet(sessionEx.id, setLog.id, {
                                  setType: e.target.value as SetType,
                                })
                              }
                              className={cn(
                                "text-xs font-mono font-bold rounded px-1.5 py-0.5 border-2 border-[#171717] cursor-pointer shadow-neo-sm",
                                setLog.setType === "warmup"
                                  ? "bg-[#B9A5EF] text-[#171717]"
                                  : setLog.setType === "drop"
                                  ? "bg-[#FF7043] text-white"
                                  : "bg-white text-[#171717]"
                              )}
                            >
                              <option value="normal">{setLog.setNumber}</option>
                              <option value="warmup">W</option>
                              <option value="drop">D</option>
                            </select>
                          </td>

                          {/* Previous performance */}
                          <td className="py-2.5 px-2 text-[#171717]/80 font-bold">
                            {prevPerformance ? (
                              <span>
                                {prevPerformance.previousWeight} kg × {prevPerformance.previousReps}
                              </span>
                            ) : (
                              <span className="text-[#171717]/40 italic">—</span>
                            )}
                          </td>

                          {/* Target Today with Progression Reason Badge */}
                          <td className="py-2.5 px-2">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-[#171717] font-mono text-xs">
                                {progression.targetWeight > 0
                                  ? `${progression.targetWeight} kg × ${progression.targetReps}`
                                  : `${progression.targetReps} reps`}
                              </span>
                              {progression.reasonType === "WEIGHT_INCREASE" && (
                                <span
                                  className="text-[9px] px-1.5 py-0.2 rounded bg-[#3155F5] text-[#E9F56A] border border-[#171717] font-bold"
                                  title={progression.explanation}
                                >
                                  +WEIGHT
                                </span>
                              )}
                              {progression.reasonType === "REP_PROGRESSION" && (
                                <span
                                  className="text-[9px] px-1.5 py-0.2 rounded bg-[#E9F56A] text-[#171717] border border-[#171717] font-bold"
                                  title={progression.explanation}
                                >
                                  +1 REP
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Weight Input with Stepper */}
                          <td className="py-2.5 px-2">
                            <div className="flex items-center gap-1 max-w-[130px]">
                              <button
                                type="button"
                                onClick={() =>
                                  updateSet(sessionEx.id, setLog.id, {
                                    weight: Math.max(
                                      0,
                                      Number((setLog.weight - 2.5).toFixed(2))
                                    ),
                                  })
                                }
                                className="w-6 h-7 rounded bg-[#F5F1E8] hover:bg-[#E9F56A] text-[#171717] font-bold flex items-center justify-center text-xs border-2 border-[#171717] shadow-neo-sm"
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
                                className="w-16 px-2 py-1 rounded bg-[#F5F1E8] border-2 border-[#171717] text-[#171717] text-center font-mono font-bold text-xs focus:outline-none focus:bg-white"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  updateSet(sessionEx.id, setLog.id, {
                                    weight: Number((setLog.weight + 2.5).toFixed(2)),
                                  })
                                }
                                className="w-6 h-7 rounded bg-[#F5F1E8] hover:bg-[#E9F56A] text-[#171717] font-bold flex items-center justify-center text-xs border-2 border-[#171717] shadow-neo-sm"
                              >
                                +
                              </button>
                            </div>
                          </td>

                          {/* Reps Input with Stepper */}
                          <td className="py-2.5 px-2">
                            <div className="flex items-center gap-1 max-w-[120px]">
                              <button
                                type="button"
                                onClick={() =>
                                  updateSet(sessionEx.id, setLog.id, {
                                    reps: Math.max(0, setLog.reps - 1),
                                  })
                                }
                                className="w-6 h-7 rounded bg-[#F5F1E8] hover:bg-[#E9F56A] text-[#171717] font-bold flex items-center justify-center text-xs border-2 border-[#171717] shadow-neo-sm"
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
                                className="w-14 px-2 py-1 rounded bg-[#F5F1E8] border-2 border-[#171717] text-[#171717] text-center font-mono font-bold text-xs focus:outline-none focus:bg-white"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  updateSet(sessionEx.id, setLog.id, {
                                    reps: setLog.reps + 1,
                                  })
                                }
                                className="w-6 h-7 rounded bg-[#F5F1E8] hover:bg-[#E9F56A] text-[#171717] font-bold flex items-center justify-center text-xs border-2 border-[#171717] shadow-neo-sm"
                              >
                                +
                              </button>
                            </div>
                          </td>

                          {/* Checkbox button */}
                          <td className="py-2.5 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => toggleSetCompleted(sessionEx.id, setLog.id)}
                              className={cn(
                                "w-7 h-7 rounded-md flex items-center justify-center transition-all cursor-pointer mx-auto border-2 border-[#171717]",
                                isCompleted
                                  ? "bg-[#E9F56A] text-[#171717] font-bold shadow-neo-sm"
                                  : "bg-white text-transparent hover:border-[#3155F5]"
                              )}
                            >
                              <Check className="w-4 h-4 stroke-[3]" />
                            </button>
                          </td>

                          {/* Delete Set */}
                          <td className="py-2.5 px-1 text-center">
                            <button
                              type="button"
                              onClick={() => deleteSetFromExercise(sessionEx.id, setLog.id)}
                              className="p-1 rounded text-[#171717]/50 hover:text-[#FF7043]"
                            >
                              <X className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Set Actions: + Set, + Warmup, + Drop */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t-2 border-[#171717]/15">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => addSetToExercise(sessionEx.id, "normal")}
                    className="px-3 py-1.5 rounded-lg bg-[#3155F5] hover:bg-[#2542C7] text-white text-xs font-heading font-black uppercase tracking-wider border-2 border-[#171717] shadow-neo-sm flex items-center gap-1 active:translate-x-0.5 active:translate-y-0.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Set</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => addSetToExercise(sessionEx.id, "warmup")}
                    className="px-2.5 py-1.5 rounded-lg bg-[#B9A5EF] hover:bg-[#a48fe0] text-[#171717] text-xs font-mono font-bold border-2 border-[#171717] shadow-neo-sm flex items-center gap-1"
                  >
                    <span>+ Warmup Set</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => addSetToExercise(sessionEx.id, "drop")}
                    className="px-2.5 py-1.5 rounded-lg bg-[#FF7043] hover:bg-[#e85d30] text-white text-xs font-mono font-bold border-2 border-[#171717] shadow-neo-sm flex items-center gap-1"
                  >
                    <span>+ Drop Set</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Add Exercise button */}
        <button
          onClick={() => setIsAddExerciseOpen(true)}
          className="w-full py-4 rounded-xl border-2 border-dashed border-[#171717] bg-white hover:bg-[#E9F56A] text-[#171717] font-heading font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-neo transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Another Exercise to Session</span>
        </button>
      </div>

      {/* Add Movement Selector Modal */}
      {isAddExerciseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bento-card p-6 w-full max-w-md border-2 border-[#171717] shadow-neo-xl">
            <h3 className="text-lg font-heading font-black text-[#171717] uppercase tracking-tight mb-4">
              Add Exercise to Live Session
            </h3>
            <form onSubmit={handleAddExercise} className="space-y-4">
              {exercises.length === 0 ? (
                <div className="p-4 rounded-lg bg-[#F5F1E8] border-2 border-[#171717] text-center space-y-2">
                  <p className="text-xs text-[#171717]/80 font-mono">
                    No exercises found in your library. Add custom exercises in the Exercise Library first.
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
                  <label className="block text-xs font-mono uppercase text-[#171717] font-black mb-1.5">
                    Select Exercise
                  </label>
                  <select
                    value={selectedExerciseId}
                    onChange={(e) => setSelectedExerciseId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#F5F1E8] border-2 border-[#171717] text-[#171717] text-sm font-semibold focus:outline-none"
                  >
                    <option value="">-- Choose Exercise --</option>
                    {exercises.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.name} ({ex.primaryMuscleGroup} • {ex.equipment})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddExerciseOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#F5F1E8] border-2 border-[#171717] text-xs font-mono uppercase font-bold text-[#171717]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedExerciseId}
                  className="px-5 py-2 rounded-lg bg-[#3155F5] text-[#E9F56A] text-xs font-heading uppercase font-black border-2 border-[#171717] shadow-neo disabled:opacity-50"
                >
                  Add Exercise
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Workout Completion Summary Modal */}
      {showCompletionModal && completionSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bento-card-electric p-6 sm:p-8 w-full max-w-lg border-2 border-[#171717] shadow-neo-xl relative space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-xl bg-[#E9F56A] border-2 border-[#171717] flex items-center justify-center text-[#171717] shadow-neo">
                <Award className="w-8 h-8 stroke-[2.5]" />
              </div>
              <h2 className="font-heading text-3xl font-black text-white uppercase tracking-tight">
                Workout Completed!
              </h2>
              <p className="text-xs text-white/90 font-mono">
                Performance recorded to persistent database and strength analytics.
              </p>
            </div>

            {/* Metrics Bento Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-lg bg-[#2542C7] border-2 border-[#171717]">
                <span className="text-[10px] font-mono uppercase text-white/80 font-bold block">
                  Duration
                </span>
                <span className="font-mono text-base font-bold text-white">
                  {formatDuration(completionSummary.durationSeconds)}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-[#2542C7] border-2 border-[#171717]">
                <span className="text-[10px] font-mono uppercase text-white/80 font-bold block">
                  Volume
                </span>
                <span className="font-mono text-base font-bold text-[#E9F56A]">
                  {completionSummary.totalVolume.toLocaleString()} kg
                </span>
              </div>
              <div className="p-3 rounded-lg bg-[#2542C7] border-2 border-[#171717]">
                <span className="text-[10px] font-mono uppercase text-white/80 font-bold block">
                  Sets Logged
                </span>
                <span className="font-mono text-base font-bold text-[#E9F56A]">
                  {completionSummary.completedSetsCount}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-[#2542C7] border-2 border-[#171717]">
                <span className="text-[10px] font-mono uppercase text-white/80 font-bold block">
                  Movements
                </span>
                <span className="font-mono text-base font-bold text-[#FF7043]">
                  {completionSummary.exercisesCount}
                </span>
              </div>
            </div>

            {/* PRs Broken notification */}
            {completionSummary.newPRs && completionSummary.newPRs.length > 0 && (
              <div className="p-4 rounded-lg bg-[#FF7043] border-2 border-[#171717] text-white space-y-2 shadow-neo-sm">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase">
                  <Flame className="w-4 h-4 text-white fill-white" />
                  <span>Personal Records Broken!</span>
                </div>
                <div className="space-y-1">
                  {completionSummary.newPRs.map((pr) => (
                    <div
                      key={pr.id}
                      className="text-xs font-mono flex items-center justify-between"
                    >
                      <span className="capitalize">{pr.prType.replace("_", " ")}</span>
                      <span className="font-bold text-white">{pr.value} kg</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setShowCompletionModal(false);
              }}
              className="w-full py-3.5 rounded-lg bg-[#E9F56A] hover:bg-[#dae852] text-[#171717] font-heading text-xs uppercase font-black border-2 border-[#171717] shadow-neo cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
