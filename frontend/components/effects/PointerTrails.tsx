"use client";

import { useEffect, useRef } from "react";
import { useMotion } from "./useMotion";

// A procedural marker: no sprites, images, filters, or animation dependencies.
export const MARKER_SETTINGS = {
  desktop: { maxPoints: 96, lifetime: 900, width: 10 },
  touch: { maxPoints: 72, lifetime: 720, width: 7 },
  followMs: 24,
  colorDistance: 280,
  palette: [[255, 212, 59], [240, 91, 76], [89, 186, 223], [172, 144, 225]],
};

type Point = { x: number; y: number };
type InkPoint = Point & { born: number; width: number; color: string; stroke: number; life: number };
type Mode = "desktop" | "touch";
const interactive = "a, button, input, select, textarea, nav, header, [contenteditable='true'], [role='dialog'], [data-no-trail]";
const midpoint = (a: Point, b: Point) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

function inkColor(distance: number) {
  const phase = distance / MARKER_SETTINGS.colorDistance;
  const index = Math.floor(phase) % MARKER_SETTINGS.palette.length;
  const from = MARKER_SETTINGS.palette[index];
  const to = MARKER_SETTINGS.palette[(index + 1) % MARKER_SETTINGS.palette.length];
  const blend = phase % 1;
  return `rgb(${from.map((channel, i) => Math.round(channel + (to[i] - channel) * blend)).join(",")})`;
}

