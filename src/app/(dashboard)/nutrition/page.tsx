"use client";

import Link from "next/link";
import { UtensilsCrossed, Flame, Apple, Droplets } from "lucide-react";
import { PageHeader, PastelCard, PastelBadge } from "@/components/ui/DesignSystem";

export default function NutritionPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Macro Architecture"
        subtitle="The third dimension of Liftr: connecting workout performance, body composition, and precision nutrition."
        badge={<PastelBadge tone="lime">Coming Soon</PastelBadge>}
        actions={
          <Link
            href="/overview"
            className="neo-btn px-4 py-2 rounded-xl bg-white text-xs font-bold text-[#142746]"
          >
            Return to Overview
          </Link>
        }
      />

      <PastelCard tone="white" className="p-5 sm:p-8 space-y-6">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#E9FF91] text-[#142746] border-[1.5px] border-[#142746] flex items-center justify-center shadow-neo-sm">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-[#142746]/70">
              Architectural Roadmap
            </span>
            <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-[#142746]">
              Performance Nutrition &amp; Energy Balance
            </h2>
          </div>
        </div>

        <p className="text-sm text-[#142746]/85 leading-relaxed max-w-2xl">
          The nutrition subsystem is architecturally pre-engineered to connect directly with your body composition trends and progressive overload volume without cluttering your active training logs.
        </p>

        <div className="p-5 rounded-2xl bg-white border-[1.5px] border-[#142746] flex flex-col sm:flex-row items-center justify-around gap-4 text-center">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#8993A5]">Dimension 1</span>
            <div className="font-heading font-extrabold text-base text-[#142746]">
              Workout Tracking
            </div>
            <PastelBadge tone="green">Live &amp; Active</PastelBadge>
          </div>

          <div className="hidden sm:block text-[#142746] text-xl font-extrabold">+</div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#8993A5]">Dimension 2</span>
            <div className="font-heading font-extrabold text-base text-[#142746]">
              Body Composition
            </div>
            <PastelBadge tone="green">Live &amp; Active</PastelBadge>
          </div>

          <div className="hidden sm:block text-[#142746] text-xl font-extrabold">+</div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#8993A5]">Dimension 3</span>
            <div className="font-heading font-extrabold text-base text-[#142746]">
              Precision Nutrition
            </div>
            <PastelBadge tone="coral">Coming Soon</PastelBadge>
          </div>
        </div>
      </PastelCard>

      <div className="space-y-3">
        <div className="text-xs uppercase font-bold tracking-wider text-[#8993A5] px-1">
          Planned Architectural Modules
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PastelCard tone="coral" className="p-5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-white border-[1.5px] border-[#142746] flex items-center justify-center">
              <Flame className="w-5 h-5 text-[#142746]" />
            </div>
            <h3 className="font-heading font-extrabold text-base text-[#142746]">
              Energy Balance Engine
            </h3>
            <p className="text-xs text-[#142746]/80 leading-relaxed">
              Caloric surplus or deficit targets dynamically synchronized with your weekly body weight rate-of-change.
            </p>
          </PastelCard>

          <PastelCard tone="yellow" className="p-5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-white border-[1.5px] border-[#142746] flex items-center justify-center">
              <Apple className="w-5 h-5 text-[#142746]" />
            </div>
            <h3 className="font-heading font-extrabold text-base text-[#142746]">
              Macronutrient Targets
            </h3>
            <p className="text-xs text-[#142746]/80 leading-relaxed">
              Protein benchmarks per kg of bodyweight, training-day carbohydrate periodization, and essential dietary fats.
            </p>
          </PastelCard>

          <PastelCard tone="green" className="p-5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-white border-[1.5px] border-[#142746] flex items-center justify-center">
              <Droplets className="w-5 h-5 text-[#142746]" />
            </div>
            <h3 className="font-heading font-extrabold text-base text-[#142746]">
              Hydration &amp; Meal History
            </h3>
            <p className="text-xs text-[#142746]/80 leading-relaxed">
              Streamlined meal logging across breakfast, lunch, dinner, and intra-workout fueling.
            </p>
          </PastelCard>
        </div>
      </div>
    </div>
  );
}
