"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { useWorkoutStore } from "@/stores/useWorkoutStore";
import { useHistoryStore } from "@/stores/useHistoryStore";
import { useExerciseStore } from "@/stores/useExerciseStore";
import { usePlanStore } from "@/stores/usePlanStore";
import { calculateProgression, ProgressionSuggestion } from "@/lib/progression/engine";
import { formatDuration, formatWeight, cn } from "@/lib/utils";
import { SetType, Exercise, SetLogItem } from "@/types";
import {
  Play,
  Check,
  Plus,
  Trash2,
  Timer,
  Zap,
  TrendingUp,
  AlertCircle,
  Dumbbell,
  Clock,
  Flame,
  Award,
  Layers,
  Sparkles,
  ChevronDown,
  Info,
  X,
  RefreshCw,
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

  // Timer interval for active session
  useEffect(() => {
    if (!activeSession) return;
    const interval = setInterval(() => {
      tickElapsed();
    }, 1000);
    return () => clearInterval(interval);
  }, [activeSession, tickElapsed]);

  if (!mounted) return null;

  // Calculate live session statistics
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

    // Save to history & detect personal records
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
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#8957DC", "#60C27D", "#E9D65B", "#E97860"],
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
          <h1 className="font-serif italic text-3xl text-white">Live Workout Command</h1>
          <p className="text-sm text-liftr-grey mt-0.5">
            Real-time double progression set logging with automated weight stepping and rest tracking.
          </p>
        </div>

        {/* Start Workout Bento Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quick Start Card */}
          <div className="bento-card bento-card-purple p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-liftr-purple flex items-center justify-center text-white shadow-neo">
                <Play className="w-6 h-6 fill-white ml-0.5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Start Empty Workout</h2>
                <p className="text-xs text-zinc-300 mt-1">
                  Build your workout on the fly. Select movements from your library, log sets, and test PRs with transparent double progression suggestions.
                </p>
              </div>
            </div>

            <button
              onClick={handleStartEmptySession}
              className="w-full py-3.5 px-6 rounded-lg bg-liftr-purple hover:bg-liftr-purple-dark text-white font-bold text-sm shadow-neo flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Launch Live Workout</span>
            </button>
          </div>

          {/* Start From Active Plan Card */}
          <div className="bento-card p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#1C1C1C] border border-[#2B2B2B] flex items-center justify-center text-liftr-green">
                <Dumbbell className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Start From Workout Plan</h2>
                <p className="text-xs text-liftr-grey mt-1">
                  Choose a prescribed training day from your custom routines to auto-populate targets, rep ranges, and historical baseline weights.
                </p>
              </div>
            </div>

            <Link
              href="/plans"
              className="w-full py-3.5 px-6 rounded-lg bg-[#1C1C1C] hover:bg-[#252525] border border-[#2B2B2B] text-white font-mono text-xs uppercase tracking-wider text-center transition-all flex items-center justify-center gap-2"
            >
              <span>Browse Workout Plans</span>
              <ChevronDown className="w-4 h-4 -rotate-90 text-liftr-purple" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Sticky Active Session Header Bar */}
      <div className="bento-card p-4 sm:p-5 border-liftr-purple/40 shadow-neo flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-16 z-20 bg-[#0E0E0E]/95 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-liftr-purple animate-ping" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-liftr-purple font-bold">
              Active Session
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1C1C1C] text-zinc-400 border border-[#2B2B2B] flex items-center gap-1">
              <RefreshCw className="w-2.5 h-2.5 text-liftr-green" />
              {syncStatus}
            </span>
          </div>

          <input
            type="text"
            value={activeSession.name}
            onChange={(e) => updateSessionMeta({ name: e.target.value })}
            className="text-lg sm:text-xl font-bold text-white bg-transparent border-b border-transparent hover:border-[#383838] focus:border-liftr-purple focus:outline-none"
          />
        </div>

        {/* Live Metrics: Duration, Volume, Sets, Finish */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 px-3 py-1.5 rounded-lg bg-[#141414] border border-[#232323] text-xs font-mono">
            <div>
              <span className="text-[10px] text-zinc-500 block">Time</span>
              <span className="font-bold text-white">{formatDuration(elapsedSeconds)}</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 block">Volume</span>
              <span className="font-bold text-liftr-purple-light">{currentVolume.toLocaleString()} kg</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 block">Sets</span>
              <span className="font-bold text-liftr-green">
                {completedSetsCount}/{totalSetsCount}
              </span>
            </div>
          </div>

          <button
            onClick={handleFinishSession}
            className="px-4 py-2.5 rounded-lg bg-liftr-green hover:bg-liftr-green-light text-black font-mono text-xs uppercase font-bold shadow-neo cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-1.5"
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
            className="p-2.5 rounded-lg hover:bg-liftr-coral/20 text-zinc-500 hover:text-liftr-coral transition-colors"
            title="Discard Session"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Exercise Cards */}
      <div className="space-y-5">
        {activeSession.exercises.map((sessionEx, exIdx) => {
          const exMeta =
            exercises.find((ex) => ex.id === sessionEx.exerciseId) || sessionEx.exercise;

          return (
            <div
              key={sessionEx.id}
              className="bento-card p-4 sm:p-5 border-[#262626] space-y-4"
            >
              {/* Exercise Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-liftr-purple/20 text-liftr-purple-light font-mono text-xs font-bold flex items-center justify-center">
                    {exIdx + 1}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {exMeta?.name || "Exercise"}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] font-mono text-liftr-grey mt-0.5">
                      <span className="uppercase text-liftr-purple-light">
                        {exMeta?.primaryMuscleGroup}
                      </span>
                      <span>•</span>
                      <span className="capitalize">{exMeta?.equipment}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-zinc-400">
                        <Timer className="w-3 h-3 text-zinc-500" />
                        {exMeta?.defaultRestDuration || 90}s rest
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => removeExerciseFromWorkout(sessionEx.id)}
                  className="p-1 rounded hover:bg-liftr-coral/20 text-zinc-500 hover:text-liftr-coral transition-colors"
                  title="Remove Exercise"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Set Logging Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-[#232323] text-zinc-500 text-[10px] uppercase tracking-wider">
                      <th className="py-2 px-2 w-12 text-center">Set</th>
                      <th className="py-2 px-2 min-w-[130px]">Previous Session</th>
                      <th className="py-2 px-2 min-w-[160px]">Target Today</th>
                      <th className="py-2 px-2 min-w-[100px]">Weight (kg)</th>
                      <th className="py-2 px-2 min-w-[90px]">Reps</th>
                      <th className="py-2 px-2 w-16 text-center">Done</th>
                      <th className="py-2 px-1 w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1C1C1C]">
                    {sessionEx.sets.map((setLog) => {
                      // Lookup historical performance for this exercise & set
                      const prevPerformance = getPreviousPerformance(
                        sessionEx.exerciseId,
                        setLog.setNumber,
                        activeSession.planDayId
                      );

                      // Calculate double progression
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
                            isCompleted ? "bg-[#101912]" : "hover:bg-[#161616]"
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
                                "text-[11px] font-mono font-bold rounded px-1.5 py-0.5 border cursor-pointer",
                                setLog.setType === "warmup"
                                  ? "bg-liftr-yellow/20 text-liftr-yellow border-liftr-yellow/40"
                                  : setLog.setType === "drop"
                                  ? "bg-liftr-coral/20 text-liftr-coral border-liftr-coral/40"
                                  : "bg-[#1C1C1C] text-zinc-300 border-[#2C2C2C]"
                              )}
                            >
                              <option value="normal">{setLog.setNumber}</option>
                              <option value="warmup">W</option>
                              <option value="drop">D</option>
                            </select>
                          </td>

                          {/* Previous performance column */}
                          <td className="py-2.5 px-2 text-zinc-400">
                            {prevPerformance ? (
                              <span className="font-mono text-xs">
                                {prevPerformance.previousWeight} kg × {prevPerformance.previousReps}
                              </span>
                            ) : (
                              <span className="text-zinc-600 italic text-[11px]">—</span>
                            )}
                          </td>

                          {/* Target Today with Progression Reason Badge */}
                          <td className="py-2.5 px-2">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white font-mono text-xs">
                                {progression.targetWeight > 0
                                  ? `${progression.targetWeight} kg × ${progression.targetReps}`
                                  : `${progression.targetReps} reps`}
                              </span>
                              {progression.reasonType === "WEIGHT_INCREASE" && (
                                <span
                                  className="text-[9px] px-1 py-0.2 rounded bg-liftr-purple/20 text-liftr-purple-light border border-liftr-purple/40 font-bold"
                                  title={progression.explanation}
                                >
                                  +WEIGHT
                                </span>
                              )}
                              {progression.reasonType === "REP_PROGRESSION" && (
                                <span
                                  className="text-[9px] px-1 py-0.2 rounded bg-liftr-green/20 text-liftr-green border border-liftr-green/40 font-bold"
                                  title={progression.explanation}
                                >
                                  +1 REP
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Weight Input with Stepper */}
                          <td className="py-2.5 px-2">
                            <div className="flex items-center gap-1 max-w-[120px]">
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
                                className="w-5 h-7 rounded bg-[#1C1C1C] hover:bg-[#282828] text-zinc-400 font-bold flex items-center justify-center text-xs"
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
                                className="w-14 px-2 py-1 rounded bg-[#181818] border border-[#2B2B2B] text-white text-center font-mono font-bold text-xs focus:outline-none focus:border-liftr-purple"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  updateSet(sessionEx.id, setLog.id, {
                                    weight: Number((setLog.weight + 2.5).toFixed(2)),
                                  })
                                }
                                className="w-5 h-7 rounded bg-[#1C1C1C] hover:bg-[#282828] text-zinc-400 font-bold flex items-center justify-center text-xs"
                              >
                                +
                              </button>
                            </div>
                          </td>

                          {/* Reps Input with Stepper */}
                          <td className="py-2.5 px-2">
                            <div className="flex items-center gap-1 max-w-[110px]">
                              <button
                                type="button"
                                onClick={() =>
                                  updateSet(sessionEx.id, setLog.id, {
                                    reps: Math.max(0, setLog.reps - 1),
                                  })
                                }
                                className="w-5 h-7 rounded bg-[#1C1C1C] hover:bg-[#282828] text-zinc-400 font-bold flex items-center justify-center text-xs"
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
                                className="w-12 px-2 py-1 rounded bg-[#181818] border border-[#2B2B2B] text-white text-center font-mono font-bold text-xs focus:outline-none focus:border-liftr-purple"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  updateSet(sessionEx.id, setLog.id, {
                                    reps: setLog.reps + 1,
                                  })
                                }
                                className="w-5 h-7 rounded bg-[#1C1C1C] hover:bg-[#282828] text-zinc-400 font-bold flex items-center justify-center text-xs"
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
                                "w-7 h-7 rounded-md flex items-center justify-center transition-all cursor-pointer mx-auto",
                                isCompleted
                                  ? "bg-liftr-green text-black font-bold shadow-neo-sm"
                                  : "bg-[#1C1C1C] border border-[#2C2C2C] text-transparent hover:border-liftr-green/50"
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
                              className="p-1 rounded text-zinc-600 hover:text-liftr-coral"
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

              {/* Set Actions: + Set, + Warmup, Notes */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#1C1C1C]">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => addSetToExercise(sessionEx.id, "normal")}
                    className="px-3 py-1.5 rounded bg-[#1A1A1A] hover:bg-[#222222] border border-[#2B2B2B] text-xs font-mono text-zinc-300 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Set</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => addSetToExercise(sessionEx.id, "warmup")}
                    className="px-2.5 py-1.5 rounded bg-[#1A1A1A] hover:bg-[#222222] border border-[#2B2B2B] text-xs font-mono text-liftr-yellow flex items-center gap-1"
                  >
                    <span>+ Warmup Set</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => addSetToExercise(sessionEx.id, "drop")}
                    className="px-2.5 py-1.5 rounded bg-[#1A1A1A] hover:bg-[#222222] border border-[#2B2B2B] text-xs font-mono text-liftr-coral flex items-center gap-1"
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
          className="w-full py-4 rounded-xl border-2 border-dashed border-[#282828] hover:border-liftr-purple/50 bg-[#101010] text-zinc-300 hover:text-white font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-liftr-purple" />
          <span>Add Another Exercise to Session</span>
        </button>
      </div>

      {/* Add Movement Selector Modal */}
      {isAddExerciseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bento-card p-6 w-full max-w-md border-2 border-border shadow-neo-purple">
            <h3 className="text-base font-bold text-white mb-4">
              Add Exercise to Live Session
            </h3>
            <form onSubmit={handleAddExercise} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-liftr-grey mb-1.5">
                  Select Exercise
                </label>
                <select
                  value={selectedExerciseId}
                  onChange={(e) => setSelectedExerciseId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-[#2c2c2c] text-white text-sm focus:outline-none focus:border-liftr-purple"
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
                  className="px-4 py-2 rounded bg-[#1C1C1C] text-xs font-mono uppercase text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedExerciseId}
                  className="px-5 py-2 rounded bg-liftr-purple hover:bg-liftr-purple-dark text-white text-xs font-mono uppercase font-bold shadow-neo disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bento-card p-6 sm:p-8 w-full max-w-lg border-2 border-liftr-green shadow-neo-green relative space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-liftr-green flex items-center justify-center text-black shadow-neo">
                <Award className="w-8 h-8" />
              </div>
              <h2 className="font-serif italic text-3xl text-white">Workout Completed!</h2>
              <p className="text-xs text-liftr-grey font-mono">
                Performance recorded to persistent database and strength analytics.
              </p>
            </div>

            {/* Metrics Bento Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-lg bg-[#181818] border border-[#282828]">
                <span className="text-[10px] font-mono uppercase text-zinc-500 block">Duration</span>
                <span className="font-mono text-base font-bold text-white">
                  {formatDuration(completionSummary.durationSeconds)}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-[#181818] border border-[#282828]">
                <span className="text-[10px] font-mono uppercase text-zinc-500 block">Volume</span>
                <span className="font-mono text-base font-bold text-liftr-purple-light">
                  {completionSummary.totalVolume.toLocaleString()} kg
                </span>
              </div>
              <div className="p-3 rounded-lg bg-[#181818] border border-[#282828]">
                <span className="text-[10px] font-mono uppercase text-zinc-500 block">Sets Logged</span>
                <span className="font-mono text-base font-bold text-liftr-green">
                  {completionSummary.completedSetsCount}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-[#181818] border border-[#282828]">
                <span className="text-[10px] font-mono uppercase text-zinc-500 block">Movements</span>
                <span className="font-mono text-base font-bold text-liftr-yellow">
                  {completionSummary.exercisesCount}
                </span>
              </div>
            </div>

            {/* PRs Broken notification */}
            {completionSummary.newPRs && completionSummary.newPRs.length > 0 && (
              <div className="p-4 rounded-lg bg-liftr-purple/15 border border-liftr-purple/40 space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-liftr-purple-light uppercase">
                  <Flame className="w-4 h-4 text-liftr-coral fill-liftr-coral" />
                  <span>Personal Records Broken!</span>
                </div>
                <div className="space-y-1">
                  {completionSummary.newPRs.map((pr: any) => (
                    <div
                      key={pr.id}
                      className="text-xs font-mono text-zinc-300 flex items-center justify-between"
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
              className="w-full py-3.5 rounded-lg bg-liftr-purple hover:bg-liftr-purple-dark text-white font-mono text-xs uppercase font-bold shadow-neo cursor-pointer transition-all"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
