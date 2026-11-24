"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { useWorkoutStore } from "@/stores/useWorkoutStore";
import { useHistoryStore } from "@/stores/useHistoryStore";
import { useExerciseStore } from "@/stores/useExerciseStore";
import { usePlanStore } from "@/stores/usePlanStore";
import { calculateProgression, ProgressionSuggestion } from "@/lib/progression/engine";
import { formatDuration, cn } from "@/lib/utils";
import { SetType, Exercise, SetLogItem } from "@/types";
import {
  Play,
  Check,
  Plus,
  Trash2,
  Timer,
  Zap,
  Award,
  ChevronDown,
  X,
  RefreshCw,
  Dumbbell,
  Flame,
} from "lucide-react";

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
  const [completionSummary, setCompletionSummary] = useState<any>(null);
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
      ex.sets.forEach((s) => {
        totalSetsCount++;
        if (s.isCompleted) {
          completedSetsCount++;
          if (s.setType !== "warmup") {
            currentVolume += (s.weight || 0) * (s.reps || 0);
          }
        }
      });
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
        colors: ["#D5F36A", "#183D2A", "#F07845", "#B9A4E8"],
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
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#171B16]">
            Live Workout Command
          </h1>
          <p className="text-sm text-[#171B16]/80 font-mono mt-0.5">
            Real-time double progression set logging with automated weight stepping and rest tracking.
          </p>
        </div>

        {/* Start Workout Bento Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quick Start Card (Deep Forest Green) */}
          <div className="bento-card-forest p-6 sm:p-7 flex flex-col justify-between space-y-6 rounded-xl border-2 border-[#171B16] shadow-neo-lg">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-lg bg-[#D5F36A] border-2 border-[#171B16] flex items-center justify-center text-[#171B16] shadow-neo-sm">
                <Play className="w-6 h-6 fill-[#171B16] ml-0.5" />
              </div>
              <div>
                <h2 className="text-2xl font-heading font-bold text-[#F5F0DF]">
                  Start Empty Workout
                </h2>
                <p className="text-xs text-[#B8D99A] font-mono mt-1 leading-relaxed">
                  Build your workout on the fly. Select movements from your library, log sets, and test PRs with transparent double progression suggestions.
                </p>
              </div>
            </div>

            <button
              onClick={handleStartEmptySession}
              className="w-full py-3.5 px-6 rounded-lg bg-[#D5F36A] hover:bg-[#c4e458] text-[#171B16] font-heading font-bold text-sm uppercase tracking-wider border-2 border-[#171B16] shadow-neo flex items-center justify-center gap-2 transition-all active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-[#171B16]" />
              <span>Launch Live Workout</span>
            </button>
          </div>

          {/* Start From Plan Card (Warm Cream) */}
          <div className="bento-card p-6 sm:p-7 flex flex-col justify-between space-y-6 rounded-xl border-2 border-[#171B16] shadow-neo-lg">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-lg bg-[#183D2A] border-2 border-[#171B16] flex items-center justify-center text-[#D5F36A] shadow-neo-sm">
                <Dumbbell className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-heading font-bold text-[#171B16]">
                  Start From Workout Plan
                </h2>
                <p className="text-xs text-[#171B16]/75 font-mono mt-1 leading-relaxed">
                  Choose a prescribed training day from your custom routines to auto-populate targets, rep ranges, and historical baseline weights.
                </p>
              </div>
            </div>

            <Link
              href="/plans"
              className="w-full py-3.5 px-6 rounded-lg bg-[#183D2A] hover:bg-[#143323] text-[#F5F0DF] font-heading font-bold text-xs uppercase tracking-wider text-center border-2 border-[#171B16] shadow-neo flex items-center justify-center gap-2 transition-all active:translate-x-0.5 active:translate-y-0.5"
            >
              <span>Browse Workout Plans</span>
              <ChevronDown className="w-4 h-4 -rotate-90 text-[#D5F36A]" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Sticky Active Session Header Bar (Deep Forest Green) */}
      <div className="bento-card-forest p-4 sm:p-5 border-2 border-[#171B16] shadow-neo-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-16 z-20 rounded-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D5F36A] border border-[#171B16] animate-ping" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#D5F36A] font-bold">
              Active Session
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#143323] text-[#F5F0DF] border border-[#171B16] flex items-center gap-1 font-semibold">
              <RefreshCw className="w-2.5 h-2.5 text-[#D5F36A]" />
              {syncStatus}
            </span>
          </div>

          <input
            type="text"
            value={activeSession.name}
            onChange={(e) => updateSessionMeta({ name: e.target.value })}
            className="text-lg sm:text-xl font-heading font-bold text-[#F5F0DF] bg-transparent border-b-2 border-transparent hover:border-[#D5F36A]/50 focus:border-[#D5F36A] focus:outline-none transition-colors"
          />
        </div>

        {/* Live Metrics: Duration, Volume, Sets, Finish */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 px-3 py-1.5 rounded-md bg-[#143323] border-2 border-[#171B16] text-xs font-mono text-white">
            <div>
              <span className="text-[10px] text-[#B8D99A] block uppercase font-bold">Time</span>
              <span className="font-bold text-[#F5F0DF]">{formatDuration(elapsedSeconds)}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#B8D99A] block uppercase font-bold">Volume</span>
              <span className="font-bold text-[#D5F36A]">{currentVolume.toLocaleString()} kg</span>
            </div>
            <div>
              <span className="text-[10px] text-[#B8D99A] block uppercase font-bold">Sets</span>
              <span className="font-bold text-[#D5F36A]">
                {completedSetsCount}/{totalSetsCount}
              </span>
            </div>
          </div>

          <button
            onClick={handleFinishSession}
            className="px-4 py-2.5 rounded-md bg-[#D5F36A] hover:bg-[#c3e357] text-[#171B16] font-heading text-xs uppercase font-bold border-2 border-[#171B16] shadow-neo cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-1.5"
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
            className="p-2.5 rounded-md bg-[#F07845] hover:bg-[#d96636] text-white border-2 border-[#171B16] shadow-neo-sm transition-all cursor-pointer"
            title="Discard Session"
          >
            <Trash2 className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Exercise Cards (Warm Cream) */}
      <div className="space-y-5">
        {activeSession.exercises.map((sessionEx, exIdx) => {
          const exMeta =
            exercises.find((ex) => ex.id === sessionEx.exerciseId) || sessionEx.exercise;

          return (
            <div
              key={sessionEx.id}
              className="bento-card p-5 border-2 border-[#171B16] shadow-neo rounded-xl space-y-4"
            >
              {/* Exercise Header */}
              <div className="flex items-start justify-between gap-3 border-b-2 border-[#171B16]/20 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-[#183D2A] text-[#D5F36A] border-2 border-[#171B16] font-mono text-sm font-bold flex items-center justify-center shadow-neo-sm">
                    {exIdx + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-heading font-bold text-[#171B16]">
                      {exMeta?.name || "Exercise"}
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-mono text-[#171B16]/80 mt-0.5">
                      <span className="uppercase font-bold text-[#183D2A] px-1.5 py-0.5 rounded bg-[#D5F36A] border border-[#171B16]">
                        {exMeta?.primaryMuscleGroup}
                      </span>
                      <span>•</span>
                      <span className="capitalize font-semibold">{exMeta?.equipment}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-semibold">
                        <Timer className="w-3.5 h-3.5 text-[#183D2A]" />
                        {exMeta?.defaultRestDuration || 90}s rest
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => removeExerciseFromWorkout(sessionEx.id)}
                  className="p-1.5 rounded-md hover:bg-[#F07845] hover:text-white border border-transparent hover:border-[#171B16] text-[#171B16]/60 transition-colors"
                  title="Remove Exercise"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Set Logging Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b-2 border-[#171B16] text-[#171B16] text-[10px] uppercase font-bold tracking-wider">
                      <th className="py-2 px-2 w-14 text-center">Set</th>
                      <th className="py-2 px-2 min-w-[130px]">Previous Session</th>
                      <th className="py-2 px-2 min-w-[160px]">Target Today</th>
                      <th className="py-2 px-2 min-w-[120px]">Weight (kg)</th>
                      <th className="py-2 px-2 min-w-[100px]">Reps</th>
                      <th className="py-2 px-2 w-16 text-center">Done</th>
                      <th className="py-2 px-1 w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-[#171B16]/20">
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
                            isCompleted ? "bg-[#D5F36A]/40 font-bold" : "hover:bg-[#EAE3CE]"
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
                                "text-xs font-mono font-bold rounded px-1.5 py-0.5 border-2 border-[#171B16] cursor-pointer shadow-neo-sm",
                                setLog.setType === "warmup"
                                  ? "bg-[#D5F36A] text-[#171B16]"
                                  : setLog.setType === "drop"
                                  ? "bg-[#F07845] text-white"
                                  : "bg-[#F5F0DF] text-[#171B16]"
                              )}
                            >
                              <option value="normal">{setLog.setNumber}</option>
                              <option value="warmup">W</option>
                              <option value="drop">D</option>
                            </select>
                          </td>

                          {/* Previous performance */}
                          <td className="py-2.5 px-2 text-[#171B16]/80 font-bold">
                            {prevPerformance ? (
                              <span>
                                {prevPerformance.previousWeight} kg × {prevPerformance.previousReps}
                              </span>
                            ) : (
                              <span className="text-[#171B16]/40 italic">—</span>
                            )}
                          </td>

                          {/* Target Today with Progression Reason Badge */}
                          <td className="py-2.5 px-2">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-[#171B16] font-mono text-xs">
                                {progression.targetWeight > 0
                                  ? `${progression.targetWeight} kg × ${progression.targetReps}`
                                  : `${progression.targetReps} reps`}
                              </span>
                              {progression.reasonType === "WEIGHT_INCREASE" && (
                                <span
                                  className="text-[9px] px-1.5 py-0.2 rounded bg-[#183D2A] text-[#D5F36A] border border-[#171B16] font-bold"
                                  title={progression.explanation}
                                >
                                  +WEIGHT
                                </span>
                              )}
                              {progression.reasonType === "REP_PROGRESSION" && (
                                <span
                                  className="text-[9px] px-1.5 py-0.2 rounded bg-[#D5F36A] text-[#171B16] border border-[#171B16] font-bold"
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
                                className="w-6 h-7 rounded bg-[#F5F0DF] hover:bg-[#D5F36A] text-[#171B16] font-bold flex items-center justify-center text-xs border-2 border-[#171B16] shadow-neo-sm"
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
                                className="w-16 px-2 py-1 rounded bg-[#F5F0DF] border-2 border-[#171B16] text-[#171B16] text-center font-mono font-bold text-xs focus:outline-none focus:bg-[#D5F36A]/20"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  updateSet(sessionEx.id, setLog.id, {
                                    weight: Number((setLog.weight + 2.5).toFixed(2)),
                                  })
                                }
                                className="w-6 h-7 rounded bg-[#F5F0DF] hover:bg-[#D5F36A] text-[#171B16] font-bold flex items-center justify-center text-xs border-2 border-[#171B16] shadow-neo-sm"
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
                                className="w-6 h-7 rounded bg-[#F5F0DF] hover:bg-[#D5F36A] text-[#171B16] font-bold flex items-center justify-center text-xs border-2 border-[#171B16] shadow-neo-sm"
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
                                className="w-14 px-2 py-1 rounded bg-[#F5F0DF] border-2 border-[#171B16] text-[#171B16] text-center font-mono font-bold text-xs focus:outline-none focus:bg-[#D5F36A]/20"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  updateSet(sessionEx.id, setLog.id, {
                                    reps: setLog.reps + 1,
                                  })
                                }
                                className="w-6 h-7 rounded bg-[#F5F0DF] hover:bg-[#D5F36A] text-[#171B16] font-bold flex items-center justify-center text-xs border-2 border-[#171B16] shadow-neo-sm"
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
                                "w-7 h-7 rounded-md flex items-center justify-center transition-all cursor-pointer mx-auto border-2 border-[#171B16]",
                                isCompleted
                                  ? "bg-[#D5F36A] text-[#171B16] font-bold shadow-neo-sm"
                                  : "bg-[#F5F0DF] text-transparent hover:border-[#183D2A]"
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
                              className="p-1 rounded text-[#171B16]/50 hover:text-[#F07845]"
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
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t-2 border-[#171B16]/20">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => addSetToExercise(sessionEx.id, "normal")}
                    className="px-3 py-1.5 rounded-md bg-[#183D2A] hover:bg-[#143323] text-[#F5F0DF] text-xs font-heading font-bold uppercase tracking-wider border-2 border-[#171B16] shadow-neo-sm flex items-center gap-1 active:translate-x-0.5 active:translate-y-0.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Set</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => addSetToExercise(sessionEx.id, "warmup")}
                    className="px-2.5 py-1.5 rounded-md bg-[#D5F36A] hover:bg-[#c2e255] text-[#171B16] text-xs font-mono font-bold border-2 border-[#171B16] shadow-neo-sm flex items-center gap-1"
                  >
                    <span>+ Warmup Set</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => addSetToExercise(sessionEx.id, "drop")}
                    className="px-2.5 py-1.5 rounded-md bg-[#F07845] hover:bg-[#dc6938] text-white text-xs font-mono font-bold border-2 border-[#171B16] shadow-neo-sm flex items-center gap-1"
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
          className="w-full py-4 rounded-xl border-2 border-dashed border-[#171B16] bg-[#F5F0DF] hover:bg-[#D5F36A] text-[#171B16] font-heading font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-neo transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Another Exercise to Session</span>
        </button>
      </div>

      {/* Add Movement Selector Modal */}
      {isAddExerciseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bento-card p-6 w-full max-w-md border-2 border-[#171B16] shadow-neo-xl">
            <h3 className="text-lg font-heading font-bold text-[#171B16] mb-4">
              Add Exercise to Live Session
            </h3>
            <form onSubmit={handleAddExercise} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-[#171B16] font-bold mb-1.5">
                  Select Exercise
                </label>
                <select
                  value={selectedExerciseId}
                  onChange={(e) => setSelectedExerciseId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#F5F0DF] border-2 border-[#171B16] text-[#171B16] text-sm font-semibold focus:outline-none"
                >
                  <option value="">-- Choose Exercise --</option>
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
                  onClick={() => setIsAddExerciseOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#F5F0DF] border-2 border-[#171B16] text-xs font-mono uppercase font-bold text-[#171B16]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedExerciseId}
                  className="px-5 py-2 rounded-lg bg-[#183D2A] text-[#D5F36A] text-xs font-heading uppercase font-bold border-2 border-[#171B16] shadow-neo disabled:opacity-50"
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
          <div className="bento-card-forest p-6 sm:p-8 w-full max-w-lg border-2 border-[#171B16] shadow-neo-xl relative space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-xl bg-[#D5F36A] border-2 border-[#171B16] flex items-center justify-center text-[#171B16] shadow-neo">
                <Award className="w-8 h-8 stroke-[2.5]" />
              </div>
              <h2 className="font-heading text-3xl font-bold text-[#F5F0DF]">
                Workout Completed!
              </h2>
              <p className="text-xs text-[#B8D99A] font-mono">
                Performance recorded to persistent database and strength analytics.
              </p>
            </div>

            {/* Metrics Bento Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-lg bg-[#143323] border-2 border-[#171B16]">
                <span className="text-[10px] font-mono uppercase text-[#B8D99A] font-bold block">
                  Duration
                </span>
                <span className="font-mono text-base font-bold text-white">
                  {formatDuration(completionSummary.durationSeconds)}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-[#143323] border-2 border-[#171B16]">
                <span className="text-[10px] font-mono uppercase text-[#B8D99A] font-bold block">
                  Volume
                </span>
                <span className="font-mono text-base font-bold text-[#D5F36A]">
                  {completionSummary.totalVolume.toLocaleString()} kg
                </span>
              </div>
              <div className="p-3 rounded-lg bg-[#143323] border-2 border-[#171B16]">
                <span className="text-[10px] font-mono uppercase text-[#B8D99A] font-bold block">
                  Sets Logged
                </span>
                <span className="font-mono text-base font-bold text-[#D5F36A]">
                  {completionSummary.completedSetsCount}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-[#143323] border-2 border-[#171B16]">
                <span className="text-[10px] font-mono uppercase text-[#B8D99A] font-bold block">
                  Movements
                </span>
                <span className="font-mono text-base font-bold text-[#F07845]">
                  {completionSummary.exercisesCount}
                </span>
              </div>
            </div>

            {/* PRs Broken notification */}
            {completionSummary.newPRs && completionSummary.newPRs.length > 0 && (
              <div className="p-4 rounded-lg bg-[#F07845] border-2 border-[#171B16] text-white space-y-2 shadow-neo-sm">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase">
                  <Flame className="w-4 h-4 text-white fill-white" />
                  <span>Personal Records Broken!</span>
                </div>
                <div className="space-y-1">
                  {completionSummary.newPRs.map((pr: any) => (
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
              className="w-full py-3.5 rounded-lg bg-[#D5F36A] hover:bg-[#c2e255] text-[#171B16] font-heading text-xs uppercase font-bold border-2 border-[#171B16] shadow-neo cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
