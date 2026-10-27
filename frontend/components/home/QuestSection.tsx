import React from "react";
import { Container } from "@/components/ui/Container";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const questSteps = [
  {
    step: "01",
    title: "Discover Campus Checkpoints",
    badge: "Step 1: Explore",
    badgeVariant: "cream" as const,
    description:
      "Physical checkpoints with unique QR codes are hidden across landmarks in the IIIT Guwahati campus. Scan to unlock active challenges.",
  },
  {
    step: "02",
    title: "Conquer Mini-Games & Duels",
    badge: "Step 2: Compete",
    badgeVariant: "highlight" as const,
    description:
      "Complete timed browser mini-games, solve puzzles, or challenge rival faction players to 1v1 PVP score duels.",
  },
  {
    step: "03",
    title: "Earn Faction Glory",
    badge: "Step 3: Triumph",
    badgeVariant: "accent" as const,
    description:
      "Every validated checkpoint session awards points to your personal record and propels your faction up the live leaderboard.",
  },
];

export function QuestSection() {
  return (
    <section className="relative">
      <Container>
        <div className="flex flex-col gap-10">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b-2 border-[var(--color-border-dark)] pb-6">
            <div className="max-w-2xl">
              <Badge variant="accent" className="mb-2">
                Interactive Gameplay
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-black text-[var(--color-text-dark)] tracking-tight">
                How The Campus Quest Works
              </h2>
              <p className="mt-2 text-base text-[var(--color-text-muted)] font-medium">
                Turn your festival walk into a competitive adventure with physical QR
                triggers and server-validated leaderboards.
              </p>
            </div>
            <Button href="/quest" variant="secondary" size="md">
              Quest Scanner Guide
            </Button>
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {questSteps.map((item) => (
              <Card key={item.step} variant="comic" className="flex flex-col justify-between">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl font-black text-[var(--color-primary)]">
                      {item.step}
                    </span>
                    <Badge variant={item.badgeVariant}>{item.badge}</Badge>
                  </div>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription className="text-base mt-2">
                    {item.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 mt-auto">
                  <div className="h-1.5 w-full rounded-full bg-[var(--color-cream)] overflow-hidden">
                    <div
                      className="h-full bg-[var(--color-accent)] rounded-full"
                      style={{
                        width:
                          item.step === "01"
                            ? "33%"
                            : item.step === "02"
                            ? "66%"
                            : "100%",
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
