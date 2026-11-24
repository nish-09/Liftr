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
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "Overview", href: "/overview", icon: LayoutDashboard },
  { name: "Live Workout", href: "/workouts", icon: Play, badge: "Live" },
  { name: "Workout Plans", href: "/plans", icon: CalendarDays },
  { name: "Exercise Library", href: "/exercises", icon: Dumbbell },
  { name: "Strength Analytics", href: "/progress", icon: TrendingUp },
  { name: "Body Metrics & BMI", href: "/body-metrics", icon: Activity },
  { name: "Weight Tracker", href: "/weight-tracker", icon: Scale },
  { name: "Nutrition", href: "/nutrition", icon: UtensilsCrossed, comingSoon: true },
  { name: "Workout History", href: "/history", icon: History },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-64 flex-col justify-between border-r border-border bg-[#0C0C0C] p-4 h-screen sticky top-0 z-30 select-none">
      <div>
        {/* Brand Logo */}
        <Link href="/overview" className="flex items-center gap-3 px-3 py-4 mb-4 group">
          <div className="w-10 h-10 rounded-xl bg-liftr-purple flex items-center justify-center text-white shadow-neo group-hover:scale-105 transition-all">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <div className="font-serif italic text-2xl tracking-tight text-white leading-none">
              Liftr
            </div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-liftr-grey">
              Progressive Engine
            </span>
          </div>
        </Link>

        {/* Navigation list */}
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/overview" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                  isActive
                    ? "bg-[#1B1B1B] text-white border border-[#2E2E2E] shadow-neo-sm"
                    : "text-liftr-grey hover:text-white hover:bg-[#151515]"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-colors",
                      isActive
                        ? "text-liftr-purple"
                        : "text-liftr-grey group-hover:text-white"
                    )}
                  />
                  <span>{item.name}</span>
                </div>

                {item.comingSoon ? (
                  <span className="text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded bg-liftr-yellow/15 text-liftr-yellow border border-liftr-yellow/30 font-semibold">
                    Soon
                  </span>
                ) : item.badge ? (
                  <span className="text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded bg-liftr-purple/20 text-liftr-purple-light border border-liftr-purple/30 font-bold">
                    {item.badge}
                  </span>
                ) : isActive ? (
                  <ChevronRight className="w-3.5 h-3.5 text-liftr-purple" />
                ) : null}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Status Box */}
      <div className="pt-4 border-t border-[#1C1C1C]">
        <div className="p-3 rounded-lg bg-[#141414] border border-[#232323] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-liftr-green animate-pulse" />
            <span className="text-xs font-mono text-zinc-400">Offline Ready</span>
          </div>
          <span className="text-[10px] font-mono text-liftr-purple uppercase px-1.5 py-0.5 rounded bg-liftr-purple/10">
            v1.0.0
          </span>
        </div>
      </div>
    </aside>
  );
}
