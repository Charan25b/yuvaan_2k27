
"use client";

import { useEffect, useRef, useState, type TouchEvent } from "react";
import Image from "next/image";
import gsap from "gsap";
import { GALLERY_DATA, type GalleryItem } from "@/lib/data/festivalData";
import { useLightbox } from "./useLightbox";

type GalleryFilter = "All" | GalleryItem["category"];

const GALLERY_CATEGORIES: GalleryFilter[] = [
  "All",
  ...new Set(GALLERY_DATA.map((item) => item.category)),
];

// --------------------------------------------------
// GALLERY PAGE
// --------------------------------------------------

export default function GalleryPage() {
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLDivElement | null>(null);
  const galleryRef = useRef<HTMLDivElement | null>(null);
  const touchStartX = useRef<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<GalleryFilter>("All");
  const filteredItems = GALLERY_DATA.filter(
    (item) => selectedCategory === "All" || item.category === selectedCategory
  );
  const lightboxItems = filteredItems.filter((item) => Boolean(item.imageSrc));
  const {
    activeIndex,
    activeItem,
    setActiveIndex,
    close: closeViewer,
    next: nextImage,
    previous: previousImage,
  } = useLightbox(lightboxItems);

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const startX = touchStartX.current;
    touchStartX.current = null;
    if (startX === null) return;

    const difference = event.changedTouches[0].clientX - startX;
    if (Math.abs(difference) > 50) {
      if (difference < 0) nextImage();
      else previousImage();
    }
  };

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
  // PAGE
  // --------------------------------------------------

  return (
    <div
      ref={sceneRef}
      className="gallery-page cyber-sans relative w-full overflow-hidden bg-[#10151d] pb-8 text-white"
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

        .cyber-filter {
          clip-path: polygon(0 0, calc(100% - 9px) 0, 100% 9px, 100% 100%, 9px 100%, 0 calc(100% - 9px));
          transition: color .2s ease, background .2s ease, border-color .2s ease;
        }

        .cyber-filter-active {
          border-color: #e2b83f;
          background: linear-gradient(120deg, #9f252c, #571e29);
          box-shadow: 0 0 12px rgba(184, 50, 50, .2);
        }

        .cyber-filter:not(.cyber-filter-active):hover {
          border-color: #777bd0;
          background: #292b43;
        }

        /* Photo frame well */

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

        .photo-well {
          display: grid;
          place-items: center;
          background:
            radial-gradient(ellipse at 50% 35%, rgba(119, 123, 208, .16), transparent 58%),
            linear-gradient(145deg, #161f2a, #090e16 72%);
        }

        .photo-frame-art {
          position: relative;
          display: grid;
          width: 78%;
          height: 78%;
          place-items: center;
          border: 1px dashed rgba(174, 184, 193, .5);
          background:
            linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px);
          background-size: 18px 18px;
          transition: border-color .35s ease;
        }

        .photo-number {
          position: absolute;
          top: .55rem;
          right: .65rem;
          color: #9ca8b5;
          font-size: .75rem;
          letter-spacing: .12em;
        }

        .photo-mark {
          display: grid;
          width: 2.75rem;
          height: 2.25rem;
          place-items: center;
          border: 1px solid rgba(226, 184, 63, .7);
          color: #e2b83f;
          font-size: 1.25rem;
        }

        .cyber-frame:hover .photo-frame-art {
          border-color: rgba(226, 184, 63, .8);
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

      `}</style>

      {/* ------------------------------------------------
          CYBERTRON BACKGROUND
      ------------------------------------------------ */}

      <div
        className="pointer-events-none fixed inset-0 z-0 bg-[#111820]"
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

      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-col px-4 pt-14 pb-8 sm:px-6 lg:px-8">
        <header
          ref={headingRef}
          className="mb-10 flex flex-col items-center text-center"
        >
          <div className="mb-4 flex items-center gap-3">
            <span className="h-px w-10 bg-[#b83232]" aria-hidden="true" />
            <span className="cyber-display text-xs font-bold tracking-[0.2em] text-[#e2b83f]">
              YUVAAN // PHOTO ARCHIVE
            </span>
            <span className="h-px w-10 bg-[#777bd0]" aria-hidden="true" />
          </div>

          <h1 className="cyber-display cyber-title text-4xl font-black tracking-[0.08em] uppercase sm:text-6xl md:text-7xl">
            The Gallery
          </h1>

          <div className="mt-5 flex items-center gap-2" aria-hidden="true">
            <span className="h-1 w-14 bg-[#b83232]" />
            <span className="h-1 w-7 bg-[#e2b83f]" />
            <span className="h-1 w-3 bg-[#777bd0]" />
          </div>

          <p className="mt-6 max-w-2xl text-base font-medium leading-relaxed text-[#c0c8d0]">
            Browse the Yuvaan photo archive.
          </p>
        </header>

        <section className="mb-8" aria-label="Gallery filters">
          <div className="mb-5 flex items-center justify-between border-b border-[#89949e]/40 pb-3">
            <div className="flex items-center gap-3">
              <span className="h-4 w-1 bg-[#b83232]" aria-hidden="true" />
              <h2 className="cyber-display text-xs font-bold tracking-[0.15em] text-[#e2b83f] uppercase sm:text-sm">
                Filter by category
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {GALLERY_CATEGORIES.map((category) => {
              const selected = selectedCategory === category;

              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={selected}
                  aria-controls="gallery-grid"
                  onClick={() => setSelectedCategory(category)}
                  className={`cyber-filter border px-4 py-2.5 text-xs font-extrabold tracking-wide uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e2b83f] ${
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

        <div
          ref={galleryRef}
          id="gallery-grid"
          aria-live="polite"
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4"
        >
          {filteredItems.map((item, index) => {
            const lightboxIndex = lightboxItems.findIndex(
              (photo) => photo.id === item.id
            );
            const frame = (
              <>
                <div
                  className={`cyber-image-well ${item.imageSrc ? "" : "photo-well"}`}
                >
                  {item.imageSrc ? (
                    <Image
                      src={item.imageSrc}
                      alt={item.imageAlt ?? item.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="cyber-image object-cover"
                    />
                  ) : (
                    <div className="photo-frame-art" aria-hidden="true">
                      <span className="photo-number">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="photo-mark">+</span>
                    </div>
                  )}
                </div>

                <span className="cyber-corner cyber-corner-tl" />
                <span className="cyber-corner cyber-corner-br" />
                <span className="cyber-rivet cyber-rivet-tl" />
                <span className="cyber-rivet cyber-rivet-tr" />
                <span className="cyber-rivet cyber-rivet-bl" />
                <span className="cyber-rivet cyber-rivet-br" />

                <div className="cyber-energy-strip" aria-hidden="true">
                  <span className="cyber-energy-red" />
                  <span className="cyber-energy-gold" />
                  <span className="cyber-energy-blue" />
                </div>
              </>
            );

            return item.imageSrc ? (
              <button
                key={item.id}
                type="button"
                className="cyber-frame relative aspect-square cursor-zoom-in text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e2b83f]"
                aria-label={`View ${item.title}`}
                onClick={() => setActiveIndex(lightboxIndex)}
              >
                {frame}
              </button>
            ) : (
              <div key={item.id} className="cyber-frame relative aspect-square">
                {frame}
              </div>
            );
          })}
        </div>
      </main>

      {activeItem?.imageSrc && activeIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#05080d]/95 p-3 backdrop-blur-sm sm:p-6"
          onClick={closeViewer}
        >
          <div
            className="relative flex h-[min(82vh,850px)] w-full max-w-6xl flex-col border border-[#89949e]/50 bg-[#111820] p-3 shadow-2xl sm:p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between border-b border-[#89949e]/30 pb-3">
              <p className="cyber-display text-[10px] font-bold tracking-[0.18em] text-[#e2b83f] uppercase sm:text-xs">
                {activeItem.title}
              </p>
              <button
                type="button"
                onClick={closeViewer}
                aria-label="Close photo viewer"
                autoFocus
                className="flex h-9 w-9 items-center justify-center border border-[#89949e]/60 text-xl text-white transition hover:border-[#e2b83f] hover:text-[#e2b83f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e2b83f]"
              >
                &times;
              </button>
            </div>

            <div
              className="relative min-h-0 flex-1 touch-pan-y bg-[#090e16]"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <Image
                key={activeItem.id}
                src={activeItem.imageSrc}
                alt={activeItem.imageAlt ?? activeItem.title}
                fill
                priority
                sizes="100vw"
                className="object-contain p-2 sm:p-5"
              />
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-[#89949e]/30 pt-3">
              <button
                type="button"
                onClick={previousImage}
                aria-label="Previous photo"
                className="flex h-10 w-12 items-center justify-center border border-[#89949e]/50 text-2xl text-white transition hover:border-[#e2b83f] hover:text-[#e2b83f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e2b83f]"
              >
                &#8249;
              </button>
              <span className="cyber-display text-[10px] font-bold tracking-[0.18em] text-[#c0c8d0]">
                {String(activeIndex + 1).padStart(2, "0")} / {String(lightboxItems.length).padStart(2, "0")}
              </span>
              <button
                type="button"
                onClick={nextImage}
                aria-label="Next photo"
                className="flex h-10 w-12 items-center justify-center border border-[#89949e]/50 text-2xl text-white transition hover:border-[#e2b83f] hover:text-[#e2b83f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e2b83f]"
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
