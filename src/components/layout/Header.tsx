"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { signOut } from "@/lib/auth/actions";
import ActiveWorkoutPill from "@/components/workout/ActiveWorkoutPill";
import { LiftrMark } from "@/components/common/LiftrLogo";

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
    <header className="sticky top-0 z-20 bg-white border-b-2 border-[#171717] px-4 lg:px-8 py-3.5 flex items-center justify-between shadow-[0px_2px_0px_0px_#171717]">
      {/* Mobile Brand / Page Title */}
      <div className="flex items-center gap-3">
        <Link href="/overview" className="lg:hidden flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-[#F5F1E8] border-2 border-[#171717] flex items-center justify-center p-1.5 shadow-neo-sm">
            <LiftrMark className="w-full h-full" />
          </div>
        </Link>
        <div>
          <h1 className="text-xl lg:text-2xl font-heading font-black text-[#171717] tracking-tight leading-tight uppercase">
            {title}
          </h1>
          <p className="hidden sm:block text-xs text-[#171717]/70 font-mono font-medium">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right controls: Active Workout Pill & User profile menu */}
      <div className="flex items-center gap-3">
        {/* Active workout indicator button */}
        <ActiveWorkoutPill />

        {/* User profile dropdown & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l-2 border-[#171717]/20">
          <Link
            href="/settings"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#E9F56A] hover:bg-[#dae852] border-2 border-[#171717] shadow-neo-sm transition-all text-xs text-[#171717] font-bold"
          >
            <div className="w-5 h-5 rounded-md bg-[#3155F5] text-white flex items-center justify-center font-bold font-mono text-[10px] border border-[#171717]">
              {(userDisplayName || userEmail || "U")[0].toUpperCase()}
            </div>
            <span className="hidden md:inline font-mono font-bold">
              {userDisplayName || userEmail?.split("@")[0] || "Athlete"}
            </span>
          </Link>

          <form action={signOut}>
            <button
              type="submit"
              title="Sign Out"
              className="p-1.5 rounded-lg bg-[#FF7043] hover:bg-[#e85d30] text-white border-2 border-[#171717] shadow-neo-sm transition-all cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
            >
              <LogOut className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
