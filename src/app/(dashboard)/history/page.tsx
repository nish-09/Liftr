"use client";

import { useState, useMemo, useRef, Fragment } from "react";
import { useHistoryStore } from "@/stores/useHistoryStore";
import { useExerciseStore } from "@/stores/useExerciseStore";
import { usePlanStore } from "@/stores/usePlanStore";
import { formatDuration, cn } from "@/lib/utils";
import { calculateVolume } from "@/lib/calculations/strength";
import {
  downloadWorkoutSheetCSV,
  parseWorkoutSheetCSV,
  getSetColumnLabel,
  getWorkingSets,
  getSessionDayLabel,
  formatSheetWeight,
} from "@/lib/export/dataHandler";
import { WorkoutSessionItem, SessionExerciseItem, SetLogItem } from "@/types";
import {
  Calendar,
  Clock,
  Dumbbell,
  Trash2,
  Search,
  Edit2,
  X,
  Download,
  Upload,
  FileSpreadsheet,
} from "lucide-react";

interface EditableCellProps {
  value: string;
  placeholder?: string;
  type?: "text" | "number";
  align?: "left" | "center";
  onCommit: (nextValue: string) => void;
  className?: string;
}

function EditableCell({
  value,
  placeholder = "",
  type = "text",
  align = "center",
  onCommit,
  className,
}: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  function startEditing() {
    setDraft(value);
    setIsEditing(true);
  }

  function commit() {
    setIsEditing(false);
    if (draft !== value) {
      onCommit(draft);
    }
  }

  if (isEditing) {
    return (
      <input
        autoFocus
        type={type}
        step={type === "number" ? "any" : undefined}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onFocus={(e) => e.target.select()}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            commit();
          } else if (e.key === "Escape") {
            setIsEditing(false);
            setDraft(value);
          }
        }}
        className={cn(
          "w-full h-full px-2 py-1.5 bg-[#E9F56A]/40 text-[#171717] font-mono text-xs font-bold focus:outline-none ring-2 ring-inset ring-[#3155F5]",
          align === "center" ? "text-center" : "text-left",
          className
        )}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={startEditing}
      title="Click to edit cell"
      className={cn(
        "w-full h-full min-h-[34px] px-2.5 py-1.5 font-mono text-xs transition-colors hover:bg-[#E9F56A]/25 cursor-text flex items-center",
        align === "center" ? "justify-center text-center" : "justify-start text-left",
        value ? "text-[#171717] font-semibold" : "text-[#171717]/30",
        className
      )}
    >
      <span className={cn(align === "left" && "line-clamp-2 break-words")}>
        {value || placeholder}
      </span>
    </button>
  );
}

function recalculateSessionVolume(exercisesList: SessionExerciseItem[]): number {
  return exercisesList.reduce((sum, ex) => sum + calculateVolume(ex.sets), 0);
}

