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
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#E9F56A] hover:bg-[#dae852] border-2 border-[#171717] text-[#171717] shadow-neo-sm transition-all group active:translate-x-0.5 active:translate-y-0.5"
    >
      <span className="w-2.5 h-2.5 rounded-full bg-[#3155F5] border border-[#171717] animate-ping" />
      <span className="text-xs font-mono font-bold tracking-tight">
        {formatDuration(elapsedSeconds)}
      </span>
      <span className="hidden sm:inline text-xs font-heading font-bold">
        • {activeSession.name}
      </span>
      <Play className="w-3.5 h-3.5 fill-[#171717] stroke-[2] group-hover:translate-x-0.5 transition-transform" />
    </Link>
  );
}
