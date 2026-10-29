import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "comic" | "subtle" | "flat" | "elevated";
  bgTint?: "white" | "cream" | "gold" | "peach" | "blush" | "cyan" | "mint" | "violet";
  accentStrip?: string; // e.g. "bg-[var(--color-ember)]" or "bg-[var(--color-orange)]"
  className?: string;
  children: React.ReactNode;
}

export function Card({
  variant = "comic",
  bgTint = "white",
  accentStrip,
  className = "",
  children,
  ...props
}: CardProps) {
  const bgStyles = {
    white: "bg-[var(--color-surface)]",
    cream: "bg-[var(--color-cream)]",
    gold: "bg-[#FFFBEB]",
    peach: "bg-[#FFF7ED]",
    blush: "bg-[#FFF1F2]",
    cyan: "bg-[#F0F9FF]",
    mint: "bg-[#F0FDF4]",
    violet: "bg-[#F5F3FF]",
  };

  const variantStyles = {
    comic: "comic-card border-2 border-[var(--color-border-dark)] comic-shadow rounded-2xl",
    elevated: "comic-card border-2 border-[var(--color-border-dark)] comic-shadow-lg rounded-2xl",
    subtle: "border border-[var(--color-border-subtle)] shadow-sm rounded-2xl",
    flat: "border border-[var(--color-border-subtle)] rounded-2xl",
  };

  return (
    <div
      className={`comic-card relative overflow-hidden transition-all duration-200 ${bgStyles[bgTint]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {accentStrip && (
        <div className={`h-2.5 w-full ${accentStrip} border-b-2 border-[var(--color-border-dark)]`} />
      )}
      {children}
    </div>
  );
}

export function CardHeader({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-5 sm:p-6 pb-2 sm:pb-3 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={`text-xl font-black text-[var(--color-text-dark)] tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={`text-xs sm:text-sm text-[var(--color-text-muted)] font-medium leading-relaxed ${className}`}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-5 sm:p-6 pt-0 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`p-5 sm:p-6 pt-0 flex items-center justify-between border-t border-[var(--color-border-subtle)] mt-auto ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
