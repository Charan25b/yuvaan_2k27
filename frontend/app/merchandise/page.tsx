import React from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MERCHANDISE_DATA } from "@/lib/data/festivalData";

export function generateMetadata() {
  return {
    title: "Official Merchandise | Yuvaan 2027",
    description: "Browse the official Yuvaan 2027 festival merchandise collection at IIIT Guwahati.",
  };
}

export default function MerchandisePage() {
  return (
    <div className="py-10 sm:py-16">
      <Container>
        <div className="flex flex-col gap-10">
          {/* Header */}
          <div className="border-b-2 border-[var(--color-border-dark)] pb-8">
            <SectionHeading
              badge="Official Festival Collection"
              badgeVariant="primary"
              title="Yuvaan 2027 Official Merchandise"
              description="Commemorative festival apparel, collectible enamel faction pins, and campus accessories. Designed with vintage comic line-art and premium durable fabrics."
            />

            {/* Catalogue Policy Banner with Comic Styling */}
            <div className="mt-6 p-4 rounded-xl bg-[var(--tint-gold)] border-2 border-[var(--color-border-dark)] comic-shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-base">📢</span>
                <span className="font-black text-amber-950 uppercase tracking-wide">
                  Exhibition Catalogue Only:
                </span>
                <span className="text-amber-900 font-medium">
                  Physical purchases and pre-order pickups are handled directly at the SAC Arena Merchandise Desk during festival days.
                </span>
              </div>
              <Badge variant="gold" comicStamp className="shrink-0 text-[10px]">
                ON-CAMPUS PICKUP ONLY
              </Badge>
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {MERCHANDISE_DATA.map((item, idx) => {
              const tints = ["peach", "cyan", "gold", "blush", "mint", "violet"] as const;
              const strips = ["ember", "cyan", "gold", "orange", "yellow", "violet"] as const;
              const tint = tints[idx % tints.length];
              const strip = strips[idx % strips.length];

              const availabilityBadge =
                item.availability.includes("Limited")
                  ? "gold"
                  : item.availability.includes("Pre-Order")
                  ? "cyan"
                  : "emerald";

              return (
                <Card
                  key={item.id}
                  variant="comic"
                  bgTint={tint}
                  accentStrip={strip}
                  className="flex flex-col justify-between comic-shadow-hover transition-all"
                >
                  <div>
                    {/* Product Mockup Slot */}
                    <div className="relative aspect-square w-full bg-white border-b-2 border-[var(--color-border-dark)] flex flex-col items-center justify-center p-6 text-center overflow-hidden">
                      {/* Subtle comic dot accent */}
                      <div className="absolute inset-0 comic-dots-subtle opacity-40 pointer-events-none" />

                      <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-ember)] mb-1">
                        {item.category}
                      </span>
                      <span className="text-lg font-black text-[var(--color-text-dark)] max-w-xs relative z-10">
                        {item.name}
                      </span>
                      <span className="text-[11px] text-[var(--color-text-muted)] mt-1 font-bold">
                        Official Collectible Mockup Slot
                      </span>

                      {item.featuredBadge && (
                        <div className="absolute top-3 right-3 rotate-[3deg]">
                          <Badge variant="gold" comicStamp className="text-[10px]">
                            {item.featuredBadge}
                          </Badge>
                        </div>
                      )}
                    </div>

                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        {/* Price Burst Tag */}
                        <div className="px-3 py-1 rounded-xl bg-white border-2 border-[var(--color-border-dark)] comic-shadow-sm flex items-center gap-1">
                          <span className="text-xs font-bold text-[var(--color-text-muted)]">MRP:</span>
                          <span className="text-lg font-black text-[var(--color-ember)]">
                            {item.price}
                          </span>
                        </div>
                        <Badge variant={availabilityBadge} className="text-[10px]">
                          {item.availability}
                        </Badge>
                      </div>

                      <CardTitle className="text-xl font-black">{item.name}</CardTitle>
                      <CardDescription className="text-xs sm:text-sm mt-1 text-[var(--color-text-dark)] font-medium">
                        {item.description}
                      </CardDescription>
                    </CardHeader>
                  </div>

                  <CardContent className="pt-2 mt-auto">
                    <div className="rounded-xl bg-white/95 p-3 border border-[var(--color-border-dark)] text-xs text-[var(--color-text-muted)] flex items-center justify-between font-bold comic-shadow-sm">
                      <span>In-Person Claim:</span>
                      <span className="font-extrabold text-[var(--color-text-dark)]">SAC Merchandise Desk</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </Container>
    </div>
  );
}
