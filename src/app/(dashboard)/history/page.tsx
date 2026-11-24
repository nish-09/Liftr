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
  Search,
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
          <div className="flex items-center gap-3">
            <h1 className="font-heading font-black text-3xl md:text-4xl text-[#171717] tracking-tight uppercase">
              WORKOUT HISTORY
            </h1>
            <span className="px-2.5 py-1 rounded-lg bg-[#3155F5] text-white border-2 border-[#171717] text-xs font-mono font-bold shadow-neo-sm">
              {filteredSessions.length} Completed Logs
            </span>
          </div>
          <p className="text-sm text-[#171717]/70 font-sans mt-1">
            Archival record of past sessions, individual set weights, rep thresholds, and training volume.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border-2 border-[#171717] rounded-xl shadow-neo p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#171717]/50 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search workout name or exercise..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#F5F1E8] border-2 border-[#171717] text-sm text-[#171717] placeholder:text-[#171717]/40 focus:outline-none focus:ring-2 focus:ring-[#3155F5] font-sans"
          />
        </div>

        <select
          value={selectedPlanFilter}
          onChange={(e) => setSelectedPlanFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-[#F5F1E8] border-2 border-[#171717] text-xs font-mono font-bold text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#3155F5] shadow-neo-sm cursor-pointer"
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
        <div className="bg-white border-2 border-[#171717] rounded-xl shadow-neo p-12 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-xl bg-[#3155F5]/10 border-2 border-[#171717] flex items-center justify-center text-[#171717]">
            <Calendar className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h3 className="font-heading font-black text-lg text-[#171717] tracking-tight uppercase">NO SESSIONS FOUND</h3>
          <p className="text-xs text-[#171717]/70 max-w-sm mx-auto font-sans">
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
                className="bg-white border-2 border-[#171717] rounded-xl shadow-neo hover:shadow-neo-lg transition-all overflow-hidden"
              >
                {/* Session Summary Header */}
                <div
                  onClick={() =>
                    setExpandedSessionId(isExpanded ? null : sess.id)
                  }
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none bg-white border-b-2 border-[#171717]/10 hover:bg-[#F5F1E8]/50"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-[#3155F5] text-white border-2 border-[#171717] font-black shadow-neo-sm">
                        {formattedDate}
                      </span>
                      {sess.phaseId && (
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-[#B9A5EF] text-[#171717] border-2 border-[#171717] font-black shadow-neo-sm">
                          {sess.phaseId}
                        </span>
                      )}
                    </div>
                    <h3 className="font-heading font-black text-lg text-[#171717] tracking-tight uppercase">{sess.name}</h3>
                    {sess.notes && (
                      <p className="text-xs text-[#171717]/70 line-clamp-1 italic font-sans">
                        &ldquo;{sess.notes}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Right Metrics Pills */}
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="flex items-center gap-2 text-[#171717] font-bold">
                      <span className="flex items-center gap-1 bg-[#F5F1E8] px-2.5 py-1 rounded-lg border-2 border-[#171717] shadow-neo-sm">
                        <Clock className="w-3.5 h-3.5 text-[#3155F5]" />
                        {formatDuration(sess.durationSeconds)}
                      </span>
                      <span className="flex items-center gap-1 bg-[#F5F1E8] px-2.5 py-1 rounded-lg border-2 border-[#171717] shadow-neo-sm">
                        <Dumbbell className="w-3.5 h-3.5 text-[#FF7043]" />
                        {sess.totalVolume.toLocaleString()} kg
                      </span>
                      <span className="bg-[#E9F56A] text-[#171717] px-2.5 py-1 rounded-lg border-2 border-[#171717] shadow-neo-sm font-black">
                        {totalSets} sets
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(sess);
                        }}
                        className="p-1.5 rounded-md border-2 border-[#171717] bg-[#F5F1E8] hover:bg-[#3155F5] hover:text-white text-[#171717] transition-all shadow-neo-sm cursor-pointer"
                        title="Edit Session"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(sess.id, sess.name);
                        }}
                        className="p-1.5 rounded-md border-2 border-[#171717] bg-[#FF7043] text-white hover:bg-[#e85d30] transition-all shadow-neo-sm cursor-pointer"
                        title="Delete Session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="p-1 rounded text-[#171717] font-black">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 stroke-[2.5]" />
                        ) : (
                          <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details: Exercise & Set Breakdown */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 pt-0 bg-[#F5F1E8] space-y-4">
                    <div className="text-xs font-mono uppercase font-black tracking-wider text-[#171717]/70 pt-4">
                      Recorded Movements &amp; Sets
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {sess.exercises.map((sessionEx, idx) => {
                        const exMeta = exercises.find(
                          (ex) => ex.id === sessionEx.exerciseId
                        );

                        return (
                          <div
                            key={sessionEx.id}
                            className="p-3.5 rounded-xl bg-white border-2 border-[#171717] shadow-neo-sm space-y-2.5"
                          >
                            <div className="flex items-center justify-between">
                              <h4 className="font-heading font-black text-sm text-[#171717] uppercase">
                                {idx + 1}. {exMeta?.name || "Exercise"}
                              </h4>
                              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-[#3155F5] text-white border-2 border-[#171717] font-black shadow-neo-sm">
                                {exMeta?.primaryMuscleGroup}
                              </span>
                            </div>

                            <div className="space-y-1">
                              {sessionEx.sets.map((s) => (
                                <div
                                  key={s.id}
                                  className={cn(
                                    "flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono border-2 border-[#171717]/15",
                                    s.isCompleted
                                      ? "bg-[#F5F1E8] text-[#171717] font-bold"
                                      : "bg-white text-[#171717]/40"
                                  )}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="w-4 text-center font-black text-[#3155F5]">
                                      {s.setType === "warmup" ? "W" : s.setNumber}
                                    </span>
                                    <span>
                                      {s.weight} kg × {s.reps} reps
                                    </span>
                                  </div>
                                  <span className="text-[#171717]/60 text-[11px] font-bold">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white border-2 border-[#171717] rounded-xl shadow-neo-lg p-6 w-full max-w-md relative font-sans space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[#171717]/15 pb-3">
              <h3 className="font-heading font-black text-xl text-[#171717] tracking-tight uppercase">EDIT WORKOUT DETAILS</h3>
              <button
                onClick={() => setEditingSession(null)}
                className="p-1.5 rounded-lg border-2 border-[#171717] bg-[#F5F1E8] hover:bg-[#3155F5] hover:text-white text-[#171717] transition-all cursor-pointer shadow-neo-sm"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase font-black text-[#171717] mb-1.5">
                  Workout Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#F5F1E8] border-2 border-[#171717] text-[#171717] text-sm focus:outline-none focus:ring-2 focus:ring-[#3155F5] font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase font-black text-[#171717] mb-1.5">
                  Workout Notes
                </label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-[#F5F1E8] border-2 border-[#171717] text-[#171717] text-sm focus:outline-none focus:ring-2 focus:ring-[#3155F5] resize-none font-sans"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t-2 border-[#171717]/15">
                <button
                  type="button"
                  onClick={() => setEditingSession(null)}
                  className="px-4 py-2.5 rounded-lg bg-[#F5F1E8] border-2 border-[#171717] hover:bg-white text-[#171717] text-xs font-mono font-bold uppercase transition-all shadow-neo-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-[#3155F5] hover:bg-[#2542C7] text-white text-xs font-mono uppercase font-black tracking-wider border-2 border-[#171717] shadow-neo cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5"
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
