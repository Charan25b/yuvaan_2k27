import React from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FACTIONS_DATA } from "@/lib/data/festivalData";

const factionStyling: Record<
  string,
  {
    bgTint: "blush" | "gold" | "cyan" | "violet";
    accentStrip: "ember" | "gold" | "cyan" | "violet";
    badgeVariant: "primary" | "gold" | "cyan" | "violet";
    glyph: string;
    pillBg: string;
    borderTopColor: string;
  }
> = {
  Ignis: {
    bgTint: "blush",
    accentStrip: "ember",
    badgeVariant: "primary",
    glyph: "🔥",
    pillBg: "bg-red-100 text-red-900 border-red-300",
    borderTopColor: "var(--color-ember)",
  },
  Terra: {
    bgTint: "gold",
    accentStrip: "gold",
    badgeVariant: "gold",
    glyph: "🛡️",
    pillBg: "bg-amber-100 text-amber-900 border-amber-300",
    borderTopColor: "var(--color-gold)",
  },
  Ventus: {
    bgTint: "cyan",
    accentStrip: "cyan",
    badgeVariant: "cyan",
    glyph: "⚡",
    pillBg: "bg-sky-100 text-sky-900 border-sky-300",
    borderTopColor: "var(--color-cyan)",
  },
  Aqua: {
    bgTint: "violet",
    accentStrip: "violet",
    badgeVariant: "violet",
    glyph: "🌊",
    pillBg: "bg-indigo-100 text-indigo-900 border-indigo-300",
    borderTopColor: "var(--color-violet)",
  },
};

export function FactionsSection() {
  return (
    <section className="py-14 sm:py-20 bg-[var(--color-surface)] border-y-2 border-[var(--color-border-dark)] relative overflow-hidden">
      {/* Halftone texture */}
      <div className="absolute inset-0 comic-dots-subtle pointer-events-none opacity-40" />

      <Container className="relative z-10">
        <div className="flex flex-col gap-10">
          <SectionHeading
            badge="Festival Lore & Rivalry"
            badgeVariant="primary"
            title="Four Factions. One Festival Championship."
            description="Every festival competitor belongs to one of the four legendary campus divisions. Points earned in hackathons, esports brackets, and cultural battles fuel each faction's standings."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FACTIONS_DATA.map((f) => {
              const style = factionStyling[f.name] || {
                bgTint: "blush",
                accentStrip: "ember",
                badgeVariant: "primary",
                glyph: "✦",
                pillBg: "bg-white",
                borderTopColor: f.accentBorder,
              };

              return (
                <Card
                  key={f.name}
                  variant="comic"
                  bgTint={style.bgTint}
                  accentStrip={style.accentStrip}
                  className="flex flex-col justify-between comic-shadow-hover transition-all"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg">{style.glyph}</span>
                        <span className="text-xs font-black uppercase tracking-wider text-[var(--color-text-dark)]">
                          {f.element}
                        </span>
                      </div>
                      <Badge variant={style.badgeVariant} className="text-[10px]">
                        DIVISION
                      </Badge>
                    </div>

                    <CardTitle className="text-2xl font-black">{f.name}</CardTitle>
                    <p className="text-xs font-extrabold text-[var(--color-text-dark)] mt-1 opacity-90">
                      &ldquo;{f.tagline}&rdquo;
                    </p>
                    <CardDescription className="text-xs sm:text-sm mt-3 text-[var(--color-text-dark)] font-medium leading-relaxed">
                      {f.lore}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-2 mt-auto">
                    <div className="rounded-xl bg-white/90 p-3 text-xs font-bold text-[var(--color-text-dark)] border border-[var(--color-border-dark)] comic-shadow-sm space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)] block">
                        Competitive Focus
                      </span>
                      <p className="text-xs font-black text-[var(--color-text-dark)]">
                        {f.pointsHighlight}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
