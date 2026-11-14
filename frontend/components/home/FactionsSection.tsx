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

const factionsTopDividerPath =
  "M 1000 46 L 960 52 L 910 43 L 870 50 L 820 41 L 770 53 L 710 44 L 660 49 L 600 40 L 550 52 L 490 45 L 440 54 L 380 42 L 330 49 L 270 43 L 220 53 L 160 46 L 110 51 L 50 42 L 0 48";

const factionsBottomDividerPath =
  "M 0 14 L 30 6 L 55 18 L 80 3 L 110 12 L 140 19 L 170 5 L 200 10 L 230 2 L 260 16 L 290 7 L 320 20 L 350 11 L 380 4 L 410 15 L 440 6 L 470 18 L 500 9 L 530 1 L 560 13 L 590 20 L 620 7 L 650 16 L 680 3 L 710 11 L 740 19 L 770 5 L 800 14 L 830 2 L 860 10 L 890 18 L 920 6 L 950 15 L 980 4 L 1000 12";

export function FactionsSection() {
  return (
    <section data-home-section="factions" className="py-16 sm:py-24 bg-[var(--color-surface)] relative overflow-hidden">
      {/* Halftone texture */}
      <div className="absolute inset-0 comic-dots-subtle pointer-events-none opacity-40" />

      <svg
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 z-[6] h-14 w-full"
        viewBox="0 0 1000 56"
        preserveAspectRatio="none"
      >
        <path
          d={factionsTopDividerPath}
          fill="none"
          stroke="#111110"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
        />
      </svg>

      <Container className="relative z-10">
        <div className="flex flex-col gap-10">
          <SectionHeading
            title="Four Factions. One Festival Championship."
            description="Every festival competitor belongs to one of the four legendary campus divisions. Points earned in hackathons, esports brackets, and cultural battles fuel each faction's standings."
            className="home-section-heading"
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

      <svg
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 z-[6] h-5 w-full overflow-visible"
        viewBox="0 0 1000 20"
        preserveAspectRatio="none"
      >
        <path
          d={factionsBottomDividerPath}
          fill="none"
          stroke="#111110"
          strokeWidth="4"
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
        />
      </svg>
    </section>
  );
}
