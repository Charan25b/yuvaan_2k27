"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { EventItem } from "@/lib/data/festivalData";
import {
  PlaceholderLeftPage,
  PlaceholderRightPage,
  stopAllPlaceholderVideos,
} from "./PlaceholderSpread";

export interface ComicBookData {
  event: EventItem;
  issueNumber: number;
  bgColor: string;
  accentColor: string;
  burstText: string;
}

export interface OpenComicBookModalProps {
  event: EventItem | null;
  comicData: ComicBookData | null;
  isOpen: boolean;
  onClose: () => void;
  // Content slots for real page content
  leftPageChildren?: React.ReactNode;
  rightPageChildren?: React.ReactNode;
}

const ANIMATION_DURATION_MS = 380;

// ============================================================================
// ⚠️ TEMPORARY PLACEHOLDER FEATURE FLAG
// Set to `true` to display the funny 4x Miku video grid.
// Set to `false` (or pass custom children props) to instantly revert to blank pages.
// ============================================================================
const ENABLE_PLACEHOLDER_VIDEOS = true;

export function OpenComicBookModal({
  event,
  comicData,
  isOpen,
  onClose,
  leftPageChildren,
  rightPageChildren,
}: OpenComicBookModalProps) {
  // Retain last non-null event & comic in state so they remain rendered during exit transition
  const [displayedEvent, setDisplayedEvent] = useState<EventItem | null>(event);
  const [displayedComic, setDisplayedComic] = useState<ComicBookData | null>(comicData);

  // React-recommended pattern: adjust state during render when props change
  if (event && event !== displayedEvent) {
    setDisplayedEvent(event);
  }
  if (comicData && comicData !== displayedComic) {
    setDisplayedComic(comicData);
  }

  // Mount & visibility states for CSS 3D transitions
  const [isMounted, setIsMounted] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);

  if (isOpen && !isMounted) {
    setIsMounted(true);
  }

  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);

  // Trigger smooth enter / exit transitions
  useEffect(() => {
    if (isOpen && isMounted) {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      // Double requestAnimationFrame ensures initial closed pose is painted before transition fires
      const raf1 = requestAnimationFrame(() => {
        const raf2 = requestAnimationFrame(() => {
          setIsVisible(true);
        });
        rafRef.current = raf2;
      });
      return () => {
        cancelAnimationFrame(raf1);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    } else if (!isOpen && isMounted) {
      // Exit transition triggered from parent prop
      const animTimer = setTimeout(() => {
        setIsVisible(false);
      }, 0);
      closeTimerRef.current = setTimeout(() => {
        setIsMounted(false);
      }, ANIMATION_DURATION_MS + 40);

      return () => {
        clearTimeout(animTimer);
        if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      };
    }
  }, [isOpen, isMounted]);

  // Lock background body scroll while modal is active
  useEffect(() => {
    if (!isMounted) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isMounted]);

  // Close handler triggered from user interactions (button, ESC, backdrop)
  const handleClose = useCallback(() => {
    if (!isVisible) return;
    // Mute/pause placeholder videos instantly if active
    if (ENABLE_PLACEHOLDER_VIDEOS) {
      stopAllPlaceholderVideos();
    }
    setIsVisible(false);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setIsMounted(false);
      onClose();
    }, ANIMATION_DURATION_MS + 40);
  }, [isVisible, onClose]);

  // ESC key listener
  useEffect(() => {
    if (!isMounted) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        handleClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMounted, handleClose]);

  if (!isMounted || !displayedEvent || !displayedComic) return null;

  const pageTransition = `transform ${ANIMATION_DURATION_MS}ms cubic-bezier(0.16, 1, 0.3, 1)`;
  const backdropTransition = `opacity ${ANIMATION_DURATION_MS}ms ease`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Comic Book Spread"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 lg:p-8 select-none"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.82)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        opacity: isVisible ? 1 : 0,
        transition: backdropTransition,
      }}
      onClick={handleClose}
    >
      {/* 3D Perspective Stage — overflow visible so rotating 3D elements are never clipped */}
      <div
        className="relative w-full max-w-5xl flex flex-col items-center"
        style={{
          perspective: "2000px",
          transform: isVisible ? "scale(1) translateY(0)" : "scale(0.88) translateY(24px)",
          opacity: isVisible ? 1 : 0,
          transition: `transform ${ANIMATION_DURATION_MS}ms cubic-bezier(0.16, 1, 0.3, 1), opacity ${ANIMATION_DURATION_MS}ms ease`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar with Close Button */}
        <div className="mb-3 flex items-center justify-end w-full px-2">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-1.5 rounded-full bg-[#FDE047] text-[#1C1917] border-2 border-[#1C1917] font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[3px_3px_0px_#1C1917] hover:bg-[#FACC15] active:translate-y-[1px] transition-colors cursor-pointer"
          >
            <span>✕ CLOSE BOOK</span>
            <span className="text-[10px] font-mono text-black/60 hidden sm:inline">[ESC]</span>
          </button>
        </div>

        {/* 2-Page Comic Spread Container */}
        <div
          className="relative w-full flex flex-row items-stretch rounded-2xl md:rounded-3xl border-4 border-[#1C1917] bg-[#FFFDF7] shadow-[12px_18px_0px_#0C0A09]"
          style={{
            transformStyle: "preserve-3d",
            minHeight: "540px",
            height: "min(680px, calc(86vh - 40px))",
            overflow: "visible",
          }}
        >
          {/* Halftone Texture Overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-5 mix-blend-multiply z-10 rounded-2xl md:rounded-3xl"
            style={{
              backgroundImage:
                "radial-gradient(#000 1.5px, transparent 1.5px), radial-gradient(#000 1.5px, transparent 1.5px)",
              backgroundSize: "16px 16px",
              backgroundPosition: "0 0, 8px 8px",
            }}
          />

          {/* Left Page */}
          <div
            className="relative flex-1 bg-[#FFFDF7] border-r border-[#1C1917]/25 rounded-l-2xl md:rounded-l-3xl p-3 sm:p-4 md:p-5 flex flex-col justify-center"
            style={{
              transformOrigin: "right center",
              transform: isVisible ? "rotateY(0deg)" : "rotateY(90deg)",
              transition: pageTransition,
              overflow: "hidden",
            }}
          >
            {/* Custom Content or Reversible Placeholder */}
            {leftPageChildren ??
              (ENABLE_PLACEHOLDER_VIDEOS ? <PlaceholderLeftPage /> : null)}
          </div>

          {/* Center Spine Crease & Binding Staples */}
          <div className="relative w-6 sm:w-8 flex flex-col justify-between items-center py-8 pointer-events-none bg-gradient-to-r from-black/15 via-black/30 to-black/15 border-x border-[#1C1917]/25 shadow-inner z-20">
            <div className="w-1.5 h-6 rounded-sm bg-[#E2E8F0] border border-[#0F172A] shadow-sm" />
            <div className="w-[1px] h-full bg-[#1C1917]/40 my-3" />
            <div className="w-1.5 h-6 rounded-sm bg-[#E2E8F0] border border-[#0F172A] shadow-sm" />
          </div>

          {/* Right Page */}
          <div
            className="relative flex-1 bg-[#FFFDF7] border-l border-[#1C1917]/25 rounded-r-2xl md:rounded-r-3xl p-3 sm:p-4 md:p-5 flex flex-col justify-center"
            style={{
              transformOrigin: "left center",
              transform: isVisible ? "rotateY(0deg)" : "rotateY(-90deg)",
              transition: pageTransition,
              overflow: "hidden",
            }}
          >
            {/* Custom Content or Reversible Placeholder */}
            {rightPageChildren ??
              (ENABLE_PLACEHOLDER_VIDEOS ? <PlaceholderRightPage /> : null)}
          </div>
        </div>
      </div>
    </div>
  );
}
