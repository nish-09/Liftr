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
  Zap,
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
    <aside className="hidden lg:flex w-64 flex-col justify-between border-r-2 border-[#171B16] bg-[#183D2A] p-4 h-screen sticky top-0 z-30 select-none shadow-[2px_0px_0px_0px_#171B16]">
      <div>
        {/* Brand Logo Header */}
        <Link
          href="/overview"
          className="flex items-center gap-3 px-3 py-4 mb-4 rounded-lg bg-[#143323] border-2 border-[#171B16] shadow-neo group hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
        >
          <div className="w-10 h-10 rounded-md bg-[#D5F36A] flex items-center justify-center text-[#171B16] border-2 border-[#171B16] shadow-neo-sm group-hover:scale-105 transition-all">
            <Dumbbell className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="font-heading text-2xl font-bold tracking-tight text-[#F5F0DF] leading-none">
              LIFTR
            </div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-[#D5F36A] font-semibold">
              Performance OS
            </span>
          </div>
        </Link>

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
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-heading font-semibold uppercase tracking-wider transition-all group",
                  isActive
                    ? "bg-[#D5F36A] text-[#171B16] border-2 border-[#171B16] shadow-neo translate-x-1"
                    : "text-[#F5F0DF] hover:bg-[#1E4C34] hover:text-[#D5F36A] border-2 border-transparent"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-colors",
                      isActive ? "text-[#171B16] stroke-[2.5]" : "text-[#B8D99A] group-hover:text-[#D5F36A]"
                    )}
                  />
                  <span>{item.name}</span>
                </div>

                {item.comingSoon ? (
                  <span className="text-[9px] font-mono tracking-wider uppercase px-2 py-0.5 rounded bg-[#F07845] text-white border border-[#171B16] font-bold">
                    Soon
                  </span>
                ) : item.badge ? (
                  <span
                    className={cn(
                      "text-[9px] font-mono tracking-wider uppercase px-1.5 py-0.5 rounded font-bold border",
                      isActive
                        ? "bg-[#183D2A] text-[#D5F36A] border-[#171B16]"
                        : "bg-[#D5F36A] text-[#171B16] border-[#171B16]"
                    )}
                  >
                    {item.badge}
                  </span>
                ) : isActive ? (
                  <ChevronRight className="w-4 h-4 text-[#171B16] stroke-[3]" />
                ) : null}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Status Box */}
      <div className="pt-3 border-t-2 border-[#171B16]/60">
        <div className="p-3 rounded-lg bg-[#143323] border-2 border-[#171B16] shadow-neo-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D5F36A] border border-[#171B16] animate-pulse" />
            <span className="text-xs font-mono font-bold text-[#F5F0DF]">Offline Ready</span>
          </div>
          <span className="text-[10px] font-mono text-[#171B16] font-bold uppercase px-1.5 py-0.5 rounded bg-[#D5F36A] border border-[#171B16]">
            v2.0
          </span>
        </div>
      </div>
    </aside>
  );
}
