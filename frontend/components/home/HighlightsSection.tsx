import React from "react";
import { Container } from "@/components/ui/Container";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const categories = [
  {
    title: "Cultural Stages",
    badge: "Stage & Lights",
    description:
      "Music bands, drama productions, solo vocals, and dance showdowns under the Guwahati night sky.",
  },
  {
    title: "Technical Arenas",
    badge: "Code & Hardware",
    description:
      "24-hour hackathons, algorithmic sprints, robotics challenges, and open-source project showcases.",
  },
  {
    title: "Gaming & Esports",
    badge: "Competitive",
    description:
      "LAN tournaments, console showdowns, retro speedruns, and quick-fire arcade mini-game duels.",
  },
  {
    title: "Workshops & Panels",
    badge: "Learn & Connect",
    description:
      "Hands-on masterclasses led by industry veterans, creative comic artists, and guest speakers.",
  },
];

export function HighlightsSection() {
  return (
    <section className="relative">
      <Container>
        <div className="flex flex-col gap-10">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b-2 border-[var(--color-border-dark)] pb-6">
            <div className="max-w-2xl">
              <Badge variant="highlight" className="mb-2">
                Festival Arenas
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-black text-[var(--color-text-dark)] tracking-tight">
                Festival Highlights & Event Tracks
              </h2>
              <p className="mt-2 text-base text-[var(--color-text-muted)] font-medium">
                Explore a packed 3-day schedule filled with competitions, performances,
                and interactive experiences.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button href="/events" variant="primary" size="md">
                Browse Events
              </Button>
              <Button href="/schedule" variant="secondary" size="md">
                Full Schedule
              </Button>
            </div>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((c) => (
              <Card key={c.title} variant="comic" className="flex flex-col justify-between">
                <CardHeader>
                  <Badge variant="cream" className="mb-3 self-start">
                    {c.badge}
                  </Badge>
                  <CardTitle className="text-xl">{c.title}</CardTitle>
                  <CardDescription className="text-sm mt-2">
                    {c.description}
                  </CardDescription>
                </CardHeader>
                <div className="p-6 pt-0 mt-auto">
                  <Button
                    href="/events"
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start p-0 text-[var(--color-primary)] font-extrabold hover:bg-transparent hover:text-[var(--color-accent)]"
                  >
                    View Track &rarr;
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
