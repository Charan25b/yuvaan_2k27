import React from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SPONSORS_DATA } from "@/lib/data/festivalData";

export function SponsorsPreviewSection() {
  const previewSponsors = SPONSORS_DATA.slice(0, 4);

  return (
    <section data-home-section="sponsors" className="py-14 sm:py-20 relative overflow-hidden">
      <Container>
        <div className="flex flex-col gap-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b-2 border-[var(--color-border-dark)] pb-6">
            <SectionHeading
              badge="Festival Partners"
              badgeVariant="gold"
              title="Backed By Visionary Industry Partners"
              description="Yuvaan 2027 is supported by forward-thinking organizations empowering collegiate engineering, design, arts, and student innovation."
            />
            <Button href="/sponsors" variant="primary" size="md" className="shrink-0">
              View All Partners &rarr;
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {previewSponsors.map((sp, idx) => {
              const tints = ["gold", "cyan", "peach", "blush"] as const;
              const strips = ["gold", "cyan", "orange", "ember"] as const;
              const badgeVariants = ["gold", "cyan", "primary", "emerald"] as const;

              return (
                <Card
                  key={sp.id}
                  variant="comic"
                  bgTint={tints[idx % tints.length]}
                  accentStrip={strips[idx % strips.length]}
                  className="flex flex-col justify-between text-center p-3 comic-shadow-hover transition-all"
                >
                  <CardHeader className="p-3">
                    <Badge
                      variant={badgeVariants[idx % badgeVariants.length]}
                      className="mb-3 self-center text-[10px] font-black"
                    >
                      {sp.tier}
                    </Badge>
                    <div className="h-24 w-full rounded-xl bg-white border-2 border-[var(--color-border-dark)] comic-shadow-sm flex flex-col items-center justify-center p-3 mb-4">
                      <span className="text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">
                        Partner Logo
                      </span>
                      <span className="font-black text-base text-[var(--color-text-dark)] mt-0.5">
                        {sp.name}
                      </span>
                    </div>
                    <CardTitle className="text-base font-black">
                      {sp.category}
                    </CardTitle>
                    <CardDescription className="text-xs mt-1 text-[var(--color-text-dark)] font-medium">
                      {sp.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
