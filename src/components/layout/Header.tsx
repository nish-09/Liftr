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

  function getPageTitle() {
    if (pathname.startsWith("/overview")) return "Overview";
    if (pathname.startsWith("/workouts")) return "Live Workout";
    if (pathname.startsWith("/plans")) return "Workout Plans";
    if (pathname.startsWith("/exercises")) return "Exercises";
    if (pathname.startsWith("/progress")) return "Strength Analytics";
    if (pathname.startsWith("/body-metrics")) return "Body Metrics";
    if (pathname.startsWith("/weight-tracker")) return "Weight Tracker";
    if (pathname.startsWith("/nutrition")) return "Nutrition";
    if (pathname.startsWith("/history")) return "Workout History";
    if (pathname.startsWith("/settings")) return "Settings";
    return "Liftr";
  }

  const title = getPageTitle();
  const displayLabel = userDisplayName || userEmail?.split("@")[0] || "Account";

  return (
    <header className="sticky top-0 z-20 bg-[#EBCBF7]/95 backdrop-blur-sm border-b border-[#142746]/15 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-3 min-w-0">
      {/* Left: Mobile Menu + Compact Mobile Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="lg:hidden min-w-[42px] min-h-[42px] flex items-center justify-center rounded-xl bg-[#BDF7B6] border-[1.5px] border-[#142746] text-[#142746] cursor-pointer shrink-0"
          aria-label="Open navigation"
        >
          <Menu className="w-4 h-4 stroke-[2.5]" />
        </button>

        <Link href="/overview" className="hidden min-[380px]:flex lg:hidden items-center shrink-0">
          <div className="w-9 h-9 rounded-xl bg-[#E9FF91] border-[1.5px] border-[#142746] flex items-center justify-center p-1.5">
            <LiftrMark className="w-full h-full" color="#142746" />
          </div>
        </Link>

        <span className="lg:hidden text-sm sm:text-base font-heading font-extrabold text-[#142746] tracking-tight truncate">
          {title}
        </span>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        <ActiveWorkoutPill />

        {/* Collapsible Right Panel button on tablet/mobile */}
        <button
          type="button"
          onClick={onOpenContextPanel}
          className="xl:hidden min-w-[42px] min-h-[42px] px-2.5 flex items-center justify-center gap-1.5 rounded-xl bg-white hover:bg-[#BDF7B6] border-[1.5px] border-[#142746] text-[#142746] cursor-pointer"
          title="Open Summary Panel"
          aria-label="Open Summary Panel"
        >
          <PanelRightOpen className="w-4 h-4 shrink-0" />
          <span className="hidden md:inline text-xs font-heading font-bold">Summary</span>
        </button>

        {/* User profile & Logout */}
        <div className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 border-l border-[#142746]/15">
          <Link
            href="/settings"
            className="min-h-[40px] flex items-center gap-2 px-2 sm:px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#F2FA91] border-[1.5px] border-[#142746] transition-colors text-xs text-[#142746] font-bold"
          >
            <div className="w-6 h-6 rounded-lg bg-[#142746] text-white flex items-center justify-center font-bold text-[11px] shrink-0">
              {displayLabel[0].toUpperCase()}
            </div>
            <span className="hidden md:inline font-semibold max-w-[120px] truncate">
              {displayLabel}
            </span>
          </Link>

          <form action={signOut}>
            <button
              type="submit"
              title="Sign Out"
              aria-label="Sign Out"
              className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl bg-white hover:bg-[#F8C3B5] text-[#142746] border-[1.5px] border-[#142746] transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 stroke-[2.2]" />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
