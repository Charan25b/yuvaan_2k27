"use client";

import React, { useState } from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { SCHEDULE_DATA } from "@/lib/data/festivalData";

const dayTheme: Record<
  1 | 2 | 3,
  {
    name: string;
    date: string;
    summary: string;
    activeBtn: string;
    badgeVariant: "primary" | "gold" | "cyan";
    accentBorder: string;
    bgTint: string;
  }
> = {
  1: {
    name: "Day 1 (Friday)",
    date: "February 19, 2027",
    summary: "Grand Inauguration Ceremony, 24-Hour HackQuest Kickoff, Parliamentary Debate Prelims, and Open-Air Acoustic Cyphers.",
    activeBtn: "bg-[var(--color-ember)] text-white border-2 border-[var(--color-border-dark)] comic-shadow",
    badgeVariant: "primary",
    accentBorder: "border-l-4 border-l-[var(--color-ember)]",
    bgTint: "bg-[var(--tint-blush)]",
  },
  2: {
    name: "Day 2 (Saturday)",
    date: "February 20, 2027",
    summary: "HackQuest Project Showcase & Pitching, Apex LAN Esports Finals, Cosplay Spectacle, and Battle of the Bands.",
    activeBtn: "bg-[var(--color-gold)] text-white border-2 border-[var(--color-border-dark)] comic-shadow",
    badgeVariant: "gold",
    accentBorder: "border-l-4 border-l-[var(--color-gold)]",
    bgTint: "bg-[var(--tint-gold)]",
  },
  3: {
    name: "Day 3 (Sunday)",
    date: "February 21, 2027",
    summary: "RoboCombat Arena Showdown, Generative Media Masterclass, Valedictory & Faction Trophy Ceremony, and Grand Star Night.",
    activeBtn: "bg-[var(--color-cyan)] text-white border-2 border-[var(--color-border-dark)] comic-shadow",
    badgeVariant: "cyan",
    accentBorder: "border-l-4 border-l-[var(--color-cyan)]",
    bgTint: "bg-[var(--tint-cyan)]",
  },
};

const categoryBadgeStyles: Record<
  string,
  "primary" | "cyan" | "violet" | "gold" | "emerald" | "cream"
> = {
  Ceremony: "primary",
  Technical: "cyan",
  "Gaming & Esports": "violet",
  Cultural: "primary",
  "Literary & Arts": "gold",
  "Pro-Nite": "gold",
  Workshops: "emerald",
};

export default function SchedulePage() {
  const [activeDay, setActiveDay] = useState<1 | 2 | 3>(1);

  const dayEvents = SCHEDULE_DATA.filter((item) => item.day === activeDay);
  const currentTheme = dayTheme[activeDay];

  return (
    <div className="py-10 sm:py-16">
      <Container>
        <div className="flex flex-col gap-10 max-w-4xl mx-auto">
          {/* Header */}
          <div className="border-b-2 border-[var(--color-border-dark)] pb-8 text-center sm:text-left">
            <SectionHeading
              badge="Festival Timetable"
              badgeVariant="primary"
              title="Official Festival Schedule"
              description="Chronological event itineraries across all campus arenas, indoor halls, and open amphitheatre stages. Designed for smooth mobile viewing without table horizontal scroll."
            />

            {/* Day Selector Tabs with vibrant comic buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              {([1, 2, 3] as const).map((day) => {
                const isActive = activeDay === day;
                const theme = dayTheme[day];
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setActiveDay(day)}
                    className={`px-6 py-3 rounded-xl text-sm font-black transition-all cursor-pointer select-none flex items-center gap-2 ${
                      isActive
                        ? theme.activeBtn
                        : "bg-white text-[var(--color-text-dark)] border-2 border-[var(--color-border-dark)] hover:bg-[var(--color-cream)] comic-shadow-sm"
                    }`}
                  >
                    <span>Day {day}</span>
                    <span className="text-xs opacity-80 hidden sm:inline">&bull; {theme.date.split(",")[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Day Banner */}
            <div className={`mt-5 p-4 rounded-xl border-2 border-[var(--color-border-dark)] comic-shadow-sm ${currentTheme.bgTint} text-xs font-bold text-[var(--color-text-dark)] space-y-1`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-black">{currentTheme.name}</span>
                <Badge variant={currentTheme.badgeVariant} className="text-[10px]">
                  {currentTheme.date}
                </Badge>
              </div>
              <p className="text-xs font-medium text-[var(--color-text-dark)] opacity-90">
                {currentTheme.summary}
              </p>
            </div>
          </div>

          {/* Timeline List (Mobile-friendly vertical cards with comic accents) */}
          <div className="flex flex-col gap-4">
            {dayEvents.map((item, idx) => (
              <div
                key={item.id}
                className={`relative flex flex-col sm:flex-row sm:items-start gap-4 p-5 rounded-2xl bg-white border-2 border-[var(--color-border-dark)] comic-shadow transition-all hover:bg-[var(--color-cream-canvas)] ${currentTheme.accentBorder}`}
              >
                {/* Time Indicator & Category Badge */}
                <div className="sm:w-48 shrink-0 flex sm:flex-col items-center sm:items-start justify-between gap-1.5 border-b sm:border-b-0 sm:border-r-2 border-[var(--color-border-subtle)] pb-2 sm:pb-0 sm:pr-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-cream)] border border-[var(--color-border-dark)] font-black text-[10px] text-[var(--color-text-dark)]">
                      {idx + 1}
                    </span>
                    <span className="text-xs sm:text-sm font-black text-[var(--color-text-dark)] tracking-tight">
                      {item.time}
                    </span>
                  </div>
                  <Badge
                    variant={categoryBadgeStyles[item.category] || "cream"}
                    className="text-[10px]"
                  >
                    {item.category}
                  </Badge>
                </div>

                {/* Event Details */}
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-lg font-black text-[var(--color-text-dark)] leading-snug">
                      {item.title}
                    </h3>
                    <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-[var(--color-cream-canvas)] text-[var(--color-text-dark)] border border-[var(--color-border-dark)] comic-shadow-sm">
                      📍 {item.venue}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--color-text-muted)] font-medium leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Schedule Footer Note */}
          <div className="p-4 rounded-xl bg-[var(--tint-gold)] border-2 border-[var(--color-border-dark)] text-xs text-[var(--color-text-dark)] text-center font-bold comic-shadow-sm">
            ⚡ Stage Advisory: Venue allocations and timings are subject to slight technical stage adjustments.
            Live schedule updates are broadcast across all campus information screens and student reporting desks.
          </div>
        </div>
      </Container>
    </div>
  );
}
