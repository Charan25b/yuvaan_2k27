import React from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export function AboutSection() {
  return (
    <section data-home-section="intro" className="py-14 sm:py-20 bg-[var(--color-surface)] border-y-2 border-[var(--color-border-dark)] relative overflow-hidden">
      {/* Background halftone accent */}
      <div className="absolute inset-0 comic-dots-subtle pointer-events-none opacity-50" />

      <Container className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 flex flex-col gap-6">
            <SectionHeading
              badge="About Yuvaan"
              badgeVariant="gold"
              title="A Celebration of Student Ingenuity & Artistry"
              description="Yuvaan is the landmark annual gathering that unites colleges across Northeast India and beyond at IIIT Guwahati. Drawing from contemporary comic arts, vibrant character design, and cutting-edge engineering, the 2027 edition combines high-energy stage performances with deep technical challenges."
            />

            <div className="space-y-4 text-sm text-[var(--color-text-muted)] leading-relaxed font-medium">
              <p>
                From 24-hour product hackathons in the computer labs to battle-of-the-bands
                under the open amphitheatre floodlights, Yuvaan serves as a launchpad
                for technical innovation and creative self-expression.
              </p>
              <div className="p-4 rounded-xl bg-[var(--color-cream-canvas)] border-2 border-[var(--color-border-dark)] comic-shadow-sm flex items-start gap-3">
                <span className="text-xl">💡</span>
                <p className="text-xs text-[var(--color-text-dark)] font-bold">
                  This public website provides the full festival schedule, event descriptions,
                  rulebooks, sponsor details, and official merchandise without requiring a login.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button href="/events" variant="primary" size="md">
                View Event Categories &rarr;
              </Button>
              <Button href="/team" variant="outline" size="md">
                Meet Organizing Team
              </Button>
            </div>
          </div>

          {/* 4 Multi-colored Feature Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Cultural Stages */}
            <Card
              variant="comic"
              bgTint="blush"
              accentStrip="ember"
              className="flex flex-col justify-between comic-shadow-hover"
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-white border-2 border-[var(--color-border-dark)] flex items-center justify-center font-black text-[var(--color-ember)] text-base comic-shadow-sm">
                    01
                  </div>
                  <Badge variant="blush" className="text-[10px]">
                    STAGE &amp; MUSIC
                  </Badge>
                </div>
                <CardTitle className="text-xl">Cultural Stages</CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-1 text-[var(--color-text-dark)] font-medium">
                  Live rock bands, solo acoustics, street cyphers, theatrical plays, and grand star night headliners.
                </CardDescription>
              </CardHeader>
              <div className="px-6 pb-5 pt-0 text-[11px] font-bold text-[var(--color-ember)] flex items-center gap-1">
                <span>Amphitheatre &amp; Open Grounds</span>
              </div>
            </Card>

            {/* Technical Arenas */}
            <Card
              variant="comic"
              bgTint="cyan"
              accentStrip="cyan"
              className="flex flex-col justify-between comic-shadow-hover"
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-white border-2 border-[var(--color-border-dark)] flex items-center justify-center font-black text-[var(--color-cyan)] text-base comic-shadow-sm">
                    02
                  </div>
                  <Badge variant="cyan" className="text-[10px]">
                    CODE &amp; BOTS
                  </Badge>
                </div>
                <CardTitle className="text-xl">Technical Arenas</CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-1 text-[var(--color-text-dark)] font-medium">
                  24-hour software hackathons, robotics obstacle derbies, algorithmic coding sprints, and hardware demos.
                </CardDescription>
              </CardHeader>
              <div className="px-6 pb-5 pt-0 text-[11px] font-bold text-[var(--color-cyan)] flex items-center gap-1">
                <span>Computer Labs &amp; SAC Hall</span>
              </div>
            </Card>

            {/* Gaming & Esports */}
            <Card
              variant="comic"
              bgTint="violet"
              accentStrip="violet"
              className="flex flex-col justify-between comic-shadow-hover"
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-white border-2 border-[var(--color-border-dark)] flex items-center justify-center font-black text-[var(--color-violet)] text-base comic-shadow-sm">
                    03
                  </div>
                  <Badge variant="violet" className="text-[10px]">
                    LAN &amp; CONSOLE
                  </Badge>
                </div>
                <CardTitle className="text-xl">Gaming &amp; Esports</CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-1 text-[var(--color-text-dark)] font-medium">
                  High-stakes tactical FPS brackets, console fighting tournaments, and collegiate LAN championships.
                </CardDescription>
              </CardHeader>
              <div className="px-6 pb-5 pt-0 text-[11px] font-bold text-[var(--color-violet)] flex items-center gap-1">
                <span>LAN Gaming Arena (Seminar Hall)</span>
              </div>
            </Card>

            {/* Workshops & Talks */}
            <Card
              variant="comic"
              bgTint="gold"
              accentStrip="gold"
              className="flex flex-col justify-between comic-shadow-hover"
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-white border-2 border-[var(--color-border-dark)] flex items-center justify-center font-black text-[var(--color-gold)] text-base comic-shadow-sm">
                    04
                  </div>
                  <Badge variant="gold" className="text-[10px]">
                    KEYNOTES &amp; LABS
                  </Badge>
                </div>
                <CardTitle className="text-xl">Workshops &amp; Talks</CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-1 text-[var(--color-text-dark)] font-medium">
                  Generative design masterclasses, creative panels, comic illustration bootcamps, and industry tech mentorship.
                </CardDescription>
              </CardHeader>
              <div className="px-6 pb-5 pt-0 text-[11px] font-bold text-[var(--color-gold)] flex items-center gap-1">
                <span>Auditorium Complex</span>
              </div>
            </Card>
          </div>
        </div>
      </Container>
    </section>
  );
}
