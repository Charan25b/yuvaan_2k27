import React from "react";
import { HeroSection } from "@/components/home/HeroSection";
import { AboutSection } from "@/components/home/AboutSection";
import { FeaturedEventsSection } from "@/components/home/FeaturedEventsSection";
import { SchedulePreviewSection } from "@/components/home/SchedulePreviewSection";
import { GameSiteSection } from "@/components/home/GameSiteSection";
import { FactionsSection } from "@/components/home/FactionsSection";
import { SponsorsPreviewSection } from "@/components/home/SponsorsPreviewSection";
import { GalleryPreviewSection } from "@/components/home/GalleryPreviewSection";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <AboutSection />
      <FeaturedEventsSection />
      <SchedulePreviewSection />
      <GameSiteSection />
      <FactionsSection />
      <SponsorsPreviewSection />
      <GalleryPreviewSection />
    </div>
  );
}
