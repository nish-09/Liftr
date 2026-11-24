"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Play,
  CalendarDays,
  TrendingUp,
  Activity,
  Scale,
  Dumbbell,
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
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0C0C0C]/95 backdrop-blur-md border-t border-[#232323] px-3 py-2">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {MOBILE_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.isCenter) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -top-5 flex flex-col items-center group"
              >
                <div className="w-13 h-13 rounded-2xl bg-liftr-purple flex items-center justify-center text-white shadow-neo active:scale-95 transition-all p-3.5 border-2 border-[#090909]">
                  <Icon className="w-6 h-6 fill-white" />
                </div>
                <span className="text-[10px] font-mono tracking-wider text-liftr-purple font-bold mt-1 uppercase">
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
                "flex flex-col items-center gap-1 py-1 px-2 rounded-lg transition-colors",
                isActive ? "text-liftr-purple font-semibold" : "text-liftr-grey hover:text-white"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-sans tracking-tight">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
