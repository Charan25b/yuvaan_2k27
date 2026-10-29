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
      className={`flex flex-col gap-2.5 w-full ${
        isCenter ? "items-center text-center mx-auto" : ""
      } ${className}`}
    >
      {badge && (
        <div className="flex items-center gap-2 mb-1.5">
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
      <h2 className={`comic-heading font-anton font-black tracking-tight uppercase max-w-[820px] mt-2.5 sm:mt-3 ${isCenter ? "mx-auto" : ""}`}>
        {title}
      </h2>
      {description && (
        <p className={`text-sm sm:text-base font-medium leading-relaxed mt-1 max-w-2xl ${isCenter ? "mx-auto" : ""}`}>
          {description}
        </p>
      )}
    </div>
  );
}
