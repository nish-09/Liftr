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
import { PageHeader, PastelCard, PastelBadge } from "@/components/ui/DesignSystem";
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
          "w-full h-full px-2.5 py-1.5 bg-[#E9FF91]/60 text-[#142746] text-xs font-bold focus:outline-none ring-2 ring-inset ring-[#142746]",
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
        "w-full h-full min-h-[36px] px-2.5 py-1.5 text-xs transition-colors hover:bg-[#E9FF91]/35 cursor-text flex items-center",
        align === "center" ? "justify-center text-center" : "justify-start text-left",
        value ? "text-[#142746] font-semibold" : "text-[#8993A5]",
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
      const baseWeight = workingSets.find((s) => (s.weight || 0) > 0)?.weight ?? 0;

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

      const mergedSets: SetLogItem[] = [...warmups, ...updatedWorking].map((s, idx) => ({
        ...s,
        setNumber: idx + 1,
      }));

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

      const exerciseByName = new Map(
        exercises.map((ex) => [ex.name.trim().toLowerCase(), ex])
      );

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
      <PageHeader
        title="Workout History"
        subtitle="Click any cell to edit inline."
        actions={
          <>
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
              className="neo-btn min-h-[44px] px-3.5 py-2 rounded-xl bg-white text-[#142746] text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer flex-1 sm:flex-initial"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import Sheet CSV</span>
            </button>
            <button
              type="button"
              disabled={filteredSessions.length === 0}
              onClick={() => downloadWorkoutSheetCSV(filteredSessions, exercises, plans)}
              className="neo-btn min-h-[44px] px-3.5 py-2 rounded-xl bg-[#142746] text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer flex-1 sm:flex-initial"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Sheet CSV</span>
            </button>
          </>
        }
      />

      {importFeedback && (
        <PastelCard tone="lime" className="px-4 py-2.5 text-xs font-bold flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4" />
          <span>{importFeedback}</span>
        </PastelCard>
      )}

      {/* Search & Filter */}
      <PastelCard tone="white" className="p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8993A5] absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search workout name or exercise..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FAF9FD] border-[1.5px] border-[#142746] text-sm text-[#142746] placeholder:text-[#8993A5] focus:outline-none"
          />
        </div>

        <select
          value={selectedPlanFilter}
          onChange={(e) => setSelectedPlanFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-[#FAF9FD] border-[1.5px] border-[#142746] text-xs font-bold text-[#142746] cursor-pointer focus:outline-none"
        >
          <option value="all">All Workout Plans</option>
          {plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </PastelCard>

      {/* Spreadsheet View */}
      {filteredSessions.length === 0 ? (
        <PastelCard tone="white" className="overflow-hidden">
          <div className="overflow-x-auto border-b-[1.5px] border-[#142746]">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-[#BDF7B6] text-[#142746] border-b border-[#142746]">
                  <th className="px-3 py-2.5 bg-[#E9FF91] font-heading font-extrabold border-r border-[#142746] whitespace-nowrap">
                    DAY 1
                  </th>
                  <th className="px-3 py-2.5 text-left font-heading font-extrabold border-r border-[#142746]/25 whitespace-nowrap">
                    Exercise
                  </th>
                  <th className="px-3 py-2.5 text-center font-heading font-extrabold border-r border-[#142746]/25 whitespace-nowrap">
                    Sets
                  </th>
                  <th className="px-3 py-2.5 text-center font-heading font-extrabold border-r border-[#142746]/25 whitespace-nowrap">
                    Reps
                  </th>
                  <th className="px-3 py-2.5 text-center font-heading font-extrabold border-r border-[#142746]/25 whitespace-nowrap">
                    Rest (Seconds)
                  </th>
                  <th className="px-3 py-2.5 text-center font-heading font-extrabold border-r border-[#142746]/25 whitespace-nowrap">
                    Weight
                  </th>
                  {setColumnHeaders.map((label) => (
                    <th
                      key={label}
                      className="px-3 py-2.5 text-center font-heading font-extrabold border-r border-[#142746]/25 whitespace-nowrap"
                    >
                      {label}
                    </th>
                  ))}
                  <th className="px-3 py-2.5 text-left font-heading font-extrabold whitespace-nowrap">
                    Note
                  </th>
                </tr>
              </thead>
            </table>
          </div>

          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-[#EBCBF7] border-[1.5px] border-[#142746] flex items-center justify-center text-[#142746]">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-extrabold text-lg text-[#142746]">
              No Sessions Found
            </h3>
            <p className="text-xs text-[#8993A5] max-w-md mx-auto">
              Complete a session in Live Workout or click <strong>Import Sheet CSV</strong> to populate your Day-by-Day training spreadsheet.
            </p>
          </div>
        </PastelCard>
      ) : (
        <PastelCard tone="white" className="overflow-hidden">
          <div className="lg:hidden px-3 py-1.5 bg-[#E9FF91]/60 border-b border-[#142746] text-[11px] font-bold text-[#142746] flex items-center justify-between">
            <span>Day-by-Day Training Sheet</span>
            <span>Swipe table →</span>
          </div>
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
                      {sessIdx > 0 && (
                        <tr>
                          <td
                            colSpan={totalColCount}
                            className="h-4 bg-[#EBCBF7]/45 border-y-[1.5px] border-[#142746]"
                          />
                        </tr>
                      )}

                      {/* Session Meta Strip */}
                      <tr className="bg-[#FAF9FD] border-b border-[#142746]">
                        <td colSpan={totalColCount} className="px-3 py-2">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-[#142746] border border-[#142746] font-bold">
                                {formattedDate}
                              </span>
                              <span className="font-heading font-extrabold text-xs text-[#142746]">
                                {sess.name}
                              </span>
                              {sess.phaseId && (
                                <PastelBadge tone="lavender" className="text-[10px]">
                                  {sess.phaseId}
                                </PastelBadge>
                              )}
                              {sess.notes && (
                                <span className="text-[11px] italic text-[#8993A5]">
                                  &ldquo;{sess.notes}&rdquo;
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-[11px] font-bold text-[#142746]">
                              {sess.durationSeconds > 0 && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-[#142746]">
                                  <Clock className="w-3 h-3" />
                                  {formatDuration(sess.durationSeconds)}
                                </span>
                              )}
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-[#142746]">
                                <Dumbbell className="w-3 h-3" />
                                {sess.totalVolume.toLocaleString()} kg
                              </span>
                              <button
                                type="button"
                                onClick={() => openEditModal(sess)}
                                className="p-1.5 rounded-lg bg-white hover:bg-[#E9FF91] border border-[#142746] cursor-pointer"
                                title="Edit Session Info"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(sess.id, sess.name)}
                                className="p-1.5 rounded-lg bg-[#F8C3B5] text-[#142746] border border-[#142746] cursor-pointer"
                                title="Delete Session"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>

                      {/* Exact Spreadsheet Column Header Row */}
                      <tr className="bg-[#BDF7B6] text-[#142746] border-b-[1.5px] border-[#142746]">
                        <th className="px-3 py-2.5 bg-[#E9FF91] text-[#142746] font-heading font-extrabold text-xs text-center border-r-[1.5px] border-[#142746] min-w-[88px] whitespace-nowrap">
                          {dayLabel}
                        </th>
                        <th className="px-3 py-2.5 text-left font-heading font-extrabold text-xs border-r border-[#142746]/25 min-w-[220px] whitespace-nowrap">
                          Exercise
                        </th>
                        <th className="px-3 py-2.5 text-center font-heading font-extrabold text-xs border-r border-[#142746]/25 w-16 whitespace-nowrap">
                          Sets
                        </th>
                        <th className="px-3 py-2.5 text-center font-heading font-extrabold text-xs border-r border-[#142746]/25 w-16 whitespace-nowrap">
                          Reps
                        </th>
                        <th className="px-3 py-2.5 text-center font-heading font-extrabold text-xs border-r border-[#142746]/25 w-32 whitespace-nowrap">
                          Rest (Seconds)
                        </th>
                        <th className="px-3 py-2.5 text-center font-heading font-extrabold text-xs border-r border-[#142746]/25 w-24 whitespace-nowrap">
                          Weight
                        </th>
                        {setColumnHeaders.map((colHeader) => (
                          <th
                            key={colHeader}
                            className="px-3 py-2.5 text-center font-heading font-extrabold text-xs border-r border-[#142746]/25 min-w-[118px] whitespace-nowrap"
                          >
                            {colHeader}
                          </th>
                        ))}
                        <th className="px-3 py-2.5 text-left font-heading font-extrabold text-xs min-w-[230px] whitespace-nowrap">
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
                            className="border-b border-[#142746]/15 hover:bg-[#FAF9FD] transition-colors"
                          >
                            <td className="bg-[#FAF9FD] border-r-[1.5px] border-[#142746] px-2 py-1.5" />
                            <td className="px-3 py-2 font-semibold text-[#142746] border-r border-[#142746]/15">
                              {exMeta?.name || "Exercise"}
                            </td>
                            <td className="px-2 py-2 text-center font-bold text-[#142746] border-r border-[#142746]/15">
                              {workingSets.length || "—"}
                            </td>
                            <td className="p-0 border-r border-[#142746]/15">
                              <EditableCell
                                type="number"
                                value={targetRepsVal !== null ? String(targetRepsVal) : ""}
                                placeholder="—"
                                onCommit={(val) => handleCommitTargetReps(sess, sessionEx, val)}
                              />
                            </td>
                            <td className="p-0 border-r border-[#142746]/15">
                              <EditableCell
                                type="number"
                                value={String(restVal)}
                                onCommit={(val) => handleCommitRest(sess, sessionEx, val)}
                              />
                            </td>
                            <td className="p-0 border-r border-[#142746]/15">
                              <EditableCell
                                type="text"
                                value={weightDisplay}
                                placeholder=""
                                onCommit={(val) => handleCommitWeight(sess, sessionEx, val)}
                              />
                            </td>
                            {setColumnHeaders.map((_, setIdx) => {
                              const setItem = workingSets[setIdx];
                              const displayVal =
                                setItem && (setItem.isCompleted || (setItem.reps || 0) > 0)
                                  ? String(setItem.reps)
                                  : "";

                              return (
                                <td
                                  key={setIdx}
                                  className="p-0 border-r border-[#142746]/15"
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
                            <td className="p-0">
                              <EditableCell
                                type="text"
                                align="left"
                                value={sessionEx.notes || ""}
                                placeholder="Add note..."
                                onCommit={(val) => handleCommitNote(sess, sessionEx, val)}
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
        </PastelCard>
      )}

      {/* Edit Session Modal */}
      {editingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#142746]/50 backdrop-blur-sm overflow-y-auto">
          <PastelCard tone="white" className="p-5 sm:p-6 w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto my-auto space-y-4 shadow-neo-xl">
            <div className="flex items-center justify-between border-b border-[#142746]/15 pb-3">
              <h3 className="font-heading font-extrabold text-xl text-[#142746]">
                Edit Workout Details
              </h3>
              <button
                onClick={() => setEditingSession(null)}
                className="p-1.5 rounded-xl border-[1.5px] border-[#142746] bg-[#FAF9FD] hover:bg-[#EBCBF7] text-[#142746] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#142746] mb-1.5">
                  Workout Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border-[1.5px] border-[#142746] text-[#142746] text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#142746] mb-1.5">
                  Workout Notes
                </label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border-[1.5px] border-[#142746] text-[#142746] text-sm resize-none focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#142746]/15">
                <button
                  type="button"
                  onClick={() => setEditingSession(null)}
                  className="neo-btn px-4 py-2 rounded-xl bg-white text-[#142746] text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="neo-btn px-5 py-2 rounded-xl bg-[#142746] text-white text-xs font-bold cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </PastelCard>
        </div>
      )}
    </div>
  );
}
