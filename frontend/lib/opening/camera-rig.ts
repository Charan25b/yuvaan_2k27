// camera-rig.ts — Pure math functions for camera positioning and logo framing.
// No imports from opening.config.ts; all config values are passed as arguments.

const DEG2RAD = Math.PI / 180;

// ─── Helpers ─────────────────────────────────────────────────────────

/** Clamp value between min and max. */
export function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

/** Hermite smoothstep. Returns 0 when x<=edge0, 1 when x>=edge1. */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

/** Linear interpolation. */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Convert positive depth axis to world Z: toWorldZ(depth) = -depth. */
export function toWorldZ(depth: number): number {
  return -depth;
}

// ─── Monotone C1 Cubic Interpolation ─────────────────────────────────

/**
 * Monotone C1 cubic (Fritsch–Carlson) interpolation on sorted keyframes.
 * Keyframes: [[progress0, depth0], [progress1, depth1], ...].
 * Returns depth at a given progress.
 */
export function depthAt(
  p: number,
  keyframes: readonly [number, number][]
): number {
  const n = keyframes.length;
  if (n === 0) return 0;
  if (n === 1) return keyframes[0][1];
  if (p <= keyframes[0][0]) return keyframes[0][1];
  if (p >= keyframes[n - 1][0]) return keyframes[n - 1][1];

  // Compute finite differences
  const dx: number[] = [];
  const dy: number[] = [];
  const m: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    dx.push(keyframes[i + 1][0] - keyframes[i][0]);
    dy.push(keyframes[i + 1][1] - keyframes[i][1]);
    m.push(dy[i] / dx[i]);
  }

  // Compute tangents (Fritsch–Carlson)
  const tangents: number[] = new Array(n);
  tangents[0] = m[0];
  tangents[n - 1] = m[n - 2];
  for (let i = 1; i < n - 1; i++) {
    if (m[i - 1] * m[i] <= 0) {
      tangents[i] = 0;
    } else {
      tangents[i] = (m[i - 1] + m[i]) * 0.5;
    }
  }

  // Enforce monotonicity
  for (let i = 0; i < n - 1; i++) {
    if (Math.abs(m[i]) < 1e-10) {
      tangents[i] = 0;
      tangents[i + 1] = 0;
    } else {
      const alpha = tangents[i] / m[i];
      const beta = tangents[i + 1] / m[i];
      const sum2 = alpha * alpha + beta * beta;
      if (sum2 > 9) {
        const tau = 3 / Math.sqrt(sum2);
        tangents[i] = tau * alpha * m[i];
        tangents[i + 1] = tau * beta * m[i];
      }
    }
  }

  // Find segment
  let seg = 0;
  for (let i = 0; i < n - 1; i++) {
    if (p >= keyframes[i][0] && p <= keyframes[i + 1][0]) {
      seg = i;
      break;
    }
  }

  // Hermite basis
  const h = dx[seg];
  const t = (p - keyframes[seg][0]) / h;
  const t2 = t * t;
  const t3 = t2 * t;
  const h00 = 2 * t3 - 3 * t2 + 1;
  const h10 = t3 - 2 * t2 + t;
  const h01 = -2 * t3 + 3 * t2;
  const h11 = t3 - t2;

  return (
    h00 * keyframes[seg][1] +
    h10 * h * tangents[seg] +
    h01 * keyframes[seg + 1][1] +
    h11 * h * tangents[seg + 1]
  );
}

// ─── FOV Calculation ─────────────────────────────────────────────────

/**
 * Compute vertical FOV in degrees based on viewport aspect ratio.
 * Smoothly interpolates between portrait and landscape FOVs,
 * then clamps to min/max.
 */
export function vfovFor(
  aspect: number,
  landscape: number,
  portrait: number,
  min: number,
  max: number,
  aspectRange: [number, number]
): number {
  const t = smoothstep(aspectRange[0], aspectRange[1], aspect);
  const raw = lerp(portrait, landscape, t);
  return clamp(raw, min, max);
}

/**
 * Compute the FOV bump for the pass-through effect.
 * Returns additional degrees to add to the base FOV.
 * The bump is a smooth triangle across the passThrough.window
 * [start, peak, end] in progress space.
 */
