
"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";

import { GALLERY_DATA } from "@/lib/data/festivalData";

// --------------------------------------------------
// CONFIGURATION
// --------------------------------------------------

const categories = [
  "All",
  "Pro-Nites & Concerts",
  "Competitions",
  "Campus Life",
  "Exhibitions",
] as const;

// --------------------------------------------------
// GALLERY PAGE
// --------------------------------------------------

export default function GalleryPage() {
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLDivElement | null>(null);
  const galleryRef = useRef<HTMLDivElement | null>(null);
  const touchStartX = useRef<number | null>(null);

  const [selectedCategory, setSelectedCategory] =
    useState<string>("All");

  const [activeIndex, setActiveIndex] =
    useState<number | null>(null);

  const filteredItems = GALLERY_DATA.filter(
    (item) =>
      selectedCategory === "All" ||
      item.category === selectedCategory
  );

  const activeItem =
    activeIndex !== null ? filteredItems[activeIndex] : null;

  // --------------------------------------------------
  // LIGHTBOX CONTROLS
  // --------------------------------------------------

  const closeViewer = () => setActiveIndex(null);

  const nextImage = () => {
    setActiveIndex((current) => {
      if (current === null || !filteredItems.length) return current;
      return (current + 1) % filteredItems.length;
    });
  };

  const previousImage = () => {
    setActiveIndex((current) => {
      if (current === null || !filteredItems.length) return current;
      return (current - 1 + filteredItems.length) % filteredItems.length;
    });
  };

  // --------------------------------------------------
  // KEYBOARD CONTROLS
  // --------------------------------------------------

  useEffect(() => {
    if (activeIndex === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeViewer();
      if (event.key === "ArrowRight") nextImage();
      if (event.key === "ArrowLeft") previousImage();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeIndex, filteredItems.length]);

  // --------------------------------------------------
  // GSAP ENTRANCE
  // --------------------------------------------------

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headingRef.current,
        { y: -18, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: "power3.out",
        }
      );

      if (galleryRef.current) {
        gsap.fromTo(
          galleryRef.current.children,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.55,
            stagger: 0.07,
            ease: "power3.out",
          }
        );
      }
    }, sceneRef);

    return () => ctx.revert();
  }, [selectedCategory]);

  // --------------------------------------------------
  // SWIPE CONTROLS
  // --------------------------------------------------

  const handleTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (touchStartX.current === null) return;

    const difference =
      event.changedTouches[0].clientX - touchStartX.current;

    if (Math.abs(difference) > 50) {
      difference < 0 ? nextImage() : previousImage();
    }

    touchStartX.current = null;
  };

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <div
      ref={sceneRef}
      className="cyber-sans relative min-h-screen w-full overflow-hidden bg-[#10151d] text-white"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .cyber-sans {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        .cyber-display {
          font-family: 'Orbitron', sans-serif;
        }

        .cyber-title {
          background: linear-gradient(180deg, #fff 0%, #c4cbd5 55%, #7f8997 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .cyber-grid {
          background-image:
            linear-gradient(rgba(255,255,255,.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.2) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        /* ==============================================
           CYBERTRONIAN IMAGE FRAMES
        ============================================== */

        .cyber-frame {
          position: relative;
          isolation: isolate;
          overflow: hidden;
          padding: 7px;

          background:
            linear-gradient(
              145deg,
              #687582 0%,
              #303d49 18%,
              #151e29 55%,
              #46515c 100%
            );

          border: 1px solid rgba(180, 194, 208, .55);

          clip-path: polygon(
            0 15px,
            15px 0,
            calc(100% - 23px) 0,
            100% 23px,
            100% calc(100% - 15px),
            calc(100% - 15px) 100%,
            23px 100%,
            0 calc(100% - 23px)
          );

          transition:
            border-color .3s ease,
            background .3s ease,
            filter .3s ease;
        }

        /* Inner metallic border */

        .cyber-frame::before {
          content: "";
          position: absolute;
          inset: 3px;
          z-index: 2;
          pointer-events: none;

          border: 1px solid rgba(205, 216, 226, .3);

          clip-path: polygon(
            0 12px,
            12px 0,
            calc(100% - 18px) 0,
            100% 18px,
            100% calc(100% - 12px),
            calc(100% - 12px) 100%,
            18px 100%,
            0 calc(100% - 18px)
          );
        }

        /* Red Energon top strip */

        .cyber-frame::after {
          content: "";
          position: absolute;
          top: 0;
          left: 18px;
          width: 42px;
          height: 3px;
          z-index: 5;
          pointer-events: none;

          background: linear-gradient(
            90deg,
            #b83232,
            #ed7770
          );

          box-shadow: 0 0 9px rgba(184, 50, 50, .65);
        }

        .cyber-frame:hover {
          border-color: rgba(226, 184, 63, .9);
          filter: drop-shadow(0 0 8px rgba(184, 50, 50, .22));
        }

        /* Actual image area */

        .cyber-image-well {
          position: absolute;
          inset: 7px;
          overflow: hidden;

          background: #090e16;

          clip-path: polygon(
            0 9px,
            9px 0,
            calc(100% - 15px) 0,
            100% 15px,
            100% calc(100% - 9px),
            calc(100% - 9px) 100%,
            15px 100%,
            0 calc(100% - 15px)
          );
        }

        .cyber-image {
          transition:
            transform .45s ease,
            filter .35s ease;
        }

        .cyber-frame:hover .cyber-image {
          transform: scale(1.055);
          filter: brightness(1.12);
        }

        /* Frame corner details */

        .cyber-corner {
          position: absolute;
          z-index: 6;
          width: 14px;
          height: 14px;
          pointer-events: none;
        }

        .cyber-corner-tl {
          top: 3px;
          left: 3px;
          border-top: 2px solid #d34a4a;
          border-left: 2px solid #d34a4a;
        }

        .cyber-corner-br {
          bottom: 3px;
          right: 3px;
          border-bottom: 2px solid #8588d9;
          border-right: 2px solid #8588d9;
        }

        /* Small mechanical rivets */

        .cyber-rivet {
          position: absolute;
          z-index: 6;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #8996a2;
          box-shadow: 0 0 3px rgba(255,255,255,.4);
          pointer-events: none;
        }

        .cyber-rivet-tl {
          top: 5px;
          left: 22px;
        }

        .cyber-rivet-tr {
          top: 5px;
          right: 22px;
        }

        .cyber-rivet-bl {
          bottom: 5px;
          left: 22px;
        }

        .cyber-rivet-br {
          bottom: 5px;
          right: 22px;
        }

        /* Bottom Energon indicator */

        .cyber-energy-strip {
          position: absolute;
          right: 13px;
          bottom: 13px;
          z-index: 7;
          display: flex;
          align-items: center;
          gap: 4px;
          pointer-events: none;
        }

        .cyber-energy-strip span {
          display: block;
          height: 3px;
        }

        .cyber-energy-red {
          width: 17px;
          background: #c43b42;
          box-shadow: 0 0 6px rgba(196, 59, 66, .7);
        }

        .cyber-energy-gold {
          width: 9px;
          background: #e2b83f;
        }

        .cyber-energy-blue {
          width: 5px;
          background: #777bd0;
        }

        .cyber-accent-line {
          background: linear-gradient(90deg, #b83232, #e2b83f, #777bd0);
        }

        /* ==============================================
           FILTERS AND VIEWER
        ============================================== */

        .cyber-filter {
          clip-path: polygon(
            0 0,
            calc(100% - 9px) 0,
            100% 9px,
            100% 100%,
            9px 100%,
            0 calc(100% - 9px)
          );
          transition: all .2s ease;
        }

        .cyber-filter-active {
          background: linear-gradient(120deg, #9f252c, #571e29);
          border-color: #e2b83f;
          box-shadow: 0 0 12px rgba(184,50,50,.2);
        }

        .cyber-filter:not(.cyber-filter-active):hover {
          border-color: #777bd0;
          background: #292b43;
        }

        .viewer-control {
          background: linear-gradient(145deg, #3a4652, #171e29);
          border: 1px solid #748293;
          clip-path: polygon(
            0 0,
            calc(100% - 11px) 0,
            100% 11px,
            100% 100%,
            11px 100%,
            0 calc(100% - 11px)
          );
          transition: all .2s ease;
        }

        .viewer-control:hover {
          background: #a52c35;
          border-color: #e2b83f;
          box-shadow: 0 0 15px rgba(184,50,50,.3);
        }

        .viewer-shell {
          background: linear-gradient(145deg, #394550, #171f29 60%, #111720);
          border: 1px solid rgba(190, 202, 214, .55);
          box-shadow:
            0 0 0 4px rgba(20,27,37,.8),
            0 0 35px rgba(184,50,50,.12);

          clip-path: polygon(
            0 18px,
            18px 0,
            calc(100% - 18px) 0,
            100% 18px,
            100% calc(100% - 18px),
            calc(100% - 18px) 100%,
            18px 100%,
            0 calc(100% - 18px)
          );
        }
      `}</style>

      {/* ------------------------------------------------
          CYBERTRON BACKGROUND
      ------------------------------------------------ */}

      <div
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/cybertron-bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-[#111820]/35" />

        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 15%, rgba(184,50,50,0.12), transparent 65%), linear-gradient(180deg, rgba(10,15,22,0.1), rgba(10,15,22,0.55))",
          }}
        />

        <div className="cyber-grid absolute inset-0 opacity-[0.035]" />

        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, transparent 55%, rgba(10,15,22,0.45) 100%)",
          }}
        />
      </div>

      {/* ------------------------------------------------
          MAIN CONTENT
      ------------------------------------------------ */}

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pt-14 pb-24 sm:px-6 lg:px-8">

        {/* HEADER */}

        <header
          ref={headingRef}
          className="mb-14 flex flex-col items-center text-center"
        >
          <div className="mb-4 flex items-center gap-3">
            <span className="h-[2px] w-12 bg-gradient-to-r from-transparent to-[#b83232]" />

            <span className="cyber-display text-[10px] font-bold tracking-[0.3em] text-[#e2b83f] uppercase sm:text-xs">
              CYBERTRON // VISUAL ARCHIVE
            </span>

            <span className="h-[2px] w-12 bg-gradient-to-l from-transparent to-[#777bd0]" />
          </div>

          <h1 className="cyber-display cyber-title text-4xl font-black tracking-[0.08em] uppercase sm:text-6xl md:text-7xl">
            THE GALLERY
          </h1>

          <div className="mt-5 flex items-center gap-2">
            <span className="h-1 w-14 bg-[#b83232]" />
            <span className="h-1 w-7 bg-[#e2b83f]" />
            <span className="h-1 w-3 bg-[#777bd0]" />
          </div>

          <p className="mt-6 max-w-2xl text-sm font-medium leading-relaxed text-[#c0c8d0] sm:text-base">
            Every moment tells a story. Explore the unforgettable
            memories, electrifying performances and celebrations
            that define Yuvaan at IIIT Guwahati.
          </p>

          {/* CYBERTRONIAN STATUS STRIP */}

          <div className="mt-7 flex items-center gap-3 border border-[#89949e]/40 bg-[#141c27]/85 px-5 py-2.5 backdrop-blur-md">
            <span className="h-2 w-2 bg-[#b83232] shadow-[0_0_9px_#b83232]" />

            <span className="cyber-display text-[9px] font-bold tracking-[0.2em] text-[#d5dce2] uppercase">
              Visual Transmission Online
            </span>

            <span className="h-2 w-2 bg-[#777bd0] shadow-[0_0_9px_#777bd0]" />
          </div>
        </header>

        {/* CATEGORY FILTERS */}

        <section className="mb-9">
          <div className="mb-5 flex items-center justify-between border-b border-[#89949e]/40 pb-3">
            <div className="flex items-center gap-3">
              <span className="h-4 w-1 bg-[#b83232]" />

              <h2 className="cyber-display text-xs font-bold tracking-[0.15em] text-[#e2b83f] uppercase sm:text-sm">
                Archive Selection
              </h2>
            </div>

            <span className="cyber-display text-[9px] font-bold tracking-wider text-[#aeb8c1] uppercase">
              {filteredItems.length} Images
            </span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {categories.map((category) => {
              const selected = selectedCategory === category;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`cyber-filter border px-4 py-2.5 text-[10px] font-extrabold tracking-wide uppercase sm:text-xs ${
                    selected
                      ? "cyber-filter-active text-white"
                      : "border-[#89949e]/50 bg-[#18212c]/90 text-[#c0c8d0]"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </section>

        {/* ------------------------------------------------
            IMAGE GRID
        ------------------------------------------------ */}

        <section
          ref={galleryRef}
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4"
        >
          {filteredItems.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Open gallery image ${index + 1}`}
              className="cyber-frame group relative aspect-square cursor-pointer text-left"
            >
              {/* IMAGE WELL */}

              <div className="cyber-image-well">
                <Image
                  src={`/gallery/${item.id}.jpg`}
                  alt={`Yuvaan gallery photograph ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="cyber-image object-cover"
                />
              </div>

              {/* FRAME CORNERS */}

              <span className="cyber-corner cyber-corner-tl" />
              <span className="cyber-corner cyber-corner-br" />

              {/* METALLIC RIVETS */}

              <span className="cyber-rivet cyber-rivet-tl" />
              <span className="cyber-rivet cyber-rivet-tr" />
              <span className="cyber-rivet cyber-rivet-bl" />
              <span className="cyber-rivet cyber-rivet-br" />

              {/* ENERGON INDICATOR */}

              <div className="cyber-energy-strip">
                <span className="cyber-energy-red" />
                <span className="cyber-energy-gold" />
                <span className="cyber-energy-blue" />
              </div>

              {/* HOVER INDICATOR */}

              <div className="pointer-events-none absolute inset-[7px] z-[4] flex items-center justify-center bg-[#090e18]/0 opacity-0 transition-all duration-300 group-hover:bg-[#090e18]/30 group-hover:opacity-100">
                <div className="cyber-display border border-[#e2b83f]/70 bg-[#101722]/90 px-3 py-2 text-[9px] font-bold tracking-[0.2em] text-white uppercase">
                  Open Archive
                </div>
              </div>
            </button>
          ))}
        </section>

        {/* EMPTY STATE */}

        {filteredItems.length === 0 && (
          <div className="border border-dashed border-[#89949e]/50 bg-[#18212c]/90 px-6 py-20 text-center">
            <p className="cyber-display text-xl font-black text-[#b83232]">
              NO TRANSMISSIONS FOUND
            </p>

            <button
              type="button"
              onClick={() => setSelectedCategory("All")}
              className="mt-6 border border-[#e2b83f] bg-[#8f252d] px-5 py-2.5 text-xs font-black text-white uppercase hover:bg-[#b83232]"
            >
              View All Images
            </button>
          </div>
        )}

        {/* FOOTER */}

        <div className="mt-16 flex items-center justify-center gap-3">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#89949e]/50" />

          <span className="cyber-display text-[9px] font-bold tracking-[0.25em] text-[#89949e] uppercase">
            Yuvaan // End of Transmission
          </span>

          <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#89949e]/50" />
        </div>
      </main>

      {/* ------------------------------------------------
          CYBERTRONIAN IMAGE VIEWER
      ------------------------------------------------ */}

      {activeItem && activeIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Cybertronian image viewer"
          onClick={closeViewer}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#05080d]/95 p-3 backdrop-blur-xl sm:p-6"
        >
          {/* BACKGROUND ENERGY ACCENTS */}

          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(184,50,50,0.12),transparent_65%)]" />

          <div
            className="viewer-shell relative z-10 flex h-[82vh] w-full max-w-6xl flex-col p-3 sm:p-5"
            onClick={(event) => event.stopPropagation()}
          >
            {/* VIEWER TOP BAR */}

            <div className="mb-3 flex items-center justify-between border-b border-[#89949e]/30 px-2 pb-3 sm:px-4">
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center border border-[#b83232] bg-[#7c202b]/30">
                  <span className="cyber-display text-xs font-black text-[#e2b83f]">
                    C
                  </span>
                </div>

                <div>
                  <p className="cyber-display text-[9px] font-bold tracking-[0.2em] text-[#e2b83f] uppercase">
                    Cybertron Visual Database
                  </p>

                  <p className="mt-1 text-[8px] tracking-[0.15em] text-[#89949e] uppercase">
                    Image Transmission Active
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeViewer}
                aria-label="Close viewer"
                className="viewer-control flex h-9 w-9 cursor-pointer items-center justify-center text-xl text-white"
              >
                &times;
              </button>
            </div>

            {/* IMAGE VIEWER AREA */}

            <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-[#090e16]/70">
              <div className="pointer-events-none absolute inset-0 border border-[#89949e]/20" />

              <div className="pointer-events-none absolute top-0 left-0 h-12 w-12 border-t-2 border-l-2 border-[#b83232]" />

              <div className="pointer-events-none absolute right-0 bottom-0 h-12 w-12 border-r-2 border-b-2 border-[#777bd0]" />

              <Image
                key={String(activeItem.id)}
                src={`/gallery/${activeItem.id}.jpg`}
                alt="Enlarged Yuvaan photograph"
                fill
                priority
                sizes="100vw"
                className="object-contain p-3 sm:p-6"
              />
            </div>

            {/* VIEWER BOTTOM BAR */}

            <div className="mt-3 flex items-center justify-between border-t border-[#89949e]/30 px-2 pt-3 sm:px-4">
              <button
                type="button"
                onClick={previousImage}
                aria-label="Previous image"
                className="viewer-control flex h-10 w-12 cursor-pointer items-center justify-center text-xl text-white sm:w-16"
              >
                &#8249;
              </button>

              <div className="flex flex-col items-center gap-1">
                <span className="cyber-display text-[10px] font-bold tracking-[0.2em] text-[#e2b83f]">
                  {String(activeIndex + 1).padStart(3, "0")}
                  <span className="mx-2 text-[#89949e]">/</span>
                  {String(filteredItems.length).padStart(3, "0")}
                </span>

                <div className="flex items-center gap-1">
                  <span className="h-[2px] w-5 bg-[#b83232]" />
                  <span className="h-[2px] w-3 bg-[#e2b83f]" />
                  <span className="h-[2px] w-5 bg-[#777bd0]" />
                </div>
              </div>

              <button
                type="button"
                onClick={nextImage}
                aria-label="Next image"
                className="viewer-control flex h-10 w-12 cursor-pointer items-center justify-center text-xl text-white sm:w-16"
              >
                &#8250;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
