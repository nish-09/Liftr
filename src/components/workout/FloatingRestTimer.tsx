"use client";

import { useEffect, useState } from "react";
import { useWorkoutStore } from "@/stores/useWorkoutStore";
import { Timer, Play, Pause, X } from "lucide-react";

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
      <div className="bg-[#3155F5] border-2 border-[#171717] rounded-xl p-3.5 shadow-neo-xl max-w-xs w-72 text-white">
        {/* Progress bar line */}
        <div className="w-full bg-[#2542C7] border border-[#171717] h-2 rounded-full overflow-hidden mb-2.5">
          <div
            className="bg-[#E9F56A] h-full transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#E9F56A] text-[#171717] border border-[#171717]">
              <Timer className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-white/80 font-bold leading-tight">
                Rest Timer
              </div>
              <div className="text-xl font-mono font-black tracking-tight text-[#E9F56A] leading-none">
                {formattedTime}
              </div>
            </div>
          </div>

          {/* Quick controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => addRestSeconds(15)}
              title="Add 15s"
              className="px-1.5 py-1 rounded bg-white text-[#171717] border border-[#171717] text-[10px] font-mono font-bold hover:bg-[#E9F56A] transition-colors"
            >
              +15s
            </button>
            <button
              onClick={() => addRestSeconds(30)}
              title="Add 30s"
              className="px-1.5 py-1 rounded bg-white text-[#171717] border border-[#171717] text-[10px] font-mono font-bold hover:bg-[#E9F56A] transition-colors"
            >
              +30s
            </button>
            {restTimer.isRunning ? (
              <button
                onClick={pauseRestTimer}
                title="Pause"
                className="p-1.5 rounded bg-white text-[#171717] border border-[#171717] hover:bg-[#E9F56A]"
              >
                <Pause className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            ) : (
              <button
                onClick={resumeRestTimer}
                title="Resume"
                className="p-1.5 rounded bg-[#E9F56A] text-[#171717] border border-[#171717] shadow-neo-sm"
              >
                <Play className="w-3.5 h-3.5 fill-[#171717]" />
              </button>
            )}
            <button
              onClick={resetRestTimer}
              title="Dismiss"
              className="p-1.5 rounded bg-[#FF7043] text-white border border-[#171717] hover:bg-[#e85d30] transition-colors"
            >
              <X className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
