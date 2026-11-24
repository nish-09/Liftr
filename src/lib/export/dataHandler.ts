import { WorkoutSessionItem, Exercise, WeightLogItem, BodyMeasurementItem, WorkoutPlanItem } from "@/types";

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
          `"${dateStr.split("T")[0]}"`,
          `"${sess.name.replace(/"/g, '""')}"`,
          `"${(exMeta?.name || "Exercise").replace(/"/g, '""')}"`,
          `"${exMeta?.primaryMuscleGroup || ""}"`,
          `"${exMeta?.equipment || ""}"`,
          s.setNumber,
          s.setType,
          s.weight,
          s.reps,
          (s.weight * s.reps).toFixed(1),
          s.isCompleted ? "Yes" : "No",
          `"${(s.notes || "").replace(/"/g, '""')}"`,
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
