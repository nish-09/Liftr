import { X } from "lucide-react";
import { GoalType, WeightLogItem } from "@/types";

interface LogWeightModalProps {
  isOpen: boolean;
  weightValue: string;
  dateValue: string;
  notesValue: string;
  error: string | null;
  onWeightChange: (val: string) => void;
  onDateChange: (val: string) => void;
  onNotesChange: (val: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function LogWeightModal({
  isOpen,
  weightValue,
  dateValue,
  notesValue,
  error,
  onWeightChange,
  onDateChange,
  onNotesChange,
  onClose,
  onSubmit,
}: LogWeightModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-cream border-2 border-dark rounded-xl shadow-neo-lg p-6 w-full max-w-sm relative font-sans space-y-4">
        <div className="flex items-center justify-between border-b-2 border-dark/15 pb-3">
          <h3 className="font-heading font-black text-xl text-dark tracking-tight">LOG BODY WEIGHT</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border-2 border-dark bg-white hover:bg-forest hover:text-cream text-dark transition-all cursor-pointer shadow-neo-sm"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-orange/20 border-2 border-orange text-dark text-xs font-mono font-bold">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase font-bold text-dark mb-1.5">
              Weight (kg) *
            </label>
            <input
              type="number"
              step={0.1}
              min={30}
              max={300}
              required
              value={weightValue}
              onChange={(e) => onWeightChange(e.target.value)}
              placeholder="e.g., 80.5"
              className="w-full px-3.5 py-2.5 rounded-lg bg-white border-2 border-dark text-dark text-sm focus:outline-none focus:ring-2 focus:ring-forest font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase font-bold text-dark mb-1.5">
              Date
            </label>
            <input
              type="date"
              required
              value={dateValue}
              onChange={(e) => onDateChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-white border-2 border-dark text-dark text-sm focus:outline-none focus:ring-2 focus:ring-forest font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase font-bold text-dark mb-1.5">
              Notes / Conditions
            </label>
            <input
              type="text"
              value={notesValue}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Fasting morning weigh-in..."
              className="w-full px-3.5 py-2.5 rounded-lg bg-white border-2 border-dark text-dark text-sm focus:outline-none focus:ring-2 focus:ring-forest font-sans"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t-2 border-dark/15">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg bg-white border-2 border-dark hover:bg-cream text-dark text-xs font-mono font-bold uppercase transition-all shadow-neo-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-lime hover:bg-lime/90 text-dark text-xs font-mono uppercase font-black tracking-wider border-2 border-dark shadow-neo cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5"
            >
              Save Log
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface TargetWeightModalProps {
  isOpen: boolean;
  startWeight: string;
  targetWeight: string;
  goalType: GoalType;
  targetDate: string;
  onStartWeightChange: (val: string) => void;
  onTargetWeightChange: (val: string) => void;
  onGoalTypeChange: (val: GoalType) => void;
  onTargetDateChange: (val: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function TargetWeightModal({
  isOpen,
  startWeight,
  targetWeight,
  goalType,
  targetDate,
  onStartWeightChange,
  onTargetWeightChange,
  onGoalTypeChange,
  onTargetDateChange,
  onClose,
  onSubmit,
}: TargetWeightModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-cream border-2 border-dark rounded-xl shadow-neo-lg p-6 w-full max-w-md relative font-sans space-y-4">
        <div className="flex items-center justify-between border-b-2 border-dark/15 pb-3">
          <h3 className="font-heading font-black text-xl text-dark tracking-tight">TARGET WEIGHT SETUP</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border-2 border-dark bg-white hover:bg-forest hover:text-cream text-dark transition-all cursor-pointer shadow-neo-sm"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono uppercase font-bold text-dark mb-1.5">
                Starting (kg)
              </label>
              <input
                type="number"
                step={0.1}
                required
                value={startWeight}
                onChange={(e) => onStartWeightChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white border-2 border-dark text-dark text-sm focus:outline-none focus:ring-2 focus:ring-forest font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase font-bold text-dark mb-1.5">
                Target (kg)
              </label>
              <input
                type="number"
                step={0.1}
                required
                value={targetWeight}
                onChange={(e) => onTargetWeightChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white border-2 border-dark text-dark text-sm focus:outline-none focus:ring-2 focus:ring-forest font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase font-bold text-dark mb-1.5">
              Goal Trajectory
            </label>
            <select
              value={goalType}
              onChange={(e) => onGoalTypeChange(e.target.value as GoalType)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-white border-2 border-dark text-dark text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-forest cursor-pointer"
            >
              <option value="gain">Weight Gain (Hypertrophy / Bulk)</option>
              <option value="loss">Weight Loss (Cut / Leaning)</option>
              <option value="maintenance">Maintenance (Body Recomposition)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase font-bold text-dark mb-1.5">
              Target Arrival Date
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => onTargetDateChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-white border-2 border-dark text-dark text-sm focus:outline-none focus:ring-2 focus:ring-forest font-mono font-bold"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t-2 border-dark/15">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg bg-white border-2 border-dark hover:bg-cream text-dark text-xs font-mono font-bold uppercase transition-all shadow-neo-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-lime hover:bg-lime/90 text-dark text-xs font-mono uppercase font-black tracking-wider border-2 border-dark shadow-neo cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5"
            >
              Update Goals
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface EditWeightModalProps {
  editingLog: WeightLogItem | null;
  weightValue: string;
  dateValue: string;
  notesValue: string;
  onWeightChange: (val: string) => void;
  onDateChange: (val: string) => void;
  onNotesChange: (val: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function EditWeightModal({
  editingLog,
  weightValue,
  dateValue,
  notesValue,
  onWeightChange,
  onDateChange,
  onNotesChange,
  onClose,
  onSubmit,
}: EditWeightModalProps) {
  if (!editingLog) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-cream border-2 border-dark rounded-xl shadow-neo-lg p-6 w-full max-w-sm relative font-sans space-y-4">
        <div className="flex items-center justify-between border-b-2 border-dark/15 pb-3">
          <h3 className="font-heading font-black text-xl text-dark tracking-tight">EDIT WEIGHT ENTRY</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border-2 border-dark bg-white hover:bg-forest hover:text-cream text-dark transition-all cursor-pointer shadow-neo-sm"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase font-bold text-dark mb-1.5">
              Weight (kg)
            </label>
            <input
              type="number"
              step={0.1}
              required
              value={weightValue}
              onChange={(e) => onWeightChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-white border-2 border-dark text-dark text-sm focus:outline-none focus:ring-2 focus:ring-forest font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase font-bold text-dark mb-1.5">
              Date
            </label>
            <input
              type="date"
              required
              value={dateValue}
              onChange={(e) => onDateChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-white border-2 border-dark text-dark text-sm focus:outline-none focus:ring-2 focus:ring-forest font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase font-bold text-dark mb-1.5">
              Notes
            </label>
            <input
              type="text"
              value={notesValue}
              onChange={(e) => onNotesChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-white border-2 border-dark text-dark text-sm focus:outline-none focus:ring-2 focus:ring-forest font-sans"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t-2 border-dark/15">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg bg-white border-2 border-dark hover:bg-cream text-dark text-xs font-mono font-bold uppercase transition-all shadow-neo-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-lime hover:bg-lime/90 text-dark text-xs font-mono uppercase font-black tracking-wider border-2 border-dark shadow-neo cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5"
            >
              Save Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
