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
    <aside className="hidden lg:flex w-64 flex-col justify-between border-r-2 border-[#171717] bg-[#3155F5] p-4 h-screen sticky top-0 z-30 select-none shadow-[2px_0px_0px_0px_#171717]">
      <div>
        {/* Brand Logo Header */}
        <Link
          href="/overview"
          className="flex items-center gap-3 px-3 py-3.5 mb-5 rounded-xl bg-white border-2 border-[#171717] shadow-neo group hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
        >
          <div className="w-10 h-10 rounded-lg bg-[#E9F56A] flex items-center justify-center text-[#171717] border-2 border-[#171717] shadow-neo-sm group-hover:scale-105 transition-all">
            <Dumbbell className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="font-heading text-2xl font-black tracking-tight text-[#171717] leading-none uppercase">
              LIFTR
            </div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-[#3155F5] font-black">
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
                  "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-heading font-bold uppercase tracking-wider transition-all group",
                  isActive
                    ? "bg-[#E9F56A] text-[#171717] border-2 border-[#171717] shadow-neo translate-x-1"
                    : "text-white/90 hover:bg-[#2542C7] hover:text-[#E9F56A] border-2 border-transparent"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-colors",
                      isActive ? "text-[#171717] stroke-[2.5]" : "text-white/70 group-hover:text-[#E9F56A]"
                    )}
                  />
                  <span>{item.name}</span>
                </div>

                {item.comingSoon ? (
                  <span className="text-[9px] font-mono tracking-wider uppercase px-2 py-0.5 rounded bg-[#FF7043] text-white border border-[#171717] font-black shadow-neo-sm">
                    Soon
                  </span>
                ) : item.badge ? (
                  <span
                    className={cn(
                      "text-[9px] font-mono tracking-wider uppercase px-1.5 py-0.5 rounded font-black border",
                      isActive
                        ? "bg-[#3155F5] text-[#E9F56A] border-[#171717]"
                        : "bg-[#E9F56A] text-[#171717] border-[#171717]"
                    )}
                  >
                    {item.badge}
                  </span>
                ) : isActive ? (
                  <ChevronRight className="w-4 h-4 text-[#171717] stroke-[3]" />
                ) : null}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Status Box */}
      <div className="pt-3 border-t-2 border-[#171717]/30">
        <div className="p-3 rounded-xl bg-white border-2 border-[#171717] shadow-neo-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E9F56A] border border-[#171717] animate-pulse" />
            <span className="text-xs font-mono font-bold text-[#171717]">Offline Engine</span>
          </div>
          <span className="text-[10px] font-mono text-[#171717] font-black uppercase px-2 py-0.5 rounded bg-[#E9F56A] border border-[#171717]">
            v2.0
          </span>
        </div>
      </div>
    </aside>
  );
}
