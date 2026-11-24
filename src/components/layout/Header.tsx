"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dumbbell, LogOut } from "lucide-react";
import { signOut } from "@/lib/auth/actions";
import ActiveWorkoutPill from "@/components/workout/ActiveWorkoutPill";

interface HeaderProps {
  userDisplayName?: string | null;
  userEmail?: string | null;
}

export default function Header({ userDisplayName, userEmail }: HeaderProps) {
  const pathname = usePathname();

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
    <header className="sticky top-0 z-20 bg-[#F5F0DF] border-b-2 border-[#171B16] px-4 lg:px-8 py-3.5 flex items-center justify-between shadow-[0px_2px_0px_0px_#171B16]">
      {/* Mobile Brand / Page Title */}
      <div className="flex items-center gap-3">
        <Link href="/overview" className="lg:hidden flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-[#183D2A] border-2 border-[#171B16] flex items-center justify-center text-[#D5F36A] shadow-neo-sm">
            <Dumbbell className="w-4 h-4" />
          </div>
        </Link>
        <div>
          <h1 className="text-xl lg:text-2xl font-heading font-bold text-[#171B16] tracking-tight leading-tight">
            {title}
          </h1>
          <p className="hidden sm:block text-xs text-[#171B16]/70 font-mono">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right controls: Active Workout Pill & User profile menu */}
      <div className="flex items-center gap-3">
        {/* Active workout indicator button */}
        <ActiveWorkoutPill />

        {/* User profile dropdown & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l-2 border-[#171B16]/30">
          <Link
            href="/settings"
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#B8D99A] hover:bg-[#D5F36A] border-2 border-[#171B16] shadow-neo-sm transition-all text-xs text-[#171B16] font-bold"
          >
            <div className="w-5 h-5 rounded bg-[#183D2A] text-[#F5F0DF] flex items-center justify-center font-bold font-mono text-[10px]">
              {(userDisplayName || userEmail || "U")[0].toUpperCase()}
            </div>
            <span className="hidden md:inline font-mono">
              {userDisplayName || userEmail?.split("@")[0] || "Athlete"}
            </span>
          </Link>

          <form action={signOut}>
            <button
              type="submit"
              title="Sign Out"
              className="p-1.5 rounded-md bg-[#F07845] hover:bg-[#d96636] text-white border-2 border-[#171B16] shadow-neo-sm transition-all cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
            >
              <LogOut className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
