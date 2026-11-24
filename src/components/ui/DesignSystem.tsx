import React from "react";
import { cn } from "@/lib/utils";

export type PastelTone =
  | "white"
  | "lavender"
  | "green"
  | "lime"
  | "yellow"
  | "coral"
  | "navy";

const TONE_CLASSES: Record<PastelTone, string> = {
  white: "bg-white text-[#142746]",
  lavender: "bg-[#EBCBF7] text-[#142746]",
  green: "bg-[#BDF7B6] text-[#142746]",
  lime: "bg-[#E9FF91] text-[#142746]",
  yellow: "bg-[#F2FA91] text-[#142746]",
  coral: "bg-[#F8C3B5] text-[#142746]",
  navy: "bg-[#142746] text-white",
};

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: PastelTone;
  interactive?: boolean;
}

export function PastelCard({
  tone = "white",
  interactive = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-2xl border-[1.5px] border-[#142746] shadow-neo transition-all duration-150",
        TONE_CLASSES[tone],
        interactive && "hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neo-lg",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "lime" | "green" | "coral" | "lavender";
  size?: "sm" | "md" | "lg";
}

const BUTTON_VARIANTS: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-[#142746] text-white hover:bg-[#1e3863]",
  secondary: "bg-white text-[#142746] hover:bg-[#FAF9FD]",
  lime: "bg-[#E9FF91] text-[#142746] hover:bg-[#dff67c]",
  green: "bg-[#BDF7B6] text-[#142746] hover:bg-[#aeeea7]",
  coral: "bg-[#F8C3B5] text-[#142746] hover:bg-[#f4b3a2]",
  lavender: "bg-[#EBCBF7] text-[#142746] hover:bg-[#e1b9f1]",
};

const BUTTON_SIZES: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "min-h-[38px] px-3 py-1.5 text-xs rounded-lg",
  md: "min-h-[44px] px-4 py-2.5 text-xs rounded-xl",
  lg: "min-h-[48px] px-5 py-3 text-sm rounded-xl",
};

export function NeoButton({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "neo-btn inline-flex items-center justify-center gap-2 font-heading font-bold tracking-tight cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#142746]/40",
        BUTTON_VARIANTS[variant],
        BUTTON_SIZES[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function PastelBadge({
  tone = "lime",
  className,
  children,
}: {
  tone?: PastelTone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-[#142746] text-[11px] font-semibold tracking-tight",
        TONE_CLASSES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function PageHeader({
  title,
  subtitle,
  badge,
  actions,
}: {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 min-w-0">
      <div className="min-w-0">
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          <h1 className="font-heading text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#142746] tracking-tight break-words">
            {title}
          </h1>
          {badge}
        </div>
        {subtitle && (
          <p className="text-xs sm:text-sm text-[#142746]/75 font-medium mt-1 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap shrink-0">{actions}</div>
      )}
    </div>
  );
}

export function EmptyStateCard({
  icon,
  title,
  description,
  action,
  tone = "white",
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  tone?: PastelTone;
}) {
  return (
    <PastelCard tone={tone} className="p-10 text-center space-y-4">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-[#EBCBF7] border-[1.5px] border-[#142746] flex items-center justify-center text-[#142746] shadow-neo-sm">
        {icon}
      </div>
      <div className="space-y-1.5">
        <h3 className="font-heading font-extrabold text-lg text-[#142746]">{title}</h3>
        <p className="text-xs sm:text-sm text-[#8993A5] max-w-md mx-auto leading-relaxed">
          {description}
        </p>
      </div>
      {action && <div className="pt-1 flex justify-center">{action}</div>}
    </PastelCard>
  );
}

export function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-white/60 border border-[#142746]/15",
        className
      )}
    />
  );
}
