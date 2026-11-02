"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMotion } from "@/components/effects/useMotion";
import styles from "./HeroSection.module.css";

type HeroImage = { src: string; width: number; height: number };

export const HERO_IMAGES: HeroImage[] = [
  { src: "/spiderman.jpg", width: 735, height: 1037 },
  { src: "/horimiya.webp", width: 1080, height: 1538 },
  { src: "/dr doom.jpg", width: 1440, height: 1800 },
  { src: "/beserk.jpg", width: 2574, height: 3830 },
  { src: "/batman.jpeg", width: 1036, height: 1600 },
  { src: "/jojo.jpg", width: 6633, height: 9686 },
  { src: "/vagabond.jpg", width: 759, height: 1236 },
  { src: "/superman.jpg", width: 900, height: 1324 },
  { src: "/zoro.jpg", width: 704, height: 1158 },
];

export const HERO_MOTION = {
  desktop: { zoom: 0.14, backgroundShift: 40, titleShift: 16 },
  mobile: { zoom: 0.06, backgroundShift: 18, titleShift: 8 },
};

function ComicScene({ image, priority = false }: { image: HeroImage; priority?: boolean }) {
  return (
    <Image
      className={styles.scene}
      src={image.src}
      width={image.width}
      height={image.height}
      alt=""
      sizes="(max-width: 680px) 48vw, 32vw"
      loading="eager"
      fetchPriority={priority ? "high" : "auto"}
    />
  );
}

function ComicRail({
  images,
  reverse = false,
  firstRail = false,
}: {
  images: HeroImage[];
  reverse?: boolean;
  firstRail?: boolean;
}) {
  const track = useRef<HTMLDivElement>(null);
  const sequence = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trackElement = track.current;
    const sequenceElement = sequence.current;
    if (!trackElement || !sequenceElement) return;

    const updateDuration = () => {
      const sequenceHeight = sequenceElement.getBoundingClientRect().height;
      if (sequenceHeight > 0) {
        trackElement.style.setProperty("--comic-duration", `${sequenceHeight / 42}s`);
      }
    };
    const observer = new ResizeObserver(updateDuration);
    observer.observe(sequenceElement);
    updateDuration();
    return () => observer.disconnect();
  }, []);

  return (
    <div className={`${styles.rail}${reverse ? ` ${styles.reverse}` : ""}`}>
      <div ref={track} className={styles.track}>
        {[0, 1].map((copy) => (
          <div className={styles.sequence} key={copy} ref={copy === 0 ? sequence : undefined}>
            {images.map((image, index) => (
              <ComicScene
                key={`${copy}-${index}`}
                image={image}
                priority={firstRail && copy === 0 && index === 0}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function HeroSection() {
  const hero = useRef<HTMLElement>(null);
  const { enabled } = useMotion();
  const firstColumn = HERO_IMAGES.slice(0, 3);
  const secondColumn = HERO_IMAGES.slice(3, 6);
  const thirdColumn = HERO_IMAGES.slice(6, 9);

  useEffect(() => {
    const element = hero.current;
    if (!element || !enabled) return;

    const mobile = matchMedia("(max-width: 680px)");
    let frame = 0;
    let visible = true;
    let height = element.offsetHeight;
    let top = element.getBoundingClientRect().top + window.scrollY;
    const update = () => {
      frame = 0;
      const progress = Math.max(0, Math.min(1, (window.scrollY - top) / height));
      const amount = mobile.matches ? HERO_MOTION.mobile : HERO_MOTION.desktop;
      element.style.setProperty("--comic-scale", String(1.04 + amount.zoom * (1 - progress)));
      element.style.setProperty("--comic-y", `${progress * amount.backgroundShift}px`);
      element.style.setProperty("--title-y", `${-progress * amount.titleShift}px`);
    };
    const schedule = () => {
      if (visible && !document.hidden && !frame) frame = requestAnimationFrame(update);
    };
    const activity = () => {
      element.dataset.running = String(visible && !document.hidden);
      if (!visible || document.hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else {
        schedule();
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      activity();
    });
    const resize = new ResizeObserver(() => {
      height = element.offsetHeight;
      top = element.getBoundingClientRect().top + window.scrollY;
      schedule();
    });

    observer.observe(element);
    resize.observe(element);
    window.addEventListener("scroll", schedule, { passive: true });
    document.addEventListener("visibilitychange", activity);
    activity();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      resize.disconnect();
      window.removeEventListener("scroll", schedule);
      document.removeEventListener("visibilitychange", activity);
      element.dataset.running = "false";
      ["--comic-scale", "--comic-y", "--title-y"].forEach((key) => element.style.removeProperty(key));
    };
  }, [enabled]);

  return (
    <section ref={hero} className={styles.hero} aria-labelledby="hero-title" data-running="false">
      <div className={styles.artwork} aria-hidden="true">
        <ComicRail images={firstColumn} firstRail />
        <ComicRail images={secondColumn} reverse />
        <ComicRail images={thirdColumn} />
      </div>
      <div className={styles.wash} aria-hidden="true" />
      <div className={styles.copy}>
        <p className={styles.eyebrow}>CULTURE. CHAOS. CONNECTION.</p>
        <h1 id="hero-title" className={styles.title}>
          <span className={styles.prelude}>ENTER THE</span>
          <span className={styles.brand}>YUVAAN</span>
          <span className={styles.verse}>
            VERSE<span>!</span>
          </span>
        </h1>
        <Link className={styles.explore} href="/events">
          Explore the events <span aria-hidden="true">&#8599;</span>
        </Link>
      </div>
    </section>
  );
}
