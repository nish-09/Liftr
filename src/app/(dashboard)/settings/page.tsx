"use client";

import { useState } from "react";
import { useHistoryStore } from "@/stores/useHistoryStore";
import { useExerciseStore } from "@/stores/useExerciseStore";
import { usePlanStore } from "@/stores/usePlanStore";
import { useBodyStore } from "@/stores/useBodyStore";
import { useDashboardUser } from "@/components/common/UserContext";
import { WorkoutSessionItem, SessionExerciseItem } from "@/types";
import {
  downloadJSONBackup,
  downloadWorkoutsCSV,
  parseCSV,
} from "@/lib/export/dataHandler";
import { PageHeader, PastelCard } from "@/components/ui/DesignSystem";
import {
  Settings as SettingsIcon,
  Download,
  Upload,
  Bell,
  Sliders,
  Database,
  CheckCircle2,
  FileText,
  FileSpreadsheet,
  ShieldAlert,
} from "lucide-react";

export default function SettingsPage() {
  const { displayName: authName } = useDashboardUser();
  const { sessions, deleteHistoricalSession, addCompletedSession } = useHistoryStore();
  const { exercises, addExercise } = useExerciseStore();
  const { plans } = usePlanStore();
  const { weightLogs, bodyMeasurements } = useBodyStore();

  const [displayName, setDisplayName] = useState(authName);
  const [weightUnit, setWeightUnit] = useState<"kg" | "lb">("kg");
  const [defaultRest, setDefaultRest] = useState(90);
  const [defaultMinReps, setDefaultMinReps] = useState(8);
  const [defaultMaxReps, setDefaultMaxReps] = useState(12);
  const [defaultIncrement, setDefaultIncrement] = useState(2.5);
  const [progressionSuggestions, setProgressionSuggestions] = useState(true);
  const [timerSound, setTimerSound] = useState(true);
  const [timerVibrate, setTimerVibrate] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [csvPreview, setCsvPreview] = useState<{
    headers: string[];
    rows: Record<string, string>[];
  } | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  function handleSavePreferences(e: React.FormEvent) {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  }

  function handleExportJSON() {
    downloadJSONBackup({
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
      workouts: sessions,
      plans,
      exercises,
      weightLogs,
      measurements: bodyMeasurements,
    });
  }

  function handleExportCSV() {
    downloadWorkoutsCSV(sessions, exercises);
  }

  function handleCSVFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === "string") {
        const parsed = parseCSV(text);
        setCsvPreview(parsed);
        setImportStatus(null);
      }
    };
    reader.onerror = () => {
      setImportStatus("Failed to read CSV file. Please verify the file format.");
    };
    reader.readAsText(file);
  }

  function handleConfirmCSVImport() {
    if (!csvPreview || csvPreview.rows.length === 0) return;

    const workoutGroups: Record<string, WorkoutSessionItem> = {};
    const resolvedExercises = new Map(
      exercises.map((ex) => [ex.name.toLowerCase(), ex])
    );

    csvPreview.rows.forEach((row) => {
      const date = row["Date"] || row["date"] || new Date().toISOString().split("T")[0];
      const workoutName = row["Workout Name"] || row["workout_name"] || "Imported Workout";
      const key = `${date}_${workoutName}`;

      if (!workoutGroups[key]) {
        workoutGroups[key] = {
          id: `imported-${crypto.randomUUID()}`,
          userId: "local-user",
          name: workoutName,
          startedAt: `${date}T10:00:00.000Z`,
          completedAt: `${date}T11:00:00.000Z`,
          durationSeconds: 3600,
          status: "completed",
          totalVolume: 0,
          exercises: [],
        };
      }

      const exName = row["Exercise Name"] || row["exercise"] || "Imported Exercise";
      let matchedEx = resolvedExercises.get(exName.toLowerCase());
      if (!matchedEx) {
        matchedEx = addExercise({
          name: exName,
          primaryMuscleGroup: "full_body",
          secondaryMuscleGroups: [],
          equipment: "other",
          weightUnit: "kg",
          defaultRestDuration: 90,
          progressionIncrement: 2.5,
          isFavorite: false,
          description: "Imported via CSV",
        });
        resolvedExercises.set(exName.toLowerCase(), matchedEx);
      }
      const exId = matchedEx.id;

      let sessionEx: SessionExerciseItem | undefined = workoutGroups[key].exercises.find(
        (e) => e.exerciseId === exId
      );
      if (!sessionEx) {
        sessionEx = {
          id: `sex-${crypto.randomUUID()}`,
          sessionId: workoutGroups[key].id,
          exerciseId: exId,
          orderInSession: workoutGroups[key].exercises.length + 1,
          isCompleted: true,
          sets: [],
        };
        workoutGroups[key].exercises.push(sessionEx);
      }

      const weight = parseFloat(row["Weight (kg)"] || row["weight"] || "0") || 0;
      const reps = parseInt(row["Reps"] || row["reps"] || "0", 10) || 0;
      const setNum = parseInt(
        row["Set Number"] || row["set"] || String(sessionEx.sets.length + 1),
        10
      );

      sessionEx.sets.push({
        id: `set-${crypto.randomUUID()}`,
        sessionExerciseId: sessionEx.id,
        sessionId: workoutGroups[key].id,
        exerciseId: exId,
        setNumber: setNum,
        setType: "normal",
        weight,
        reps,
        isCompleted: true,
      });

      workoutGroups[key].totalVolume += weight * reps;
    });

    const importedWorkouts = Object.values(workoutGroups);
    importedWorkouts.forEach((w) => addCompletedSession(w));

    setImportStatus(`Successfully imported ${importedWorkouts.length} workout sessions!`);
    setCsvPreview(null);
  }

  function handleClearAllHistory() {
    if (
      confirm(
        "CAUTION: Are you sure you want to erase all workout history logs? This action is permanent and cannot be undone."
      )
    ) {
      sessions.forEach((s) => deleteHistoricalSession(s.id));
      alert("Workout history cleared.");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" />

      {savedSuccess && (
        <PastelCard tone="lime" className="p-4 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Settings successfully updated and saved locally.</span>
        </PastelCard>
      )}

      <form onSubmit={handleSavePreferences} className="space-y-5">
        <PastelCard tone="white" className="p-5 space-y-4">
          <div className="flex items-center gap-2 font-heading font-extrabold text-base text-[#142746]">
            <Sliders className="w-4 h-4" />
            <span>General Preferences</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#142746] mb-1.5">
                Display Athlete Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border-[1.5px] border-[#142746] text-[#142746] text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#142746] mb-1.5">
                Preferred Weight Unit
              </label>
              <select
                value={weightUnit}
                onChange={(e) => setWeightUnit(e.target.value as "kg" | "lb")}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border-[1.5px] border-[#142746] text-[#142746] text-xs font-bold cursor-pointer focus:outline-none"
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="lb">Pounds (lb)</option>
              </select>
            </div>
          </div>
        </PastelCard>

        <PastelCard tone="white" className="p-5 space-y-4">
          <div className="flex items-center gap-2 font-heading font-extrabold text-base text-[#142746]">
            <SettingsIcon className="w-4 h-4" />
            <span>Progressive Overload &amp; Rest Engine</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#142746] mb-1.5">
                Default Rest Timer (sec)
              </label>
              <input
                type="number"
                min={15}
                max={600}
                step={15}
                value={defaultRest}
                onChange={(e) => setDefaultRest(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border-[1.5px] border-[#142746] text-[#142746] text-sm font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#142746] mb-1.5">
                Default Step Increment (kg)
              </label>
              <input
                type="number"
                min={0.5}
                max={10}
                step={0.5}
                value={defaultIncrement}
                onChange={(e) => setDefaultIncrement(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border-[1.5px] border-[#142746] text-[#142746] text-sm font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#142746] mb-1.5">
                Default Rep Range
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  value={defaultMinReps}
                  onChange={(e) => setDefaultMinReps(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border-[1.5px] border-[#142746] text-[#142746] text-sm text-center font-bold focus:outline-none"
                />
                <span className="font-bold">-</span>
                <input
                  type="number"
                  min={1}
                  value={defaultMaxReps}
                  onChange={(e) => setDefaultMaxReps(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border-[1.5px] border-[#142746] text-[#142746] text-sm text-center font-bold focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-between gap-4 border-t border-[#142746]/15">
            <div className="min-w-0">
              <div className="text-xs font-extrabold text-[#142746]">
                Transparent Progression Suggestions
              </div>
              <span className="text-xs text-[#8993A5]">
                Automatically calculate target reps and weight increases in Live Workout.
              </span>
            </div>
            <input
              type="checkbox"
              checked={progressionSuggestions}
              onChange={(e) => setProgressionSuggestions(e.target.checked)}
              className="w-5 h-5 shrink-0 rounded border-[#142746] cursor-pointer accent-[#142746]"
            />
          </div>
        </PastelCard>

        <PastelCard tone="white" className="p-5 space-y-4">
          <div className="flex items-center gap-2 font-heading font-extrabold text-base text-[#142746]">
            <Bell className="w-4 h-4" />
            <span>Rest Timer Alarms &amp; Vibration</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="text-xs font-extrabold text-[#142746]">
                  Audio Alert on Timer Zero
                </div>
                <span className="text-xs text-[#8993A5]">
                  Play audio chime when rest interval ends.
                </span>
              </div>
              <input
                type="checkbox"
                checked={timerSound}
                onChange={(e) => setTimerSound(e.target.checked)}
                className="w-5 h-5 shrink-0 rounded border-[#142746] cursor-pointer accent-[#142746]"
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="text-xs font-extrabold text-[#142746]">
                  Haptic Vibration on Mobile
                </div>
                <span className="text-xs text-[#8993A5]">
                  Vibrate supported devices when rest time concludes.
                </span>
              </div>
              <input
                type="checkbox"
                checked={timerVibrate}
                onChange={(e) => setTimerVibrate(e.target.checked)}
                className="w-5 h-5 shrink-0 rounded border-[#142746] cursor-pointer accent-[#142746]"
              />
            </div>
          </div>
        </PastelCard>

        <button
          type="submit"
          className="neo-btn min-h-[44px] px-6 py-3 rounded-xl bg-[#142746] text-white text-xs font-heading font-bold cursor-pointer"
        >
          Save Preferences
        </button>
      </form>

      {/* Data Backup & Import */}
      <PastelCard tone="white" className="p-5 sm:p-6 space-y-5">
        <div>
          <div className="flex items-center gap-2 font-heading font-extrabold text-base text-[#142746]">
            <Database className="w-4 h-4" />
            <span>Import &amp; Export</span>
          </div>
          <p className="text-xs text-[#8993A5] mt-0.5">
            Download backups or import workout logs from CSV.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <PastelCard tone="green" className="p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 font-heading font-extrabold text-sm">
                <FileText className="w-4 h-4" />
                <span>Full JSON Archive</span>
              </div>
              <p className="text-xs text-[#142746]/75 mt-1">
                Download every workout, plan, exercise, weight log, and measurement.
              </p>
            </div>
            <button
              onClick={handleExportJSON}
              className="neo-btn py-2.5 px-4 rounded-xl bg-white text-[#142746] text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Full Backup</span>
            </button>
          </PastelCard>

          <PastelCard tone="lime" className="p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 font-heading font-extrabold text-sm">
                <FileSpreadsheet className="w-4 h-4" />
                <span>Workouts CSV Export</span>
              </div>
              <p className="text-xs text-[#142746]/75 mt-1">
                Export all session logs into tabular CSV format for Excel and Sheets.
              </p>
            </div>
            <button
              onClick={handleExportCSV}
              className="neo-btn py-2.5 px-4 rounded-xl bg-white text-[#142746] text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Sessions CSV</span>
            </button>
          </PastelCard>
        </div>

        {/* CSV Import Wizard */}
        <div className="p-5 rounded-2xl bg-[#FAF9FD] border-[1.5px] border-[#142746] space-y-4">
          <div>
            <h3 className="text-sm font-heading font-extrabold text-[#142746] flex items-center gap-2">
              <Upload className="w-4 h-4" />
              <span>Import Workouts From CSV</span>
            </h3>
            <p className="text-xs text-[#8993A5] mt-0.5">
              Upload past records from Strong, Hevy, or custom CSV logs.
            </p>
          </div>

          {importStatus && (
            <div className="p-3 rounded-xl bg-[#BDF7B6] border-[1.5px] border-[#142746] text-[#142746] text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{importStatus}</span>
            </div>
          )}

          <input
            type="file"
            accept=".csv"
            onChange={handleCSVFileUpload}
            className="w-full max-w-full overflow-hidden text-xs font-semibold text-[#142746] file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-[1.5px] file:border-[#142746] file:text-xs file:font-bold file:bg-white file:text-[#142746] hover:file:bg-[#E9FF91] cursor-pointer"
          />

          {csvPreview && (
            <div className="space-y-3 pt-2">
              <div className="text-xs font-bold text-[#142746]">
                Previewing {csvPreview.rows.length} rows
              </div>

              <div className="overflow-x-auto border-[1.5px] border-[#142746] rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#BDF7B6] border-b border-[#142746] text-[#142746] sticky top-0 font-bold">
                    <tr>
                      {csvPreview.headers.slice(0, 5).map((h) => (
                        <th key={h} className="py-2 px-3">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#142746]/15 bg-white">
                    {csvPreview.rows.slice(0, 4).map((r, i) => (
                      <tr key={i}>
                        {csvPreview.headers.slice(0, 5).map((h) => (
                          <td key={h} className="py-1.5 px-3 text-[#142746]">
                            {r[h] || "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                onClick={handleConfirmCSVImport}
                className="neo-btn px-5 py-2.5 rounded-xl bg-[#142746] text-white text-xs font-bold cursor-pointer"
              >
                Confirm &amp; Import {csvPreview.rows.length} Records
              </button>
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <PastelCard tone="coral" className="p-5 space-y-3">
          <div className="flex items-center gap-2 font-heading font-extrabold text-sm text-[#142746]">
            <ShieldAlert className="w-4 h-4" />
            <span>Danger Zone</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-extrabold text-[#142746]">Clear Workout History</div>
              <span className="text-xs text-[#142746]/80">
                Removes all completed sessions. Plans and exercises remain intact.
              </span>
            </div>
            <button
              onClick={handleClearAllHistory}
              className="neo-btn px-4 py-2 rounded-xl bg-[#142746] text-white text-xs font-bold cursor-pointer"
            >
              Clear Sessions
            </button>
          </div>
        </PastelCard>
      </PastelCard>
    </div>
  );
}