export function PointerTrails() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const { enabled } = useMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !enabled) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const cursor = cursorRef.current;
    const fine = matchMedia("(any-hover: hover) and (any-pointer: fine)");
    const lowPower = navigator.hardwareConcurrency <= 4;
    let points: InkPoint[] = [];
    let target: Point | null = null;
    let pen: Point | null = null;
    let mode: Mode = "desktop";
    let touchId: number | null = null;
    let suppressMouseUntil = 0;
    let frame = 0;
    let lastDraw = 0;
    let stroke = 0;
    let distance = 0;
    let penWidth = MARKER_SETTINGS.desktop.width;
    let width = innerWidth;
    let height = innerHeight;

    const hideCursor = () => {
      if (!cursor) return;
      cursor.dataset.visible = "false";
      cursor.dataset.pressed = "false";
    };
    const showCursor = (point: Point, isInteractive: boolean) => {
      if (!cursor || !fine.matches) return;
      cursor.style.setProperty("--cursor-x", `${point.x}px`);
      cursor.style.setProperty("--cursor-y", `${point.y}px`);
      cursor.style.setProperty("--cursor-color", inkColor(distance));
      cursor.dataset.interactive = String(isInteractive);
      cursor.dataset.visible = "true";
    };
    const updateCursorCapability = () => {
      document.documentElement.classList.toggle("trail-cursor-active", fine.matches);
      if (!fine.matches) hideCursor();
    };

    const lift = () => { target = null; pen = null; stroke++; };
    const clear = () => ctx.clearRect(0, 0, width, height);
    const reset = () => {
      cancelAnimationFrame(frame); frame = 0; lastDraw = 0;
      points = []; touchId = null; lift(); clear();
    };
    const resize = () => {
      // A collapsing mobile browser bar must not cancel the active touch gesture.
      if (width !== innerWidth) reset();
      width = innerWidth; height = innerHeight;
      const dpr = Math.min(devicePixelRatio || 1, lowPower ? 1 : 1.5);
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = "round"; ctx.lineJoin = "round";
    };
    const paint = (start: Point, control: Point, end: Point, offset: number, thickness: number, color: string, opacity: number) => {
      ctx.beginPath();
      ctx.moveTo(start.x + offset, start.y - offset * .55);
      ctx.quadraticCurveTo(control.x + offset, control.y - offset * .55, end.x + offset, end.y - offset * .55);
      ctx.lineWidth = thickness; ctx.strokeStyle = color; ctx.globalAlpha = opacity;
      ctx.stroke();
    };
    const draw = (now: number) => {
      frame = 0;
      const interval = lowPower ? 1000 / 30 : 1000 / 60;
      if (lastDraw && now - lastDraw < interval - 1) { frame = requestAnimationFrame(draw); return; }
      const delta = Math.min(40, lastDraw ? now - lastDraw : 16);
      lastDraw = now;
      const settings = MARKER_SETTINGS[mode];
      if (target) {
        const fresh = !pen;
        const previous = pen || target;
        const follow = 1 - Math.exp(-delta / MARKER_SETTINGS.followMs);
        pen = { x: previous.x + (target.x - previous.x) * follow, y: previous.y + (target.y - previous.y) * follow };
        const step = Math.hypot(pen.x - previous.x, pen.y - previous.y);
        if (fresh || step > .25) {
          distance += step;
          // Fast strokes narrow like a felt nib; the small variation is fixed
          // to distance, so the dry-ink texture never jitters while fading.
          const pressure = 1 - Math.min(step / delta / 3, .4);
          penWidth += (settings.width * pressure - penWidth) * .4;
          const color = inkColor(distance);
          cursor?.style.setProperty("--cursor-color", color);
          points.push({ ...pen, born: now, life: settings.lifetime, stroke,
            width: penWidth * (1 + Math.sin(distance * .075) * .09), color });
        }
      }
      points = points.filter((point) => now - point.born < point.life);
      const cap = lowPower ? 48 : settings.maxPoints;
      if (points.length > cap) points.splice(0, points.length - cap);
      clear();
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const before = points[i - 1]?.stroke === p.stroke ? points[i - 1] : p;
        const after = points[i + 1]?.stroke === p.stroke ? points[i + 1] : p;
        const start = midpoint(before, p);
        const end = midpoint(p, after);
        // A tiny nib dash also gives a single tap a visible, fading ink mark.
        if (before === p && after === p) { start.x -= 1; end.x += 1; end.y -= 1; }
        const fade = (1 - (now - p.born) / p.life) ** 1.4;
        paint(start, p, end, 0, p.width + 1.5, "#142039", fade * .18);
        paint(start, p, end, 0, p.width, p.color, fade * .72);
        paint(start, p, end, p.width * .22, .8, "#fff8df", fade * .45);
      }
      const following = target && pen && Math.hypot(target.x - pen.x, target.y - pen.y) > .5;
      if (points.length || following) frame = requestAnimationFrame(draw);
    };
    const move = (point: Point, kind: Mode) => {
      if (document.hidden) return;
      if (mode !== kind) { reset(); mode = kind; penWidth = MARKER_SETTINGS[kind].width; }
      // Start a fresh stroke after a large pointer jump or switching windows.
      if (target && Math.hypot(point.x - target.x, point.y - target.y) > 240) lift();
      target = point;
      if (!frame) frame = requestAnimationFrame(draw);
    };
    const mouse = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !fine.matches || touchId !== null || performance.now() < suppressMouseUntil) return;
      const point = { x: event.clientX, y: event.clientY };
      const isInteractive = event.target instanceof Element && Boolean(event.target.closest(interactive));
      showCursor(point, isInteractive);
      if (isInteractive) { lift(); return; }
      move(point, "desktop");
    };
    const pointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && fine.matches && cursor) cursor.dataset.pressed = "true";
    };
    const pointerUp = () => {
      if (cursor) cursor.dataset.pressed = "false";
    };
    // Passive Touch Events keep delivering positions during native page scrolling.
    // We never preventDefault, capture a pointer, or change touch-action.
    const endTouch = () => { touchId = null; suppressMouseUntil = performance.now() + 700; lift(); };
    const startTouch = (event: TouchEvent) => {
      if (event.touches.length !== 1 || (event.target as Element).closest(interactive)) { endTouch(); return; }
      const touch = event.touches[0];
      lift();
      move({ x: touch.clientX, y: touch.clientY }, "touch");
      touchId = touch.identifier;
    };
    const moveTouch = (event: TouchEvent) => {
      if (event.touches.length !== 1) { endTouch(); return; }
      const touch = event.touches[0];
      if (touch.identifier === touchId) move({ x: touch.clientX, y: touch.clientY }, "touch");
    };
    const visibility = () => { if (document.hidden) { reset(); hideCursor(); } };
    const leave = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && !event.relatedTarget) { lift(); hideCursor(); }
    };
    const scroll = () => {
      if (mode === "desktop") {
        lift();
      } else if (touchId !== null) {
        // Clear the touch trail once a gesture becomes page scrolling.
        reset();
      }
    };
    const blur = () => { reset(); hideCursor(); };
    resize();
    updateCursorCapability();
    fine.addEventListener("change", updateCursorCapability);
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", mouse, { passive: true });
    window.addEventListener("pointerdown", pointerDown, { passive: true });
    window.addEventListener("pointerup", pointerUp, { passive: true });
    window.addEventListener("pointercancel", pointerUp, { passive: true });
    window.addEventListener("pointerout", leave, { passive: true });
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("touchstart", startTouch, { passive: true });
    window.addEventListener("touchmove", moveTouch, { passive: true });
    window.addEventListener("touchend", endTouch, { passive: true });
    window.addEventListener("touchcancel", endTouch, { passive: true });
    window.addEventListener("blur", blur);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      reset();
      hideCursor();
      fine.removeEventListener("change", updateCursorCapability);
      document.documentElement.classList.remove("trail-cursor-active");
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", mouse);
      window.removeEventListener("pointerdown", pointerDown);
      window.removeEventListener("pointerup", pointerUp);
      window.removeEventListener("pointercancel", pointerUp);
      window.removeEventListener("pointerout", leave);
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("touchstart", startTouch);
      window.removeEventListener("touchmove", moveTouch);
      window.removeEventListener("touchend", endTouch);
      window.removeEventListener("touchcancel", endTouch);
      window.removeEventListener("blur", blur);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [enabled]);

  return (
    <>
      <canvas ref={canvasRef} aria-hidden="true" className="pointer-trails" />
      <span ref={cursorRef} aria-hidden="true" className="trail-cursor" />
    </>
  );
}
