"use client";

import { useEffect, useState } from "react";
import { useWorkoutStore } from "@/stores/useWorkoutStore";
import { Timer, Play, Pause, RotateCcw, Plus, X } from "lucide-react";

export default function FloatingRestTimer() {
  const [mounted, setMounted] = useState(false);
  const restTimer = useWorkoutStore((state) => state.restTimer);
  const pauseRestTimer = useWorkoutStore((state) => state.pauseRestTimer);
  const resumeRestTimer = useWorkoutStore((state) => state.resumeRestTimer);
  const resetRestTimer = useWorkoutStore((state) => state.resetRestTimer);
  const addRestSeconds = useWorkoutStore((state) => state.addRestSeconds);
  const tickRestTimer = useWorkoutStore((state) => state.tickRestTimer);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!restTimer.isRunning) return;
    const interval = setInterval(() => {
      tickRestTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [restTimer.isRunning, tickRestTimer]);

  if (!mounted || (restTimer.remainingSeconds <= 0 && !restTimer.isRunning)) {
    return null;
  }

  const mins = Math.floor(restTimer.remainingSeconds / 60);
  const secs = restTimer.remainingSeconds % 60;
  const formattedTime = `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  const progressPercent =
    restTimer.totalSeconds > 0
      ? Math.max(0, Math.min(100, ((restTimer.totalSeconds - restTimer.remainingSeconds) / restTimer.totalSeconds) * 100))
      : 0;

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 lg:right-8 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="bg-[#121212] border-2 border-liftr-purple rounded-xl p-3 shadow-neo-purple max-w-xs w-72">
        {/* Progress bar line */}
        <div className="w-full bg-[#232323] h-1.5 rounded-full overflow-hidden mb-2.5">
          <div
            className="bg-liftr-purple h-full transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-liftr-purple/20 text-liftr-purple-light">
              <Timer className="w-4 h-4 animate-spin-slow" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-liftr-grey leading-tight">
                Rest Timer
              </div>
              <div className="text-xl font-mono font-bold tracking-tight text-white leading-none">
                {formattedTime}
              </div>
            </div>
          </div>

          {/* Quick controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => addRestSeconds(15)}
              title="Add 15s"
              className="px-1.5 py-1 rounded bg-[#1C1C1C] hover:bg-[#252525] border border-[#2D2D2D] text-[10px] font-mono text-zinc-300 transition-colors"
            >
              +15s
            </button>
            <button
              onClick={() => addRestSeconds(30)}
              title="Add 30s"
              className="px-1.5 py-1 rounded bg-[#1C1C1C] hover:bg-[#252525] border border-[#2D2D2D] text-[10px] font-mono text-zinc-300 transition-colors"
            >
              +30s
            </button>
            {restTimer.isRunning ? (
              <button
                onClick={pauseRestTimer}
                title="Pause"
                className="p-1.5 rounded bg-[#1C1C1C] hover:bg-[#252525] text-white border border-[#2D2D2D]"
              >
                <Pause className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={resumeRestTimer}
                title="Resume"
                className="p-1.5 rounded bg-liftr-purple hover:bg-liftr-purple-dark text-white shadow-neo-sm"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
              </button>
            )}
            <button
              onClick={resetRestTimer}
              title="Dismiss"
              className="p-1.5 rounded hover:bg-liftr-coral/20 text-zinc-400 hover:text-liftr-coral transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
