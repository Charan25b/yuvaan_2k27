import React from "react";

interface ArtworkPlaceholderProps {
  label?: string;
  sublabel?: string;
  aspectRatio?: "square" | "video" | "portrait" | "banner";
  tint?: "cream" | "gold" | "peach" | "blush" | "cyan" | "mint";
  badge?: string;
  comicLabel?: string;
  className?: string;
}

export function ArtworkPlaceholder({
  label = "Artwork Placeholder",
  sublabel = "Design Team Asset Slot",
  aspectRatio = "video",
  tint = "cream",
  badge = "Asset Placeholder",
  comicLabel = "PANEL · ARTWORK",
  className = "",
}: ArtworkPlaceholderProps) {
  const aspectClasses = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[4/5]",
    banner: "aspect-[21/9]",
  };

  const tintClasses = {
    cream: "bg-[var(--color-cream)]",
    gold: "bg-[#FEF3C7]",
    peach: "bg-[#FFEDD5]",
    blush: "bg-[#FFE4E6]",
    cyan: "bg-[#E0F2FE]",
    mint: "bg-[#DCFCE7]",
  };

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl border-2 border-[var(--color-border-dark)] comic-shadow flex flex-col items-center justify-center p-6 text-center select-none ${tintClasses[tint]} ${aspectClasses[aspectRatio]} ${className}`}
    >
      {/* Comic Halftone Dot Texture */}
      <div
        className="absolute inset-0 opacity-25 pointer-events-none comic-dots-subtle"
      />

      {/* Top Left Comic Strip Stamp */}
      <div className="absolute top-3 left-3 z-10">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-[var(--color-surface)] border border-[var(--color-border-dark)] comic-shadow-sm text-[var(--color-text-dark)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-orange)]" />
          {comicLabel}
        </span>
      </div>

      {/* Center Visual Content */}
      <div className="relative z-10 flex flex-col items-center gap-2 max-w-xs">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[var(--color-surface)] border border-[var(--color-border-dark)] text-[var(--color-text-dark)]">
          {badge}
        </span>
        <span className="font-black text-base sm:text-lg text-[var(--color-text-dark)] leading-tight">
          {label}
        </span>
        <span className="text-xs text-[var(--color-text-muted)] font-medium leading-relaxed">
          {sublabel}
        </span>
      </div>

      {/* Subtle corner graphic accent */}
      <div className="absolute bottom-2 right-2 text-[10px] font-black text-[var(--color-text-muted)] tracking-widest uppercase opacity-40">
        YUVAAN // 2027
      </div>
    </div>
  );
}
