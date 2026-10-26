"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EVENTS_DATA } from "@/lib/data/festivalData";

const categories = [
  "All",
  "Cultural",
  "Technical",
  "Gaming & Esports",
  "Literary & Arts",
  "Workshops",
] as const;

const categoryStyles: Record<
  string,
  {
    bgTint: "peach" | "blush" | "cyan" | "gold" | "violet" | "mint";
    accentStrip: "ember" | "orange" | "yellow" | "cyan" | "violet" | "gold";
    badgeVariant: "primary" | "cyan" | "violet" | "gold" | "emerald";
    activeClass: string;
  }
> = {
  All: {
    bgTint: "peach",
    accentStrip: "ember",
    badgeVariant: "primary",
    activeClass: "bg-[var(--color-ember)] text-white border-2 border-[var(--color-border-dark)] comic-shadow-sm",
  },
  Cultural: {
    bgTint: "blush",
    accentStrip: "ember",
    badgeVariant: "primary",
    activeClass: "bg-[var(--color-ember)] text-white border-2 border-[var(--color-border-dark)] comic-shadow-sm",
  },
  Technical: {
    bgTint: "cyan",
    accentStrip: "cyan",
    badgeVariant: "cyan",
    activeClass: "bg-[var(--color-cyan)] text-white border-2 border-[var(--color-border-dark)] comic-shadow-sm",
  },
  "Gaming & Esports": {
    bgTint: "violet",
    accentStrip: "violet",
    badgeVariant: "violet",
    activeClass: "bg-[var(--color-violet)] text-white border-2 border-[var(--color-border-dark)] comic-shadow-sm",
  },
  "Literary & Arts": {
    bgTint: "gold",
    accentStrip: "gold",
    badgeVariant: "gold",
    activeClass: "bg-[var(--color-gold)] text-white border-2 border-[var(--color-border-dark)] comic-shadow-sm",
  },
  Workshops: {
    bgTint: "mint",
    accentStrip: "yellow",
    badgeVariant: "emerald",
    activeClass: "bg-emerald-600 text-white border-2 border-[var(--color-border-dark)] comic-shadow-sm",
  },
};

export default function EventsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEvents = useMemo(() => {
    return EVENTS_DATA.filter((ev) => {
      const matchesCategory =
        selectedCategory === "All" || ev.category === selectedCategory;
      const matchesSearch =
        searchQuery === "" ||
        ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.venue.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="py-10 sm:py-16">
      <Container>
        <div className="flex flex-col gap-10">
          {/* Header */}
          <div className="border-b-2 border-[var(--color-border-dark)] pb-8">
            <SectionHeading
              badge="Festival Competitions"
              badgeVariant="primary"
              title="Events, Tracks &amp; Arenas"
              description="Browse the complete lineup of cultural stages, coding hackathons, gaming tournaments, and workshops at Yuvaan 2027. Select any event for rulebooks, schedules, and team guidelines."
            />

            {/* Filter & Search Bar */}
            <div className="mt-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              {/* Category Pills with Comic Con Identity */}
              <div className="flex flex-wrap items-center gap-2">
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  const style = categoryStyles[cat] || categoryStyles["All"];
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer select-none ${
                        isSelected
                          ? style.activeClass
                          : "bg-white text-[var(--color-text-dark)] border-2 border-[var(--color-border-dark)] hover:bg-[var(--color-cream)] comic-shadow-sm"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {/* Search Box */}
              <div className="w-full md:w-80 relative">
                <input
                  type="text"
                  placeholder="Search events, venues, tracks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-xs font-bold rounded-xl bg-white border-2 border-[var(--color-border-dark)] comic-shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ember)] placeholder:text-[var(--color-text-muted)]"
                />
                <span className="absolute left-3 top-2.5 text-xs text-[var(--color-text-muted)]">
                  🔍
                </span>
              </div>
            </div>

            {/* Count indicator */}
            <div className="mt-4 flex items-center justify-between text-xs font-bold text-[var(--color-text-muted)]">
              <span className="flex items-center gap-2">
                <Badge variant="cream" className="text-[10px]">
                  {filteredEvents.length} {filteredEvents.length === 1 ? "Event" : "Events"} Discovered
                </Badge>
                {selectedCategory !== "All" && (
                  <span>Filtering by: <strong className="text-[var(--color-text-dark)]">{selectedCategory}</strong></span>
                )}
              </span>
            </div>
          </div>

          {/* Event Cards Grid */}
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((ev) => {
                const style = categoryStyles[ev.category] || categoryStyles["All"];

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
                      <div className="rounded-xl bg-white/95 p-3.5 border border-[var(--color-border-dark)] text-xs text-[var(--color-text-muted)] space-y-1.5 comic-shadow-sm">
                        <p className="flex items-center justify-between">
                          <span className="font-bold text-[var(--color-text-dark)]">Stage / Venue:</span>
                          <span className="font-extrabold text-[var(--color-ember)]">{ev.venue}</span>
                        </p>
                        <p className="flex items-center justify-between">
                          <span className="font-bold text-[var(--color-text-dark)]">Team Format:</span>
                          <span className="font-semibold text-[var(--color-text-dark)]">{ev.teamSize}</span>
                        </p>
                        <p className="flex items-center justify-between">
                          <span className="font-bold text-[var(--color-text-dark)]">Entry Status:</span>
                          <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wide">
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
                          View Rulebook &amp; Arena Details &rarr;
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl bg-white border-2 border-[var(--color-border-dark)] comic-shadow">
              <span className="text-3xl">🔍</span>
              <h3 className="text-lg font-black text-[var(--color-text-dark)] mt-2">
                No matching events found
              </h3>
              <p className="text-xs text-[var(--color-text-muted)] font-medium mt-1">
                Try searching for another event title, venue, or switch category filters.
              </p>
              <div className="pt-4">
                <Button
                  onClick={() => {
                    setSelectedCategory("All");
                    setSearchQuery("");
                  }}
                  variant="primary"
                  size="sm"
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
