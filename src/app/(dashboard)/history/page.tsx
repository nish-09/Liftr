"use client";

import { useState, useMemo } from "react";
import { useHistoryStore } from "@/stores/useHistoryStore";
import { useExerciseStore } from "@/stores/useExerciseStore";
import { usePlanStore } from "@/stores/usePlanStore";
import { formatDuration } from "@/lib/utils";
import { WorkoutSessionItem } from "@/types";
import {
  Calendar,
  Clock,
  Dumbbell,
  Trash2,
  ChevronDown,
  ChevronUp,
  Filter,
  CheckCircle2,
  Search,
  Layers,
  Award,
  Edit2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function HistoryPage() {
  const { sessions, deleteHistoricalSession, updateHistoricalSession } = useHistoryStore();
  const { exercises } = useExerciseStore();
  const { plans } = usePlanStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlanFilter, setSelectedPlanFilter] = useState("all");
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(
    sessions[0]?.id || null
  );

  // Edit Modal State
  const [editingSession, setEditingSession] = useState<WorkoutSessionItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const filteredSessions = useMemo(() => {
    return sessions.filter((sess) => {
      const matchesSearch =
        sess.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sess.exercises.some((e) => {
          const exMeta = exercises.find((ex) => ex.id === e.exerciseId);
          return exMeta?.name.toLowerCase().includes(searchQuery.toLowerCase());
        });

      const matchesPlan =
        selectedPlanFilter === "all" || sess.planId === selectedPlanFilter;

      return matchesSearch && matchesPlan;
    });
  }, [sessions, searchQuery, selectedPlanFilter, exercises]);

  function handleDelete(id: string, name: string) {
    if (confirm(`Are you sure you want to delete "${name}"? Derived analytics and personal records will be recalculated.`)) {
      deleteHistoricalSession(id);
    }
  }

  function openEditModal(sess: WorkoutSessionItem) {
    setEditingSession(sess);
    setEditName(sess.name);
    setEditNotes(sess.notes || "");
  }

  function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingSession || !editName.trim()) return;

    updateHistoricalSession(editingSession.id, {
      name: editName.trim(),
      notes: editNotes.trim(),
    });

    setEditingSession(null);
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif italic text-3xl text-white">Workout History</h1>
            <span className="px-2 py-0.5 rounded bg-[#1C1C1C] border border-[#2B2B2B] text-xs font-mono text-liftr-purple">
              {filteredSessions.length} Completed Logs
            </span>
          </div>
          <p className="text-sm text-liftr-grey mt-0.5">
            Archival record of past sessions, individual set weights, rep thresholds, and training volume.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bento-card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search workout name or exercise..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#181818] border border-[#2c2c2c] text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-liftr-purple font-sans"
          />
        </div>

        <select
          value={selectedPlanFilter}
          onChange={(e) => setSelectedPlanFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-[#181818] border border-[#2c2c2c] text-xs font-mono text-white focus:outline-none focus:border-liftr-purple cursor-pointer"
        >
          <option value="all">All Workout Plans</option>
          {plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Session List */}
      {filteredSessions.length === 0 ? (
        <div className="bento-card p-12 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-xl bg-[#1C1C1C] flex items-center justify-center text-zinc-500">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Sessions Found</h3>
          <p className="text-xs text-liftr-grey max-w-sm mx-auto">
            No completed workouts match your current filter. Complete a session in the Live Workout Tracker to build your archive.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSessions.map((sess) => {
            const isExpanded = expandedSessionId === sess.id;
            const formattedDate = new Date(sess.completedAt || sess.startedAt).toLocaleDateString(
              "en-US",
              {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              }
            );

            // Compute total completed sets
            let totalSets = 0;
            sess.exercises.forEach((ex) => {
              totalSets += ex.sets.filter((s) => s.isCompleted).length;
            });

            return (
              <div
                key={sess.id}
                className="bento-card border-[#232323] hover:border-[#333333] transition-all overflow-hidden"
              >
                {/* Session Summary Header */}
                <div
                  onClick={() =>
                    setExpandedSessionId(isExpanded ? null : sess.id)
                  }
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none bg-[#121212]"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-liftr-purple/15 text-liftr-purple-light border border-liftr-purple/30 font-semibold">
                        {formattedDate}
                      </span>
                      {sess.phaseId && (
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#1C1C1C] text-zinc-400 border border-[#2B2B2B]">
                          {sess.phaseId}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white">{sess.name}</h3>
                    {sess.notes && (
                      <p className="text-xs text-liftr-grey line-clamp-1 italic">
                        &ldquo;{sess.notes}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Right Metrics Pills */}
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="flex items-center gap-3 text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-zinc-500" />
                        {formatDuration(sess.durationSeconds)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Dumbbell className="w-3.5 h-3.5 text-liftr-purple" />
                        {sess.totalVolume.toLocaleString()} kg
                      </span>
                      <span>{totalSets} sets</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(sess);
                        }}
                        className="p-1.5 rounded hover:bg-[#202020] text-zinc-400 hover:text-white"
                        title="Edit Session"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(sess.id, sess.name);
                        }}
                        className="p-1.5 rounded hover:bg-liftr-coral/20 text-zinc-400 hover:text-liftr-coral"
                        title="Delete Session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="p-1 rounded text-zinc-500">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details: Exercise & Set Breakdown */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 pt-0 border-t border-[#1C1C1C] bg-[#0E0E0E] space-y-4">
                    <div className="text-xs font-mono uppercase tracking-wider text-liftr-grey pt-3">
                      Recorded Exercises &amp; Sets
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {sess.exercises.map((sessionEx, idx) => {
                        const exMeta = exercises.find(
                          (ex) => ex.id === sessionEx.exerciseId
                        );

                        return (
                          <div
                            key={sessionEx.id}
                            className="p-3.5 rounded-lg bg-[#141414] border border-[#232323] space-y-2.5"
                          >
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-bold text-white">
                                {idx + 1}. {exMeta?.name || "Exercise"}
                              </h4>
                              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-liftr-purple/10 text-liftr-purple-light">
                                {exMeta?.primaryMuscleGroup}
                              </span>
                            </div>

                            <div className="space-y-1">
                              {sessionEx.sets.map((s) => (
                                <div
                                  key={s.id}
                                  className={cn(
                                    "flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-mono",
                                    s.isCompleted
                                      ? "bg-[#181818] text-white"
                                      : "bg-[#121212] text-zinc-500"
                                  )}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="w-4 text-center text-zinc-500">
                                      {s.setType === "warmup" ? "W" : s.setNumber}
                                    </span>
                                    <span>
                                      {s.weight} kg × {s.reps} reps
                                    </span>
                                  </div>
                                  <span className="text-zinc-500 text-[11px]">
                                    {(s.weight * s.reps).toLocaleString()} kg vol
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Session Modal */}
      {editingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bento-card p-6 w-full max-w-md border-2 border-border shadow-neo-purple">
            <h3 className="text-base font-bold text-white mb-4">Edit Workout Details</h3>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-liftr-grey mb-1.5">
                  Workout Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-[#2c2c2c] text-white text-sm focus:outline-none focus:border-liftr-purple"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-liftr-grey mb-1.5">
                  Workout Notes
                </label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-[#181818] border border-[#2c2c2c] text-white text-sm focus:outline-none focus:border-liftr-purple resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSession(null)}
                  className="px-4 py-2 rounded bg-[#1C1C1C] text-xs font-mono uppercase text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-liftr-purple hover:bg-liftr-purple-dark text-white text-xs font-mono uppercase font-bold shadow-neo"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
