import React from "react";
import { HeroSection } from "@/components/home/HeroSection";
import { AboutSection } from "@/components/home/AboutSection";
import { FeaturedEventsSection } from "@/components/home/FeaturedEventsSection";
import { HighlightsSection } from "@/components/home/HighlightsSection";
import { FactionsSection } from "@/components/home/FactionsSection";
import { QuestSection } from "@/components/home/QuestSection";
import { GameSiteSection } from "@/components/home/GameSiteSection";
import { SchedulePreviewSection } from "@/components/home/SchedulePreviewSection";
import { SponsorsPreviewSection } from "@/components/home/SponsorsPreviewSection";
import { GalleryPreviewSection } from "@/components/home/GalleryPreviewSection";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <AboutSection />
      <FeaturedEventsSection />
      <HighlightsSection />
      <FactionsSection />
      <QuestSection />
      <GameSiteSection />
      <SchedulePreviewSection />
      <SponsorsPreviewSection />
      <GalleryPreviewSection />
    </div>
  );
}
