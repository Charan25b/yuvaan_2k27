"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { openingConfig } from "@/lib/opening/opening.config";
import type { SceneHandle, SceneDebugInfo } from "@/lib/opening/scene";

// ─── Reduced-motion external store (useSyncExternalStore) ────────────

type Listener = () => void;
let _reducedMotion = false;
const _listeners = new Set<Listener>();

function subscribeReducedMotion(cb: Listener): () => void {
  _listeners.add(cb);
  return () => {
    _listeners.delete(cb);
  };
}
function getReducedMotionSnapshot(): boolean {
  return _reducedMotion;
}
function getReducedMotionServerSnapshot(): boolean {
  return false;
}
function initReducedMotion(): void {
  if (typeof window === "undefined") return;
  const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
  _reducedMotion = mql.matches;
  const onChange = () => {
    _reducedMotion = mql.matches;
    _listeners.forEach((l) => l());
  };
  mql.addEventListener("change", onChange);
}

// ─── Skip position lookup ─────────────────────────────────────────────

const skipPositions: Record<string, string> = {
  "top-right": "top-6 right-6",
  "top-left": "top-6 left-6",
  "bottom-right": "bottom-6 right-6",
  "bottom-left": "bottom-6 left-6",
};

// ─── Component ───────────────────────────────────────────────────────

type OpeningState = "poster" | "ready" | "static" | "skipped";

