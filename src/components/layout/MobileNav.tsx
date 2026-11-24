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
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#3155F5] border-t-2 border-[#171717] px-3 py-2 shadow-[0px_-2px_0px_0px_#171717]">
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
                <div className="w-14 h-14 rounded-xl bg-[#E9F56A] flex items-center justify-center text-[#171717] border-2 border-[#171717] shadow-neo active:translate-x-0.5 active:translate-y-0.5 transition-all p-3">
                  <Icon className="w-6 h-6 fill-[#171717] stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-mono tracking-wider text-[#E9F56A] font-black mt-1 uppercase">
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
                "flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg transition-colors",
                isActive
                  ? "bg-[#E9F56A] text-[#171717] font-bold border-2 border-[#171717] shadow-neo-sm"
                  : "text-white/90 hover:text-[#E9F56A]"
              )}
            >
              <Icon className="w-4 h-4 stroke-[2]" />
              <span className="text-[10px] font-heading font-bold uppercase tracking-tight">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
