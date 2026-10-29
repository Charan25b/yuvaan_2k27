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
              badgeVariant="section-dark"
              title="Backed By Visionary Industry Partners"
              description="Yuvaan 2027 is supported by forward-thinking organizations empowering collegiate engineering, design, arts, and student innovation."
            />
            <Button href="/sponsors" variant="gold" size="md" className="shrink-0">
              View All Partners &rarr;
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {previewSponsors.map((sp, idx) => {
              const strips = ["gold", "cyan", "orange", "ember"] as const;
              const badgeVariants = ["gold", "cyan", "blush", "emerald"] as const;
              const boxTilts = ["tilt-box-1", "tilt-box-2", "tilt-box-3", "tilt-box-4"] as const;

              return (
                <Card
                  key={sp.id}
                  variant="comic"
                  bgTint="white"
                  accentStrip={strips[idx % strips.length]}
                  className="flex flex-col justify-between text-center p-3"
                >
                  <CardHeader className="p-3">
                    {/* Tagline: strictly static without hover animation */}
                    <Badge variant={badgeVariants[idx % badgeVariants.length]} className="mb-3 self-center text-[10px] font-black">
                      {sp.tier}
                    </Badge>

                    {/* Logo Box: has default tilt and tilt animation on hover. The logo text inside has NO independent animation */}
                    <div className={`comic-small-box ${boxTilts[idx % boxTilts.length]} h-24 w-full rounded-xl bg-white border-2 border-[#121110] shadow-[3.5px_3.5px_0px_#121110] flex flex-col items-center justify-center p-3 mb-4 select-none`}>
                      <span className="text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-widest pointer-events-none transition-none transform-none">
                        Partner Logo
                      </span>
                      <span className="font-black text-base text-[#121110] mt-0.5 pointer-events-none transition-none transform-none">
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