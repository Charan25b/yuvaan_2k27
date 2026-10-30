"use client";

import React from "react";
import { SpiderWebEventsCanvas } from "@/components/events";
import { EVENTS_DATA } from "@/lib/data";

export default function EventsPage() {
  return (
    <div className="w-full min-h-screen p-0 m-0 overflow-x-hidden">
      <SpiderWebEventsCanvas events={EVENTS_DATA} />
    </div>
  );
}
