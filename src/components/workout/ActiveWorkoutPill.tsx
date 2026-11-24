"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useWorkoutStore } from "@/stores/useWorkoutStore";
import { Flame, Play } from "lucide-react";
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
      className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-liftr-purple/15 hover:bg-liftr-purple/25 border border-liftr-purple/40 text-liftr-purple-light shadow-neo-sm transition-all group animate-pulse"
    >
      <span className="w-2 h-2 rounded-full bg-liftr-purple animate-ping" />
      <span className="text-xs font-mono font-bold tracking-tight text-white">
        {formatDuration(elapsedSeconds)}
      </span>
      <span className="hidden sm:inline text-xs font-sans text-zinc-300">
        • {activeSession.name}
      </span>
      <Play className="w-3 h-3 text-liftr-purple fill-liftr-purple group-hover:translate-x-0.5 transition-transform" />
    </Link>
  );
}
