"use client";

import React, { useEffect } from "react";
import { HeroSection } from "@/components/home/HeroSection";
import { AboutSection } from "@/components/home/AboutSection";
import { FeaturedEventsSection } from "@/components/home/FeaturedEventsSection";
import { SchedulePreviewSection } from "@/components/home/SchedulePreviewSection";
import { GameSiteSection } from "@/components/home/GameSiteSection";
import { FactionsSection } from "@/components/home/FactionsSection";
import { SponsorsPreviewSection } from "@/components/home/SponsorsPreviewSection";
import { GalleryPreviewSection } from "@/components/home/GalleryPreviewSection";
import { Reveal } from "@/components/ui/Reveal";

export default function HomePage() {
  // Always start at the top (Hero) when refreshing or loading the page
  useEffect(() => {
    if (typeof window !== "undefined") {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
      window.scrollTo(0, 0);
    }
  }, []);

  return (
    <div className="comic-home flex flex-col">
      {/* Hero section is always immediately visible at the top */}
      <HeroSection />

      <Reveal>
        <AboutSection />
      </Reveal>
      <Reveal>
        <FeaturedEventsSection />
      </Reveal>
      <Reveal>
        <SchedulePreviewSection />
      </Reveal>
      <Reveal>
        <GameSiteSection />
      </Reveal>
      <Reveal>
        <FactionsSection />
      </Reveal>
      <Reveal>
        <SponsorsPreviewSection />
      </Reveal>
      <Reveal>
        <GalleryPreviewSection />
      </Reveal>
    </div>
  );
}
