"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Play,
  CalendarDays,
  Dumbbell,
  TrendingUp,
  Activity,
  Scale,
  UtensilsCrossed,
  History,
  Settings,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LiftrLogo } from "@/components/common/LiftrLogo";

const NAV_ITEMS = [
  { name: "Overview", href: "/overview", icon: LayoutDashboard },
  { name: "Workouts", href: "/workouts", icon: Play, badge: "Live" },
  { name: "Plans", href: "/plans", icon: CalendarDays },
  { name: "Exercises", href: "/exercises", icon: Dumbbell },
  { name: "Strength Analytics", href: "/progress", icon: TrendingUp },
  { name: "Body Metrics", href: "/body-metrics", icon: Activity },
  { name: "Weight Tracker", href: "/weight-tracker", icon: Scale },
  { name: "History", href: "/history", icon: History },
  { name: "Nutrition", href: "/nutrition", icon: UtensilsCrossed, comingSoon: true },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({ isMobileOpen = false, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();

  const navContent = (
    <div className="flex flex-col justify-between h-full">
      <div>
        {/* Brand Logo Header */}
        <div className="flex items-center justify-between gap-2 mb-6">
          <Link
            href="/overview"
            onClick={onCloseMobile}
            className="flex-1 flex items-center px-3 py-2.5 rounded-2xl bg-white border-[1.5px] border-[#142746] shadow-neo-sm hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
          >
            <LiftrLogo
              className="h-7 w-auto"
              symbolColor="#142746"
              textColor="#142746"
            />
          </Link>

          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-2 rounded-xl bg-white border-[1.5px] border-[#142746] text-[#142746] cursor-pointer"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation list */}
        <nav className="space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/overview" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-heading font-bold transition-all",
                  isActive
                    ? "bg-[#E9FF91] text-[#142746] border-[1.5px] border-[#142746] shadow-neo-sm"
                    : "text-[#142746]/85 hover:bg-white/70 border-[1.5px] border-transparent"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className="w-4 h-4 text-[#142746] shrink-0 stroke-[2.2]" />
                  <span className="truncate">{item.name}</span>
                </div>

                {item.comingSoon ? (
                  <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#EBCBF7] text-[#142746] border border-[#142746] shrink-0">
                    Soon
                  </span>
                ) : item.badge ? (
                  <span
                    className={cn(
                      "text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border border-[#142746] shrink-0",
                      isActive ? "bg-[#142746] text-white" : "bg-[#F8C3B5] text-[#142746]"
                    )}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Offline Status Pill */}
      <div className="pt-4 mt-4 border-t border-[#142746]/15">
        <div className="px-3 py-2.5 rounded-xl bg-white border-[1.5px] border-[#142746] shadow-neo-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#BDF7B6] border border-[#142746]" />
            <span className="text-xs font-semibold text-[#142746]">Offline Ready</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBCBF7] border border-[#142746] text-[#142746]">
            PWA
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Pastel Green Sidebar */}
      <aside className="hidden lg:flex w-56 2xl:w-60 shrink-0 flex-col bg-[#BDF7B6] border-r-[1.5px] border-[#142746] p-3.5 2xl:p-4 select-none lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
        {navContent}
      </aside>

      {/* Tablet/Mobile Slide-In Sidebar */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex bg-[#142746]/45 backdrop-blur-sm">
          <aside className="w-[min(17rem,85vw)] h-full bg-[#BDF7B6] border-r-[1.5px] border-[#142746] p-4 shadow-neo-xl overflow-y-auto">
            {navContent}
          </aside>
          <div className="flex-1" onClick={onCloseMobile} />
        </div>
      )}
    </>
  );
}
