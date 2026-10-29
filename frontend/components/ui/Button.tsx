import React from "react";
import Link from "next/link";

export type ButtonVariant =
  | "primary"
  | "accent"
  | "secondary"
  | "outline"
  | "ghost"
  | "cyan"
  | "gold"
  | "white"
  | "black";

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  isExternal?: boolean;
  className?: string;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  // Red button -> inverts to Yellow on hover with cool pop shadow
  primary:
    "bg-[#f04b2b] text-white border-2 border-[#121110] shadow-[4px_4px_0px_#121110] hover:bg-[#F2AE30] hover:text-[#121110] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#121110] active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_#121110]",
  accent:
    "bg-[var(--color-orange)] text-white border-2 border-[#121110] shadow-[4px_4px_0px_#121110] hover:bg-[#F2AE30] hover:text-[#121110] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#121110] active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_#121110]",
  // Yellow button -> inverts to Red on hover with cool pop shadow (like VIEW ALL 6+ EVENTS)
  gold:
    "bg-[#F2AE30] text-[#121110] border-2 border-[#121110] shadow-[4px_4px_0px_#121110] hover:bg-[#f04b2b] hover:text-white hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#121110] active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_#121110]",
  secondary:
    "bg-[#F2AE30] text-[#121110] border-2 border-[#121110] shadow-[4px_4px_0px_#121110] hover:bg-[#f04b2b] hover:text-white hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#121110] active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_#121110]",
  // White button -> inverts to Black on hover
  outline:
    "bg-white text-[#121110] border-2 border-[#121110] shadow-[4px_4px_0px_#121110] hover:bg-[#121110] hover:text-white hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#121110] active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_#121110]",
  white:
    "bg-white text-[#121110] border-2 border-[#121110] shadow-[4px_4px_0px_#121110] hover:bg-[#121110] hover:text-white hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#121110] active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_#121110]",
  // Black button -> inverts to White on hover
  black:
    "bg-[#121110] text-white border-2 border-[#121110] shadow-[4px_4px_0px_#121110] hover:bg-white hover:text-[#121110] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#121110] active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_#121110]",
  cyan:
    "bg-[#0284c7] text-white border-2 border-[#121110] shadow-[4px_4px_0px_#121110] hover:bg-[#F2AE30] hover:text-[#121110] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#121110] active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_#121110]",
  ghost:
    "bg-transparent text-[#121110] hover:bg-[#121110] hover:text-white border-2 border-transparent",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3.5 py-1.5 text-xs font-black tracking-wide rounded-lg",
  md: "px-5 py-2.5 text-sm font-black tracking-wide rounded-xl",
  lg: "px-6 py-3 text-base font-black tracking-wide rounded-xl",
};

export function Button({
  variant = "primary",
  size = "md",
  href,
  isExternal,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const combinedClasses = `inline-flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer select-none font-sans font-black ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  if (href) {
    if (isExternal) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={combinedClasses}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={combinedClasses}>
        {children}
      </Link>
    );
  }

  return (
    <button className={combinedClasses} {...props}>
      {children}
    </button>
  );
}