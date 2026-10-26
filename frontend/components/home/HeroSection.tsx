import React from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ArtworkPlaceholder } from "@/components/ui/ArtworkPlaceholder";

export function HeroSection() {
  return (
    <section className="relative pt-6 sm:pt-12 pb-14 sm:pb-20 overflow-hidden">
      {/* Decorative background accents */}
      <div className="absolute top-10 right-1/4 w-96 h-96 rounded-full bg-[var(--tint-gold)] blur-3xl pointer-events-none -z-10 opacity-70" />
      <div className="absolute -top-10 left-10 w-72 h-72 rounded-full bg-[var(--tint-peach)] blur-3xl pointer-events-none -z-10 opacity-60" />

      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Headline, Comic Bursts & CTAs */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-left">
            {/* Top Comic Tag Row */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="primary" comicStamp className="py-1 px-3">
                ✦ ISSUE NO. 27
              </Badge>
              <Badge variant="gold" className="py-1 px-3">
                FEBRUARY 2027 · GUWAHATI
              </Badge>
              <Badge variant="cyan" className="py-1 px-2.5 hidden sm:inline-flex">
                ANNUAL FESTIVAL
              </Badge>
            </div>

            {/* Main Headline */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-[var(--color-text-dark)] leading-[1.06]">
                Step Into the Arena of{" "}
                <span className="relative inline-block text-[var(--color-ember)] underline decoration-[var(--color-yellow)] decoration-wavy decoration-from-font">
                  Yuvaan 2027
                </span>
              </h1>
              <p className="text-sm sm:text-base font-extrabold text-[var(--color-orange)] uppercase tracking-wider">
                IIIT Guwahati&apos;s Flagship Cultural &amp; Technical Phenomenon
              </p>
            </div>

            {/* Description */}
            <p className="text-base sm:text-lg text-[var(--color-text-muted)] font-medium leading-relaxed max-w-2xl">
              Three legendary days of high-stakes hackathons, amphitheatre music headliners,
              esports tournaments, and campus celebrations. Drawing inspiration from vibrant
              comic arts and creative engineering.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button href="/events" variant="primary" size="lg">
                Explore Events &amp; Arenas &rarr;
              </Button>
              <Button href="/schedule" variant="gold" size="lg">
                View Schedule
              </Button>
              <Button href="/merchandise" variant="outline" size="lg">
                Official Merch
              </Button>
            </div>

            {/* Expressive Comic Metric Stat Cards */}
            <div className="grid grid-cols-3 gap-3.5 pt-6 mt-2 max-w-xl">
              <div className="p-3.5 rounded-xl bg-white border-2 border-[var(--color-border-dark)] comic-shadow-sm flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="text-2xl sm:text-3xl font-black text-[var(--color-ember)]">
                    25+
                  </span>
                  <span className="text-xs">🏆</span>
                </div>
                <span className="text-[11px] font-black text-[var(--color-text-dark)] uppercase tracking-wider mt-1">
                  Events &amp; Arenas
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)] font-medium">
                  Tech, Culture &amp; Esports
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white border-2 border-[var(--color-border-dark)] comic-shadow-sm flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="text-2xl sm:text-3xl font-black text-[var(--color-orange)]">
                    3
                  </span>
                  <span className="text-xs">⚡</span>
                </div>
                <span className="text-[11px] font-black text-[var(--color-text-dark)] uppercase tracking-wider mt-1">
                  Festival Days
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)] font-medium">
                  Non-stop action
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white border-2 border-[var(--color-border-dark)] comic-shadow-sm flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="text-2xl sm:text-3xl font-black text-[var(--color-cyan)]">
                    4
                  </span>
                  <span className="text-xs">⚔️</span>
                </div>
                <span className="text-[11px] font-black text-[var(--color-text-dark)] uppercase tracking-wider mt-1">
                  Campus Factions
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)] font-medium">
                  Championship battle
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Artwork Slot Framed As Comic Cover */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md">
              {/* Comic sticker badge */}
              <div className="absolute -top-4 -right-3 z-20 rotate-[6deg]">
                <Badge variant="gold" comicStamp className="py-1 px-3 text-xs shadow-md">
                  ★ OFFICIAL COVER
                </Badge>
              </div>

              {/* Main Artwork Container */}
              <div className="p-2 rounded-2xl bg-white border-2 border-[var(--color-border-dark)] comic-shadow-lg rotate-[0.5deg]">
                <ArtworkPlaceholder
                  label="Official Festival Key Visual"
                  sublabel="Reserved for creative team's Comic Con cover artwork & hero graphic."
                  aspectRatio="portrait"
                  badge="Comic Cover Slot"
                  className="rounded-xl border border-[var(--color-border-subtle)]"
                />
                <div className="p-3 text-center border-t border-[var(--color-border-subtle)] bg-[var(--color-cream-canvas)] rounded-b-xl flex items-center justify-between text-xs font-bold text-[var(--color-text-muted)]">
                  <span>IIITG FESTIVAL PRESS</span>
                  <span className="text-[var(--color-ember)] font-black">VOL. 27 NO. 1</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
