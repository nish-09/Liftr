"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dumbbell, User, LogOut, Bell, Flame } from "lucide-react";
import { signOut } from "@/lib/auth/actions";
import ActiveWorkoutPill from "@/components/workout/ActiveWorkoutPill";

interface HeaderProps {
  userDisplayName?: string | null;
  userEmail?: string | null;
}

export default function Header({ userDisplayName, userEmail }: HeaderProps) {
  const pathname = usePathname();

  // Page title mapping
  function getPageHeading() {
    if (pathname.startsWith("/overview")) return { title: "Overview", subtitle: "Performance Command Center" };
    if (pathname.startsWith("/workouts")) return { title: "Live Workout", subtitle: "Double Progression Session" };
    if (pathname.startsWith("/plans")) return { title: "Workout Plans", subtitle: "Custom Routines & Splits" };
    if (pathname.startsWith("/exercises")) return { title: "Exercise Library", subtitle: "Muscle Group Target System" };
    if (pathname.startsWith("/progress")) return { title: "Strength Analytics", subtitle: "Volume, 1RM & PR Tracking" };
    if (pathname.startsWith("/body-metrics")) return { title: "Body Metrics & BMI", subtitle: "Body Composition & Health" };
    if (pathname.startsWith("/weight-tracker")) return { title: "Weight Tracker", subtitle: "Goal Trajectory & Trends" };
    if (pathname.startsWith("/nutrition")) return { title: "Nutrition", subtitle: "Macro Architecture (Coming Soon)" };
    if (pathname.startsWith("/history")) return { title: "Workout History", subtitle: "Past Sessions & Set Archives" };
    if (pathname.startsWith("/settings")) return { title: "Settings", subtitle: "Preferences & Data Management" };
    return { title: "Liftr", subtitle: "Strength Operating System" };
  }

  const { title, subtitle } = getPageHeading();

  return (
    <header className="sticky top-0 z-20 bg-[#090909]/90 backdrop-blur-md border-b border-border px-4 lg:px-8 py-3.5 flex items-center justify-between">
      {/* Mobile Brand / Page Title */}
      <div className="flex items-center gap-3">
        <Link href="/overview" className="lg:hidden flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-liftr-purple flex items-center justify-center text-white shadow-neo-sm">
            <Dumbbell className="w-4 h-4" />
          </div>
        </Link>
        <div>
          <h1 className="text-lg lg:text-xl font-bold text-white tracking-tight flex items-center gap-2 font-sans">
            {title}
          </h1>
          <p className="hidden sm:block text-xs text-liftr-grey font-mono">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right controls: Active Workout Pill, Streak, User profile menu */}
      <div className="flex items-center gap-3">
        {/* Active workout indicator button */}
        <ActiveWorkoutPill />

        {/* User dropdown/profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#232323]">
          <Link
            href="/settings"
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#141414] hover:bg-[#1A1A1A] border border-[#282828] transition-all text-xs text-zinc-300"
          >
            <div className="w-6 h-6 rounded-full bg-liftr-purple/20 border border-liftr-purple/40 text-liftr-purple-light flex items-center justify-center font-bold font-mono text-[10px]">
              {(userDisplayName || userEmail || "U")[0].toUpperCase()}
            </div>
            <span className="hidden md:inline font-mono text-zinc-300">
              {userDisplayName || userEmail?.split("@")[0] || "Athlete"}
            </span>
          </Link>

          <form action={signOut}>
            <button
              type="submit"
              title="Sign Out"
              className="p-2 rounded-lg bg-[#141414] hover:bg-liftr-coral/15 hover:text-liftr-coral hover:border-liftr-coral/30 border border-[#282828] text-liftr-grey transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