export function fovBump(
  progress: number,
  bumpDeg: number,
  window: [number, number, number]
): number {
  const [start, peak, end] = window;
  if (progress < start || progress > end) return 0;
  if (progress <= peak) {
    return bumpDeg * smoothstep(start, peak, progress);
  }
  return bumpDeg * (1 - smoothstep(peak, end, progress));
}

// ─── Visible Size at Depth ───────────────────────────────────────────

/** Visible height at a given depth for a given vertical FOV (degrees). */
export function visibleHeight(depth: number, vfovDeg: number): number {
  return 2 * depth * Math.tan((vfovDeg * DEG2RAD) * 0.5);
}

/** Visible width at a given depth for a given vertical FOV and aspect ratio. */
export function visibleWidth(depth: number, vfovDeg: number, aspect: number): number {
  return visibleHeight(depth, vfovDeg) * aspect;
}

// ─── Logo Framing ────────────────────────────────────────────────────

export interface LogoDimensions {
  width: number;
  height: number;
}

/**
 * Compute logo plane size in world units.
 * logoAspect: natural width/height of the loaded logo image.
 */
export function fitLogo(
  aspect: number,
  vfovDeg: number,
  logoAspect: number,
  cameraStartDepth: number,
  logoDepth: number,
  widthFraction: { desktop: number; mobile: number },
  maxHeightFraction: { desktop: number; mobile: number },
  fitAspectRange: [number, number]
): LogoDimensions {
  const d0 = logoDepth - cameraStartDepth;
  const visH = visibleHeight(d0, vfovDeg);
  const visW = visH * aspect;
  const t = smoothstep(fitAspectRange[0], fitAspectRange[1], aspect);
  const fW = lerp(widthFraction.mobile, widthFraction.desktop, t);
  const fH = lerp(maxHeightFraction.mobile, maxHeightFraction.desktop, t);
  const logoW = Math.min(fW * visW, fH * visH * logoAspect);
  const logoH = logoW / logoAspect;
  return { width: logoW, height: logoH };
}

// ─── Camera Pose ─────────────────────────────────────────────────────

export interface CameraPose {
  x: number;
  y: number;
  z: number;
  pitch: number; // radians
  yaw: number;   // radians
  roll: number;  // radians
  vfov: number;  // degrees (with passThrough bump)
}

/**
 * Compute full camera pose at the current progress and elapsed time.
 * All config values are passed in explicitly — no module-level imports.
 */
export function cameraPose(
  progress: number,
  elapsedS: number,
  aspect: number,
  keyframes: readonly [number, number][],
  vfovConfig: {
    landscape: number;
    portrait: number;
    min: number;
    max: number;
    aspectRange: [number, number];
  },
  passThroughConfig: {
    fovBumpDeg: number;
    window: [number, number, number];
  },
  swayConfig: {
    position: number;
    rollDeg: number;
    periodS: number;
  },
  pitchMaxRad: number,
  eyeY: number
): CameraPose {
  const depth = depthAt(progress, keyframes);
  const baseVfov = vfovFor(
    aspect,
    vfovConfig.landscape,
    vfovConfig.portrait,
    vfovConfig.min,
    vfovConfig.max,
    vfovConfig.aspectRange
  );
  const bump = fovBump(progress, passThroughConfig.fovBumpDeg, passThroughConfig.window);
  const vfov = clamp(baseVfov + bump, vfovConfig.min, vfovConfig.max);

  // Ambient sway (time-based, independent of scroll)
  const phase = (elapsedS / swayConfig.periodS) * Math.PI * 2;
  const swayX = Math.sin(phase) * swayConfig.position;
  const swayY = Math.cos(phase * 0.7) * swayConfig.position * 0.6;
  const rollRad = Math.sin(phase * 0.5) * swayConfig.rollDeg * DEG2RAD;

  // Subtle pitch based on scroll velocity approximation (progress-driven)
  const pitch = clamp(Math.sin(phase * 1.3) * pitchMaxRad * 0.5, -pitchMaxRad, pitchMaxRad);

  return {
    x: swayX,
    y: eyeY + swayY,
    z: toWorldZ(depth),
    pitch,
    yaw: 0,
    roll: rollRad,
    vfov,
  };
}
