"use client";

import React, { useState } from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card, CardHeader, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { GALLERY_DATA, type GalleryItem } from "@/lib/data/festivalData";

const categories = [
  "All",
  "Pro-Nites & Concerts",
  "Competitions",
  "Campus Life",
  "Exhibitions",
] as const;

const categoryBadges: Record<
  string,
  "primary" | "cyan" | "gold" | "violet" | "emerald"
> = {
  All: "primary",
  "Pro-Nites & Concerts": "gold",
  Competitions: "cyan",
  "Campus Life": "primary",
  Exhibitions: "violet",
};

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeModalItem, setActiveModalItem] = useState<GalleryItem | null>(null);

  const filteredItems = GALLERY_DATA.filter((item) => {
    return selectedCategory === "All" || item.category === selectedCategory;
  });

  return (
    <div className="py-10 sm:py-16">
      <Container>
        <div className="flex flex-col gap-10 max-w-6xl mx-auto">
          {/* Header */}
          <div className="border-b-2 border-[var(--color-border-dark)] pb-8 text-center sm:text-left">
            <SectionHeading
              badge="Visual Archives"
              badgeVariant="primary"
              title="Festival Photo Gallery &amp; Archive"
              description="A curated visual retrospective of landmark Yuvaan moments across concerts, hackathons, cosplay spectacles, and campus celebrations at IIIT Guwahati."
            />

            {/* Category Filter Pills */}
            <div className="mt-8 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer select-none ${
                      isSelected
                        ? "bg-[var(--color-ember)] text-white border-2 border-[var(--color-border-dark)] comic-shadow"
                        : "bg-white text-[var(--color-text-dark)] border-2 border-[var(--color-border-dark)] hover:bg-[var(--color-cream)] comic-shadow-sm"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Gallery Grid of Comic Polaroid Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredItems.map((item, idx) => {
              const tints = ["blush", "cyan", "gold", "mint"] as const;
              const tint = tints[idx % tints.length];
              const badgeVariant = categoryBadges[item.category] || "primary";

              return (
                <Card
                  key={item.id}
                  variant="comic"
                  bgTint={tint}
                  className="flex flex-col justify-between overflow-hidden comic-shadow-hover cursor-pointer transition-all"
                  onClick={() => setActiveModalItem(item)}
                >
                  {/* Photo Placeholder Frame */}
                  <div className="relative aspect-square w-full bg-white border-b-2 border-[var(--color-border-dark)] flex flex-col items-center justify-center p-4 text-center group overflow-hidden">
                    {/* Comic dots pattern */}
                    <div className="absolute inset-0 comic-dots-subtle opacity-40 pointer-events-none" />

                    <div className="absolute top-2.5 left-2.5 z-10">
                      <Badge variant={badgeVariant} className="text-[9px]">
                        {item.category}
                      </Badge>
                    </div>

                    <span className="text-sm font-black text-[var(--color-text-dark)] max-w-xs line-clamp-2 relative z-10 mt-4">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-[var(--color-text-muted)] mt-1 font-bold">
                      {item.year} Photographic Slot
                    </span>

                    <span className="mt-3 text-[10px] font-black px-3 py-1 rounded-xl bg-[var(--color-yellow)] border-2 border-[var(--color-border-dark)] text-[var(--color-text-dark)] comic-shadow-sm group-hover:scale-105 transition-all">
                      Click to View &rarr;
                    </span>
                  </div>

                  <CardHeader className="p-3.5">
                    <span className="text-xs font-black text-[var(--color-text-dark)] line-clamp-1">
                      {item.title}
                    </span>
                    <CardDescription className="text-xs line-clamp-2 mt-0.5 text-[var(--color-text-dark)] font-medium">
                      {item.caption}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>

          {/* Image Viewer Modal */}
          {activeModalItem && (
            <div
              role="dialog"
              aria-modal="true"
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150"
              onClick={() => setActiveModalItem(null)}
            >
              <div
                className="w-full max-w-2xl rounded-3xl bg-white border-2 border-[var(--color-border-dark)] comic-shadow-lg p-6 sm:p-8 text-left"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-3 border-b-2 border-[var(--color-border-dark)]">
                  <div className="flex items-center gap-2">
                    <Badge variant="primary" comicStamp className="text-xs">
                      {activeModalItem.year} ARCHIVE
                    </Badge>
                    <Badge variant="cyan" className="text-xs">
                      {activeModalItem.category}
                    </Badge>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveModalItem(null)}
                    className="h-8 w-8 rounded-full bg-[var(--color-cream-canvas)] border-2 border-[var(--color-border-dark)] flex items-center justify-center font-black text-sm text-[var(--color-text-dark)] hover:bg-rose-100 transition-colors"
                    aria-label="Close dialog"
                  >
                    &times;
                  </button>
                </div>

                <div className="mt-4 flex flex-col gap-4">
                  {/* High-res Image Slot */}
                  <div className="aspect-video w-full rounded-2xl bg-[var(--color-cream-canvas)] border-2 border-[var(--color-border-dark)] comic-shadow-sm flex flex-col items-center justify-center p-6 text-center">
                    <span className="text-xs font-black text-[var(--color-ember)] uppercase tracking-wider mb-1">
                      Photographic Master Asset
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-[var(--color-text-dark)]">
                      {activeModalItem.title}
                    </h3>
                    <span className="text-xs text-[var(--color-text-muted)] font-medium mt-1">
                      High-resolution festival photography slot ({activeModalItem.year} Edition)
                    </span>
                  </div>

                  <div>
                    <h4 className="text-lg font-black text-[var(--color-text-dark)]">
                      {activeModalItem.title}
                    </h4>
                    <p className="text-sm text-[var(--color-text-muted)] font-medium mt-1">
                      {activeModalItem.caption}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[var(--color-border-subtle)] flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveModalItem(null)}
                    className="px-5 py-2.5 rounded-xl bg-[var(--color-text-dark)] text-white text-xs font-black border border-[var(--color-border-dark)] comic-shadow-sm hover:bg-black transition-all cursor-pointer"
                  >
                    Close Viewer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