export function CinematicOpening() {
  const router = useRouter();
  const config = openingConfig;

  const [isStatic, setIsStatic] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // ── Reduced motion ──
  const reducedMotion = React.useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  // ── Check if already seen in session ──
  useEffect(() => {
    if (config.playback.mode === "oncePerSession") {
      try {
        if (sessionStorage.getItem(config.playback.storageKey)) {
          router.replace("/home");
        }
      } catch {
        /* blocked */
      }
    }
  }, [config.playback.mode, config.playback.storageKey, router]);

  // ── Refs ──
  const trackRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const welcomeRef = useRef<HTMLDivElement>(null);
  const scrollCueRef = useRef<HTMLDivElement>(null);
  const posterRef = useRef<HTMLDivElement>(null);

  const stateRef = useRef<OpeningState>("poster");
  const sceneRef = useRef<SceneHandle | null>(null);
  const rafRef = useRef<number>(0);
  const progressRef = useRef(0); // smoothed
  const progressTargetRef = useRef(0); // raw
  const stageHeightRef = useRef(0);
  const aspectRef = useRef(1);
  const firstFrameRef = useRef(true);
  const visibleRef = useRef(false);
  const sessionMarkedRef = useRef(false);
  const reducedMotionRef = useRef(reducedMotion);

  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
    sceneRef.current?.setReducedMotion?.(reducedMotion);
  }, [reducedMotion]);

  // ── Mark session ──
  const markSeen = useCallback(() => {
    if (sessionMarkedRef.current) return;
    sessionMarkedRef.current = true;
    try {
      sessionStorage.setItem(config.playback.storageKey, "1");
    } catch {
      /* blocked */
    }
  }, [config.playback.storageKey]);

  // ── Exit to main website ──
  const handleEnter = useCallback(() => {
    if (isExiting) return;
    setIsExiting(true);
    markSeen();

    if (reducedMotion || !sceneRef.current) {
      router.push("/home");
      return;
    }

    sceneRef.current.triggerExit(() => {
      router.push("/home");
    });

    setTimeout(() => {
      router.push("/home");
    }, 1500);
  }, [isExiting, markSeen, reducedMotion, router]);

  // ── Skip directly to main website ──
  const handleSkip = useCallback(() => {
    markSeen();
    router.push("/home");
  }, [markSeen, router]);

  // ── Transition to static fallback (only on WebGL failure / timeout) ──
  const goStatic = useCallback(() => {
    if (stateRef.current === "static" || stateRef.current === "skipped") return;
    stateRef.current = "static";
    setIsStatic(true);

    if (sceneRef.current) {
      sceneRef.current.dispose();
      sceneRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }

    if (posterRef.current) posterRef.current.style.opacity = "1";
    if (canvasRef.current) canvasRef.current.style.opacity = "0";

    if (welcomeRef.current) {
      welcomeRef.current.style.opacity = "1";
      welcomeRef.current.style.transform = "translateY(0)";
      welcomeRef.current.removeAttribute("inert");
    }
  }, []);

  // ── Init reduced motion ──
  useEffect(() => {
    initReducedMotion();
  }, []);

  // ── Main effect ──
  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!track || !stage || !canvas) return;

    let disposed = false;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === stage) {
          stageHeightRef.current = entry.contentRect.height;
          aspectRef.current =
            entry.contentRect.width / Math.max(entry.contentRect.height, 1);
        }
      }
    });
    ro.observe(stage);

    stageHeightRef.current = stage.clientHeight;
    aspectRef.current = stage.clientWidth / Math.max(stage.clientHeight, 1);

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visibleRef.current = entry.isIntersecting;
        }
      },
      { rootMargin: "100% 0px 100% 0px" },
    );
    io.observe(track);

    const onVisibility = () => {
      if (document.hidden) {
        firstFrameRef.current = true;
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      goStatic();
    };
    canvas.addEventListener("webglcontextlost", onContextLost);

    const loadTimeout = setTimeout(() => {
      if (stateRef.current === "poster") {
        goStatic();
      }
    }, config.timing.loadTimeoutMs);

    // ── Lazy scene init ──
    let sceneLoadAborted = false;
    const initScene = async () => {
      try {
        const { createOpeningScene } = await import("@/lib/opening/scene");
        if (disposed || sceneLoadAborted) return;

        const handle = await createOpeningScene(
          canvas,
          config,
          () => progressRef.current,
          () => aspectRef.current,
          () => stageHeightRef.current,
          reducedMotionRef.current,
        );
        if (disposed || sceneLoadAborted) {
          handle.dispose();
          return;
        }

        sceneRef.current = handle;
        stateRef.current = "ready";
        clearTimeout(loadTimeout);

        // Crossfade: poster out, canvas in
        if (posterRef.current) {
          posterRef.current.style.transition = `opacity ${config.timing.posterCrossfadeMs}ms ease-out`;
          posterRef.current.style.opacity = "0";
        }
        canvas.style.transition = `opacity ${config.timing.posterCrossfadeMs}ms ease-in`;
        canvas.style.opacity = "1";

        handle.start();
        if (typeof window !== "undefined") {
          const win = window as unknown as {
            __TRIGGER_YUVAAN_LIGHTNING__?: () => void;
            __YUVAAN_SCENE_DEBUG__?: () => SceneDebugInfo | undefined;
          };
          win.__TRIGGER_YUVAAN_LIGHTNING__ = () => {
            handle.triggerStrike();
          };
          win.__YUVAAN_SCENE_DEBUG__ = () => handle.getDebugInfo?.();
        }
        startLoop();
      } catch (err) {
        if (!disposed && !sceneLoadAborted) {
          if (process.env.NODE_ENV === "development") {
            console.warn("[opening]", err);
          }
          goStatic();
        }
      }
    };

    // ── Orchestrator loop ──
    let lastTime = 0;
    const startLoop = () => {
      const loop = (time: number) => {
        if (disposed) return;
        if (!visibleRef.current || document.hidden) {
          rafRef.current = requestAnimationFrame(loop);
          return;
        }

        const dt = Math.min((time - lastTime) / 1000, config.scroll.maxDt);
        lastTime = time;

        // Compute raw scroll progress
        const trackRect = trackRef.current?.getBoundingClientRect();
        if (trackRect) {
          const totalScroll = trackRect.height - stageHeightRef.current;
          progressTargetRef.current =
            totalScroll > 0
              ? Math.max(0, Math.min(1, -trackRect.top / totalScroll))
              : 0;
        }

        // Smooth progress
        const pTarget = progressTargetRef.current;
        if (firstFrameRef.current) {
          progressRef.current = pTarget;
          firstFrameRef.current = false;
        } else {
          const delta = pTarget - progressRef.current;
          if (Math.abs(delta) < 1e-4) {
            progressRef.current = pTarget;
          } else {
            progressRef.current +=
              delta * (1 - Math.exp(-dt * config.scroll.damping));
          }
        }

        const p = progressRef.current;

        if (sceneRef.current) {
          sceneRef.current.setProgress(p);
        }

        if (scrollCueRef.current) {
          const cueOpacity = p < 0.04 ? 1 : 0;
          scrollCueRef.current.style.opacity = String(cueOpacity);
        }

        if (welcomeRef.current) {
          const [fadeStart, fadeEnd] = config.timing.welcomeFade;
          const welcomeOpacity =
            p < fadeStart
              ? 0
              : p > fadeEnd
              ? 1
              : (p - fadeStart) / (fadeEnd - fadeStart);
          const translateY = (1 - welcomeOpacity) * 35;
          welcomeRef.current.style.opacity = String(welcomeOpacity);
          welcomeRef.current.style.transform = `translateY(${translateY}px)`;

          if (p >= config.timing.welcomeInteractiveAt) {
            if (welcomeRef.current.hasAttribute("inert")) {
              welcomeRef.current.removeAttribute("inert");
              markSeen();
            }
          } else {
            if (!welcomeRef.current.hasAttribute("inert")) {
              welcomeRef.current.setAttribute("inert", "");
            }
          }
        }

        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    };

    initScene();

    return () => {
      disposed = true;
      sceneLoadAborted = true;
      clearTimeout(loadTimeout);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      if (typeof window !== "undefined") {
        const win = window as unknown as {
          __TRIGGER_YUVAAN_LIGHTNING__?: () => void;
          __YUVAAN_SCENE_DEBUG__?: () => SceneDebugInfo | undefined;
        };
        delete win.__TRIGGER_YUVAAN_LIGHTNING__;
        delete win.__YUVAAN_SCENE_DEBUG__;
      }
      if (sceneRef.current) {
        sceneRef.current.dispose();
        sceneRef.current = null;
      }
    };
  }, [config, goStatic, markSeen]);

  const skipPosClasses =
    skipPositions[config.skip.position] ?? skipPositions["top-right"];

  return (
    <>
      {/* Blinding portal exit flash overlay */}
      <div
        className="fixed inset-0 z-50 pointer-events-none transition-opacity duration-1000"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(255,255,255,1) 0%, rgba(229,169,60,0.95) 60%, rgba(11,14,20,1) 100%)",
          opacity: isExiting ? 1 : 0,
        }}
        aria-hidden="true"
      />

      {/* ── Standalone Cinematic Scroll Track (No overflow-x-hidden so sticky works) ── */}
      <section
        ref={trackRef}
        aria-label="Yuvaan 2027 Cinematic Intro"
        className="relative w-full bg-[#05070E]"
        style={{
          height: isStatic ? "auto" : `${config.scroll.trackSvh}svh`,
        }}
      >
        {/* ── Viewport Stage ── */}
        <div
          ref={stageRef}
          className="sticky top-0 z-10 w-full overflow-hidden isolate"
          style={{
            height: isStatic ? "auto" : "100svh",
            minHeight: isStatic ? "100svh" : undefined,
          }}
        >
          {/* Static Poster fallback layer */}
          <div
            ref={posterRef}
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 1 }}
          >
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to bottom, ${config.palette.skyTop}, ${config.palette.skyMid}, ${config.palette.skyLow})`,
              }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={config.logo.src}
              alt={config.logo.alt}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[54vmin] max-w-[420px] max-h-[54vh] object-contain opacity-95 drop-shadow-[0_10px_40px_rgba(0,0,0,0.9)]"
            />
          </div>

          {/* WebGL Canvas */}
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 2, opacity: 0 }}
          />

          {/* Vignette & subtle atmosphere */}
          <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 3 }}>
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(ellipse at center, transparent 45%, rgba(5,7,14,${config.atmosphere.vignette}) 100%)`,
              }}
            />
          </div>

          {/* ── Overlay HUD ── */}
          <div className="absolute inset-0 flex flex-col pointer-events-none" style={{ zIndex: 4 }}>
            {/* Skip button */}
            <button
              type="button"
              aria-label="Skip to main website"
              onClick={handleSkip}
              className={`absolute ${skipPosClasses} pointer-events-auto z-20 px-4 py-2 text-xs sm:text-sm font-black uppercase tracking-wider rounded-xl border border-white/20 transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md`}
              style={{
                color: config.palette.cream,
                backgroundColor: "rgba(11, 14, 20, 0.65)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
              }}
            >
              {config.skip.label} &rarr;
            </button>

            {/* Scroll cue */}
            <div
              ref={scrollCueRef}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2.5 transition-opacity duration-300 pointer-events-none"
              style={{ opacity: 1 }}
            >
              <span
                className="text-[11px] sm:text-xs font-black tracking-[0.25em] uppercase"
                style={{ color: config.palette.cream, textShadow: "0 2px 10px rgba(0,0,0,0.8)" }}
              >
                {config.welcome.scrollCue}
              </span>
              <div
                className="w-5 h-8 rounded-full border-2 flex items-start justify-center pt-1"
                style={{ borderColor: "rgba(250,246,239,0.7)", backgroundColor: "rgba(5,7,14,0.4)" }}
              >
                <div
                  className="w-1.5 h-2.5 rounded-full animate-bounce"
                  style={{ backgroundColor: config.palette.gold }}
                />
              </div>
            </div>

            {/* Ready to Enter presentation */}
            <div
              ref={welcomeRef}
              className="flex-1 flex flex-col items-center justify-center px-4 text-center pointer-events-none"
              style={{
                opacity: isStatic ? 1 : 0,
                transform: isStatic ? "none" : "translateY(35px)",
              }}
              inert={!isStatic}
            >
              <div className="flex flex-col items-center max-w-2xl px-6 py-8 rounded-3xl backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.7)] bg-[#05070E]/80">
                <span
                  className="text-xs sm:text-sm font-black tracking-[0.3em] uppercase mb-2"
                  style={{ color: config.palette.gold }}
                >
                  {config.welcome.eyebrow}
                </span>

                <h1
                  className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-2 leading-none"
                  style={{
                    textShadow: "0 4px 30px rgba(229,169,60,0.4)",
                  }}
                >
                  {config.welcome.headline}
                </h1>

                <p className="text-xs sm:text-sm font-semibold tracking-wide text-white/70 max-w-md mb-6">
                  Annual Cultural &amp; Technical Festival &bull; Vol. 27
                </p>

                {/* Ready to Enter Action Button */}
                <button
                  type="button"
                  disabled={isExiting}
                  onClick={handleEnter}
                  className="pointer-events-auto group relative px-8 py-4 rounded-2xl text-sm sm:text-base font-black uppercase tracking-wider text-[#0B0E14] transition-all hover:scale-105 active:scale-95 disabled:opacity-80 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(229,169,60,0.6)] cursor-pointer"
                  style={{
                    backgroundColor: config.palette.gold,
                  }}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {isExiting ? (
                      <>
                        <span className="inline-block h-4 w-4 rounded-full border-2 border-[#0B0E14] border-t-transparent animate-spin" />
                        <span>Entering Yuvaan...</span>
                      </>
                    ) : (
                      <>
                        <span>{config.cta.label}</span>
                        <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                      </>
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}