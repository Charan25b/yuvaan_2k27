import React from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

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

function ComicRail({ images, reverse = false }: { images: string[]; reverse?: boolean }) {
  return (
    <div className={`hero-comic-rail${reverse ? " hero-comic-rail--reverse" : ""}`}>
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
          <div className="hero-kicker"><span /> IIIT GUWAHATI · FEBRUARY 19–21, 2027 <span /></div>
          <p className="hero-issue">THE NEXT BIG THING STARTS HERE</p>
          <h1 id="hero-title" className="hero-title-comic">
            <span className="hero-title-row hero-title-row--top">
              <span className="hero-word">ENTER</span>
              <span className="hero-word">THE</span>
            </span>
            <span className="hero-title-row hero-title-row--bottom">
              <span className="hero-word hero-word--brand">YUVAAN</span>
              <span className="hero-word">VERSE</span><span className="hero-word hero-word--bang">!</span>
            </span>
          </h1>
          <p className="hero-description">
            Three days. One campus. A universe of music, makers, and moments you won’t find anywhere else.
          </p>

          <div className="hero-footnote">
            <span className="hero-spark">✦</span> THE ANNUAL CULTURAL &amp; TECHNICAL FESTIVAL <span>·</span> 3 DAYS OF ACTION
          </div>
        </div>
      </Container>

      <div className="hero-scroll-cue" aria-hidden="true"><span /> SCROLL TO EXPLORE</div>
      <Button href="/team" variant="gold" size="md" className="hero-team-link">
        Meet Organizing Team &rarr;
      </Button>
    </section>
  );
}
