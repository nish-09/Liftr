"use client";

import Link from "next/link";
import {
  UtensilsCrossed,
  Sparkles,
  Flame,
  Apple,
  Droplets,
  TrendingUp,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default function NutritionPage() {
  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif italic text-3xl text-white">Macro Architecture</h1>
            <span className="px-2 py-0.5 rounded bg-liftr-yellow/15 border border-liftr-yellow/30 text-xs font-mono text-liftr-yellow font-bold uppercase">
              Coming Soon
            </span>
          </div>
          <p className="text-sm text-liftr-grey mt-0.5">
            The third dimension of Liftr: connecting workout performance, body composition, and precision nutrition.
          </p>
        </div>

        <Link
          href="/overview"
          className="px-3.5 py-2 rounded-lg bg-[#181818] hover:bg-[#202020] border border-[#2B2B2B] text-xs font-mono uppercase text-zinc-300 transition-colors self-start md:self-auto"
        >
          Return to Overview
        </Link>
      </div>

      {/* Editorial Vision Hero Banner */}
      <div className="bento-card p-6 sm:p-8 bg-gradient-to-br from-[#1A1810] via-[#121212] to-[#0A0A0A] border-liftr-yellow/30 shadow-neo space-y-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-liftr-yellow text-black flex items-center justify-center font-bold shadow-neo-sm">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-liftr-yellow font-bold">
              Architectural Roadmap
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-sans">
              Performance Nutrition &amp; Energy Balance
            </h2>
          </div>
        </div>

        <p className="text-sm text-zinc-300 leading-relaxed max-w-2xl">
          In strict accordance with Liftr&apos;s product philosophy, we do not deploy artificial or fake food logging. The nutrition subsystem is architecturally pre-engineered to connect with your body metrics and workout volume without cluttering your existing strength logs.
        </p>

        {/* The Triad Vision Diagram */}
        <div className="p-4 rounded-xl bg-[#141414] border border-[#262626] flex flex-col sm:flex-row items-center justify-around gap-4 text-center">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-liftr-purple uppercase font-bold">
              Dimension 1
            </span>
            <div className="text-sm font-bold text-white">Workout Tracking</div>
            <span className="text-[11px] font-mono text-liftr-green">● Live &amp; Active</span>
          </div>

          <div className="hidden sm:block text-zinc-600 font-mono text-xl">+</div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono text-liftr-green uppercase font-bold">
              Dimension 2
            </span>
            <div className="text-sm font-bold text-white">Body Composition</div>
            <span className="text-[11px] font-mono text-liftr-green">● Live &amp; Active</span>
          </div>

          <div className="hidden sm:block text-zinc-600 font-mono text-xl">+</div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono text-liftr-yellow uppercase font-bold">
              Dimension 3
            </span>
            <div className="text-sm font-bold text-white">Precision Nutrition</div>
            <span className="text-[11px] font-mono text-liftr-yellow">● In Development</span>
          </div>
        </div>
      </div>

      {/* Forthcoming Subsystem Capabilities */}
      <div className="space-y-3">
        <div className="text-xs font-mono uppercase tracking-wider text-liftr-grey px-1">
          Planned Architectural Modules
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bento-card p-5 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-liftr-coral/20 text-liftr-coral flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">Energy Balance Engine</h3>
            <p className="text-xs text-liftr-grey leading-relaxed">
              Automated caloric surplus (+300 kcal for lean bulking) or deficit targets dynamically synchronized with your current weight rate-of-change.
            </p>
          </div>

          <div className="bento-card p-5 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-liftr-purple/20 text-liftr-purple-light flex items-center justify-center">
              <Apple className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">Macronutrient Targets</h3>
            <p className="text-xs text-liftr-grey leading-relaxed">
              Target protein benchmarks (e.g., 2.0g per kg of bodyweight), carbohydrate periodization for training days, and essential dietary fats.
            </p>
          </div>

          <div className="bento-card p-5 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-liftr-green/20 text-liftr-green flex items-center justify-center">
              <Droplets className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">Hydration &amp; Meal History</h3>
            <p className="text-xs text-liftr-grey leading-relaxed">
              Frictionless meal logging across breakfast, lunch, dinner, and intra-workout fueling, with verified database caching.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