export default function HistoryPage() {
  const {
    sessions,
    addCompletedSession,
    deleteHistoricalSession,
    updateHistoricalSession,
  } = useHistoryStore();
  const { exercises, addExercise } = useExerciseStore();
  const { plans } = usePlanStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlanFilter, setSelectedPlanFilter] = useState("all");
  const [importFeedback, setImportFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit Modal State
  const [editingSession, setEditingSession] = useState<WorkoutSessionItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const filteredSessions = useMemo(() => {
    return sessions.filter((sess) => {
      const matchesSearch =
        sess.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sess.exercises.some((e) => {
          const exMeta = exercises.find((ex) => ex.id === e.exerciseId) || e.exercise;
          return exMeta?.name.toLowerCase().includes(searchQuery.toLowerCase());
        });

      const matchesPlan =
        selectedPlanFilter === "all" || sess.planId === selectedPlanFilter;

      return matchesSearch && matchesPlan;
    });
  }, [sessions, searchQuery, selectedPlanFilter, exercises]);

  // Match the Google Sheet's First / Second / Third Set Reps columns by default,
  // expanding dynamically if any visible session has 4+ working sets.
  const maxSetColumns = useMemo(() => {
    let maxSets = 3;
    filteredSessions.forEach((sess) => {
      sess.exercises.forEach((ex) => {
        const count = getWorkingSets(ex).length;
        if (count > maxSets) maxSets = count;
      });
    });
    return maxSets;
  }, [filteredSessions]);

  const setColumnHeaders = useMemo(
    () => Array.from({ length: maxSetColumns }, (_, idx) => getSetColumnLabel(idx)),
    [maxSetColumns]
  );

  function handleDelete(id: string, name: string) {
    if (
      confirm(
        `Are you sure you want to delete "${name}"? Derived analytics and personal records will be recalculated.`
      )
    ) {
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

  function updateSessionExercise(
    sess: WorkoutSessionItem,
    sessionExId: string,
    transform: (ex: SessionExerciseItem) => SessionExerciseItem
  ) {
    const updatedExercises = sess.exercises.map((ex) =>
      ex.id === sessionExId ? transform(ex) : ex
    );
    const updatedVolume = recalculateSessionVolume(updatedExercises);
    updateHistoricalSession(sess.id, {
      exercises: updatedExercises,
      totalVolume: updatedVolume,
    });
  }

  function handleCommitTargetReps(sess: WorkoutSessionItem, ex: SessionExerciseItem, raw: string) {
    const parsed = parseInt(raw, 10);
    const nextTarget = Number.isNaN(parsed) || parsed < 0 ? null : parsed;
    updateSessionExercise(sess, ex.id, (item) => ({
      ...item,
      targetReps: nextTarget,
      sets: item.sets.map((s) => ({ ...s, targetReps: nextTarget })),
    }));
  }

  function handleCommitRest(sess: WorkoutSessionItem, ex: SessionExerciseItem, raw: string) {
    const parsed = parseInt(raw, 10);
    const nextRest = Number.isNaN(parsed) || parsed < 0 ? 0 : parsed;
    updateSessionExercise(sess, ex.id, (item) => ({
      ...item,
      restDuration: nextRest,
    }));
  }

  function handleCommitWeight(sess: WorkoutSessionItem, ex: SessionExerciseItem, raw: string) {
    const trimmed = raw.trim();
    const parsed = trimmed === "" ? 0 : parseFloat(trimmed);
    if (trimmed !== "" && Number.isNaN(parsed)) return;
    const nextWeight = Math.max(0, parsed || 0);

    updateSessionExercise(sess, ex.id, (item) => ({
      ...item,
      sets: item.sets.map((s) =>
        s.setType === "warmup" ? s : { ...s, weight: nextWeight }
      ),
    }));
  }

  function handleCommitSetReps(
    sess: WorkoutSessionItem,
    ex: SessionExerciseItem,
    setIndex: number,
    raw: string
  ) {
    const trimmed = raw.trim();
    const parsed = trimmed === "" ? null : parseInt(trimmed, 10);
    if (parsed !== null && (Number.isNaN(parsed) || parsed < 0)) return;

    updateSessionExercise(sess, ex.id, (item) => {
      const workingSets = getWorkingSets(item);
      const warmups = item.sets.filter((s) => s.setType === "warmup");
      const baseWeight =
        workingSets.find((s) => (s.weight || 0) > 0)?.weight ?? 0;

      const updatedWorking = [...workingSets];
      while (updatedWorking.length <= setIndex) {
        const nextNum = updatedWorking.length + 1;
        updatedWorking.push({
          id: crypto.randomUUID(),
          sessionExerciseId: item.id,
          sessionId: sess.id,
          exerciseId: item.exerciseId,
          setNumber: nextNum,
          setType: "normal",
          weight: baseWeight,
          reps: 0,
          targetReps: item.targetReps ?? null,
          isCompleted: false,
        });
      }

      updatedWorking[setIndex] = {
        ...updatedWorking[setIndex],
        reps: parsed ?? 0,
        isCompleted: parsed !== null,
      };

      const mergedSets: SetLogItem[] = [...warmups, ...updatedWorking].map(
        (s, idx) => ({ ...s, setNumber: idx + 1 })
      );

      return {
        ...item,
        sets: mergedSets,
        isCompleted: mergedSets.some((s) => s.isCompleted),
      };
    });
  }

  function handleCommitNote(sess: WorkoutSessionItem, ex: SessionExerciseItem, raw: string) {
    updateSessionExercise(sess, ex.id, (item) => ({
      ...item,
      notes: raw.trim() || null,
    }));
  }

  function handleImportSheetCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text !== "string") return;

      const blocks = parseWorkoutSheetCSV(text);
      if (blocks.length === 0) {
        setImportFeedback("No valid workout day blocks found in CSV.");
        return;
      }

      // Build lookup map of existing exercises by lowercase name
      const exerciseByName = new Map(
        exercises.map((ex) => [ex.name.trim().toLowerCase(), ex])
      );

      // Insert in reverse order because addCompletedSession prepends newest sessions first,
      // keeping DAY 1..DAY N in natural spreadsheet top-to-bottom order.
      const baseTime = Date.now();
      [...blocks].reverse().forEach((block, revIdx) => {
        const sessionId = `sess-import-${crypto.randomUUID()}`;
        const timestamp = new Date(baseTime - revIdx * 60_000).toISOString();

        const sessionExercises: SessionExerciseItem[] = block.exercises.map((row, exIdx) => {
          const normalizedName = row.name.trim().toLowerCase();
          let exMeta = exerciseByName.get(normalizedName);
          if (!exMeta) {
            exMeta = addExercise({
              name: row.name.trim(),
              primaryMuscleGroup: "full_body",
              secondaryMuscleGroups: [],
              equipment: "other",
              weightUnit: "kg",
              defaultRestDuration: row.restDuration || 120,
              progressionIncrement: 2.5,
              isFavorite: false,
            });
            exerciseByName.set(normalizedName, exMeta);
          }

          const sessionExId = crypto.randomUUID();
          const setCount = Math.max(row.targetSets, row.setReps.length, 1);
          const sets: SetLogItem[] = Array.from({ length: setCount }, (_, sIdx) => {
            const repVal = row.setReps[sIdx] ?? null;
            return {
              id: crypto.randomUUID(),
              sessionExerciseId: sessionExId,
              sessionId,
              exerciseId: exMeta!.id,
              setNumber: sIdx + 1,
              setType: "normal",
              weight: row.weight || 0,
              reps: repVal ?? 0,
              targetReps: row.targetReps,
              isCompleted: repVal !== null,
            };
          });

          return {
            id: sessionExId,
            sessionId,
            exerciseId: exMeta.id,
            orderInSession: exIdx + 1,
            targetReps: row.targetReps,
            restDuration: row.restDuration,
            notes: row.note || null,
            isCompleted: sets.some((s) => s.isCompleted),
            exercise: exMeta,
            sets,
          };
        });

        const totalVolume = recalculateSessionVolume(sessionExercises);

        addCompletedSession({
          id: sessionId,
          userId: "local-user",
          name: block.dayLabel,
          startedAt: timestamp,
          completedAt: timestamp,
          durationSeconds: 0,
          status: "completed",
          notes: "",
          totalVolume,
          exercises: sessionExercises,
        });
      });

      setImportFeedback(`Imported ${blocks.length} workout day(s) into history.`);
      setTimeout(() => setImportFeedback(null), 4000);
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-heading font-black text-3xl md:text-4xl text-[#171717] tracking-tight uppercase">
              WORKOUT HISTORY
            </h1>
            <span className="px-2.5 py-1 rounded-lg bg-[#3155F5] text-white border-2 border-[#171717] text-xs font-mono font-bold shadow-neo-sm">
              {filteredSessions.length} Completed Logs
            </span>
          </div>
          <p className="text-sm text-[#171717]/70 font-sans mt-1">
            Spreadsheet logbook matching your Day-by-Day training sheet. Click any Weight, Reps, Rest, or Note cell to edit inline.
          </p>
        </div>

        {/* Sheet Import / Export Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleImportSheetCSV}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-[#E9F56A] text-[#171717] text-xs font-mono font-bold uppercase border-2 border-[#171717] shadow-neo-sm cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5"
          >
            <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Import Sheet CSV</span>
          </button>
          <button
            type="button"
            disabled={filteredSessions.length === 0}
            onClick={() => downloadWorkoutSheetCSV(filteredSessions, exercises, plans)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#3155F5] hover:bg-[#2542C7] disabled:opacity-40 text-white text-xs font-mono font-bold uppercase border-2 border-[#171717] shadow-neo-sm cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Export Sheet CSV</span>
          </button>
        </div>
      </div>

      {importFeedback && (
        <div className="px-4 py-2.5 rounded-lg bg-[#E9F56A] border-2 border-[#171717] shadow-neo-sm text-xs font-mono font-bold text-[#171717] flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 stroke-[2.5]" />
          <span>{importFeedback}</span>
        </div>
      )}

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

      {/* Spreadsheet View */}
      {filteredSessions.length === 0 ? (
        <div className="bg-white border-2 border-[#171717] rounded-xl shadow-neo overflow-hidden">
          {/* Show exact sheet header structure preview even when empty */}
          <div className="overflow-x-auto border-b-2 border-[#171717]">
            <table className="w-full border-collapse text-xs font-mono">
              <thead>
                <tr className="bg-[#3155F5] text-white border-b-2 border-[#171717]">
                  <th className="px-3 py-2.5 bg-[#E9F56A] text-[#171717] font-heading font-black uppercase border-r border-[#171717] whitespace-nowrap">
                    DAY 1
                  </th>
                  <th className="px-3 py-2.5 text-left font-heading font-black uppercase border-r border-[#171717]/40 whitespace-nowrap">
                    Exercise
                  </th>
                  <th className="px-3 py-2.5 text-center font-heading font-black uppercase border-r border-[#171717]/40 whitespace-nowrap">
                    Sets
                  </th>
                  <th className="px-3 py-2.5 text-center font-heading font-black uppercase border-r border-[#171717]/40 whitespace-nowrap">
                    Reps
                  </th>
                  <th className="px-3 py-2.5 text-center font-heading font-black uppercase border-r border-[#171717]/40 whitespace-nowrap">
                    Rest (Seconds)
                  </th>
                  <th className="px-3 py-2.5 text-center font-heading font-black uppercase border-r border-[#171717]/40 whitespace-nowrap">
                    Weight
                  </th>
                  {setColumnHeaders.map((label) => (
                    <th
                      key={label}
                      className="px-3 py-2.5 text-center font-heading font-black uppercase border-r border-[#171717]/40 whitespace-nowrap"
                    >
                      {label}
                    </th>
                  ))}
                  <th className="px-3 py-2.5 text-left font-heading font-black uppercase whitespace-nowrap">
                    Note
                  </th>
                </tr>
              </thead>
            </table>
          </div>

          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-xl bg-[#3155F5]/10 border-2 border-[#171717] flex items-center justify-center text-[#171717]">
              <Calendar className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h3 className="font-heading font-black text-lg text-[#171717] tracking-tight uppercase">
              NO SESSIONS FOUND
            </h3>
            <p className="text-xs text-[#171717]/70 max-w-md mx-auto font-sans">
              Complete a session in Live Workout or click <strong>Import Sheet CSV</strong> to populate your Day-by-Day training spreadsheet.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white border-2 border-[#171717] rounded-xl shadow-neo overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <tbody>
                {filteredSessions.map((sess, sessIdx) => {
                  const formattedDate = new Date(
                    sess.completedAt || sess.startedAt
                  ).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });

                  const dayLabel = getSessionDayLabel(
                    sess,
                    filteredSessions.length - sessIdx,
                    plans
                  );

                  const matchedPlan = sess.planId
                    ? plans.find((p) => p.id === sess.planId)
                    : undefined;
                  const matchedPlanDay =
                    matchedPlan && sess.planDayId
                      ? matchedPlan.days.find((d) => d.id === sess.planDayId)
                      : undefined;

                  const totalColCount = 7 + maxSetColumns;

                  return (
                    <Fragment key={sess.id}>
                      {/* Spacer row between Day blocks (matches blank separator rows in sheet) */}
                      {sessIdx > 0 && (
                        <tr>
                          <td
                            colSpan={totalColCount}
                            className="h-5 bg-[#F5F1E8] border-y-2 border-[#171717]"
                          />
                        </tr>
                      )}

                      {/* Compact Session Meta & Action Bar */}
                      <tr className="bg-[#F5F1E8] border-b border-[#171717]">
                        <td colSpan={totalColCount} className="px-3 py-2">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white text-[#171717] border border-[#171717] font-bold">
                                {formattedDate}
                              </span>
                              <span className="font-heading font-black text-xs text-[#171717] uppercase tracking-tight">
                                {sess.name}
                              </span>
                              {sess.phaseId && (
                                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#B9A5EF] text-[#171717] border border-[#171717] font-bold">
                                  {sess.phaseId}
                                </span>
                              )}
                              {sess.notes && (
                                <span className="text-[11px] font-sans italic text-[#171717]/70">
                                  &ldquo;{sess.notes}&rdquo;
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-[#171717]">
                              {sess.durationSeconds > 0 && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-[#171717]">
                                  <Clock className="w-3 h-3 text-[#3155F5]" />
                                  {formatDuration(sess.durationSeconds)}
                                </span>
                              )}
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-[#171717]">
                                <Dumbbell className="w-3 h-3 text-[#FF7043]" />
                                {sess.totalVolume.toLocaleString()} kg
                              </span>
                              <button
                                type="button"
                                onClick={() => openEditModal(sess)}
                                className="p-1 rounded bg-white hover:bg-[#3155F5] hover:text-white border border-[#171717] transition-colors cursor-pointer"
                                title="Edit Session Info"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(sess.id, sess.name)}
                                className="p-1 rounded bg-[#FF7043] hover:bg-[#e85d30] text-white border border-[#171717] transition-colors cursor-pointer"
                                title="Delete Session"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>

                      {/* Exact Google Sheet Column Header Row */}
                      <tr className="bg-[#3155F5] text-white border-b-2 border-[#171717]">
                        <th className="px-3 py-2.5 bg-[#E9F56A] text-[#171717] font-heading font-black text-xs uppercase text-center border-r-2 border-[#171717] min-w-[88px] whitespace-nowrap">
                          {dayLabel}
                        </th>
                        <th className="px-3 py-2.5 text-left font-heading font-black text-xs uppercase border-r border-white/25 min-w-[230px] whitespace-nowrap">
                          Exercise
                        </th>
                        <th className="px-3 py-2.5 text-center font-heading font-black text-xs uppercase border-r border-white/25 w-16 whitespace-nowrap">
                          Sets
                        </th>
                        <th className="px-3 py-2.5 text-center font-heading font-black text-xs uppercase border-r border-white/25 w-16 whitespace-nowrap">
                          Reps
                        </th>
                        <th className="px-3 py-2.5 text-center font-heading font-black text-xs uppercase border-r border-white/25 w-32 whitespace-nowrap">
                          Rest (Seconds)
                        </th>
                        <th className="px-3 py-2.5 text-center font-heading font-black text-xs uppercase border-r border-white/25 w-24 whitespace-nowrap">
                          Weight
                        </th>
                        {setColumnHeaders.map((colHeader) => (
                          <th
                            key={colHeader}
                            className="px-3 py-2.5 text-center font-heading font-black text-xs uppercase border-r border-white/25 min-w-[118px] whitespace-nowrap"
                          >
                            {colHeader}
                          </th>
                        ))}
                        <th className="px-3 py-2.5 text-left font-heading font-black text-xs uppercase min-w-[240px] whitespace-nowrap">
                          Note
                        </th>
                      </tr>

                      {/* Exercise Rows */}
                      {sess.exercises.map((sessionEx) => {
                        const exMeta =
                          exercises.find((ex) => ex.id === sessionEx.exerciseId) ||
                          sessionEx.exercise;
                        const planEx = matchedPlanDay?.exercises.find(
                          (pe) => pe.exerciseId === sessionEx.exerciseId
                        );
                        const workingSets = getWorkingSets(sessionEx);

                        const targetRepsVal =
                          sessionEx.targetReps ??
                          workingSets[0]?.targetReps ??
                          planEx?.maxReps ??
                          null;
                        const restVal =
                          sessionEx.restDuration ??
                          planEx?.restDuration ??
                          exMeta?.defaultRestDuration ??
                          120;
                        const weightDisplay = formatSheetWeight(workingSets);

                        return (
                          <tr
                            key={sessionEx.id}
                            className="border-b border-[#171717]/20 hover:bg-[#F5F1E8]/50 transition-colors"
                          >
                            {/* Blank Day gutter cell */}
                            <td className="bg-[#F5F1E8]/50 border-r-2 border-[#171717] px-2 py-1.5" />

                            {/* Exercise Name */}
                            <td className="px-3 py-2 font-sans font-bold text-[#171717] border-r border-[#171717]/20">
                              {exMeta?.name || "Exercise"}
                            </td>

                            {/* Sets */}
                            <td className="px-2 py-2 text-center font-mono font-bold text-[#171717] border-r border-[#171717]/20">
                              {workingSets.length || "—"}
                            </td>

                            {/* Target Reps */}
                            <td className="p-0 border-r border-[#171717]/20">
                              <EditableCell
                                type="number"
                                value={targetRepsVal !== null ? String(targetRepsVal) : ""}
                                placeholder="—"
                                onCommit={(val) =>
                                  handleCommitTargetReps(sess, sessionEx, val)
                                }
                              />
                            </td>

                            {/* Rest (Seconds) */}
                            <td className="p-0 border-r border-[#171717]/20">
                              <EditableCell
                                type="number"
                                value={String(restVal)}
                                onCommit={(val) =>
                                  handleCommitRest(sess, sessionEx, val)
                                }
                              />
                            </td>

                            {/* Weight */}
                            <td className="p-0 border-r border-[#171717]/20">
                              <EditableCell
                                type="text"
                                value={weightDisplay}
                                placeholder=""
                                onCommit={(val) =>
                                  handleCommitWeight(sess, sessionEx, val)
                                }
                              />
                            </td>

                            {/* First Set Reps, Second Set Reps, Third Set Reps, ... */}
                            {setColumnHeaders.map((_, setIdx) => {
                              const setItem = workingSets[setIdx];
                              const displayVal =
                                setItem && (setItem.isCompleted || (setItem.reps || 0) > 0)
                                  ? String(setItem.reps)
                                  : "";

                              return (
                                <td
                                  key={setIdx}
                                  className="p-0 border-r border-[#171717]/20"
                                >
                                  <EditableCell
                                    type="number"
                                    value={displayVal}
                                    placeholder=""
                                    onCommit={(val) =>
                                      handleCommitSetReps(sess, sessionEx, setIdx, val)
                                    }
                                  />
                                </td>
                              );
                            })}

                            {/* Note */}
                            <td className="p-0">
                              <EditableCell
                                type="text"
                                align="left"
                                value={sessionEx.notes || ""}
                                placeholder="Add note..."
                                onCommit={(val) =>
                                  handleCommitNote(sess, sessionEx, val)
                                }
                                className="font-sans"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Session Modal */}
      {editingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white border-2 border-[#171717] rounded-xl shadow-neo-lg p-6 w-full max-w-md relative font-sans space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[#171717]/15 pb-3">
              <h3 className="font-heading font-black text-xl text-[#171717] tracking-tight uppercase">
                EDIT WORKOUT DETAILS
              </h3>
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
