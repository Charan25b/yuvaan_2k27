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
    badgeVariant: "blush" | "gold" | "cyan" | "violet";
    sigil: string;
    sigilTilt: string;
  }
> = {
  Ignis: {
    bgTint: "blush",
    accentStrip: "ember",
    badgeVariant: "blush",
    sigil: "IGN",
    sigilTilt: "tilt-box-1",
  },
  Terra: {
    bgTint: "gold",
    accentStrip: "gold",
    badgeVariant: "gold",
    sigil: "TER",
    sigilTilt: "tilt-box-2",
  },
  Ventus: {
    bgTint: "cyan",
    accentStrip: "cyan",
    badgeVariant: "cyan",
    sigil: "VEN",
    sigilTilt: "tilt-box-3",
  },
  Aqua: {
    bgTint: "violet",
    accentStrip: "violet",
    badgeVariant: "violet",
    sigil: "AQU",
    sigilTilt: "tilt-box-4",
  },
};

export function FactionsSection() {
  return (
    <section data-home-section="factions" className="py-14 sm:py-20 bg-[var(--color-surface)] border-y-2 border-[var(--color-border-dark)] relative overflow-hidden">
      {/* Halftone texture */}
      <div className="absolute inset-0 comic-dots-subtle pointer-events-none opacity-40" />

      <Container className="relative z-10">
        <div className="flex flex-col gap-10">
          <SectionHeading
            badge="Festival Lore & Rivalry"
            badgeVariant="section-light"
            title="Four Factions. One Festival Championship."
            description="Every festival competitor belongs to one of the four legendary campus divisions. Points earned in hackathons, esports brackets, and cultural battles fuel each faction's standings."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FACTIONS_DATA.map((f) => {
              const style = factionStyling[f.name] || {
                bgTint: "blush" as const,
                accentStrip: "ember" as const,
                badgeVariant: "blush" as const,
                sigil: "DIV",
                sigilTilt: "tilt-box-1",
              };

              return (
                <Card
                  key={f.name}
                  variant="comic"
                  bgTint={style.bgTint}
                  accentStrip={style.accentStrip}
                  className="flex flex-col justify-between"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        {/* White small box: Sigil box with default tilt & hover animation */}
                        <span className={`comic-small-box ${style.sigilTilt} text-xs font-black px-2.5 py-1 rounded-md bg-white border-2 border-[#121110] shadow-[2.5px_2.5px_0px_#121110] select-none text-[#121110]`}>
                          {style.sigil}
                        </span>
                        <span className="text-xs font-black uppercase tracking-wider text-[var(--color-text-dark)]">
                          {f.element}
                        </span>
                      </div>
                      {/* Tagline: static without hover animation */}
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
                    <div className="rounded-xl bg-white/95 p-3 text-xs font-bold text-[var(--color-text-dark)] border-2 border-[var(--color-border-dark)] comic-shadow-sm space-y-1">
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