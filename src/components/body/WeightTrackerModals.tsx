import { X } from "lucide-react";
import { GoalType, WeightLogItem } from "@/types";
import { PastelCard } from "@/components/ui/DesignSystem";

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
    <div className="fixed inset-0 !m-0 z-50 flex items-center justify-center p-4 bg-[#142746]/50 backdrop-blur-sm overflow-y-auto w-full h-full min-h-[100dvh]">
      <PastelCard tone="white" className="p-5 sm:p-6 w-full max-w-sm max-h-[calc(100dvh-2rem)] overflow-y-auto my-auto space-y-4 shadow-neo-xl">
        <div className="flex items-center justify-between border-b border-[#142746]/15 pb-3">
          <h3 className="font-heading font-extrabold text-xl text-[#142746]">Log Body Weight</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl border-[1.5px] border-[#142746] bg-[#FAF9FD] hover:bg-[#EBCBF7] text-[#142746] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-[#F8C3B5] border-[1.5px] border-[#142746] text-[#142746] text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#142746] mb-1.5">
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
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border-[1.5px] border-[#142746] text-[#142746] text-sm font-bold focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#142746] mb-1.5">Date</label>
            <input
              type="date"
              required
              value={dateValue}
              onChange={(e) => onDateChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border-[1.5px] border-[#142746] text-[#142746] text-sm font-bold focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#142746] mb-1.5">
              Notes / Conditions
            </label>
            <input
              type="text"
              value={notesValue}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Fasting morning weigh-in..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border-[1.5px] border-[#142746] text-[#142746] text-sm focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#142746]/15">
            <button
              type="button"
              onClick={onClose}
              className="neo-btn px-4 py-2 rounded-xl bg-white text-[#142746] text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="neo-btn px-5 py-2 rounded-xl bg-[#142746] text-white text-xs font-bold cursor-pointer"
            >
              Save Log
            </button>
          </div>
        </form>
      </PastelCard>
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
    <div className="fixed inset-0 !m-0 z-50 flex items-center justify-center p-4 bg-[#142746]/50 backdrop-blur-sm overflow-y-auto w-full h-full min-h-[100dvh]">
      <PastelCard tone="white" className="p-5 sm:p-6 w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto my-auto space-y-4 shadow-neo-xl">
        <div className="flex items-center justify-between border-b border-[#142746]/15 pb-3">
          <h3 className="font-heading font-extrabold text-xl text-[#142746]">
            Target Weight Setup
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl border-[1.5px] border-[#142746] bg-[#FAF9FD] hover:bg-[#EBCBF7] text-[#142746] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#142746] mb-1.5">
                Starting (kg)
              </label>
              <input
                type="number"
                step={0.1}
                required
                value={startWeight}
                onChange={(e) => onStartWeightChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border-[1.5px] border-[#142746] text-[#142746] text-sm font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#142746] mb-1.5">
                Target (kg)
              </label>
              <input
                type="number"
                step={0.1}
                required
                value={targetWeight}
                onChange={(e) => onTargetWeightChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border-[1.5px] border-[#142746] text-[#142746] text-sm font-bold focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#142746] mb-1.5">
              Goal Trajectory
            </label>
            <select
              value={goalType}
              onChange={(e) => onGoalTypeChange(e.target.value as GoalType)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border-[1.5px] border-[#142746] text-[#142746] text-xs font-bold cursor-pointer focus:outline-none"
            >
              <option value="gain">Weight Gain (Hypertrophy / Bulk)</option>
              <option value="loss">Weight Loss (Cut / Leaning)</option>
              <option value="maintenance">Maintenance (Body Recomposition)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#142746] mb-1.5">
              Target Arrival Date
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => onTargetDateChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border-[1.5px] border-[#142746] text-[#142746] text-sm font-bold focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#142746]/15">
            <button
              type="button"
              onClick={onClose}
              className="neo-btn px-4 py-2 rounded-xl bg-white text-[#142746] text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="neo-btn px-5 py-2 rounded-xl bg-[#142746] text-white text-xs font-bold cursor-pointer"
            >
              Update Goals
            </button>
          </div>
        </form>
      </PastelCard>
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
    <div className="fixed inset-0 !m-0 z-50 flex items-center justify-center p-4 bg-[#142746]/50 backdrop-blur-sm overflow-y-auto w-full h-full min-h-[100dvh]">
      <PastelCard tone="white" className="p-5 sm:p-6 w-full max-w-sm max-h-[calc(100dvh-2rem)] overflow-y-auto my-auto space-y-4 shadow-neo-xl">
        <div className="flex items-center justify-between border-b border-[#142746]/15 pb-3">
          <h3 className="font-heading font-extrabold text-xl text-[#142746]">
            Edit Weight Entry
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl border-[1.5px] border-[#142746] bg-[#FAF9FD] hover:bg-[#EBCBF7] text-[#142746] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#142746] mb-1.5">
              Weight (kg)
            </label>
            <input
              type="number"
              step={0.1}
              required
              value={weightValue}
              onChange={(e) => onWeightChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border-[1.5px] border-[#142746] text-[#142746] text-sm font-bold focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#142746] mb-1.5">Date</label>
            <input
              type="date"
              required
              value={dateValue}
              onChange={(e) => onDateChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border-[1.5px] border-[#142746] text-[#142746] text-sm font-bold focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#142746] mb-1.5">Notes</label>
            <input
              type="text"
              value={notesValue}
              onChange={(e) => onNotesChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border-[1.5px] border-[#142746] text-[#142746] text-sm focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#142746]/15">
            <button
              type="button"
              onClick={onClose}
              className="neo-btn px-4 py-2 rounded-xl bg-white text-[#142746] text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="neo-btn px-5 py-2 rounded-xl bg-[#142746] text-white text-xs font-bold cursor-pointer"
            >
              Save Entry
            </button>
          </div>
        </form>
      </PastelCard>
    </div>
  );
}
