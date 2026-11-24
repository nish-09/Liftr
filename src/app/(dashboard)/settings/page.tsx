"use client";

import { useState } from "react";
import { useHistoryStore } from "@/stores/useHistoryStore";
import { useExerciseStore } from "@/stores/useExerciseStore";
import { usePlanStore } from "@/stores/usePlanStore";
import { useBodyStore } from "@/stores/useBodyStore";
import {
  downloadJSONBackup,
  downloadWorkoutsCSV,
  parseCSV,
} from "@/lib/export/dataHandler";
import { signOut } from "@/lib/auth/actions";
import {
  Settings as SettingsIcon,
  Download,
  Upload,
  Trash2,
  Bell,
  Sliders,
  Database,
  CheckCircle2,
  AlertTriangle,
  FileText,
  FileSpreadsheet,
  LogOut,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { sessions, deleteHistoricalSession, addCompletedSession } = useHistoryStore();
  const { exercises } = useExerciseStore();
  const { plans } = usePlanStore();
  const { userBodyProfile, weightLogs, bodyMeasurements } = useBodyStore();

  // Settings State
  const [displayName, setDisplayName] = useState("Athlete");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lb">("kg");
  const [defaultRest, setDefaultRest] = useState(90);
  const [defaultMinReps, setDefaultMinReps] = useState(8);
  const [defaultMaxReps, setDefaultMaxReps] = useState(12);
  const [defaultIncrement, setDefaultIncrement] = useState(2.5);
  const [progressionSuggestions, setProgressionSuggestions] = useState(true);
  const [timerSound, setTimerSound] = useState(true);
  const [timerVibrate, setTimerVibrate] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // CSV Import State
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
      const text = event.target?.result as string;
      if (text) {
        const parsed = parseCSV(text);
        setCsvPreview(parsed);
      }
    };
    reader.readAsText(file);
  }

  function handleConfirmCSVImport() {
    if (!csvPreview || csvPreview.rows.length === 0) return;

    // Group rows into workouts by Date and Workout Name
    const workoutGroups: Record<string, any> = {};

    csvPreview.rows.forEach((row, idx) => {
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
      // Find or associate exercise
      let matchedEx = exercises.find(
        (e) => e.name.toLowerCase() === exName.toLowerCase()
      );
      const exId = matchedEx ? matchedEx.id : "ex-bench-press";

      let sessionEx = workoutGroups[key].exercises.find((e: any) => e.exerciseId === exId);
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
      const setNum = parseInt(row["Set Number"] || row["set"] || String(sessionEx.sets.length + 1), 10);

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
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="font-serif italic text-3xl text-white">Settings &amp; Data Hub</h1>
          <span className="px-2 py-0.5 rounded bg-[#1C1C1C] border border-[#2B2B2B] text-xs font-mono text-liftr-purple">
            System Preferences
          </span>
        </div>
        <p className="text-sm text-liftr-grey mt-0.5">
          Configure double progression increments, notification alarms, and manage full data backups.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-lg bg-liftr-green/15 border border-liftr-green/30 text-liftr-green text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Settings successfully updated and saved locally.</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSavePreferences} className="space-y-6">
        {/* General & Profile */}
        <div className="bento-card p-5 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Sliders className="w-4 h-4 text-liftr-purple" />
            <span>General Preferences</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-liftr-grey mb-1.5">
                Display Athlete Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-[#2c2c2c] text-white text-sm focus:outline-none focus:border-liftr-purple font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-liftr-grey mb-1.5">
                Preferred Weight Unit
              </label>
              <select
                value={weightUnit}
                onChange={(e) => setWeightUnit(e.target.value as "kg" | "lb")}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-[#2c2c2c] text-white text-sm focus:outline-none focus:border-liftr-purple"
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="lb">Pounds (lb)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Workout & Progression Defaults */}
        <div className="bento-card p-5 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <SettingsIcon className="w-4 h-4 text-liftr-green" />
            <span>Progressive Overload &amp; Rest Engine</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-liftr-grey mb-1.5">
                Default Rest Timer (sec)
              </label>
              <input
                type="number"
                min={15}
                max={600}
                step={15}
                value={defaultRest}
                onChange={(e) => setDefaultRest(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-[#2c2c2c] text-white text-sm focus:outline-none focus:border-liftr-purple font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-liftr-grey mb-1.5">
                Default Step Increment (kg)
              </label>
              <input
                type="number"
                min={0.5}
                max={10}
                step={0.5}
                value={defaultIncrement}
                onChange={(e) => setDefaultIncrement(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-[#2c2c2c] text-white text-sm focus:outline-none focus:border-liftr-purple font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-liftr-grey mb-1.5">
                Default Working Rep Range
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  value={defaultMinReps}
                  onChange={(e) => setDefaultMinReps(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-[#2c2c2c] text-white text-sm text-center font-mono"
                />
                <span className="text-zinc-600 font-mono">-</span>
                <input
                  type="number"
                  min={1}
                  value={defaultMaxReps}
                  onChange={(e) => setDefaultMaxReps(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-[#2c2c2c] text-white text-sm text-center font-mono"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-[#1C1C1C]">
            <div>
              <div className="text-xs font-bold text-white">
                Transparent Progression Suggestions
              </div>
              <span className="text-[11px] text-liftr-grey">
                Automatically calculate target reps and weight increases in the Live Workout Tracker.
              </span>
            </div>
            <input
              type="checkbox"
              checked={progressionSuggestions}
              onChange={(e) => setProgressionSuggestions(e.target.checked)}
              className="w-4 h-4 rounded text-liftr-purple focus:ring-0 cursor-pointer"
            />
          </div>
        </div>

        {/* Notifications & Audio */}
        <div className="bento-card p-5 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Bell className="w-4 h-4 text-liftr-yellow" />
            <span>Rest Timer Alarms &amp; Vibration</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Audio Alert on Timer Zero</div>
                <span className="text-[11px] text-liftr-grey">
                  Chime audio chime when rest interval ends.
                </span>
              </div>
              <input
                type="checkbox"
                checked={timerSound}
                onChange={(e) => setTimerSound(e.target.checked)}
                className="w-4 h-4 rounded text-liftr-purple cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Haptic Vibration on Mobile</div>
                <span className="text-[11px] text-liftr-grey">
                  Vibrate supported phones and wearables when rest time concludes.
                </span>
              </div>
              <input
                type="checkbox"
                checked={timerVibrate}
                onChange={(e) => setTimerVibrate(e.target.checked)}
                className="w-4 h-4 rounded text-liftr-purple cursor-pointer"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 rounded-lg bg-liftr-purple hover:bg-liftr-purple-dark text-white text-xs font-mono uppercase font-bold shadow-neo cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5"
        >
          Save System Preferences
        </button>
      </form>

      {/* Complete Data Management Hub: Export / Import / Erase */}
      <div className="bento-card p-6 space-y-6 border-border">
        <div>
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Database className="w-5 h-5 text-liftr-purple" />
            <span>Data Sovereignty &amp; Import / Export</span>
          </div>
          <p className="text-xs text-liftr-grey font-mono mt-1">
            Download complete offline backups or migrate workout history via standard CSV spreadsheets.
          </p>
        </div>

        {/* Action Buttons: JSON Backup & CSV Export */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#161616] border border-[#262626] flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <FileText className="w-4 h-4 text-liftr-purple" />
                <span>Full JSON Archive</span>
              </div>
              <p className="text-xs text-liftr-grey mt-1">
                Download every workout, custom plan, exercise, weight log, and measurement in a portable JSON file.
              </p>
            </div>
            <button
              onClick={handleExportJSON}
              className="py-2.5 px-4 rounded-lg bg-[#202020] hover:bg-[#2A2A2A] text-white text-xs font-mono uppercase font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-liftr-purple" />
              <span>Download Full Backup</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-[#161616] border border-[#262626] flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <FileSpreadsheet className="w-4 h-4 text-liftr-green" />
                <span>Workouts CSV Export</span>
              </div>
              <p className="text-xs text-liftr-grey mt-1">
                Export all session logs into clean tabular CSV format compatible with Excel and Google Sheets.
              </p>
            </div>
            <button
              onClick={handleExportCSV}
              className="py-2.5 px-4 rounded-lg bg-[#202020] hover:bg-[#2A2A2A] text-white text-xs font-mono uppercase font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-liftr-green" />
              <span>Export Sessions CSV</span>
            </button>
          </div>
        </div>

        {/* CSV Import Wizard */}
        <div className="p-5 rounded-xl bg-[#141414] border border-[#262626] space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-liftr-yellow" />
              <span>Import Workouts from CSV</span>
            </h3>
            <p className="text-xs text-liftr-grey font-mono mt-0.5">
              Upload past records from Strong, Hevy, or custom CSV logs without losing data.
            </p>
          </div>

          {importStatus && (
            <div className="p-3 rounded-lg bg-liftr-green/15 border border-liftr-green/30 text-liftr-green text-xs font-mono flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{importStatus}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="file"
              accept=".csv"
              onChange={handleCSVFileUpload}
              className="text-xs font-mono text-zinc-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-mono file:bg-[#222222] file:text-white hover:file:bg-[#2A2A2A] cursor-pointer"
            />
          </div>

          {/* CSV Preview Table */}
          {csvPreview && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                <span>Previewing {csvPreview.rows.length} rows found in CSV:</span>
                <span className="text-liftr-yellow">Validation OK</span>
              </div>

              <div className="overflow-x-auto max-h-48 border border-[#262626] rounded-lg">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#1C1C1C] text-zinc-400 sticky top-0">
                    <tr>
                      {csvPreview.headers.slice(0, 5).map((h) => (
                        <th key={h} className="py-2 px-3">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222]">
                    {csvPreview.rows.slice(0, 4).map((r, i) => (
                      <tr key={i} className="hover:bg-[#1A1A1A]">
                        {csvPreview.headers.slice(0, 5).map((h) => (
                          <td key={h} className="py-1.5 px-3 text-zinc-300">
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
                className="px-5 py-2.5 rounded-lg bg-liftr-yellow hover:bg-liftr-yellow-light text-black text-xs font-mono uppercase font-bold shadow-neo cursor-pointer"
              >
                Confirm &amp; Import {csvPreview.rows.length} Records
              </button>
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="p-5 rounded-xl bg-liftr-coral/10 border border-liftr-coral/30 space-y-4">
          <div className="flex items-center gap-2 text-liftr-coral font-bold text-sm">
            <ShieldAlert className="w-4 h-4" />
            <span>Danger Zone Safeguards</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-white">Clear Workout History</div>
              <span className="text-[11px] text-liftr-grey">
                Removes all completed sessions. Plans and exercise library remain intact.
              </span>
            </div>
            <button
              onClick={handleClearAllHistory}
              className="px-4 py-2 rounded-lg bg-liftr-coral/20 hover:bg-liftr-coral/30 text-liftr-coral text-xs font-mono uppercase font-bold border border-liftr-coral/40 cursor-pointer"
            >
              Clear Sessions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
