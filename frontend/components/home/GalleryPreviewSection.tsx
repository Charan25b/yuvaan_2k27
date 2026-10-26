import React from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card, CardHeader, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { GALLERY_DATA } from "@/lib/data/festivalData";

export function GalleryPreviewSection() {
  const previewItems = GALLERY_DATA.slice(0, 3);
  const badgeVariants = ["primary", "cyan", "gold"] as const;

  return (
    <section className="py-14 sm:py-20 bg-[var(--color-surface)] border-t-2 border-[var(--color-border-dark)] relative">
      <Container>
        <div className="flex flex-col gap-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b-2 border-[var(--color-border-dark)] pb-6">
            <SectionHeading
              badge="Festival Memories"
              badgeVariant="primary"
              title="Snapshots of the Yuvaan Spirit"
              description="From packed pro-night amphitheatre crowds to late-night hackathon coding sessions, experience the energy of previous festival editions."
            />
            <Button href="/gallery" variant="secondary" size="md" className="shrink-0">
              Full Photo Gallery &rarr;
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {previewItems.map((item, idx) => (
              <Card
                key={item.id}
                variant="comic"
                className="flex flex-col overflow-hidden comic-shadow-hover transition-all bg-white"
              >
                {/* Visual Polaroid Frame for Gallery Image */}
                <div className="relative aspect-video w-full bg-[var(--color-cream-canvas)] border-b-2 border-[var(--color-border-dark)] flex flex-col items-center justify-center p-4 text-center">
                  <div className="absolute top-3 left-3">
                    <Badge variant={badgeVariants[idx % badgeVariants.length]} className="text-[10px]">
                      {item.category}
                    </Badge>
                  </div>
                  <span className="text-base font-black text-[var(--color-text-dark)] max-w-xs mt-3">
                    {item.title}
                  </span>
                  <span className="text-[11px] text-[var(--color-text-muted)] mt-1 font-bold">
                    {item.year} Photographic Archive
                  </span>
                </div>
                <CardHeader className="p-4">
                  <CardDescription className="text-xs sm:text-sm text-[var(--color-text-dark)] font-medium">
                    {item.caption}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
