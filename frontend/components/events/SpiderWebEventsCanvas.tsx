"use client";

import React, { useEffect, useRef } from "react";
import { EventItem } from "@/lib/data/festivalData";
import {
  PhysicalCard,
  PhysicalWebMidpoint,
  updateWebChainsPhysics,
} from "./physics";
import { generateWebChains } from "./layoutGenerator";
import { drawWebStrands, drawComicCard } from "./canvasRenderer";
import { findCardAtPoint } from "./hitTesting";
import { OpenComicBookModal } from "./OpenComicBookModal";
import { useEventCanvas } from "./useEventCanvas";

interface SpiderWebEventsCanvasProps {
  events: EventItem[];
}

export function SpiderWebEventsCanvas({ events }: SpiderWebEventsCanvasProps) {
  const {
    canvasRef,
    viewportWidth,
    shuffleCount,
    selectedEvent,
    setSelectedEvent,
    selectedComicData,
    setSelectedComicData,
  } = useEventCanvas();

  const hoveredEventIdRef = useRef<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || viewportWidth === 0) return;

    const ctx = canvas.getContext("2d", {
      alpha: true,
      desynchronized: true,
    });

    if (!ctx) return;

    const width = viewportWidth;
    const isMobile = width < 768;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const { chains, totalHeight } = generateWebChains(
      events,
      width,
      isMobile
    );

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(totalHeight * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${totalHeight}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let frameId: number | null = null;
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

    const hasMotion = () => {
      const velocityThreshold = 0.08;
      const angularThreshold = 0.001;

      for (const chain of chains) {
        for (const card of chain.cards) {
          if (
            Math.abs(card.vx) > velocityThreshold ||
            Math.abs(card.vy) > velocityThreshold ||
            Math.abs(card.angularVelocity) > angularThreshold
          ) {
            return true;
          }
        }

        for (const midpoint of chain.webMidpoints) {
          if (
            Math.abs(midpoint.vx) > velocityThreshold ||
            Math.abs(midpoint.vy) > velocityThreshold
          ) {
            return true;
          }
        }
      }

      return false;
    };

    const renderFrame = () => {
      frameId = null;

      if (document.hidden) return;

      updateWebChainsPhysics(chains, activeDragCard, width, isMobile);

      ctx.clearRect(0, 0, width, totalHeight);

      for (const chain of chains) {
        drawWebStrands(ctx, chain);

        for (const card of chain.cards) {
          const isHovered =
            hoveredEventIdRef.current === card.comic.event.id;

          drawComicCard(ctx, card, isHovered, isMobile);
        }
      }

      // Continue only while physics is still moving.
      if (activeDragCard || activeDragMidpoint || hasMotion()) {
        frameId = requestAnimationFrame(renderFrame);
      }
    };

    const requestRender = () => {
      if (document.hidden || frameId !== null) return;

      frameId = requestAnimationFrame(renderFrame);
    };

    const resetDrag = () => {
      if (activeDragMidpoint) {
        activeDragMidpoint.isDragging = false;
      }

      activeDragCard = null;
      activeDragMidpoint = null;
      hasMovedSignificantly = false;

      canvas.style.cursor = hoveredEventIdRef.current
        ? "pointer"
        : "grab";

      requestRender();
    };

    const handlePointerDown = (e: PointerEvent) => {
      const pos = getCanvasPos(e.clientX, e.clientY);

      pointerDownPos = pos;
      pointerDownTime = performance.now();
      hasMovedSignificantly = false;

      activeDragCard = null;
      activeDragMidpoint = null;

      const card = findCardAtPoint(chains, pos.x, pos.y);
      if (card) {
        activeDragCard = card;
        dragPointerOffset = { x: pos.x - card.x, y: pos.y - card.y };

        canvas.style.cursor = "grabbing";

        try {
          canvas.setPointerCapture(e.pointerId);
        } catch {}

        requestRender();
        return;
      }

      // Check draggable web midpoints.
      for (const chain of chains) {
        for (const midpoint of chain.webMidpoints) {
          const dx = pos.x - midpoint.x;
          const dy = pos.y - midpoint.y;

          if (dx * dx + dy * dy < 45 * 45) {
            activeDragMidpoint = midpoint;
            midpoint.isDragging = true;

            dragPointerOffset = { x: dx, y: dy };
            canvas.style.cursor = "grabbing";

            try {
              canvas.setPointerCapture(e.pointerId);
            } catch {}

            requestRender();
            return;
          }
        }
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (
        (activeDragCard || activeDragMidpoint) &&
        e.buttons === 0
      ) {
        resetDrag();
        return;
      }

      const pos = getCanvasPos(e.clientX, e.clientY);

      const dxFromDown = pos.x - pointerDownPos.x;
      const dyFromDown = pos.y - pointerDownPos.y;

      if (
        dxFromDown * dxFromDown + dyFromDown * dyFromDown >
        8 * 8
      ) {
        hasMovedSignificantly = true;
      }

      // Move a dragged card.
      if (activeDragCard) {
        const targetX = pos.x - dragPointerOffset.x;
        const targetY = pos.y - dragPointerOffset.y;

        activeDragCard.vx = (targetX - activeDragCard.x) * 0.45;
        activeDragCard.vy = (targetY - activeDragCard.y) * 0.45;

        activeDragCard.x = targetX;
        activeDragCard.y = targetY;
      }

      // Move a dragged web midpoint.
      if (activeDragMidpoint) {
        activeDragMidpoint.x = pos.x - dragPointerOffset.x;
        activeDragMidpoint.y = pos.y - dragPointerOffset.y;

        activeDragMidpoint.vx = 0;
        activeDragMidpoint.vy = 0;
      }

      const hoveredCard = findCardAtPoint(chains, pos.x, pos.y);
      const foundHover = hoveredCard?.comic.event.id ?? null;

      const hoverChanged =
        foundHover !== hoveredEventIdRef.current;

      if (hoverChanged) {
        hoveredEventIdRef.current = foundHover;
      }

      if (!activeDragCard && !activeDragMidpoint) {
        canvas.style.cursor = foundHover ? "pointer" : "grab";
      }

      // Only request a frame when something actually changed.
      if (
        activeDragCard ||
        activeDragMidpoint ||
        hoverChanged
      ) {
        requestRender();
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

      const dx = pos.x - pointerDownPos.x;
      const dy = pos.y - pointerDownPos.y;
      const distanceSquared = dx * dx + dy * dy;

      if (
        !hasMovedSignificantly &&
        distanceSquared < 100 &&
        duration < 320 &&
        activeDragCard
      ) {
        setSelectedEvent(activeDragCard.comic.event);
        setSelectedComicData(activeDragCard.comic);
      }

      resetDrag();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (frameId !== null) {
          cancelAnimationFrame(frameId);
          frameId = null;
        }
      } else {
        requestRender();
      }
    };

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);

    // Pointerup is registered on window only, avoiding duplicate bubbling.
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", resetDrag);
    window.addEventListener("blur", resetDrag);
    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    // Initial draw and initial physics settling.
    requestRender();

    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);

      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", resetDrag);
      window.removeEventListener("blur", resetDrag);

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [events, viewportWidth, shuffleCount, canvasRef, setSelectedEvent, setSelectedComicData]);

  return (
    <div className="relative w-full p-0 m-0 overflow-x-hidden flex justify-center select-none">
      <canvas
        ref={canvasRef}
        className="cursor-grab active:cursor-grabbing block touch-pan-y"
      />

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