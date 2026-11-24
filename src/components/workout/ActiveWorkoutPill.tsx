"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useWorkoutStore } from "@/stores/useWorkoutStore";
import { Play } from "lucide-react";
import { formatDuration } from "@/lib/utils";

export default function ActiveWorkoutPill() {
  const [mounted, setMounted] = useState(false);
  const activeSession = useWorkoutStore((state) => state.activeSession);
  const elapsedSeconds = useWorkoutStore((state) => state.elapsedSeconds);
  const tickElapsed = useWorkoutStore((state) => state.tickElapsed);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!activeSession) return;
    const interval = setInterval(() => {
      tickElapsed();
    }, 1000);
    return () => clearInterval(interval);
  }, [activeSession, tickElapsed]);

  if (!mounted || !activeSession) return null;

  return (
    <Link
      href="/workouts"
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#E9FF91] hover:bg-[#dff67c] border-[1.5px] border-[#142746] text-[#142746] shadow-neo-sm transition-all group"
    >
      <span className="w-2 h-2 rounded-full bg-[#142746] animate-ping" />
      <span className="text-xs font-bold stat-number">{formatDuration(elapsedSeconds)}</span>
      <span className="hidden sm:inline text-xs font-heading font-bold truncate max-w-[120px]">
        • {activeSession.name}
      </span>
      <Play className="w-3 h-3 fill-[#142746] group-hover:translate-x-0.5 transition-transform" />
    </Link>
  );
}
