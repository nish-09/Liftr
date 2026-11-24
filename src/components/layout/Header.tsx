"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, PanelRightOpen, LogOut } from "lucide-react";
import { signOut } from "@/lib/auth/actions";
import ActiveWorkoutPill from "@/components/workout/ActiveWorkoutPill";
import { LiftrMark } from "@/components/common/LiftrLogo";

interface HeaderProps {
  userDisplayName?: string | null;
  userEmail?: string | null;
  onOpenSidebar?: () => void;
  onOpenContextPanel?: () => void;
}

export default function Header({
  userDisplayName,
  userEmail,
  onOpenSidebar,
  onOpenContextPanel,
}: HeaderProps) {
  const pathname = usePathname();

  function getPageHeading() {
    if (pathname.startsWith("/overview")) return { title: "Overview", subtitle: "Dashboard & daily momentum" };
    if (pathname.startsWith("/workouts")) return { title: "Live Workout", subtitle: "Real-time double progression" };
    if (pathname.startsWith("/plans")) return { title: "Workout Plans", subtitle: "Splits & progression rules" };
    if (pathname.startsWith("/exercises")) return { title: "Exercise Library", subtitle: "Movements & targets" };
    if (pathname.startsWith("/progress")) return { title: "Strength Analytics", subtitle: "1RM, volume & muscle heatmap" };
    if (pathname.startsWith("/body-metrics")) return { title: "Body Metrics", subtitle: "BMI & circumference logs" };
    if (pathname.startsWith("/weight-tracker")) return { title: "Weight Tracker", subtitle: "Weight trajectory & goal" };
    if (pathname.startsWith("/nutrition")) return { title: "Nutrition", subtitle: "Coming soon" };
    if (pathname.startsWith("/history")) return { title: "Workout History", subtitle: "Day-by-day spreadsheet archive" };
    if (pathname.startsWith("/settings")) return { title: "Settings", subtitle: "Preferences & data export" };
    return { title: "Liftr", subtitle: "Fitness Platform" };
  }

  const { title, subtitle } = getPageHeading();
  const displayLabel = userDisplayName || userEmail?.split("@")[0] || "Athlete";

  return (
    <header className="sticky top-0 z-20 bg-[#EBCBF7]/95 backdrop-blur-sm border-b-[1.5px] border-[#142746]/20 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-3 min-w-0">
      {/* Left: Mobile Menu + Brand + Page Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="lg:hidden min-w-[42px] min-h-[42px] flex items-center justify-center rounded-xl bg-[#BDF7B6] border-[1.5px] border-[#142746] text-[#142746] shadow-neo-sm cursor-pointer shrink-0"
          aria-label="Open navigation"
        >
          <Menu className="w-4 h-4 stroke-[2.5]" />
        </button>

        <Link href="/overview" className="hidden min-[380px]:flex lg:hidden items-center shrink-0">
          <div className="w-10 h-10 rounded-xl bg-[#E9FF91] border-[1.5px] border-[#142746] flex items-center justify-center p-1.5 shadow-neo-sm">
            <LiftrMark className="w-full h-full" color="#142746" />
          </div>
        </Link>

        <div className="min-w-0">
          <h2 className="text-sm sm:text-lg font-heading font-extrabold text-[#142746] tracking-tight truncate">
            {title}
          </h2>
          <p className="hidden sm:block text-xs text-[#142746]/70 font-medium truncate">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        <ActiveWorkoutPill />

        {/* Collapsible Right Panel button on tablet/mobile */}
        <button
          type="button"
          onClick={onOpenContextPanel}
          className="xl:hidden min-w-[42px] min-h-[42px] px-2.5 flex items-center justify-center gap-1.5 rounded-xl bg-white hover:bg-[#BDF7B6] border-[1.5px] border-[#142746] text-[#142746] shadow-neo-sm cursor-pointer"
          title="Open Insights Panel"
          aria-label="Open Insights Panel"
        >
          <PanelRightOpen className="w-4 h-4 shrink-0" />
          <span className="hidden md:inline text-xs font-heading font-bold">Insights</span>
        </button>

        {/* User profile pill & Logout */}
        <div className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 border-l border-[#142746]/15">
          <Link
            href="/settings"
            className="min-h-[42px] flex items-center gap-2 px-2 sm:px-2.5 py-1.5 rounded-xl bg-[#F2FA91] hover:bg-[#E9FF91] border-[1.5px] border-[#142746] shadow-neo-sm transition-all text-xs text-[#142746] font-bold"
          >
            <div className="w-6 h-6 rounded-lg bg-[#142746] text-white flex items-center justify-center font-bold text-[11px] shrink-0">
              {displayLabel[0].toUpperCase()}
            </div>
            <span className="hidden md:inline font-semibold max-w-[110px] truncate">
              {displayLabel}
            </span>
          </Link>

          <form action={signOut}>
            <button
              type="submit"
              title="Sign Out"
              aria-label="Sign Out"
              className="min-w-[42px] min-h-[42px] flex items-center justify-center rounded-xl bg-[#F8C3B5] hover:bg-[#f4b3a2] text-[#142746] border-[1.5px] border-[#142746] shadow-neo-sm transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4 stroke-[2.2]" />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
