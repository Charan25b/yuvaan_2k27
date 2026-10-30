import React from "react";
import Link from "next/link";
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
      dayId: 1,
      subtitle: "Inauguration & Cyphers",
      item: day1Highlight,
      bgTint: "blush" as const,
      accentStrip: "ember" as const,
      taglineVariant: "blush" as const,
      dayTilt: "tilt-box-1",
    },
    {
      dayNumber: "Day 2",
      dayId: 2,
      subtitle: "Hackathons & Battle of Bands",
      item: day2Highlight,
      bgTint: "gold" as const,
      accentStrip: "gold" as const,
      taglineVariant: "gold" as const,
      dayTilt: "tilt-box-2",
    },
    {
      dayNumber: "Day 3",
      dayId: 3,
      subtitle: "RoboCombat & Star Night",
      item: day3Highlight,
      bgTint: "cyan" as const,
      accentStrip: "cyan" as const,
      taglineVariant: "cyan" as const,
      dayTilt: "tilt-box-3",
    },
  ];

  return (
    <section data-home-section="schedule" className="py-14 sm:py-20 relative">
      <Container>
        <div className="flex flex-col gap-10">
          <div className="home-section-rule flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b-2 pb-6">
            <SectionHeading
              badge="Festival Timeline"
              badgeVariant="section-light"
              title="Three Days of Uninterrupted Action"
              description="A quick glance at key milestones across the 3-day schedule. View the full timeline for comprehensive venue alignments and hourly programs."
              className="home-section-heading"
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
                className="flex flex-col justify-between"
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-3 gap-2">
                    {/* Clickable Day badge that routes to that specific day on /schedule */}
                    <Link
                      href={`/schedule?day=${d.dayId}#day-${d.dayId}`}
                      className={`comic-small-box ${d.dayTilt} inline-flex items-center px-3 py-1 rounded-md bg-white border-2 border-[#121110] font-black text-xs text-[#121110] shadow-[2.5px_2.5px_0px_#121110] select-none cursor-pointer hover:bg-[#F2AE30] hover:text-[#121110] hover:shadow-[3.5px_3.5px_0px_#121110] transition-all`}
                      title={`View ${d.dayNumber} Full Schedule`}
                    >
                      {d.dayNumber}
                    </Link>

                    {/* Tagline: strictly static without hover animation */}
                    <Badge variant={d.taglineVariant} className="text-[10px]">
                      {d.subtitle}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl leading-snug text-[#121110]">
                    {d.item?.title}
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm mt-2 text-[#121110] font-bold leading-relaxed">
                    {d.item?.description}
                  </CardDescription>
                </CardHeader>

                {/* 4 distinct non-interactive mini-boxes: SOLID BLACK TEXT FOR CLARITY, NO POINTER ON HOVER */}
                <div className="p-6 pt-0 mt-auto">
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    {/* Box 1: Scheduled Slot Label -> Black text, non-interactive */}
                    <div className="schedule-meta-box p-2 rounded-lg bg-white border-2 border-[#121110] font-black text-[10px] uppercase text-[#121110] shadow-[2.5px_2.5px_0px_#121110] text-center select-none cursor-default pointer-events-none">
                      Scheduled Slot<br/>{d.item?.time}
                    </div>
                    {/* Box 3: Stage Location Label -> Black text, non-interactive */}
                    <div className="schedule-meta-box p-2 rounded-lg bg-white border-2 border-[#121110] font-black text-[10px] uppercase text-[#121110] shadow-[2.5px_2.5px_0px_#121110] text-center select-none cursor-default pointer-events-none">
                      Stage Location<br/>{d.item?.venue}
                    </div>
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
