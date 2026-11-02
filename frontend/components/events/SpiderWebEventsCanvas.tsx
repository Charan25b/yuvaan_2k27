"use client";

import React, { useEffect, useRef, useState } from "react";
import { EventItem } from "@/lib/data/festivalData";
import { ComicBookData } from "./types";
import { PhysicalCard, PhysicalWebMidpoint, updateWebChainsPhysics } from "./physics";
import { generateWebChains } from "./layoutGenerator";
import { drawWebStrands, drawComicCard } from "./canvasRenderer";
import { OpenComicBookModal } from "./OpenComicBookModal";

interface SpiderWebEventsCanvasProps {
  events: EventItem[];
}

export function SpiderWebEventsCanvas({ events }: SpiderWebEventsCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [, setWindowWidth] = useState<number>(0);
  const [shuffleCount, setShuffleCount] = useState<number>(0);

  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [selectedComicData, setSelectedComicData] = useState<ComicBookData | null>(null);

  // Ref tracking modal open state to guard global keyboard shortcuts
  const isModalOpenRef = useRef(false);

  useEffect(() => {
    isModalOpenRef.current = Boolean(selectedEvent && selectedComicData);
  }, [selectedEvent, selectedComicData]);

  // High-performance hover ref (avoids triggering React re-renders on every mouse pixel movement)
  const hoveredEventIdRef = useRef<string | null>(null);

  // Window resize & keyboard shuffle listeners
  useEffect(() => {
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    const onResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setWindowWidth((w) => (w === window.innerWidth ? w : window.innerWidth));
      }, 150);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "r" || e.key === "R") && !e.ctrlKey && !e.metaKey) {
        const target = e.target as HTMLElement | null;
        if (
          target &&
          (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
        ) {
          return;
        }
        if (isModalOpenRef.current) return;
        setShuffleCount((c) => c + 1);
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

  // Main Canvas & Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = window.innerWidth;
    const isMobile = width < 768;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Procedural layout generation with non-parallel & non-complementary logic
    const { chains, totalHeight } = generateWebChains(events, width, isMobile);

    canvas.width = width * dpr;
    canvas.height = totalHeight * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${totalHeight}px`;

    // Pointer Interaction State
    let activeDragCard: PhysicalCard | null = null;
    let activeDragMidpoint: PhysicalWebMidpoint | null = null;
    let dragPointerOffset = { x: 0, y: 0 };
    let pointerDownPos = { x: 0, y: 0 };
    let pointerDownTime = 0;
    let hasMovedSignificantly = false;

    const getCanvasPos = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    };

    const handlePointerDown = (e: PointerEvent) => {
      const pos = getCanvasPos(e.clientX, e.clientY);
      pointerDownPos = pos;
      pointerDownTime = performance.now();
      hasMovedSignificantly = false;

      activeDragCard = null;
      activeDragMidpoint = null;

      // 1. Check card hit testing using rotated local coordinates for exact precision
      for (const chain of chains) {
        for (let i = chain.cards.length - 1; i >= 0; i--) {
          const c = chain.cards[i];
          const dx = pos.x - c.x;
          const dy = pos.y - c.y;
          const cos = Math.cos(-c.angle);
          const sin = Math.sin(-c.angle);
          const localX = dx * cos - dy * sin;
          const localY = dx * sin + dy * cos;

          if (Math.abs(localX) <= c.cardWidth / 2 && Math.abs(localY) <= c.cardHeight / 2) {
            activeDragCard = c;
            dragPointerOffset = { x: dx, y: dy };
            canvas.style.cursor = "grabbing";
            try {
              canvas.setPointerCapture(e.pointerId);
            } catch {}
            return;
          }
        }
      }

      // 2. Check web midpoint / strand hit testing
      if (!activeDragCard) {
        for (const chain of chains) {
          for (const m of chain.webMidpoints) {
            const dist = Math.hypot(pos.x - m.x, pos.y - m.y);
            if (dist < 45) {
              activeDragMidpoint = m;
              m.isDragging = true;
              dragPointerOffset = { x: pos.x - m.x, y: pos.y - m.y };
              canvas.style.cursor = "grabbing";
              try {
                canvas.setPointerCapture(e.pointerId);
              } catch {}
              return;
            }
          }
        }
      }
    };

    const resetDrag = () => {
      if (activeDragMidpoint) {
        activeDragMidpoint.isDragging = false;
      }
      activeDragCard = null;
      activeDragMidpoint = null;
      hasMovedSignificantly = false;
      canvas.style.cursor = hoveredEventIdRef.current ? "pointer" : "grab";
    };

    const handlePointerMove = (e: PointerEvent) => {
      // Safety: If no mouse button is held, cancel drag immediately
      if ((activeDragCard || activeDragMidpoint) && e.buttons === 0) {
        resetDrag();
        return;
      }

      const pos = getCanvasPos(e.clientX, e.clientY);
      const dist = Math.hypot(pos.x - pointerDownPos.x, pos.y - pointerDownPos.y);
      if (dist > 8) {
        hasMovedSignificantly = true;
      }

      // Dragging Card
      if (activeDragCard) {
        const targetX = pos.x - dragPointerOffset.x;
        const targetY = pos.y - dragPointerOffset.y;
        activeDragCard.vx = (targetX - activeDragCard.x) * 0.45;
        activeDragCard.vy = (targetY - activeDragCard.y) * 0.45;
        activeDragCard.x = targetX;
        activeDragCard.y = targetY;
      }

      // Dragging Web Midpoint
      if (activeDragMidpoint) {
        activeDragMidpoint.x = pos.x - dragPointerOffset.x;
        activeDragMidpoint.y = pos.y - dragPointerOffset.y;
        activeDragMidpoint.vx = 0;
        activeDragMidpoint.vy = 0;
      }

      // Hover tracking
      let foundHover: string | null = null;
      for (const chain of chains) {
        for (const c of chain.cards) {
          const dx = pos.x - c.x;
          const dy = pos.y - c.y;
          const cos = Math.cos(-c.angle);
          const sin = Math.sin(-c.angle);
          const localX = dx * cos - dy * sin;
          const localY = dx * sin + dy * cos;

          if (Math.abs(localX) <= c.cardWidth / 2 && Math.abs(localY) <= c.cardHeight / 2) {
            foundHover = c.comic.event.id;
            break;
          }
        }
        if (foundHover) break;
      }

      hoveredEventIdRef.current = foundHover;
      if (!activeDragCard && !activeDragMidpoint) {
        canvas.style.cursor = foundHover ? "pointer" : "grab";
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      try {
        if (canvas.hasPointerCapture(e.pointerId)) {
          canvas.releasePointerCapture(e.pointerId);
        }
      } catch {}

      const duration = performance.now() - pointerDownTime;
      const pos = getCanvasPos(e.clientX, e.clientY);
      const dist = Math.hypot(pos.x - pointerDownPos.x, pos.y - pointerDownPos.y);

      // Clean tap click: open modal
      if (!hasMovedSignificantly && dist < 10 && duration < 320 && activeDragCard) {
        setSelectedEvent(activeDragCard.comic.event);
        setSelectedComicData(activeDragCard.comic);
      }

      resetDrag();
    };

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", resetDrag);
    window.addEventListener("blur", resetDrag);

    // Main 60fps Physics & Render Loop
    const render = () => {
      // 1. Step forward physics
      updateWebChainsPhysics(chains, activeDragCard, width, isMobile);

      // 2. Render Canvas Frame
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, totalHeight);

      for (const chain of chains) {
        // Draw Web Strands
        drawWebStrands(ctx, chain);

        // Draw Comic Book Cards
        chain.cards.forEach((c) => {
          const isHovered = hoveredEventIdRef.current === c.comic.event.id;
          drawComicCard(ctx, c, isHovered, isMobile);
        });
      }

      ctx.restore();
      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", resetDrag);
      window.removeEventListener("blur", resetDrag);

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [events, shuffleCount]);

  return (
    <div className="relative w-full p-0 m-0 overflow-x-hidden flex justify-center select-none">
      <canvas
        ref={canvasRef}
        className="cursor-grab active:cursor-grabbing block touch-pan-y"
      />

      {/* 3D Open Comic Book 2-Page Spread Modal (<= 1s open / <= 1s exit) */}
      <OpenComicBookModal
        isOpen={Boolean(selectedEvent && selectedComicData)}
        event={selectedEvent}
        comicData={selectedComicData}
        onClose={() => {
          setSelectedEvent(null);
          setSelectedComicData(null);
        }}
      />
    </div>
  );
}
