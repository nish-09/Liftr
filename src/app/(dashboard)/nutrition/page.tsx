"use client";

import Link from "next/link";
import {
  UtensilsCrossed,
  Flame,
  Apple,
  Droplets,
} from "lucide-react";

export default function NutritionPage() {
  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading font-black text-3xl md:text-4xl text-dark tracking-tight">
              MACRO ARCHITECTURE
            </h1>
            <span className="px-2.5 py-1 rounded bg-lime text-dark border-2 border-dark text-xs font-mono font-black uppercase shadow-neo-sm">
              Coming Soon
            </span>
          </div>
          <p className="text-sm text-dark/70 font-sans mt-1">
            The third dimension of Liftr: connecting workout performance, body composition, and precision nutrition.
          </p>
        </div>

        <Link
          href="/overview"
          className="px-4 py-2 rounded-lg bg-white hover:bg-cream border-2 border-dark text-xs font-mono uppercase font-bold text-dark shadow-neo-sm transition-all self-start md:self-auto cursor-pointer"
        >
          Return to Overview
        </Link>
      </div>

      {/* Editorial Vision Hero Banner */}
      <div className="bg-forest text-cream border-2 border-dark rounded-xl shadow-neo p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-lime text-dark border-2 border-dark flex items-center justify-center font-bold shadow-neo-sm">
            <UtensilsCrossed className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-lime font-black">
              Architectural Roadmap
            </span>
            <h2 className="font-heading font-black text-xl sm:text-2xl text-cream tracking-tight">
              PERFORMANCE NUTRITION &amp; ENERGY BALANCE
            </h2>
          </div>
        </div>

        <p className="text-sm text-cream/90 leading-relaxed max-w-2xl font-sans">
          In strict accordance with Liftr&apos;s product philosophy, we do not deploy artificial or fake food logging. The nutrition subsystem is architecturally pre-engineered to connect with your body metrics and workout volume without cluttering your existing strength logs.
        </p>

        {/* The Triad Vision Diagram */}
        <div className="p-5 rounded-xl bg-cream border-2 border-dark shadow-neo-sm flex flex-col sm:flex-row items-center justify-around gap-4 text-center">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-dark/60 uppercase font-black">
              Dimension 1
            </span>
            <div className="font-heading font-black text-base text-dark">Workout Tracking</div>
            <span className="text-[11px] font-mono font-bold text-forest">● Live &amp; Active</span>
          </div>

          <div className="hidden sm:block text-dark font-mono text-2xl font-black">+</div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono text-dark/60 uppercase font-black">
              Dimension 2
            </span>
            <div className="font-heading font-black text-base text-dark">Body Composition</div>
            <span className="text-[11px] font-mono font-bold text-forest">● Live &amp; Active</span>
          </div>

          <div className="hidden sm:block text-dark font-mono text-2xl font-black">+</div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono text-dark/60 uppercase font-black">
              Dimension 3
            </span>
            <div className="font-heading font-black text-base text-dark">Precision Nutrition</div>
            <span className="text-[11px] font-mono font-black text-orange">● In Development</span>
          </div>
        </div>
      </div>

      {/* Forthcoming Subsystem Capabilities */}
      <div className="space-y-3">
        <div className="text-xs font-mono uppercase font-black tracking-wider text-dark/70 px-1">
          Planned Architectural Modules
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-cream border-2 border-dark rounded-xl shadow-neo p-5 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-orange text-cream border-2 border-dark flex items-center justify-center shadow-neo-sm">
              <Flame className="w-5 h-5 stroke-[2.5]" />
            </div>
            <h3 className="font-heading font-black text-base text-dark tracking-tight">ENERGY BALANCE ENGINE</h3>
            <p className="text-xs text-dark/75 leading-relaxed font-sans">
              Automated caloric surplus (+300 kcal for lean bulking) or deficit targets dynamically synchronized with your current weight rate-of-change.
            </p>
          </div>

          <div className="bg-cream border-2 border-dark rounded-xl shadow-neo p-5 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-lavender text-dark border-2 border-dark flex items-center justify-center shadow-neo-sm">
              <Apple className="w-5 h-5 stroke-[2.5]" />
            </div>
            <h3 className="font-heading font-black text-base text-dark tracking-tight">MACRONUTRIENT TARGETS</h3>
            <p className="text-xs text-dark/75 leading-relaxed font-sans">
              Target protein benchmarks (e.g., 2.0g per kg of bodyweight), carbohydrate periodization for training days, and essential dietary fats.
            </p>
          </div>

          <div className="bg-cream border-2 border-dark rounded-xl shadow-neo p-5 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-lime text-dark border-2 border-dark flex items-center justify-center shadow-neo-sm">
              <Droplets className="w-5 h-5 stroke-[2.5]" />
            </div>
            <h3 className="font-heading font-black text-base text-dark tracking-tight">HYDRATION &amp; MEAL HISTORY</h3>
            <p className="text-xs text-dark/75 leading-relaxed font-sans">
              Frictionless meal logging across breakfast, lunch, dinner, and intra-workout fueling, with verified database caching.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
