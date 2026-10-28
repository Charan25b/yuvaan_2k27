// opening.config.ts — Single source of truth for the cinematic opening.
// All changeable behaviour lives here. No hex colours or tunable numbers
// should appear in components, scene code, or GLSL.

// ─── Interfaces ──────────────────────────────────────────────────────

export type PlaybackMode = "always" | "oncePerSession" | "never";
export type SkipPosition = "top-right" | "top-left" | "bottom-right" | "bottom-left";
export type ScrollBehavior = "smooth" | "instant" | "auto";
export type QualityTierName = "high" | "medium" | "low";

export interface QualityTier {
  dpr: number;
  slabs: number;
  puffs: number;
  mist: number;
  embers: number;
  logoRasterMax: number;
}

export interface OpeningConfig {
  playback: {
    mode: PlaybackMode;
    storageKey: string;
  };
  anchorId: string;
  cta: {
    label: string;
    href: string | undefined;
    scrollBehavior: ScrollBehavior;
  };
  skip: {
    label: string;
    position: SkipPosition;
    scrollBehavior: ScrollBehavior;
  };
  welcome: {
    eyebrow: string;
    headline: string;
    scrollCue: string;
  };
  scroll: {
    trackSvh: number;
    damping: number;
    maxDt: number;
  };
  world: {
    depths: {
      start: number;
      logo: number;
      welcomeBackdrop: number;
      stop: number;
    };
    eyeY: number;
  };
  camera: {
    near: number;
    far: number;
    keyframes: [number, number][];
    vfov: {
      landscape: number;
      portrait: number;
      min: number;
      max: number;
      aspectRange: [number, number];
    };
    passThrough: {
      fovBumpDeg: number;
      window: [number, number, number];
    };
    sway: {
      position: number;
      rollDeg: number;
      periodS: number;
    };
    pitchMaxRad: number;
  };
  timing: {
    welcomeFade: [number, number];
    welcomeInteractiveAt: number;
    scrollCueHideAt: number;
    backdropFadeDepth: [number, number];
    posterCrossfadeMs: number;
    loadTimeoutMs: number;
  };
  logo: {
    src: string;
    srcPortrait: string | undefined;
    portraitBelowAspect: number;
    alt: string;
    yOffset: number;
    widthFraction: { desktop: number; mobile: number };
    maxHeightFraction: { desktop: number; mobile: number };
    fitAspectRange: [number, number];
    dissolve: { startDistance: number; endDistance: number; edgeWidth: number };
    glow: { strength: number };
  };
  clouds: {
    slabDepths: number[];
    coverage: [number, number];
    slabDrift: [number, number];
    puffDrift: [number, number];
    nearFade: [number, number];
    corridor: {
      radius: number;
      falloff: number;
      frontAlphaCap: number;
      behindDim: number;
    };
  };
  mist: {
    opacity: number;
    depthRange: [number, number];
    drift: number;
  };
  embers: {
    size: number;
    drift: number;
    turbulence: number;
    brightness: number;
  };
  backdrop: {
    centerY: number;
    radius: number;
    intensity: number;
  };
  lightning: {
    enabled: boolean;
    peak: number;
    seed: number;
    firstDelayS: [number, number];
    gapS: [number, number];
    pulses: [number, number];
    strikeMaxMs: number;
  };
  atmosphere: {
    halftone: number;
    vignette: number;
  };
  palette: {
    skyTop: string;
    skyMid: string;
    skyLow: string;
    cloud: string;
    gold: string;
    ember: string;
    cyan: string;
    cream: string;
    ink: string;
    lightning: string;
  };
  quality: {
    tiers: Record<QualityTierName, QualityTier>;
    initial: { mediumBelowWidth: number; lowAtOrBelowCores: number; lowAtOrBelowMemoryGb: number };
    stepDown: { afterMs: number; frameMsAbove: number; sustainMs: number; maxSteps: number };
  };
}

// ─── Configuration Object ────────────────────────────────────────────

