import React from "react";
import { Container } from "@/components/ui/Container";

/**
 * 9 SCROLLING HERO COMIC IMAGES
 * All 9 files exist in `frontend/public/`.
 * Eagerly loaded to prevent scroll freezing/stutter.
 */
export const HERO_IMAGES: string[] = [
  // Column 1
  "/spiderman.jpg",
  "/dragon ball.jpg",
  "/dr doom.jpg",

  // Column 2 (reverse scroll)
  "/beserk.jpg",
  "/batman.jpg",
  "/jojo.jpg",

  // Column 3
  "/vagabond.jpg",
  "/superman.jpg",
  "/zoro.jpg",
];

function ComicScene({ src }: { src: string }) {
  return (
    <div className="hero-comic-scene" aria-hidden="true">
      <img
        src={src}
        alt="Festival Artwork"
        className="hero-comic-img select-none pointer-events-none"
        loading="eager"
        decoding="async"
      />
    </div>
  );
}

function ComicRail({
  images,
  reverse = false,
}: {
  images: string[];
  reverse?: boolean;
}) {
  return (
    <div
      className={`hero-comic-rail${reverse ? " hero-comic-rail--reverse" : ""}`}
    >
      <div className="hero-comic-track">
        {[0, 1].map((group) => (
          <div className="hero-comic-sequence" key={group}>
            {images.map((src, i) => (
              <ComicScene key={`${group}-${i}`} src={src} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function HeroSection() {
  const col1 = HERO_IMAGES.slice(0, 3);
  const col2 = HERO_IMAGES.slice(3, 6);
  const col3 = HERO_IMAGES.slice(6, 9);

  return (
    <section className="yuvaan-hero" aria-labelledby="hero-title">
      <div className="hero-artwork" aria-hidden="true">
        <ComicRail images={col1} />
        <ComicRail images={col2} reverse />
        <ComicRail images={col3} />
      </div>
      <div className="hero-ink-wash" aria-hidden="true" />

      <Container className="hero-content">
        <div className="hero-copy">
          <h1 id="hero-title" className="hero-title-comic">
            <span className="hero-title-row hero-title-row--top">
              <span className="hero-word">ENTER</span>
              <span className="hero-word">THE</span>
            </span>

            <span className="hero-title-row hero-title-row--bottom">
              <span className="hero-word hero-word--brand">YUVAAN</span>

              <span className="hero-word-group">
                <span className="hero-word hero-word--verse">VERSE</span>
                <span className="hero-word hero-word--bang">!</span>
              </span>
            </span>
          </h1>
        </div>
      </Container>
    </section>
  );
}
