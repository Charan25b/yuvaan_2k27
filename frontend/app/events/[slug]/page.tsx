import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { ArtworkPlaceholder } from "@/components/ui/ArtworkPlaceholder";
import { EVENTS_DATA } from "@/lib/data/festivalData";

export async function generateStaticParams() {
  return EVENTS_DATA.map((event) => ({
    slug: event.slug,
  }));
}

interface EventDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params;
  const event = EVENTS_DATA.find((e) => e.slug === slug);

  if (!event) {
    notFound();
  }

  return (
    <div className="py-8 sm:py-14">
      <Container>
        <div className="flex flex-col gap-8 max-w-5xl mx-auto">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs font-bold text-[var(--color-text-muted)]">
            <Link href="/" className="hover:text-[var(--color-ember)] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/events" className="hover:text-[var(--color-ember)] transition-colors">
              Events
            </Link>
            <span>/</span>
            <span className="text-[var(--color-text-dark)] font-black truncate max-w-xs sm:max-w-md">
              {event.title}
            </span>
          </nav>

          {/* Banner Artwork Slot with Comic Styling */}
          <div className="p-2 rounded-2xl bg-white border-2 border-[var(--color-border-dark)] comic-shadow">
            <ArtworkPlaceholder
              label={`${event.title} Official Arena Poster`}
              sublabel="Graphic asset slot reserved for creative team's illustrated comic poster."
              aspectRatio="banner"
              badge="Event Cover Slot"
              className="rounded-xl border border-[var(--color-border-subtle)]"
            />
          </div>

          {/* Main Content & Registration Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Details & Rules */}
            <div className="lg:col-span-8 flex flex-col gap-8">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge variant="primary" comicStamp>
                    {event.category}
                  </Badge>
                  <Badge variant="gold">
                    {event.day}
                  </Badge>
                  <Badge variant="cyan">
                    {event.registrationStatus}
                  </Badge>
                </div>
                <h1 className="text-3xl sm:text-5xl font-black text-[var(--color-text-dark)] tracking-tight leading-tight">
                  {event.title}
                </h1>
                <p className="mt-4 text-base sm:text-lg text-[var(--color-text-muted)] font-medium leading-relaxed">
                  {event.description}
                </p>
              </div>

              {/* Event Logistics Quick Facts Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-[var(--tint-blush)] border-2 border-[var(--color-border-dark)] comic-shadow-sm flex flex-col">
                  <span className="text-[10px] font-black text-[var(--color-ember)] uppercase tracking-wider">
                    Timing
                  </span>
                  <span className="text-xs sm:text-sm font-black text-[var(--color-text-dark)] mt-1">
                    {event.time}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--tint-cyan)] border-2 border-[var(--color-border-dark)] comic-shadow-sm flex flex-col">
                  <span className="text-[10px] font-black text-[var(--color-cyan)] uppercase tracking-wider">
                    Venue
                  </span>
                  <span className="text-xs sm:text-sm font-black text-[var(--color-text-dark)] mt-1">
                    {event.venue}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--tint-gold)] border-2 border-[var(--color-border-dark)] comic-shadow-sm flex flex-col">
                  <span className="text-[10px] font-black text-[var(--color-gold)] uppercase tracking-wider">
                    Team Size
                  </span>
                  <span className="text-xs sm:text-sm font-black text-[var(--color-text-dark)] mt-1">
                    {event.teamSize}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--tint-mint)] border-2 border-[var(--color-border-dark)] comic-shadow-sm flex flex-col">
                  <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider">
                    Fee
                  </span>
                  <span className="text-xs sm:text-sm font-black text-emerald-950 mt-1">
                    Free Entry
                  </span>
                </div>
              </div>

              {/* Tournament Rules / Codex Card */}
              <Card variant="comic" bgTint="peach" accentStrip="orange">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">📜</span>
                    <CardTitle className="text-xl">Rules &amp; Arena Guidelines</CardTitle>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] font-medium">
                    Please review official participation rules. Violations result in faction point deductions.
                  </p>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-3">
                    {event.rules.map((rule, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-[var(--color-text-dark)] font-medium">
                        <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded-lg bg-white border border-[var(--color-border-dark)] font-black text-[var(--color-ember)] text-xs comic-shadow-sm">
                          {idx + 1}
                        </span>
                        <span className="pt-0.5 leading-relaxed">{rule}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Prizes & Registration Card */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* Prize Pool Card */}
              <div className="p-6 rounded-2xl bg-[var(--tint-gold)] border-2 border-[var(--color-border-dark)] comic-shadow flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <Badge variant="gold" comicStamp className="text-xs">
                    ★ PRIZE PURSE
                  </Badge>
                  <span className="text-xl">🏆</span>
                </div>
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-amber-950 block">
                    Trophies &amp; Cash Pool
                  </span>
                  <span className="text-xs font-bold text-amber-900 mt-1 block">
                    Cash prizes, merit certificates &amp; faction championship score
                  </span>
                </div>
              </div>

              {/* Registration Desk Box */}
              <Card variant="comic" bgTint="white" className="p-2">
                <CardHeader>
                  <Badge variant="cyan" className="mb-2 self-start text-[10px]">
                    ON-CAMPUS REGISTRATION
                  </Badge>
                  <CardTitle className="text-lg">Ready to Compete?</CardTitle>
                  <p className="text-xs text-[var(--color-text-muted)] font-medium mt-1 leading-relaxed">
                    Event registration is managed directly by the student organizing committee.
                    Bring your college student identification card to the reporting desk.
                  </p>
                </CardHeader>
                <CardContent className="pt-2 flex flex-col gap-3">
                  <div className="p-3 rounded-xl bg-[var(--color-cream-canvas)] border border-[var(--color-border-dark)] text-xs text-[var(--color-text-muted)] space-y-1">
                    <p className="flex justify-between">
                      <span className="font-bold text-[var(--color-text-dark)]">Desk Opens:</span>
                      <span className="font-extrabold text-[var(--color-ember)]">45 min before event</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-bold text-[var(--color-text-dark)]">Desk Venue:</span>
                      <span className="font-semibold text-[var(--color-text-dark)]">{event.venue} Entry Desk</span>
                    </p>
                  </div>

                  <Button href="/contact" variant="primary" size="md" className="w-full justify-center text-xs font-black">
                    Contact Event Coordinator &rarr;
                  </Button>
                  <Button href="/events" variant="outline" size="sm" className="w-full justify-center text-xs">
                    &larr; Back to All Events
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