export const openingConfig: OpeningConfig = {
  playback: {
    mode: "always",
    storageKey: "yuvaan:opening-seen",
  },
  anchorId: "yuvaan-home",
  cta: {
    label: "READY TO ENTER",
    href: "/home",
    scrollBehavior: "smooth",
  },
  skip: {
    label: "Skip to Main Site",
    position: "top-right",
    scrollBehavior: "instant",
  },
  welcome: {
    eyebrow: "IIIT GUWAHATI",
    headline: "YUVAAN 2027",
    scrollCue: "SCROLL TO DESCEND",
  },
  scroll: { trackSvh: 450, damping: 8, maxDt: 0.05 },
  world: {
    depths: { start: 0, logo: 5, welcomeBackdrop: 10, stop: 8 },
    eyeY: 0,
  },
  camera: {
    near: 0.1,
    far: 120,
    keyframes: [
      [0, 0], [0.06, 0], [0.18, 1.9], [0.30, 3.2],
      [0.42, 4.2], [0.50, 4.9], [0.58, 5.8], [0.75, 7.2],
      [0.92, 8], [1, 8],
    ],
    vfov: {
      landscape: 45,
      portrait: 65,
      min: 40,
      max: 70,
      aspectRange: [0.45, 1.6],
    },
    passThrough: { fovBumpDeg: 7, window: [0.38, 0.50, 0.66] },
    sway: { position: 0.08, rollDeg: 0.6, periodS: 9 },
    pitchMaxRad: 0.02,
  },
  timing: {
    welcomeFade: [0.74, 0.92],
    welcomeInteractiveAt: 0.88,
    scrollCueHideAt: 0.02,
    backdropFadeDepth: [4.5, 7.5],
    posterCrossfadeMs: 400,
    loadTimeoutMs: 10000,
  },
  logo: {
    src: "/yuvaan/iiitg-emblem.png",
    srcPortrait: undefined,
    portraitBelowAspect: 0.8,
    alt: "IIIT Guwahati Emblem",
    yOffset: 0,
    widthFraction: { desktop: 0.50, mobile: 0.72 },
    maxHeightFraction: { desktop: 0.52, mobile: 0.44 },
    fitAspectRange: [0.6, 1.2],
    dissolve: { startDistance: 1.5, endDistance: 0.1, edgeWidth: 0.1 },
    glow: { strength: 0.0 },
  },
  clouds: {
    slabDepths: [1.2, 2.8, 3.9, 6.2, 8.4, 10.8, 13.5, 17],
    coverage: [0.55, 0.72],
    slabDrift: [0.006, 0.016],
    puffDrift: [0.06, 0.18],
    nearFade: [0.15, 1.4],
    corridor: { radius: 0.32, falloff: 0.32, frontAlphaCap: 0.65, behindDim: 0.85 },
  },
  mist: { opacity: 0.45, depthRange: [4.2, 4.7], drift: 0.08 },
  embers: { size: 0.04, drift: 0.8, turbulence: 0.35, brightness: 1.2 },
  backdrop: { centerY: -0.12, radius: 0.9, intensity: 1.1 },
  lightning: {
    enabled: true,
    peak: 0.75,
    seed: 20270101,
    firstDelayS: [1.2, 3.0],
    gapS: [4, 9],
    pulses: [2, 4],
    strikeMaxMs: 300,
  },
  atmosphere: { halftone: 0.06, vignette: 0.45 },
  palette: {
    skyTop: "#050814",
    skyMid: "#10182E",
    skyLow: "#1F2840",
    cloud: "#2E3B57",
    gold: "#F59E0B",
    ember: "#E11D48",
    cyan: "#38BDF8",
    cream: "#FAF6EF",
    ink: "#0B0E14",
    lightning: "#E0F2FE",
  },
  quality: {
    tiers: {
      high: { dpr: 2, slabs: 8, puffs: 90, mist: 10, embers: 400, logoRasterMax: 4096 },
      medium: { dpr: 1.5, slabs: 6, puffs: 55, mist: 7, embers: 220, logoRasterMax: 2048 },
      low: { dpr: 1, slabs: 4, puffs: 28, mist: 4, embers: 100, logoRasterMax: 2048 },
    },
    initial: { mediumBelowWidth: 768, lowAtOrBelowCores: 4, lowAtOrBelowMemoryGb: 4 },
    stepDown: { afterMs: 1500, frameMsAbove: 24, sustainMs: 1000, maxSteps: 2 },
  },
};

