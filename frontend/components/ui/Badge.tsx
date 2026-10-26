import React from "react";

export type BadgeVariant =
  | "primary"
  | "accent"
  | "highlight"
  | "cream"
  | "outline"
  | "cyan"
  | "emerald"
  | "violet"
  | "gold"
  | "blush";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  comicStamp?: boolean;
  className?: string;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  primary: "bg-[var(--color-ember)] text-white border-1.5 border-[var(--color-border-dark)]",
  accent: "bg-[var(--color-orange)] text-white border-1.5 border-[var(--color-border-dark)]",
  highlight: "bg-[var(--color-yellow)] text-[var(--color-text-dark)] border-1.5 border-[var(--color-border-dark)]",
  cream: "bg-[var(--color-cream)] text-[var(--color-text-dark)] border-1.5 border-[var(--color-border-dark)]",
  outline: "bg-[var(--color-surface)] text-[var(--color-text-dark)] border-1.5 border-[var(--color-border-dark)]",
  cyan: "bg-[#E0F2FE] text-[#0369A1] border-1.5 border-[#0284C7]",
  emerald: "bg-[#DCFCE7] text-[#15803D] border-1.5 border-[#16A34A]",
  violet: "bg-[#EDE9FE] text-[#6D28D9] border-1.5 border-[#7C3AED]",
  gold: "bg-[#FEF3C7] text-[#B45309] border-1.5 border-[#D97706]",
  blush: "bg-[#FFE4E6] text-[#BE123C] border-1.5 border-[#E11D48]",
};

export function Badge({
  variant = "cream",
  comicStamp = false,
  className = "",
  children,
  ...props
}: BadgeProps) {
  const stampStyle = comicStamp ? "rotate-[-1.5deg] shadow-[1.5px_1.5px_0px_#1C1917]" : "comic-shadow-sm";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-black tracking-wider uppercase rounded-md ${stampStyle} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
