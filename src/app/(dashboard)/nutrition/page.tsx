"use client";

import Link from "next/link";
import { UtensilsCrossed, Flame, Apple, Droplets } from "lucide-react";
import { PageHeader, PastelCard, PastelBadge } from "@/components/ui/DesignSystem";

export default function NutritionPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Nutrition"
        badge={<PastelBadge tone="lime">Coming Soon</PastelBadge>}
        actions={
          <Link
            href="/overview"
            className="neo-btn min-h-[42px] inline-flex items-center px-4 py-2 rounded-xl bg-white text-xs font-bold text-[#142746]"
          >
            Back to Overview
          </Link>
        }
      />

      <PastelCard tone="white" className="p-5 sm:p-6 flex items-start gap-4">
        <div className="w-11 h-11 shrink-0 rounded-xl bg-[#E9FF91] text-[#142746] border-[1.5px] border-[#142746] flex items-center justify-center">
          <UtensilsCrossed className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h2 className="font-heading font-extrabold text-lg text-[#142746]">
            In Development
          </h2>
          <p className="text-xs sm:text-sm text-[#142746]/75 leading-relaxed max-w-2xl">
            Nutrition tracking will pair directly with your training volume and body weight trend.
          </p>
        </div>
      </PastelCard>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PastelCard tone="coral" className="p-5 space-y-2.5">
          <Flame className="w-5 h-5 text-[#142746]" />
          <h3 className="font-heading font-extrabold text-base text-[#142746]">
            Calorie Targets
          </h3>
          <p className="text-xs text-[#142746]/80 leading-relaxed">
            Intake targets adjusted to your weekly weight trend.
          </p>
        </PastelCard>

        <PastelCard tone="yellow" className="p-5 space-y-2.5">
          <Apple className="w-5 h-5 text-[#142746]" />
          <h3 className="font-heading font-extrabold text-base text-[#142746]">
            Macros
          </h3>
          <p className="text-xs text-[#142746]/80 leading-relaxed">
            Daily protein, carb, and fat targets tailored to training days.
          </p>
        </PastelCard>

        <PastelCard tone="green" className="p-5 space-y-2.5">
          <Droplets className="w-5 h-5 text-[#142746]" />
          <h3 className="font-heading font-extrabold text-base text-[#142746]">
            Meal &amp; Water Log
          </h3>
          <p className="text-xs text-[#142746]/80 leading-relaxed">
            Fast daily logging for meals and hydration.
          </p>
        </PastelCard>
      </div>
    </div>
  );
}
