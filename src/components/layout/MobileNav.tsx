"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Play,
  CalendarDays,
  TrendingUp,
  Scale,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MOBILE_NAV_ITEMS = [
  { name: "Overview", href: "/overview", icon: LayoutDashboard },
  { name: "Plans", href: "/plans", icon: CalendarDays },
  { name: "Workout", href: "/workouts", icon: Play, isCenter: true },
  { name: "Analytics", href: "/progress", icon: TrendingUp },
  { name: "Body", href: "/body-metrics", icon: Scale },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#BDF7B6] border-t-[1.5px] border-[#142746] px-1.5 sm:px-3 py-1.5">
      <div className="flex items-center justify-around max-w-lg mx-auto gap-0.5">
        {MOBILE_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.isCenter) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -top-3.5 flex flex-col items-center group shrink-0 px-1"
              >
                <div className="w-[52px] h-[52px] p-3 rounded-2xl bg-[#142746] flex items-center justify-center text-[#E9FF91] border-[1.5px] border-[#142746] shadow-neo active:translate-x-0.5 active:translate-y-0.5 transition-all">
                  <Icon className="w-5 h-5 fill-[#E9FF91]" />
                </div>
                <span className="text-[10px] font-heading font-bold text-[#142746] mt-0.5">
                  Log
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 min-h-[44px] min-w-[48px] py-1.5 px-2 sm:px-3 rounded-xl transition-colors border-[1.5px]",
                isActive
                  ? "bg-[#E9FF91] text-[#142746] font-bold border-[#142746] shadow-neo-sm"
                  : "border-transparent text-[#142746]/80 hover:text-[#142746]"
              )}
            >
              <Icon className="w-4 h-4 stroke-[2.2]" />
              <span className="text-[10px] font-heading font-bold truncate">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
