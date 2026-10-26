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
  | "white";

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
  primary:
    "bg-[var(--color-ember)] text-white border-2 border-[var(--color-border-dark)] comic-shadow hover:bg-[var(--color-ember-hover)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
  accent:
    "bg-[var(--color-orange)] text-white border-2 border-[var(--color-border-dark)] comic-shadow hover:bg-[var(--color-orange-hover)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
  secondary:
    "bg-[var(--color-yellow)] text-[var(--color-text-dark)] border-2 border-[var(--color-border-dark)] comic-shadow hover:bg-[var(--color-yellow-hover)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
  outline:
    "bg-[var(--color-surface)] text-[var(--color-text-dark)] border-2 border-[var(--color-border-dark)] comic-shadow hover:bg-[var(--color-cream)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
  ghost:
    "bg-transparent text-[var(--color-text-dark)] hover:bg-[var(--color-cream)] border-2 border-transparent",
  cyan:
    "bg-[var(--color-cyan)] text-white border-2 border-[var(--color-border-dark)] comic-shadow hover:brightness-105 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
  gold:
    "bg-[#F59E0B] text-[var(--color-text-dark)] border-2 border-[var(--color-border-dark)] comic-shadow hover:bg-[#D97706] hover:text-white active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
  white:
    "bg-white text-[var(--color-text-dark)] border-2 border-[var(--color-border-dark)] comic-shadow hover:bg-neutral-50 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
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
  const combinedClasses = `inline-flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer select-none font-sans ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

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
