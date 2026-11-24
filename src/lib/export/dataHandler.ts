import {
  WorkoutSessionItem,
  SessionExerciseItem,
  SetLogItem,
  Exercise,
  WeightLogItem,
  BodyMeasurementItem,
  WorkoutPlanItem,
} from "@/types";

export interface FullBackupData {
  version: string;
  exportedAt: string;
  workouts: WorkoutSessionItem[];
  plans: WorkoutPlanItem[];
  exercises: Exercise[];
  weightLogs: WeightLogItem[];
  measurements: BodyMeasurementItem[];
}

/**
 * Generates and downloads a complete JSON backup of the user's data
 */
export function downloadJSONBackup(data: FullBackupData) {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(data, null, 2)
  )}`;
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", jsonString);
  downloadAnchor.setAttribute("download", `liftr-backup-${new Date().toISOString().split("T")[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Generates and downloads a CSV export of workout sessions
 */
export function downloadWorkoutsCSV(sessions: WorkoutSessionItem[], exercises: Exercise[]) {
  const headers = [
    "Date",
    "Workout Name",
    "Exercise Name",
    "Muscle Group",
    "Equipment",
    "Set Number",
    "Set Type",
    "Weight (kg)",
    "Reps",
    "Volume (kg)",
    "Completed",
    "Notes",
  ];

  const rows: string[] = [headers.join(",")];

  sessions.forEach((sess) => {
    const dateStr = sess.completedAt || sess.startedAt;
    sess.exercises.forEach((ex) => {
      const exMeta = exercises.find((e) => e.id === ex.exerciseId);
      ex.sets.forEach((s) => {
        const row = [
          escapeCSVCell(dateStr.split("T")[0]),
          escapeCSVCell(sess.name),
          escapeCSVCell(exMeta?.name || "Exercise"),
          escapeCSVCell(exMeta?.primaryMuscleGroup || ""),
          escapeCSVCell(exMeta?.equipment || ""),
          escapeCSVCell(s.setNumber),
          escapeCSVCell(s.setType),
          escapeCSVCell(s.weight),
          escapeCSVCell(s.reps),
          escapeCSVCell((s.weight * s.reps).toFixed(1)),
          escapeCSVCell(s.isCompleted ? "Yes" : "No"),
          escapeCSVCell(s.notes || ""),
        ];
        rows.push(row.join(","));
      });
    });
  });

  const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(rows.join("\n"));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", csvContent);
  downloadAnchor.setAttribute("download", `liftr-workouts-${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Simple robust CSV Parser with column preview
 */
export function parseCSV(csvText: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };

  // Split headers handling quotes
  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(current.trim().replace(/^"|"$/g, ""));
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim().replace(/^"|"$/g, ""));
    return result;
  };

  const headers = parseLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    if (values.length >= headers.length) {
      const rowObj: Record<string, string> = {};
      headers.forEach((h, idx) => {
        rowObj[h] = values[idx] || "";
      });
      rows.push(rowObj);
    }
  }

  return { headers, rows };
}

const SET_ORDINAL_LABELS = [
  "First Set Reps",
  "Second Set Reps",
  "Third Set Reps",
  "Fourth Set Reps",
  "Fifth Set Reps",
  "Sixth Set Reps",
  "Seventh Set Reps",
  "Eighth Set Reps",
];

/**
 * Returns the spreadsheet column header for the Nth working set (0-indexed).
 */
export function getSetColumnLabel(index: number): string {
  return SET_ORDINAL_LABELS[index] || `Set ${index + 1} Reps`;
}

/**
 * Returns working sets for an exercise row, falling back to all sets if only warmups exist.
 */
export function getWorkingSets(sessionEx: SessionExerciseItem): SetLogItem[] {
  const nonWarmups = sessionEx.sets.filter((s) => s.setType !== "warmup");
  return nonWarmups.length > 0 ? nonWarmups : sessionEx.sets;
}

/**
 * Resolves a concise DAY N label for a historical session block.
 */
export function getSessionDayLabel(
  session: WorkoutSessionItem,
  fallbackDayNumber: number,
  plans: WorkoutPlanItem[]
): string {
  const nameMatch = session.name.match(/\bday\s*(\d+)\b/i);
  if (nameMatch) {
    return `DAY ${nameMatch[1]}`;
  }
  if (session.planDayId) {
    for (const plan of plans) {
      const matchedDay = plan.days.find((d) => d.id === session.planDayId);
      if (matchedDay) {
        return `DAY ${matchedDay.dayNumber}`;
      }
    }
  }
  return `DAY ${fallbackDayNumber}`;
}

/**
 * Formats working weight(s) for the spreadsheet Weight column.
 */
export function formatSheetWeight(sets: SetLogItem[]): string {
  const weighted = sets.filter((s) => (s.weight || 0) > 0);
  if (weighted.length === 0) return "";
  const uniqueWeights = Array.from(new Set(weighted.map((s) => s.weight)));
  if (uniqueWeights.length === 1) return String(uniqueWeights[0]);
  return sets.map((s) => s.weight || 0).join(" / ");
}

function escapeCSVCell(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return "";
  let str = String(val);
  // Neutralize spreadsheet formula injection (=, +, -, @, tab, CR)
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Exports workout sessions in the exact multi-day spreadsheet CSV format.
 */
export function downloadWorkoutSheetCSV(
  sessions: WorkoutSessionItem[],
  exercises: Exercise[],
  plans: WorkoutPlanItem[]
) {
  let maxSetCols = 3;
  sessions.forEach((sess) => {
    sess.exercises.forEach((ex) => {
      const workingCount = getWorkingSets(ex).length;
      if (workingCount > maxSetCols) maxSetCols = workingCount;
    });
  });

  const setHeaders = Array.from({ length: maxSetCols }, (_, i) => getSetColumnLabel(i));
  const lines: string[] = [];

  sessions.forEach((sess, idx) => {
    if (idx > 0) {
      lines.push(",".repeat(6 + maxSetCols));
    }

    const dayLabel = getSessionDayLabel(sess, idx + 1, plans);
    lines.push(
      [
        dayLabel,
        "Exercise",
        "Sets",
        "Reps",
        "Rest (Seconds)",
        "Weight",
        ...setHeaders,
        "Note",
      ]
        .map(escapeCSVCell)
        .join(",")
    );

    const matchedPlan = sess.planId ? plans.find((p) => p.id === sess.planId) : undefined;
    const matchedPlanDay =
      matchedPlan && sess.planDayId
        ? matchedPlan.days.find((d) => d.id === sess.planDayId)
        : undefined;

    sess.exercises.forEach((sessionEx) => {
      const exMeta = exercises.find((e) => e.id === sessionEx.exerciseId) || sessionEx.exercise;
      const planEx = matchedPlanDay?.exercises.find((pe) => pe.exerciseId === sessionEx.exerciseId);
      const workingSets = getWorkingSets(sessionEx);

      const targetReps =
        sessionEx.targetReps ?? workingSets[0]?.targetReps ?? planEx?.maxReps ?? "";
      const restSeconds =
        sessionEx.restDuration ?? planEx?.restDuration ?? exMeta?.defaultRestDuration ?? 120;
      const weightDisplay = formatSheetWeight(workingSets);

      const setCells = Array.from({ length: maxSetCols }, (_, sIdx) => {
        const s = workingSets[sIdx];
        if (!s) return "";
        if (!s.isCompleted && (s.reps || 0) === 0) return "";
        return s.reps;
      });

      lines.push(
        [
          "",
          exMeta?.name || "Exercise",
          workingSets.length || "",
          targetReps,
          restSeconds,
          weightDisplay,
          ...setCells,
          sessionEx.notes || "",
        ]
          .map(escapeCSVCell)
          .join(",")
      );
    });
  });

  const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(lines.join("\n"));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", csvContent);
  downloadAnchor.setAttribute(
    "download",
    `liftr-workout-history-sheet-${new Date().toISOString().split("T")[0]}.csv`
  );
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export interface ParsedSheetExerciseRow {
  name: string;
  targetSets: number;
  targetReps: number;
  restDuration: number;
  weight: number;
  setReps: (number | null)[];
  note: string;
}

export interface ParsedSheetDayBlock {
  dayLabel: string;
  exercises: ParsedSheetExerciseRow[];
}

function splitCSVRow(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Parses a multi-day workout sheet CSV (DAY 1, Exercise, Sets, Reps, Rest (Seconds), Weight, First Set Reps..., Note).
 */
export function parseWorkoutSheetCSV(csvText: string): ParsedSheetDayBlock[] {
  const lines = csvText.split(/\r?\n/);
  const blocks: ParsedSheetDayBlock[] = [];
  let currentBlock: ParsedSheetDayBlock | null = null;
  let colMap: {
    exercise: number;
    sets: number;
    reps: number;
    rest: number;
    weight: number;
    setCols: number[];
    note: number;
  } | null = null;

  for (const rawLine of lines) {
    if (!rawLine.trim()) continue;
    const cells = splitCSVRow(rawLine);
    const nonEmptyCount = cells.filter((c) => c.length > 0).length;
    if (nonEmptyCount === 0) continue;

    // Detect header row (e.g., DAY 1, Exercise, Sets, Reps, ...)
    const exerciseHeaderIdx = cells.findIndex((c) => c.toLowerCase() === "exercise");
    if (exerciseHeaderIdx !== -1) {
      const dayLabel = cells[0] || `DAY ${blocks.length + 1}`;
      const lowerCells = cells.map((c) => c.toLowerCase());
      const setCols: number[] = [];
      lowerCells.forEach((c, idx) => {
        if (c.includes("set reps") || /^set\s*\d+/.test(c)) {
          setCols.push(idx);
        }
      });

      colMap = {
        exercise: exerciseHeaderIdx,
        sets: lowerCells.findIndex((c) => c === "sets"),
        reps: lowerCells.findIndex((c) => c === "reps"),
        rest: lowerCells.findIndex((c) => c.startsWith("rest")),
        weight: lowerCells.findIndex((c) => c === "weight"),
        setCols,
        note: lowerCells.findIndex((c) => c.startsWith("note")),
      };

      currentBlock = { dayLabel, exercises: [] };
      blocks.push(currentBlock);
      continue;
    }

    if (!currentBlock || !colMap) continue;
    const exName = cells[colMap.exercise] || "";
    if (!exName) continue;

    const setsNum = colMap.sets >= 0 ? parseInt(cells[colMap.sets] || "", 10) || 3 : 3;
    const targetRepsNum = colMap.reps >= 0 ? parseInt(cells[colMap.reps] || "", 10) || 12 : 12;
    const restNum = colMap.rest >= 0 ? parseInt(cells[colMap.rest] || "", 10) || 120 : 120;
    const weightNum = colMap.weight >= 0 ? parseFloat(cells[colMap.weight] || "") || 0 : 0;
    const noteText = colMap.note >= 0 ? cells[colMap.note] || "" : "";

    const setReps: (number | null)[] = colMap.setCols.map((idx) => {
      const raw = cells[idx];
      if (!raw) return null;
      const parsed = parseInt(raw, 10);
      return Number.isNaN(parsed) ? null : parsed;
    });

    currentBlock.exercises.push({
      name: exName,
      targetSets: Math.max(setsNum, setReps.filter((r) => r !== null).length || setsNum),
      targetReps: targetRepsNum,
      restDuration: restNum,
      weight: weightNum,
      setReps,
      note: noteText,
    });
  }

  return blocks.filter((b) => b.exercises.length > 0);
}
