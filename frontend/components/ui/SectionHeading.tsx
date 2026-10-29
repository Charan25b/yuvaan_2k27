import React from "react";
import { Badge, type BadgeVariant } from "./Badge";

interface SectionHeadingProps {
  badge?: string;
  badgeVariant?: BadgeVariant;
  title: string;
  subtitle?: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  badge,
  badgeVariant = "primary",
  title,
  subtitle,
  description,
  align = "left",
  className = "",
}: SectionHeadingProps) {
  const isCenter = align === "center";

  return (
    <div
      className={`flex flex-col gap-2 ${
        isCenter ? "items-center text-center mx-auto max-w-3xl" : "max-w-2xl"
      } ${className}`}
    >
      {badge && (
        <div className="flex items-center gap-2">
          <Badge variant={badgeVariant} comicStamp>
            ✦ {badge}
          </Badge>
          {subtitle && (
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
              {subtitle}
            </span>
          )}
        </div>
      )}
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[var(--color-text-dark)] leading-[1.15]">
        {title}
      </h2>
      {description && (
        <p className="text-sm sm:text-base text-[var(--color-text-muted)] font-medium leading-relaxed mt-1">
          {description}
        </p>
      )}
    </div>
  );
}
