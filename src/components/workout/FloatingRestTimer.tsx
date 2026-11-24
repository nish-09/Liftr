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
      ? Math.max(
          0,
          Math.min(
            100,
            ((restTimer.totalSeconds - restTimer.remainingSeconds) / restTimer.totalSeconds) * 100
          )
        )
      : 0;

  return (
    <div className="fixed bottom-24 lg:bottom-6 right-3 sm:right-4 lg:right-8 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="bg-[#BDF7B6] border-[1.5px] border-[#142746] rounded-2xl p-3 sm:p-3.5 shadow-neo-lg w-[min(20rem,calc(100vw-1.5rem))] text-[#142746]">
        <div className="w-full bg-white border border-[#142746] h-2 rounded-full overflow-hidden mb-2.5">
          <div
            className="bg-[#142746] h-full transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-xl bg-[#E9FF91] text-[#142746] border border-[#142746] shrink-0">
              <Timer className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#142746]/70 leading-tight">
                Rest Timer
              </div>
              <div className="text-xl font-extrabold stat-number text-[#142746] leading-none">
                {formattedTime}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => addRestSeconds(15)}
              title="Add 15s"
              className="min-h-[38px] px-2 py-1 rounded-lg bg-white text-[#142746] border border-[#142746] text-[10px] font-bold hover:bg-[#E9FF91] cursor-pointer"
            >
              +15s
            </button>
            <button
              type="button"
              onClick={() => addRestSeconds(30)}
              title="Add 30s"
              className="min-h-[38px] px-2 py-1 rounded-lg bg-white text-[#142746] border border-[#142746] text-[10px] font-bold hover:bg-[#E9FF91] cursor-pointer"
            >
              +30s
            </button>
            {restTimer.isRunning ? (
              <button
                type="button"
                onClick={pauseRestTimer}
                title="Pause"
                className="min-w-[38px] min-h-[38px] flex items-center justify-center rounded-lg bg-[#142746] text-white border border-[#142746] cursor-pointer"
              >
                <Pause className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={resumeRestTimer}
                title="Resume"
                className="min-w-[38px] min-h-[38px] flex items-center justify-center rounded-lg bg-[#E9FF91] text-[#142746] border border-[#142746] cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-[#142746]" />
              </button>
            )}
            <button
              type="button"
              onClick={resetRestTimer}
              title="Dismiss"
              className="min-w-[38px] min-h-[38px] flex items-center justify-center rounded-lg bg-[#F8C3B5] text-[#142746] border border-[#142746] cursor-pointer"
            >
              <X className="w-3.5 h-3.5 stroke-[2.2]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
