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
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#D5F36A] hover:bg-[#c9e85e] border-2 border-[#171B16] text-[#171B16] shadow-neo-sm transition-all group active:translate-x-0.5 active:translate-y-0.5"
    >
      <span className="w-2.5 h-2.5 rounded-full bg-[#183D2A] border border-[#171B16] animate-ping" />
      <span className="text-xs font-mono font-bold tracking-tight">
        {formatDuration(elapsedSeconds)}
      </span>
      <span className="hidden sm:inline text-xs font-sans font-bold">
        • {activeSession.name}
      </span>
      <Play className="w-3.5 h-3.5 fill-[#171B16] stroke-[2] group-hover:translate-x-0.5 transition-transform" />
    </Link>
  );
}
