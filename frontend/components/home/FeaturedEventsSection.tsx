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
    badgeVariant: "primary" | "cyan" | "violet" | "gold" | "emerald";
  }
> = {
  Cultural: {
    bgTint: "blush",
    accentStrip: "ember",
    badgeVariant: "primary",
  },
  Technical: {
    bgTint: "cyan",
    accentStrip: "cyan",
    badgeVariant: "cyan",
  },
  "Gaming & Esports": {
    bgTint: "violet",
    accentStrip: "violet",
    badgeVariant: "violet",
  },
  "Literary & Arts": {
    bgTint: "gold",
    accentStrip: "gold",
    badgeVariant: "gold",
  },
  Workshops: {
    bgTint: "mint",
    accentStrip: "yellow",
    badgeVariant: "emerald",
  },
};

export function FeaturedEventsSection() {
  const featured = EVENTS_DATA.slice(0, 3);

  return (
    <section className="py-14 sm:py-20 relative overflow-hidden">
      <Container>
        <div className="flex flex-col gap-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b-2 border-[var(--color-border-dark)] pb-6">
            <SectionHeading
              badge="Marquee Competitions"
              badgeVariant="primary"
              title="Featured Festival Events"
              description="Explore highlighted tracks across music, code, and esports. Detailed rulebooks, eligibility criteria, and schedules are provided on each event page."
            />
            <Button href="/events" variant="primary" size="md" className="shrink-0">
              View All {EVENTS_DATA.length}+ Events &rarr;
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featured.map((ev) => {
              const style = categoryStyles[ev.category] || {
                bgTint: "peach",
                accentStrip: "orange",
                badgeVariant: "primary",
              };

              return (
                <Card
                  key={ev.id}
                  variant="comic"
                  bgTint={style.bgTint}
                  accentStrip={style.accentStrip}
                  className="flex flex-col justify-between comic-shadow-hover transition-all"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <Badge variant={style.badgeVariant} className="text-xs">
                        {ev.category}
                      </Badge>
                      <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-white border border-[var(--color-border-dark)] text-[var(--color-ember)] comic-shadow-sm">
                        {ev.day}
                      </span>
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
                    <div className="rounded-xl bg-white/90 p-3.5 border border-[var(--color-border-dark)] text-xs text-[var(--color-text-muted)] space-y-1.5 comic-shadow-sm">
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
                        variant="secondary"
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
