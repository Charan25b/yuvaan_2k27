import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EVENTS_DATA } from "@/lib/data/festivalData";

const categoryStyles: Record<
  string,
  {
    bgTint: "peach" | "blush" | "cyan" | "gold" | "violet" | "mint";
    accentStrip: "ember" | "orange" | "yellow" | "cyan" | "violet" | "gold";
    badgeVariant: "blush" | "cyan" | "violet" | "gold" | "emerald";
    dayTilt: string;
  }
> = {
  Cultural: {
    bgTint: "blush",
    accentStrip: "ember",
    badgeVariant: "blush",
    dayTilt: "tilt-box-1",
  },
  Technical: {
    bgTint: "cyan",
    accentStrip: "cyan",
    badgeVariant: "cyan",
    dayTilt: "tilt-box-2",
  },
  "Gaming & Esports": {
    bgTint: "violet",
    accentStrip: "violet",
    badgeVariant: "violet",
    dayTilt: "tilt-box-3",
  },
  "Literary & Arts": {
    bgTint: "gold",
    accentStrip: "gold",
    badgeVariant: "gold",
    dayTilt: "tilt-box-4",
  },
  Workshops: {
    bgTint: "mint",
    accentStrip: "yellow",
    badgeVariant: "emerald",
    dayTilt: "tilt-box-1",
  },
};

export function FeaturedEventsSection() {
  const featured = EVENTS_DATA.slice(0, 3);

  return (
    <section data-home-section="events" className="py-14 sm:py-20 relative overflow-hidden">
      <Container>
        <div className="flex flex-col gap-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b-2 border-[var(--color-border-dark)] pb-6">
            <SectionHeading
              badge="Marquee Competitions"
              badgeVariant="section-ember"
              title="Featured Festival Events"
              description="Explore highlighted tracks across music, code, and esports. Detailed rulebooks, eligibility criteria, and schedules are provided on each event page."
            />
            <Button href="/events" variant="gold" size="md" className="shrink-0">
              View All {EVENTS_DATA.length}+ Events &rarr;
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featured.map((ev) => {
              const style = categoryStyles[ev.category] || {
                bgTint: "peach" as const,
                accentStrip: "orange" as const,
                badgeVariant: "blush" as const,
                dayTilt: "tilt-box-1",
              };

              return (
                <Card
                  key={ev.id}
                  variant="comic"
                  bgTint={style.bgTint}
                  accentStrip={style.accentStrip}
                  className="flex flex-col justify-between"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      {/* Tagline: static without hover animation */}
                      <Badge variant={style.badgeVariant} className="text-xs">
                        {ev.category}
                      </Badge>
                      {/* White small box: Day pill with default tilt & hover animation */}
                      <div className={`comic-small-box ${style.dayTilt} text-xs font-black px-2.5 py-0.5 rounded-full bg-white border-2 border-[#121110] text-[var(--color-ember)] shadow-[2.5px_2.5px_0px_#121110] select-none`}>
                        {ev.day}
                      </div>
                    </div>
                    <CardTitle className="text-2xl leading-tight">
                      <Link
                        href={`/events/${ev.slug}`}
                        className="hover:text-[var(--color-ember)] transition-colors"
                      >
                        {ev.title}
                      </Link>
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm mt-2 line-clamp-3 text-[var(--color-text-dark)] font-medium">
                      {ev.shortDescription}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-2 mt-auto">
                    <div className="rounded-xl bg-white/95 p-3.5 border-2 border-[var(--color-border-dark)] text-xs text-[var(--color-text-muted)] space-y-1.5 comic-shadow-sm">
                      <p className="flex items-center justify-between">
                        <span className="font-bold text-[var(--color-text-dark)]">Venue:</span>
                        <span className="font-extrabold text-[var(--color-ember)]">{ev.venue}</span>
                      </p>
                      <p className="flex items-center justify-between">
                        <span className="font-bold text-[var(--color-text-dark)]">Team Size:</span>
                        <span className="font-semibold text-[var(--color-text-dark)]">{ev.teamSize}</span>
                      </p>
                      <p className="flex items-center justify-between">
                        <span className="font-bold text-[var(--color-text-dark)]">Status:</span>
                        <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wide">
                          {ev.registrationStatus}
                        </span>
                      </p>
                    </div>

                    <div className="pt-4">
                      <Button
                        href={`/events/${ev.slug}`}
                        variant="primary"
                        size="sm"
                        className="w-full justify-center text-xs font-black"
                      >
                        Read Event Rulebook &rarr;
                      </Button>
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