import React from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TEAM_DATA, type TeamMember } from "@/lib/data/festivalData";

const committees: {
  name: TeamMember["committee"];
  badgeVariant: "primary" | "cyan" | "gold" | "violet" | "emerald";
  bgTint: "blush" | "cyan" | "gold" | "violet" | "mint";
  accentStrip: "ember" | "cyan" | "gold" | "violet" | "yellow";
  glyph: string;
}[] = [
  {
    name: "Core Council",
    badgeVariant: "primary",
    bgTint: "blush",
    accentStrip: "ember",
    glyph: "👑",
  },
  {
    name: "Technical & Web",
    badgeVariant: "cyan",
    bgTint: "cyan",
    accentStrip: "cyan",
    glyph: "💻",
  },
  {
    name: "Events & Production",
    badgeVariant: "gold",
    bgTint: "gold",
    accentStrip: "gold",
    glyph: "🎪",
  },
  {
    name: "Design & Media",
    badgeVariant: "violet",
    bgTint: "violet",
    accentStrip: "violet",
    glyph: "🎨",
  },
  {
    name: "Logistics & PR",
    badgeVariant: "emerald",
    bgTint: "mint",
    accentStrip: "yellow",
    glyph: "📦",
  },
];

export function generateMetadata() {
  return {
    title: "Organizing Team & Committees | Yuvaan 2027",
    description: "The student committees and coordinators organizing Yuvaan 2027 at IIIT Guwahati.",
  };
}

export default function TeamPage() {
  return (
    <div className="py-10 sm:py-16">
      <Container>
        <div className="flex flex-col gap-14 max-w-5xl mx-auto">
          {/* Header */}
          <div className="border-b-2 border-[var(--color-border-dark)] pb-8 text-center sm:text-left">
            <SectionHeading
              badge="Festival Leadership"
              badgeVariant="primary"
              title="Organizing Team &amp; Student Committees"
              description="Yuvaan 2027 is spearheaded by student committees across technical architecture, cultural production, creative design, and campus logistics at IIIT Guwahati."
            />
          </div>

          {/* Committee Groups */}
          {committees.map((comm) => {
            const members = TEAM_DATA.filter((m) => m.committee === comm.name);

            return (
              <div key={comm.name} className="flex flex-col gap-6">
                <div className="flex items-center gap-3 border-b-2 border-[var(--color-border-dark)] pb-3">
                  <span className="text-xl">{comm.glyph}</span>
                  <Badge variant={comm.badgeVariant} comicStamp className="text-xs">
                    {comm.name}
                  </Badge>
                  <h3 className="text-xl font-black text-[var(--color-text-dark)] tracking-tight">
                    {comm.name} Committee
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {members.map((member) => (
                    <Card
                      key={member.id}
                      variant="comic"
                      bgTint={comm.bgTint}
                      accentStrip={comm.accentStrip}
                      className="flex flex-col items-center text-center p-5 comic-shadow-hover transition-all"
                    >
                      {/* Portrait Placeholder Slot */}
                      <div className="relative h-28 w-28 rounded-2xl bg-white border-2 border-[var(--color-border-dark)] comic-shadow-sm flex flex-col items-center justify-center p-2 mb-4">
                        <span className="text-3xl font-black text-[var(--color-ember)]">
                          {member.name.charAt(0)}
                        </span>
                        <span className="text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-wider mt-1">
                          Portrait Slot
                        </span>
                      </div>

                      <CardHeader className="p-0">
                        <CardTitle className="text-lg font-black text-[var(--color-text-dark)]">
                          {member.name}
                        </CardTitle>
                        <CardDescription className="text-xs font-black text-[var(--color-ember)] mt-0.5">
                          {member.role}
                        </CardDescription>
                        <p className="text-[11px] text-[var(--color-text-dark)] mt-1.5 font-bold opacity-80">
                          IIIT Guwahati Student Affairs
                        </p>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </div>
  );
}
