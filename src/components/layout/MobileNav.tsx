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
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#183D2A] border-t-2 border-[#171B16] px-3 py-2 shadow-[0px_-2px_0px_0px_#171B16]">
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
                <div className="w-13 h-13 rounded-xl bg-[#D5F36A] flex items-center justify-center text-[#171B16] border-2 border-[#171B16] shadow-neo active:translate-x-0.5 active:translate-y-0.5 transition-all p-3">
                  <Icon className="w-6 h-6 fill-[#171B16] stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-mono tracking-wider text-[#D5F36A] font-bold mt-1 uppercase">
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
                "flex flex-col items-center gap-1 py-1 px-2.5 rounded-md transition-colors",
                isActive
                  ? "bg-[#D5F36A] text-[#171B16] font-bold border border-[#171B16] shadow-neo-sm"
                  : "text-[#F5F0DF] hover:text-[#D5F36A]"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] font-heading font-medium tracking-tight">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
