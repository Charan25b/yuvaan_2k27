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
  leftPageChildren?: React.ReactNode;
  rightPageChildren?: React.ReactNode;
}

const ENABLE_PLACEHOLDER_VIDEOS = true;

export function OpenComicBookModal({
  event,
  comicData,
  isOpen,
  onClose,
  leftPageChildren,
  rightPageChildren,
}: OpenComicBookModalProps) {
  const [displayedEvent, setDisplayedEvent] = useState<EventItem | null>(event);
  const [displayedComic, setDisplayedComic] = useState<ComicBookData | null>(comicData);

  // States: "closed" -> "prologue-flipping" -> "opened" -> "closing"
  const [bookState, setBookState] = useState<"closed" | "prologue-flipping" | "opened" | "closing">("closed");
  const [turningPage, setTurningPage] = useState<number>(0);

  if (event && event !== displayedEvent) {
    setDisplayedEvent(event);
  }
  if (comicData && comicData !== displayedComic) {
    setDisplayedComic(comicData);
  }

  const [isMounted, setIsMounted] = useState(isOpen);
  const openTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isOpen && isMounted) {
      setBookState("closed");
      setTurningPage(0);
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      openTimersRef.current.forEach(clearTimeout);

      // Perfectly paced timing intervals for opening prologue pages
      const t1 = setTimeout(() => {
        setBookState("prologue-flipping");
        setTurningPage(1);
      }, 70);
      const t2 = setTimeout(() => setTurningPage(2), 190);
      const t3 = setTimeout(() => setTurningPage(3), 310);
      const t4 = setTimeout(() => setTurningPage(4), 430);
      const t5 = setTimeout(() => setTurningPage(5), 550);
      const t6 = setTimeout(() => setTurningPage(6), 670);
      const t7 = setTimeout(() => {
        setTurningPage(0);
        setBookState("opened");
      }, 800);

      openTimersRef.current = [t1, t2, t3, t4, t5, t6, t7];

      return () => {
        openTimersRef.current.forEach(clearTimeout);
      };
    } else if (!isOpen && isMounted) {
      openTimersRef.current.forEach(clearTimeout);
      setBookState("closed");
      setTurningPage(0);
      const unmountTimer = setTimeout(() => {
        setIsMounted(false);
      }, 20);

      return () => clearTimeout(unmountTimer);
    }
  }, [isOpen, isMounted]);

  if (isOpen && !isMounted) {
    setIsMounted(true);
  }

  useEffect(() => {
    if (!isMounted) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isMounted]);

  const handleClose = useCallback(() => {
    if (ENABLE_PLACEHOLDER_VIDEOS) {
      stopAllPlaceholderVideos();
    }
    // Instantly switch to closing state so pages hide immediately without lingering
    openTimersRef.current.forEach(clearTimeout);
    setBookState("closing");
    setTurningPage(0);

    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setIsMounted(false);
      onClose();
    }, 250);
  }, [onClose]);

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

  const isClosed = bookState === "closed" || bookState === "closing";
  const isOpened = bookState === "opened";
  const isFlippingPrologue = bookState === "prologue-flipping" && !isClosed;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Comic Book Spread"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 lg:p-8 select-none"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.88)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-5xl flex flex-col items-center"
        style={{ perspective: "3000px" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="mb-3 flex items-center justify-end w-full px-2">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-1.5 rounded-full bg-[#EF4444] text-white border-2 border-[#1C1917] font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[3px_3px_0px_#1C1917] hover:bg-[#DC2626] active:translate-y-[1px] transition-colors cursor-pointer"
          >
            <span>✕ CLOSE BOOK</span>
            <span className="text-[10px] font-mono text-white/80 hidden sm:inline">[ESC]</span>
          </button>
        </div>

        {/* 2-Page Comic Spread Container */}
        <div
          className="relative w-full flex flex-row items-stretch rounded-2xl md:rounded-3xl border-4 border-[#1C1917] bg-[#FFFDF7] shadow-[14px_22px_0px_#0C0A09]"
          style={{
            transformStyle: "preserve-3d",
            minHeight: "540px",
            height: "min(680px, calc(86vh - 40px))",
            transform: isClosed ? "scale(0.85) rotateX(8deg)" : "scale(1) rotateX(0deg)",
            transition: "transform 350ms cubic-bezier(0.25, 1, 0.5, 1)",
            overflow: "hidden",
            willChange: "transform",
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

          {/* Left Page (Hidden instantly on closing) */}
          <div
            className="relative flex-1 bg-[#FFFDF7] border-r border-[#1C1917]/25 rounded-l-2xl md:rounded-l-3xl p-4 sm:p-6 flex flex-col justify-center overflow-y-auto"
            style={{
              transformOrigin: "right center",
              transformStyle: "preserve-3d",
              transition: "transform 350ms cubic-bezier(0.25, 1, 0.5, 1), opacity 300ms ease",
              transform: isOpened ? "rotateY(0deg)" : "rotateY(90deg)",
              opacity: isOpened && !isClosed ? 1 : 0,
              willChange: "transform, opacity",
            }}
          >
            {leftPageChildren ?? (ENABLE_PLACEHOLDER_VIDEOS ? <PlaceholderLeftPage /> : null)}
          </div>

          {/* Center Spine Crease & Binding Staples */}
          <div className="relative w-6 sm:w-8 flex flex-col justify-between items-center py-8 pointer-events-none bg-gradient-to-r from-black/15 via-black/30 to-black/15 border-x border-[#1C1917]/25 shadow-inner z-30">
            <div className="w-1.5 h-6 rounded-sm bg-[#E2E8F0] border border-[#0F172A] shadow-sm" />
            <div className="w-[1px] h-full bg-[#1C1917]/40 my-3" />
            <div className="w-1.5 h-6 rounded-sm bg-[#E2E8F0] border border-[#0F172A] shadow-sm" />
          </div>

          {/* Right Page (Hidden instantly on closing) */}
          <div
            className="relative flex-1 bg-[#FFFDF7] border-l border-[#1C1917]/25 rounded-r-2xl md:rounded-r-3xl p-4 sm:p-6 flex flex-col justify-center overflow-y-auto"
            style={{
              transformOrigin: "left center",
              transformStyle: "preserve-3d",
              transition: "transform 350ms cubic-bezier(0.25, 1, 0.5, 1), opacity 300ms ease",
              transform: isOpened ? "rotateY(0deg)" : "rotateY(-90deg)",
              opacity: isOpened && !isClosed ? 1 : 0,
              willChange: "transform, opacity",
            }}
          >
            {rightPageChildren ?? (ENABLE_PLACEHOLDER_VIDEOS ? <PlaceholderRightPage /> : null)}
          </div>

          {/* 6 Opening Prologue Pages Flipping Across Spine */}
          {isFlippingPrologue && turningPage > 0 && (
            <div
              className="absolute top-0 bottom-0 w-1/2 bg-[#FFF3CD] border-2 border-[#1C1917] rounded-r-2xl z-40 flex items-center justify-center shadow-2xl"
              style={{
                left: "50%",
                transformOrigin: "left center",
                transform: `rotateY(${
                  turningPage === 1 ? -25 : turningPage === 2 ? -52 : turningPage === 3 ? -80 : turningPage === 4 ? -110 : turningPage === 5 ? -142 : -172
                }deg)`,
                transition: "transform 110ms cubic-bezier(0.25, 1, 0.5, 1)",
                backfaceVisibility: "hidden",
                backgroundImage: "radial-gradient(#1C1917 1.5px, transparent 1.5px)",
                backgroundSize: "14px 14px",
                willChange: "transform",
              }}
            >
              <div className="bg-[#1C1917] text-[#FFCC00] px-3 py-1 font-black text-xs uppercase border border-[#FFCC00] shadow-[2px_2px_0px_#EF4444]">
                PROLOGUE PAGE {turningPage}/6...
              </div>
            </div>
          )}

          {/* Front Cover Leaf */}
          <div
            className="absolute inset-y-0 left-0 w-1/2 bg-[#FF4500] border-4 border-[#1C1917] rounded-l-2xl md:rounded-l-3xl z-50 flex flex-col justify-between p-8 shadow-2xl"
            style={{
              transformOrigin: "left center",
              transformStyle: "preserve-3d",
              transition: "transform 400ms cubic-bezier(0.25, 1, 0.5, 1)",
              transform: isOpened || isFlippingPrologue ? "rotateY(-180deg)" : "rotateY(0deg)",
              pointerEvents: isOpened ? "none" : "auto",
              backgroundImage: "radial-gradient(#1C1917 1.5px, transparent 1.5px)",
              backgroundSize: "16px 16px",
              willChange: "transform",
            }}
          >
            <div className="bg-[#FFCC00] border-2 border-[#1C1917] px-3 py-1 font-black text-xs uppercase self-start shadow-[3px_3px_0px_#1C1917] text-[#1C1917]">
              YUVAAN '27 • ISSUE #{displayedComic.issueNumber.toString().padStart(2, "0")}
            </div>
            <div className="text-center my-auto">
              <h1 className="text-3xl sm:text-4xl font-black uppercase text-[#FFFDF7] tracking-wider drop-shadow-[3px_3px_0px_#1C1917] mb-2">
                {displayedEvent.title}
              </h1>
              <p className="text-xs sm:text-sm font-black text-[#FFCC00] uppercase tracking-widest bg-[#1C1917] inline-block px-3 py-1 border border-[#FFCC00] shadow-[2px_2px_0px_#000]">
                {displayedComic.burstText}
              </p>
            </div>
            <div className="flex items-center justify-between text-white font-black text-xs uppercase">
              <span>UNFOLDING BOOK...</span>
              <span>&rarr;</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}