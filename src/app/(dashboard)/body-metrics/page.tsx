"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useBodyStore } from "@/stores/useBodyStore";
import { useHistoryStore } from "@/stores/useHistoryStore";
import { calculateBMI } from "@/lib/calculations/strength";
import {
  Activity,
  Scale,
  Ruler,
  AlertTriangle,
  Info,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Layers,
  Edit2,
  X,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function BodyMetricsPage() {
  const { userBodyProfile, weightLogs, updateBodyProfile } = useBodyStore();
  const { sessions } = useHistoryStore();

  const [isHeightModalOpen, setIsHeightModalOpen] = useState(false);
  const [formHeight, setFormHeight] = useState(userBodyProfile.height || 180);

  const latestWeight = weightLogs.length > 0 ? weightLogs[0].weight : userBodyProfile.startingWeight || 75;
  const currentHeightCm = userBodyProfile.height || 180;

  // Calculate dynamic BMI
  const { bmi, category, color } = useMemo(() => {
    return calculateBMI(latestWeight, currentHeightCm);
  }, [latestWeight, currentHeightCm]);

  // Historical BMI data derived from weight logs
  const historicalBMIData = useMemo(() => {
    return [...weightLogs]
      .reverse()
      .map((log) => {
        const heightM = currentHeightCm / 100;
        const calculated = Number((log.weight / (heightM * heightM)).toFixed(1));
        return {
          date: new Date(log.recordedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          bmi: calculated,
          weight: log.weight,
        };
      });
  }, [weightLogs, currentHeightCm]);

  function handleSaveHeight(e: React.FormEvent) {
    e.preventDefault();
    updateBodyProfile({ height: Number(formHeight) });
    setIsHeightModalOpen(false);
  }

  // Calculate needle position percentage across a 15 - 35 BMI range
  const minBMIScale = 15;
  const maxBMIScale = 35;
  const scalePercent = Math.max(
    0,
    Math.min(100, ((bmi - minBMIScale) / (maxBMIScale - minBMIScale)) * 100)
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif italic text-3xl text-white">Body Metrics &amp; BMI</h1>
            <span className="px-2 py-0.5 rounded bg-[#1C1C1C] border border-[#2B2B2B] text-xs font-mono text-liftr-purple">
              Biometric Engine
            </span>
          </div>
          <p className="text-sm text-liftr-grey mt-0.5">
            Dynamic body mass index calculations, category classification, and anthropometric tracking.
          </p>
        </div>

        <button
          onClick={() => {
            setFormHeight(currentHeightCm);
            setIsHeightModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#181818] hover:bg-[#202020] border border-[#2B2B2B] text-xs font-mono uppercase text-white transition-colors"
        >
          <Ruler className="w-3.5 h-3.5 text-liftr-purple" />
          <span>Update Height ({currentHeightCm} cm)</span>
        </button>
      </div>

      {/* Advisory Banner: BMI Screening Disclaimer */}
      <div className="p-4 rounded-xl bg-[#141414] border border-[#262626] flex items-start gap-3">
        <Info className="w-5 h-5 text-liftr-yellow shrink-0 mt-0.5" />
        <div className="text-xs text-zinc-300 leading-relaxed">
          <span className="font-bold text-white uppercase font-mono mr-1">
            Clinical Note:
          </span>
          BMI is a screening tool based on total body mass and height. It does not measure body fat percentage or differentiate between skeletal muscle and adipose tissue. For athletes engaged in progressive resistance training, use BMI alongside body measurements, strength trajectory, and target weight management.
        </div>
      </div>

      {/* Hero Bento Cards: Current BMI + Visual Scale */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Dynamic BMI Display Card */}
        <div className="lg:col-span-5 bento-card p-6 flex flex-col justify-between space-y-6 border-border">
          <div>
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-liftr-grey">
                Current BMI Status
              </span>
              <span
                className="text-xs font-mono font-bold uppercase px-2.5 py-1 rounded"
                style={{
                  backgroundColor: `${color}20`,
                  color: color,
                  border: `1px solid ${color}40`,
                }}
              >
                {category}
              </span>
            </div>

            <div className="my-4">
              <div className="text-5xl font-bold stat-number text-white">
                {bmi}
              </div>
              <span className="text-xs font-mono text-zinc-400 mt-1 block">
                Derived from {latestWeight} kg and {currentHeightCm} cm
              </span>
            </div>
          </div>

          {/* Visual BMI Scale Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
              <span>Underweight (&lt;18.5)</span>
              <span>Normal (18.5-24.9)</span>
              <span>Overweight (25-29.9)</span>
              <span>Obesity (30+)</span>
            </div>

            {/* Scale Track */}
            <div className="relative w-full h-3 rounded-full bg-[#1C1C1C] overflow-hidden flex">
              <div className="w-[17.5%] h-full bg-[#E9D65B]/60" title="Underweight" />
              <div className="w-[32%] h-full bg-[#60C27D]/80" title="Normal" />
              <div className="w-[25%] h-full bg-[#E97860]/70" title="Overweight" />
              <div className="w-[25.5%] h-full bg-[#E97860]" title="Obesity" />
            </div>

            {/* Marker Needle */}
            <div className="relative w-full h-4">
              <div
                className="absolute top-0 -ml-2 text-center transition-all duration-500 ease-out"
                style={{ left: `${scalePercent}%` }}
              >
                <div className="w-4 h-4 rounded-full bg-white border-2 border-liftr-purple shadow-neo-sm mx-auto" />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#1C1C1C] flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>Healthy Target Range</span>
            <span className="text-white font-bold">18.5 — 24.9</span>
          </div>
        </div>

        {/* Right: Historical BMI Trajectory Chart */}
        <div className="lg:col-span-7 bento-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">BMI Trend Over Time</h3>
              <p className="text-xs text-liftr-grey font-mono mt-0.5">
                Dynamic history calculated per recorded weight log
              </p>
            </div>
            <Link
              href="/weight-tracker"
              className="text-xs font-mono text-liftr-purple hover:underline"
            >
              Log Weight
            </Link>
          </div>

          <div className="h-64 w-full">
            {historicalBMIData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-zinc-500 font-mono">
                Log weights to visualize your BMI trajectory.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historicalBMIData}>
                  <defs>
                    <linearGradient id="bmiGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#60C27D" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#60C27D" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis dataKey="date" stroke="#666" fontSize={11} />
                  <YAxis domain={["dataMin - 1", "dataMax + 1"]} stroke="#666" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#181818",
                      border: "1px solid #333",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontFamily: "monospace",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="bmi"
                    name="BMI"
                    stroke="#60C27D"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#bmiGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Biometric Correlation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bento-card p-5 space-y-2">
          <span className="text-[10px] font-mono uppercase text-liftr-grey block">
            Current Stature
          </span>
          <div className="text-2xl font-bold stat-number text-white">
            {currentHeightCm} cm
          </div>
          <span className="text-xs text-zinc-400 font-mono">
            ≈ {Math.floor(currentHeightCm / 30.48)}&apos; {Math.round((currentHeightCm % 30.48) / 2.54)}&quot;
          </span>
        </div>

        <div className="bento-card p-5 space-y-2">
          <span className="text-[10px] font-mono uppercase text-liftr-grey block">
            Latest Scale Weight
          </span>
          <div className="text-2xl font-bold stat-number text-liftr-yellow">
            {latestWeight} kg
          </div>
          <span className="text-xs text-zinc-400 font-mono">
            ≈ {(latestWeight * 2.20462).toFixed(1)} lbs
          </span>
        </div>

        <div className="bento-card p-5 space-y-2">
          <span className="text-[10px] font-mono uppercase text-liftr-grey block">
            Target Weight Range
          </span>
          <div className="text-2xl font-bold stat-number text-liftr-green">
            {((18.5 * (currentHeightCm / 100) ** 2)).toFixed(1)} — {((24.9 * (currentHeightCm / 100) ** 2)).toFixed(1)} kg
          </div>
          <span className="text-xs text-zinc-400 font-mono">
            Normal BMI reference span
          </span>
        </div>
      </div>

      {/* Update Height Modal */}
      {isHeightModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bento-card p-6 w-full max-w-sm border-2 border-border shadow-neo-purple">
            <h3 className="text-base font-bold text-white mb-4">Update Height</h3>
            <form onSubmit={handleSaveHeight} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-liftr-grey mb-1.5">
                  Height (centimeters)
                </label>
                <input
                  type="number"
                  min={100}
                  max={250}
                  step={0.5}
                  required
                  value={formHeight}
                  onChange={(e) => setFormHeight(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] border border-[#2c2c2c] text-white text-sm focus:outline-none focus:border-liftr-purple font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsHeightModalOpen(false)}
                  className="px-4 py-2 rounded bg-[#1C1C1C] text-xs font-mono uppercase text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-liftr-purple hover:bg-liftr-purple-dark text-white text-xs font-mono uppercase font-bold shadow-neo"
                >
                  Save Height
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
