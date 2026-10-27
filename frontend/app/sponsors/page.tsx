import React from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SPONSORS_DATA } from "@/lib/data/festivalData";

export function generateMetadata() {
  return {
    title: "Partners & Sponsors | Yuvaan 2027",
    description: "Official sponsors and partners supporting Yuvaan 2027 at IIIT Guwahati.",
  };
}

export default function SponsorsPage() {
  const titleSponsors = SPONSORS_DATA.filter((s) => s.tier === "Title Sponsor");
  const poweredBy = SPONSORS_DATA.filter((s) => s.tier === "Powered By");
  const associates = SPONSORS_DATA.filter((s) => s.tier === "Associate Partner");
  const mediaPartners = SPONSORS_DATA.filter((s) => s.tier === "Media & Beverage Partner");

  return (
    <div className="py-10 sm:py-16">
      <Container>
        <div className="flex flex-col gap-14 max-w-5xl mx-auto">
          {/* Header */}
          <div className="border-b-2 border-[var(--color-border-dark)] pb-8 text-center sm:text-left">
            <SectionHeading
              badge="Festival Supporters"
              badgeVariant="primary"
              title="Official Partners &amp; Sponsors"
              description="Yuvaan 2027 is proudly presented in collaboration with industry pioneers, tech innovators, and regional cultural sponsors investing in student brilliance."
            />
          </div>

          {/* Title Sponsor Tier (Tier 1 - Gold Hall) */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Badge variant="gold" comicStamp className="text-xs">
                ★ TIER 1
              </Badge>
              <h3 className="text-2xl font-black text-[var(--color-text-dark)] uppercase tracking-wider">
                Title Sponsor
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {titleSponsors.map((sp) => (
                <Card
                  key={sp.id}
                  variant="comic"
                  bgTint="gold"
                  accentStrip="gold"
                  className="p-5 sm:p-8 comic-shadow-lg"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                    <div className="md:col-span-5 h-36 rounded-2xl bg-white border-2 border-[var(--color-border-dark)] comic-shadow flex flex-col items-center justify-center p-6 text-center">
                      <span className="text-[10px] font-black text-[var(--color-gold)] uppercase tracking-widest">
                        Official Partner Logo Slot
                      </span>
                      <span className="text-2xl font-black text-[var(--color-text-dark)] mt-1">
                        {sp.name}
                      </span>
                    </div>
                    <div className="md:col-span-7 flex flex-col gap-2.5">
                      <div className="flex items-center gap-2">
                        <Badge variant="gold" className="text-[10px]">
                          {sp.category}
                        </Badge>
                        <span className="text-xs font-black text-amber-900">Chief Festival Presenter</span>
                      </div>
                      <h4 className="text-3xl font-black text-[var(--color-text-dark)]">
                        {sp.name}
                      </h4>
                      <p className="text-sm text-[var(--color-text-dark)] font-medium leading-relaxed">
                        {sp.description}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Powered By Tier (Tier 2 - Cyan Hall) */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Badge variant="cyan" comicStamp className="text-xs">
                ⚡ TIER 2
              </Badge>
              <h3 className="text-2xl font-black text-[var(--color-text-dark)] uppercase tracking-wider">
                Powered By Partner
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {poweredBy.map((sp) => (
                <Card
                  key={sp.id}
                  variant="comic"
                  bgTint="cyan"
                  accentStrip="cyan"
                  className="p-4 sm:p-6 comic-shadow-hover transition-all"
                >
                  <div className="h-28 rounded-xl bg-white border-2 border-[var(--color-border-dark)] comic-shadow-sm flex flex-col items-center justify-center p-3 mb-4 text-center">
                    <span className="text-[9px] font-black text-[var(--color-cyan)] uppercase tracking-wider">
                      Partner Brand Slot
                    </span>
                    <span className="text-xl font-black text-[var(--color-text-dark)] mt-0.5">
                      {sp.name}
                    </span>
                  </div>
                  <CardHeader className="p-0">
                    <span className="text-xs font-black text-[var(--color-cyan)]">{sp.category}</span>
                    <CardTitle className="text-xl font-black">{sp.name}</CardTitle>
                    <CardDescription className="text-xs sm:text-sm mt-1 text-[var(--color-text-dark)] font-medium">
                      {sp.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>

          {/* Associate & Media Partners Grid (Tier 3 - Peach / Mint Hall) */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Badge variant="primary" comicStamp className="text-xs">
                ✦ ASSOCIATES &amp; MEDIA
              </Badge>
              <h3 className="text-2xl font-black text-[var(--color-text-dark)] uppercase tracking-wider">
                Event &amp; Broadcast Partners
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...associates, ...mediaPartners].map((sp, idx) => {
                const tints = ["peach", "mint", "blush"] as const;
                const strips = ["orange", "yellow", "ember"] as const;
                return (
                  <Card
                    key={sp.id}
                    variant="comic"
                    bgTint={tints[idx % tints.length]}
                    accentStrip={strips[idx % strips.length]}
                    className="p-4 comic-shadow-hover transition-all"
                  >
                    <div className="h-20 rounded-xl bg-white border-2 border-[var(--color-border-dark)] comic-shadow-sm flex flex-col items-center justify-center p-2 mb-3 text-center">
                      <span className="text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-wider">
                        Brand Slot
                      </span>
                      <span className="text-base font-black text-[var(--color-text-dark)]">
                        {sp.name}
                      </span>
                    </div>
                    <CardHeader className="p-0">
                      <span className="text-[11px] font-black text-[var(--color-text-dark)]">{sp.category}</span>
                      <CardTitle className="text-base font-black">{sp.name}</CardTitle>
                      <CardDescription className="text-xs mt-0.5 text-[var(--color-text-dark)] font-medium">
                        {sp.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Partner Callout Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[var(--tint-gold)] border-2 border-[var(--color-border-dark)] comic-shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex flex-col gap-2 text-center sm:text-left">
              <Badge variant="gold" comicStamp className="self-center sm:self-start text-xs">
                PARTNER WITH YUVAAN 2027
              </Badge>
              <h4 className="text-2xl font-black text-amber-950">
                Interested in Sponsoring or Campus Activations?
              </h4>
              <p className="text-xs sm:text-sm text-amber-900 font-medium max-w-xl">
                Engage directly with 5,000+ top engineering and design students across Northeast India.
                Download our sponsorship brochure or connect with the student corporate relations team.
              </p>
            </div>
            <Button href="/contact" variant="primary" size="lg" className="shrink-0 font-black">
              Connect With Sponsorship Desk &rarr;
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
