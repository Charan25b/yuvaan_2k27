"use client";

import { useEffect, useRef, useState } from "react";
import { ComicBookData } from "./types";

export function useEventCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 0
  );
  const [shuffleCount, setShuffleCount] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<import("@/lib/data/festivalData").EventItem | null>(null);
  const [selectedComicData, setSelectedComicData] = useState<ComicBookData | null>(null);

  const isModalOpenRef = useRef(false);

  useEffect(() => {
    isModalOpenRef.current = Boolean(selectedEvent && selectedComicData);
  }, [selectedEvent, selectedComicData]);

  useEffect(() => {
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;

    const onResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setViewportWidth(window.innerWidth);
      }, 150);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === "r" || e.key === "R") &&
        !e.ctrlKey &&
        !e.metaKey &&
        !isModalOpenRef.current
      ) {
        const target = e.target as HTMLElement | null;
        if (
          target &&
          (target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.isContentEditable)
        ) {
          return;
        }
        setShuffleCount((count) => count + 1);
      }
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return {
    canvasRef,
    viewportWidth,
    shuffleCount,
    selectedEvent,
    setSelectedEvent,
    selectedComicData,
    setSelectedComicData,
    isModalOpenRef,
  };
}