"use client";

import { useEffect, useRef } from "react";
import { useMotion } from "./useMotion";

// Replace with local transparent character art; no downloaded or licensed component code.
// Array order is the repeating desktop trail order.
export const TRAIL_ASSETS = [
  "/trails/spider-mask.svg",
  "/trails/luffy.svg",
  "/trails/superman.svg",
  "/trails/batman.svg",
  "/trails/wonder-woman.svg",
  "/trails/iron-man.svg",
];
export const TRAIL_SETTINGS = {
  desktop: { max: 10, distance: 100, lifetime: 1800, size: 48 },
  touch: { max: 24, distance: 10, lifetime: 1000, size: 42 },
};

type Point = { x: number; y: number };
type Particle = Point & {
  born: number; life: number;
  rotation: number; size: number; drift: number; image: number;
};
const interactive = "a, button, input, select, textarea, nav, [role='dialog'], [data-no-trail]";

export function PointerTrails() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { enabled } = useMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !enabled) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const fine = matchMedia("(any-hover: hover) and (any-pointer: fine)");
    const lowPower = navigator.hardwareConcurrency <= 4;
    const images = TRAIL_ASSETS.map((src) => { const img = new Image(); img.src = src; return img; });
    // Bake overlapping, feathered wisps into one small texture. The irregular
    // silhouette reads as fog rather than individual circular particles.
    // No full-screen blur or per-frame gradient allocation is needed.
    const mist = document.createElement("canvas");
    mist.width = mist.height = 128;
    const brush = mist.getContext("2d")!;
    const wisps = [
      { x: 61, y: 66, radius: 47, opacity: .26 },
      { x: 36, y: 59, radius: 30, opacity: .22 },
      { x: 87, y: 52, radius: 32, opacity: .24 },
      { x: 74, y: 83, radius: 30, opacity: .18 },
      { x: 48, y: 39, radius: 26, opacity: .16 },
    ];
    for (const { x, y, radius, opacity } of wisps) {
      const gradient = brush.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `rgba(238,245,249,${opacity})`);
      gradient.addColorStop(.4, `rgba(215,230,239,${opacity * .6})`);
      gradient.addColorStop(1, "rgba(200,218,230,0)");
      brush.fillStyle = gradient;
      brush.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }

    let particles: Particle[] = [];
    let last: Point | null = null;
    let distanceRemainder = 0;
    let frame = 0;
    let lastDraw = 0;
    let touchId: number | null = null;
    let mode: "desktop" | "touch" = "desktop";
    let sequence = 0;
    let lastEmit = 0;
    let width = innerWidth;
    let height = innerHeight;
    const clear = () => ctx.clearRect(0, 0, width, height);
    const reset = () => {
      cancelAnimationFrame(frame); frame = 0;
      particles = []; last = null; distanceRemainder = 0; touchId = null; lastEmit = 0; clear();
    };
    const resize = () => {
      width = innerWidth; height = innerHeight;
      const dpr = Math.min(devicePixelRatio || 1, lowPower ? 1 : 1.5);
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = []; last = null; distanceRemainder = 0;
    };
    const draw = (now: number) => {
      frame = 0;
      const interval = mode === "touch" || lowPower ? 1000 / 30 : 1000 / 60;
      if (now - lastDraw < interval - 1) { frame = requestAnimationFrame(draw); return; }
      lastDraw = now;
      clear();
      particles = particles.filter((particle) => now - particle.born < particle.life);
      for (const p of particles) {
        const age = (now - p.born) / p.life;
        const fadeInDuration = mode === "touch" ? 120 : 300;
        const fadeInProgress = Math.min((now - p.born) / fadeInDuration, 1);
        const fadeIn = fadeInProgress * fadeInProgress * (3 - 2 * fadeInProgress);
        const fade = fadeIn * (1 - age) ** (mode === "touch" ? 1.2 : 1.5);
        const size = p.size * (mode === "touch" ? 1 + age * 1.4 : 1 - age * .16);
        ctx.save();
        ctx.translate(p.x + (mode === "touch" ? p.drift * age : 0), p.y - age * (mode === "touch" ? 36 : 0));
        ctx.rotate(mode === "touch" ? p.rotation + age * .12 : p.rotation);
        ctx.globalAlpha = fade * (mode === "touch" ? 1 : .85);
        if (mode === "touch") {
          // Broad, slightly flattened clouds overlap into a translucent trail;
          // each expands and lifts away from the touch point as it dissipates.
          ctx.drawImage(mist, -size, -size * .75, size * 2, size * 1.5);
        } else {
          const sprite = images[p.image];
          if (sprite.complete && sprite.naturalWidth) ctx.drawImage(sprite, -size / 2, -size / 2, size, size * 1.16);
        }
        ctx.restore();
      }
      if (particles.length) frame = requestAnimationFrame(draw);
    };
    const emit = (point: Point, kind: typeof mode) => {
      if (document.hidden) return;
      if (mode !== kind) { reset(); mode = kind; }
      const settings = TRAIL_SETTINGS[kind];
      const now = performance.now();
      const positions: Point[] = [];
      if (kind === "touch") {
        if (now - lastEmit < 28) return;
        if (last && Math.hypot(point.x - last.x, point.y - last.y) < settings.distance) return;
        positions.push(point);
        last = point;
        lastEmit = now;
      } else {
        const previous = last;
        if (!previous) {
          positions.push(point);
          distanceRemainder = 0;
        } else {
          const dx = point.x - previous.x;
          const dy = point.y - previous.y;
          const segmentLength = Math.hypot(dx, dy);
          const carriedDistance = distanceRemainder % settings.distance;
          const totalDistance = carriedDistance + segmentLength;
          const sampleCount = Math.floor(totalDistance / settings.distance);
          const firstSample = settings.distance - carriedDistance;
          for (let sample = 0; sample < sampleCount; sample++) {
            const distanceAlongSegment = firstSample + sample * settings.distance;
            const ratio = distanceAlongSegment / segmentLength;
            positions.push({ x: previous.x + dx * ratio, y: previous.y + dy * ratio });
          }
          distanceRemainder = totalDistance - sampleCount * settings.distance;
        }
        last = point;
      }
      if (positions.length === 0) return;

      for (const position of positions) {
        particles.push({
          ...position,
          born: now,
          life: settings.lifetime,
          size: settings.size * (kind === "touch" ? .85 + Math.random() * .3 : .95 + Math.random() * .1),
          rotation: (Math.random() - .5) * (kind === "touch" ? .5 : .16),
          drift: kind === "touch" ? (Math.random() - .5) * 42 : 0,
          image: kind === "desktop" ? sequence++ % images.length : 0,
        });
      }
      const cap = lowPower ? Math.min(settings.max, 16) : settings.max;
      if (particles.length > cap) particles.splice(0, particles.length - cap);
      if (!frame) frame = requestAnimationFrame(draw);
    };
    const mouse = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !fine.matches || touchId !== null) return;
      const target = event.target as Element;
      if (target.closest(interactive)) { last = null; distanceRemainder = 0; return; }
      emit({ x: event.clientX, y: event.clientY }, "desktop");
    };
    // Touch events continue during native scrolling, unlike cancelled Pointer Events.
    // Every listener is passive; we never capture pointers or preventDefault.
    const startTouch = (event: TouchEvent) => {
      if (event.touches.length !== 1 || (event.target as Element).closest(interactive)) {
        touchId = null; last = null; distanceRemainder = 0; lastEmit = 0; return;
      }
      if (mode !== "touch") { reset(); mode = "touch"; }
      const touch = event.touches[0];
      touchId = touch.identifier; last = null; distanceRemainder = 0; lastEmit = 0;
      emit({ x: touch.clientX, y: touch.clientY }, "touch");
    };
    const moveTouch = (event: TouchEvent) => {
      if (event.touches.length !== 1) { touchId = null; last = null; distanceRemainder = 0; lastEmit = 0; return; }
      const touch = event.touches[0];
      if (touch.identifier !== touchId) return;
      emit({ x: touch.clientX, y: touch.clientY }, "touch");
    };
    const endTouch = () => { touchId = null; last = null; distanceRemainder = 0; lastEmit = 0; };
    const visibility = () => { if (document.hidden) reset(); };
    resize();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", mouse, { passive: true });
    window.addEventListener("touchstart", startTouch, { passive: true });
    window.addEventListener("touchmove", moveTouch, { passive: true });
    window.addEventListener("touchend", endTouch, { passive: true });
    window.addEventListener("touchcancel", endTouch, { passive: true });
    window.addEventListener("blur", reset);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      reset();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", mouse);
      window.removeEventListener("touchstart", startTouch);
      window.removeEventListener("touchmove", moveTouch);
      window.removeEventListener("touchend", endTouch);
      window.removeEventListener("touchcancel", endTouch);
      window.removeEventListener("blur", reset);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [enabled]);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-trails" />;
}
