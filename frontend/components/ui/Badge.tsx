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
  | "blush"
  | "dark"
  | "black"
  | "parent-dark"
  | "parent-light"
  | "parent-card"
  | "section-dark"
  | "section-ember"
  | "section-light";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  comicStamp?: boolean;
  className?: string;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  primary: "bg-[#f04b2b] text-white border-2 border-[#121110] shadow-[2px_2px_0px_#121110]",
  accent: "bg-[var(--color-orange)] text-white border-2 border-[#121110] shadow-[2px_2px_0px_#121110]",
  highlight: "bg-[var(--color-yellow)] text-[#121110] border-2 border-[#121110] shadow-[2px_2px_0px_#121110]",
  cream: "bg-[var(--color-cream)] text-[#121110] border-2 border-[#121110] shadow-[2px_2px_0px_#121110]",
  outline: "bg-white text-[#121110] border-2 border-[#121110] shadow-[2px_2px_0px_#121110]",
  cyan: "bg-[#E0F2FE] text-[#0369A1] border-2 border-[#121110] shadow-[2px_2px_0px_#121110]",
  emerald: "bg-[#DCFCE7] text-[#15803D] border-2 border-[#121110] shadow-[2px_2px_0px_#121110]",
  violet: "bg-[#EDE9FE] text-[#6D28D9] border-2 border-[#121110] shadow-[2px_2px_0px_#121110]",
  gold: "bg-[#FEF3C7] text-[#B45309] border-2 border-[#121110] shadow-[2px_2px_0px_#121110]",
  blush: "bg-[#FFE4E6] text-[#BE123C] border-2 border-[#121110] shadow-[2px_2px_0px_#121110]",
  dark: "bg-[#121110] text-[#FFFFFF] border-2 border-white/70 shadow-[-3px_3px_0px_#ffffff]",
  black: "bg-[#121110] text-[#FFFFFF] border-2 border-white shadow-[-3px_3px_0px_#ffffff]",
  "parent-dark": "bg-[#111110] text-[#FFFFFF] border-2 border-white/80 shadow-[-3px_3px_0px_#ffffff]",
  "parent-light": "bg-white text-[#121110] border-2 border-[#121110] shadow-[-3px_3px_0px_#121110]",
  "parent-card": "bg-white text-[#121110] border-2 border-[#121110] shadow-[2px_2px_0px_#121110]",
  "section-dark": "bg-[#111110] text-[#FFFFFF] border-2 border-white/80 shadow-[-3px_3px_0px_#ffffff]",
  "section-ember": "bg-[#f04b2b] text-[#FFFFFF] border-2 border-white shadow-[-3px_3px_0px_#ffffff]",
  "section-light": "bg-[#f8f7f4] text-[#111110] border-2 border-[#111110] shadow-[-3px_3px_0px_#111110]",
};

export function Badge({
  variant = "cream",
  comicStamp = false,
  className = "",
  children,
  ...props
}: BadgeProps) {
  // STRICTLY STATIC: NO HOVER ANIMATIONS, NO TILTS
  return (
    <span
      className={`comic-tagline inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-black tracking-wider uppercase rounded-md select-none pointer-events-none transition-none transform-none ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}