// ─── Validation ──────────────────────────────────────────────────────

/**
 * Runs once at scene init. In development, warns on inconsistencies;
 * in production, clamps or falls back to defaults.
 */
export function validateOpeningConfig(config: OpeningConfig): OpeningConfig {
  const isDev = process.env.NODE_ENV === "development";
  const warn = (msg: string) => {
    if (isDev) console.warn(`[opening-config] ${msg}`);
  };

  // Depths: camera keyframes start/stop must match world.depths
  const kfFirst = config.camera.keyframes[0];
  const kfLast = config.camera.keyframes[config.camera.keyframes.length - 1];
  if (kfFirst && kfFirst[1] !== config.world.depths.start) {
    warn(
      `First keyframe depth (${kfFirst[1]}) does not match world.depths.start (${config.world.depths.start}).`
    );
  }
  if (kfLast && kfLast[1] !== config.world.depths.stop) {
    warn(
      `Last keyframe depth (${kfLast[1]}) does not match world.depths.stop (${config.world.depths.stop}).`
    );
  }

  // Logo depth must lie inside passThrough.window
  const ptWindow = config.camera.passThrough.window;
  // Find the depth range that the passThrough window covers
  const depthAtProgress = (p: number): number => {
    const kfs = config.camera.keyframes;
    for (let i = 0; i < kfs.length - 1; i++) {
      if (p >= kfs[i][0] && p <= kfs[i + 1][0]) {
        const t = (p - kfs[i][0]) / (kfs[i + 1][0] - kfs[i][0]);
        return kfs[i][1] + t * (kfs[i + 1][1] - kfs[i][1]);
      }
    }
    return kfs[kfs.length - 1][1];
  };
  const ptStartDepth = depthAtProgress(ptWindow[0]);
  const ptEndDepth = depthAtProgress(ptWindow[2]);
  if (config.world.depths.logo < ptStartDepth || config.world.depths.logo > ptEndDepth) {
    warn(
      `world.depths.logo (${config.world.depths.logo}) is outside passThrough depth range [${ptStartDepth.toFixed(2)}, ${ptEndDepth.toFixed(2)}].`
    );
  }

  // Safety: lightning flashes per second at most 3, peak at most 0.8
  if (config.lightning.peak > 0.8) {
    warn(`lightning.peak (${config.lightning.peak}) exceeds 0.8; clamping.`);
    config = {
      ...config,
      lightning: { ...config.lightning, peak: Math.min(config.lightning.peak, 0.8) },
    };
  }

  // Ensure gap is large enough to keep flashes <= 3/sec
  // With pulses up to 3 and strikeMaxMs 350, a full burst is ~1050ms.
  // Minimum gap to stay under 3 flashes/sec: at least 1s gap between bursts.
  const minGapForWcag = 1.0;
  if (config.lightning.gapS[0] < minGapForWcag) {
    warn(`lightning.gapS[0] (${config.lightning.gapS[0]}) too short for WCAG 2.3.1; clamping to ${minGapForWcag}.`);
    config = {
      ...config,
      lightning: {
        ...config.lightning,
        gapS: [Math.max(config.lightning.gapS[0], minGapForWcag), config.lightning.gapS[1]],
      },
    };
  }

  // Clamp vfov min/max
  if (config.camera.vfov.min > config.camera.vfov.max) {
    warn(`vfov.min (${config.camera.vfov.min}) > vfov.max (${config.camera.vfov.max}); swapping.`);
    config = {
      ...config,
      camera: {
        ...config.camera,
        vfov: {
          ...config.camera.vfov,
          min: config.camera.vfov.max,
          max: config.camera.vfov.min,
        },
      },
    };
  }

  return config;
}
