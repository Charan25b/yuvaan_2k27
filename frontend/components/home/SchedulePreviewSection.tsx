import React from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SCHEDULE_DATA } from "@/lib/data/festivalData";

export function SchedulePreviewSection() {
  const day1Highlight = SCHEDULE_DATA.find((s) => s.day === 1 && s.category === "Cultural") || SCHEDULE_DATA[0];
  const day2Highlight = SCHEDULE_DATA.find((s) => s.day === 2 && s.category === "Cultural") || SCHEDULE_DATA[5];
  const day3Highlight = SCHEDULE_DATA.find((s) => s.day === 3 && s.category === "Pro-Nite") || SCHEDULE_DATA[10];

  const days = [
    {
      dayNumber: "Day 1",
      subtitle: "Inauguration & Cyphers",
      item: day1Highlight,
      bgTint: "blush" as const,
      accentStrip: "ember" as const,
      badgeVariant: "primary" as const,
    },
    {
      dayNumber: "Day 2",
      subtitle: "Hackathons & Battle of Bands",
      item: day2Highlight,
      bgTint: "gold" as const,
      accentStrip: "gold" as const,
      badgeVariant: "gold" as const,
    },
    {
      dayNumber: "Day 3",
      subtitle: "RoboCombat & Star Night",
      item: day3Highlight,
      bgTint: "cyan" as const,
      accentStrip: "cyan" as const,
      badgeVariant: "cyan" as const,
    },
  ];

  return (
    <section data-home-section="schedule" className="py-14 sm:py-20 bg-[var(--color-surface)] border-y-2 border-[var(--color-border-dark)] relative">
      <Container>
        <div className="flex flex-col gap-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b-2 border-[var(--color-border-dark)] pb-6">
            <SectionHeading
              badge="Festival Timeline"
              badgeVariant="gold"
              title="Three Days of Uninterrupted Action"
              description="A quick glance at key milestones across the 3-day schedule. View the full timeline for comprehensive venue alignments and hourly programs."
            />
            <Button href="/schedule" variant="gold" size="md" className="shrink-0">
              Full Schedule Itinerary &rarr;
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {days.map((d) => (
              <Card
                key={d.dayNumber}
                variant="comic"
                bgTint={d.bgTint}
                accentStrip={d.accentStrip}
                className="flex flex-col justify-between comic-shadow-hover"
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant={d.badgeVariant} comicStamp className="text-xs">
                      {d.dayNumber}
                    </Badge>
                    <span className="text-xs font-black text-[var(--color-text-dark)] uppercase tracking-wide">
                      {d.subtitle}
                    </span>
                  </div>
                  <CardTitle className="text-xl leading-snug">
                    {d.item?.title}
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm mt-2 text-[var(--color-text-dark)] font-medium">
                    {d.item?.description}
                  </CardDescription>
                </CardHeader>

                <div className="p-6 pt-0 mt-auto">
                  <div className="rounded-xl bg-white/95 p-3.5 border border-[var(--color-border-dark)] text-xs font-bold text-[var(--color-text-muted)] space-y-1.5 comic-shadow-sm">
                    <p className="flex justify-between items-center">
                      <span className="text-[var(--color-text-dark)]">Scheduled Slot:</span>
                      <span className="font-black text-[var(--color-text-dark)]">{d.item?.time}</span>
                    </p>
                    <p className="flex justify-between items-center">
                      <span className="text-[var(--color-text-dark)]">Stage Location:</span>
                      <span className="font-extrabold text-[var(--color-ember)]">{d.item?.venue}</span>
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
