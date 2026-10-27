// scene.ts — WebGL renderer lifecycle, resize, loop, tiers, disposal.
// Implements the full 3D cinematic opening using Three.js.

import * as THREE from "three";
import type { OpeningConfig, QualityTier, QualityTierName } from "./opening.config";
import { validateOpeningConfig } from "./opening.config";
import {
  cameraPose,
  fitLogo,
  depthAt,
  toWorldZ,
  visibleHeight,
  smoothstep,
  lerp,
} from "./camera-rig";
import {
  skyVertexShader,
  skyFragmentShader,
  logoVertexShader,
  logoFragmentShader,
  embersVertexShader,
  embersFragmentShader,
  mistVertexShader,
  mistFragmentShader,
  backdropVertexShader,
  backdropFragmentShader,
  volumetricCloudVertexShader,
  volumetricCloudFragmentShader,
  lightningBoltVertexShader,
  lightningBoltFragmentShader,
  lightningGlowVertexShader,
  lightningGlowFragmentShader,
} from "./shaders";

// ─── Types ─────────────────────────────────────────────────────────────

export interface SceneDebugInfo {
  tier: QualityTierName;
  cloudLayerCounts: {
    foreground: number;
    midground: number;
    distant: number;
    total: number;
  };
  cameraZ: number;
  logoZ: number;
  foregroundZRange: [number, number];
  lightning: {
    visible: boolean;
    intensity: number;
    vertexCount: number;
    start: [number, number, number];
    end: [number, number, number];
  };
}

export interface SceneHandle {
  /** Start the render loop. */
  start: () => void;
  /** Update smoothed progress each frame (called from orchestrator RAF). */
  setProgress: (p: number) => void;
  /** Update reduced-motion preference dynamically. */
  setReducedMotion?: (reduced: boolean) => void;
  /** Trigger cinematic exit transition into main website. */
  triggerExit: (onComplete: () => void) => void;
  /** Trigger a lightning strike immediately. */
  triggerStrike: () => void;
  /** Inspect scene state for automated verification. */
  getDebugInfo?: () => SceneDebugInfo;
  /** Dispose all GPU resources. */
  dispose: () => void;
  /** Get current quality tier name. */
  getTier: () => QualityTierName;
}

// ─── Procedural Multi-Octave Value Noise Generator ──────────────────────

function createNoiseTexture(size: number = 256): THREE.DataTexture {
  const perm = new Uint8Array(512);
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  // Deterministic seed so noise is consistent across runs
  let seed = 1337;
  const nextRand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(nextRand() * (i + 1));
    const tmp = p[i];
    p[i] = p[j];
    p[j] = tmp;
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];

  function grad(hash: number, x: number, y: number): number {
    const h = hash & 7;
    const u = h < 4 ? x : y;
    const v = h < 4 ? y : x;
    return ((h & 1) ? -u : u) + ((h & 2) ? -2.0 * v : 2.0 * v);
  }

  function fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  function perlin(x: number, y: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const u = fade(xf);
    const v = fade(yf);
    const aa = perm[perm[X] + Y];
    const ab = perm[perm[X] + Y + 1];
    const ba = perm[perm[X + 1] + Y];
    const bb = perm[perm[X + 1] + Y + 1];

    const x1 = (1 - u) * grad(aa, xf, yf) + u * grad(ba, xf - 1, yf);
    const x2 = (1 - u) * grad(ab, xf, yf - 1) + u * grad(bb, xf - 1, yf - 1);
    return (1 - v) * x1 + v * x2;
  }

  const data = new Uint8Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let val = 0;
      let freq = 4;
      let amp = 0.55;
      let max = 0;
      for (let oct = 0; oct < 5; oct++) {
        val += perlin((x / size) * freq, (y / size) * freq) * amp;
        max += amp;
        freq *= 2.05;
        amp *= 0.5;
      }
      const norm = (val / max + 1) * 0.5;
      data[y * size + x] = Math.min(255, Math.max(0, Math.floor(norm * 255)));
    }
  }

  const tex = new THREE.DataTexture(data, size, size, THREE.RedFormat);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipMapLinearFilter;
  tex.generateMipmaps = true;
  tex.needsUpdate = true;
  return tex;
}

// ─── Colour helper ─────────────────────────────────────────────────────

function hexToVec3(hex: string): THREE.Vector3 {
  const c = new THREE.Color(hex);
  return new THREE.Vector3(c.r, c.g, c.b);
}

// ─── Quality tier selection ────────────────────────────────────────────

function selectInitialTier(config: OpeningConfig): QualityTierName {
  const w = typeof window !== "undefined" ? window.innerWidth : 1920;
  const cores = typeof navigator !== "undefined" ? (navigator.hardwareConcurrency ?? 8) : 8;
  const mem = typeof navigator !== "undefined"
    ? ((navigator as unknown as { deviceMemory?: number }).deviceMemory ?? 8)
    : 8;

  if (cores <= config.quality.initial.lowAtOrBelowCores ||
      mem <= config.quality.initial.lowAtOrBelowMemoryGb) {
    return "low";
  }
  if (w < config.quality.initial.mediumBelowWidth) {
    return "medium";
  }
  return "high";
}

// ─── Procedural Branching Lightning System ────────────────────────────

export interface LightningSystem {
  boltMesh: THREE.Mesh;
  glowMesh: THREE.Mesh;
  update: (
    nowMs: number,
    isExiting: boolean,
    isMobile: boolean,
    reducedMotion: boolean,
  ) => {
    intensity: number;
    growth: number;
    startPos: THREE.Vector3;
    endPos: THREE.Vector3;
    flash: number;
  };
  triggerStrike: (isMobile?: boolean) => void;
  dispose: () => void;
}

interface BoltSegment {
  p1: THREE.Vector3;
  p2: THREE.Vector3;
  tStart: number;
  tEnd: number;
  isBranch: boolean;
  generation: number;
}

function createBoltGeometry(
  start: THREE.Vector3,
  end: THREE.Vector3,
  maxDisplacement: number = 0.72,
  numBranches: number = 4,
): THREE.BufferGeometry {
  function subdivide(
    p1: THREE.Vector3,
    p2: THREE.Vector3,
    t1: number,
    t2: number,
    disp: number,
    depth: number,
    isBranch: boolean,
    generation: number,
  ): BoltSegment[] {
    if (depth <= 0 || p1.distanceTo(p2) < 0.16) {
      return [{ p1, p2, tStart: t1, tEnd: t2, isBranch, generation }];
    }
    const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
    const dir = new THREE.Vector3().subVectors(p2, p1).normalize();
    let perp1 = new THREE.Vector3(0, 0, 1).cross(dir);
    if (perp1.lengthSq() < 0.01) perp1 = new THREE.Vector3(1, 0, 0).cross(dir);
    perp1.normalize();
    const perp2 = new THREE.Vector3().crossVectors(dir, perp1).normalize();

    const jitterX = (Math.random() - 0.5) * 2.0 * disp;
    const jitterZ = (Math.random() - 0.5) * 0.65 * disp;
    mid.addScaledVector(perp1, jitterX);
    mid.addScaledVector(perp2, jitterZ);

    const tMid = (t1 + t2) * 0.5;
    return [
      ...subdivide(p1, mid, t1, tMid, disp * 0.54, depth - 1, isBranch, generation),
      ...subdivide(mid, p2, tMid, t2, disp * 0.54, depth - 1, isBranch, generation),
    ];
  }

  const trunk = subdivide(start, end, 0.0, 1.0, maxDisplacement, 4, false, 0);
  const allSegments: BoltSegment[] = [...trunk];

  const totalTrunk = trunk.length;
  for (let b = 0; b < numBranches; b++) {
    const frac = 0.15 + 0.62 * (b / Math.max(1, numBranches - 1)) + (Math.random() - 0.5) * 0.08;
    const idx = Math.min(totalTrunk - 2, Math.max(1, Math.floor(totalTrunk * frac)));
    const origin = trunk[idx].p1.clone();
    const tOrigin = trunk[idx].tStart;

    const trunkDir = new THREE.Vector3().subVectors(end, start).normalize();
    const sideSign = b % 2 === 0 ? 1 : -1;
    const spreadAngle = sideSign * (0.42 + Math.random() * 0.42);
    const branchDir = trunkDir
      .clone()
      .applyAxisAngle(new THREE.Vector3(0, 0, 1), spreadAngle)
      .normalize();

    const branchLen = start.distanceTo(end) * (0.34 + Math.random() * 0.24);
    const branchEnd = origin.clone().addScaledVector(branchDir, branchLen);
    const tBranchEnd = Math.min(1.0, tOrigin + 0.32);

    const primaryBranch = subdivide(
      origin,
      branchEnd,
      tOrigin,
      tBranchEnd,
      maxDisplacement * 0.45,
      3,
      true,
      1,
    );
    allSegments.push(...primaryBranch);

    // Secondary sub-fork on main branches for natural fractal silhouette
    if (primaryBranch.length >= 4) {
      const subIdx = Math.floor(primaryBranch.length * 0.5);
      const subOrigin = primaryBranch[subIdx].p1.clone();
      const subDir = branchDir
        .clone()
        .applyAxisAngle(new THREE.Vector3(0, 0, 1), -sideSign * (0.35 + Math.random() * 0.25))
        .normalize();
      const subEnd = subOrigin.clone().addScaledVector(subDir, branchLen * 0.48);
      const subBranch = subdivide(
        subOrigin,
        subEnd,
        primaryBranch[subIdx].tStart,
        Math.min(1.0, primaryBranch[subIdx].tStart + 0.18),
        maxDisplacement * 0.25,
        2,
        true,
        2,
      );
      allSegments.push(...subBranch);
    }
  }

  const positions: number[] = [];
  const uvs: number[] = [];
  const branches: number[] = [];
  const indices: number[] = [];

  let vertIdx = 0;
  for (const seg of allSegments) {
    const dir = new THREE.Vector3().subVectors(seg.p2, seg.p1);
    const segLen = dir.length();
    if (segLen < 1e-4) continue;
    dir.divideScalar(segLen);

    let perp1 = new THREE.Vector3(0, 0, 1).cross(dir);
    if (perp1.lengthSq() < 0.01) perp1 = new THREE.Vector3(1, 0, 0).cross(dir);
    perp1.normalize();
    const perp2 = new THREE.Vector3().crossVectors(dir, perp1).normalize();

    // Overlap segment ends slightly to eliminate joint gaps at sharp bends
    const extStart = seg.p1.clone().addScaledVector(dir, -0.025);
    const extEnd = seg.p2.clone().addScaledVector(dir, 0.025);

    const baseWidth = seg.generation === 0 ? 0.135 : seg.generation === 1 ? 0.072 : 0.042;
    const wStart = baseWidth * (1.0 - seg.tStart * 0.28);
    const wEnd = baseWidth * (1.0 - seg.tEnd * 0.28);
    const isB = seg.isBranch ? 1.0 : 0.0;

    // Crossed ribbon 1 (camera-facing plane)
    const p1a = extStart.clone().addScaledVector(perp1, -wStart);
    const p1b = extStart.clone().addScaledVector(perp1, wStart);
    const p2a = extEnd.clone().addScaledVector(perp1, -wEnd);
    const p2b = extEnd.clone().addScaledVector(perp1, wEnd);

    positions.push(
      p1a.x, p1a.y, p1a.z,
      p1b.x, p1b.y, p1b.z,
      p2a.x, p2a.y, p2a.z,
      p2b.x, p2b.y, p2b.z,
    );
    uvs.push(0, seg.tStart, 1, seg.tStart, 0, seg.tEnd, 1, seg.tEnd);
    branches.push(isB, isB, isB, isB);
    indices.push(vertIdx, vertIdx + 1, vertIdx + 2, vertIdx + 1, vertIdx + 3, vertIdx + 2);
    vertIdx += 4;

    // Crossed ribbon 2 (orthogonal plane for 3D volume)
    const q1a = extStart.clone().addScaledVector(perp2, -wStart);
    const q1b = extStart.clone().addScaledVector(perp2, wStart);
    const q2a = extEnd.clone().addScaledVector(perp2, -wEnd);
    const q2b = extEnd.clone().addScaledVector(perp2, wEnd);

    positions.push(
      q1a.x, q1a.y, q1a.z,
      q1b.x, q1b.y, q1b.z,
      q2a.x, q2a.y, q2a.z,
      q2b.x, q2b.y, q2b.z,
    );
    uvs.push(0, seg.tStart, 1, seg.tStart, 0, seg.tEnd, 1, seg.tEnd);
    branches.push(isB, isB, isB, isB);
    indices.push(vertIdx, vertIdx + 1, vertIdx + 2, vertIdx + 1, vertIdx + 3, vertIdx + 2);
    vertIdx += 4;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setAttribute("aBranch", new THREE.Float32BufferAttribute(branches, 1));
  geo.setIndex(indices);
  return geo;
}

function createLightningSystem(config: OpeningConfig, startTimeMs: number): LightningSystem {
  const initialStart = new THREE.Vector3(-2.3, 2.1, -6.2);
  const initialEnd = new THREE.Vector3(-1.4, -1.2, -5.8);
  const initialGeo = createBoltGeometry(initialStart, initialEnd);

  const boltMat = new THREE.ShaderMaterial({
    vertexShader: lightningBoltVertexShader,
    fragmentShader: lightningBoltFragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: {
      uIntensity: { value: 0.0 },
      uStrikeGrowth: { value: 1.0 },
      uCoreColor: { value: new THREE.Vector3(1.0, 1.0, 1.0) },
      uInnerGlowColor: { value: hexToVec3(config.palette.lightning) },
      uOuterGlowColor: { value: hexToVec3(config.palette.cyan) },
    },
  });

  const boltMesh = new THREE.Mesh(initialGeo, boltMat);
  boltMesh.renderOrder = 5;
  boltMesh.visible = false;

  const glowGeo = new THREE.PlaneGeometry(2.4, 2.4);
  const glowMat = new THREE.ShaderMaterial({
    vertexShader: lightningGlowVertexShader,
    fragmentShader: lightningGlowFragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: {
      uIntensity: { value: 0.0 },
      uGlowColor: { value: hexToVec3(config.palette.lightning) },
    },
  });

  const glowMesh = new THREE.Mesh(glowGeo, glowMat);
  glowMesh.renderOrder = 4;
  glowMesh.visible = false;

  // Strike zones calibrated strictly inside camera frustum (desktop & scaled for mobile)
  const strikeZones = [
    // Zone 0: Left Midground Storm Pillar
    { start: new THREE.Vector3(-2.5, 2.1, -6.2), end: new THREE.Vector3(-1.5, -1.3, -5.8) },
    // Zone 1: Right Midground Storm Anvil
    { start: new THREE.Vector3(2.5, 2.2, -6.4), end: new THREE.Vector3(1.4, -1.2, -5.9) },
    // Zone 2: Upper-Left Cloud Chasm
    { start: new THREE.Vector3(-1.6, 2.4, -7.2), end: new THREE.Vector3(-0.6, -0.8, -6.6) },
    // Zone 3: Upper-Right Cloud Chasm
    { start: new THREE.Vector3(1.7, 2.3, -7.4), end: new THREE.Vector3(0.7, -0.9, -6.8) },
    // Zone 4: Deep Left Horizon Turret
    { start: new THREE.Vector3(-3.0, 1.9, -8.2), end: new THREE.Vector3(-1.9, -1.6, -7.6) },
    // Zone 5: Deep Right Horizon Turret
    { start: new THREE.Vector3(3.0, 1.9, -8.2), end: new THREE.Vector3(1.9, -1.5, -7.6) },
  ];

  let currentZone = 0;
  let strikeStartTime = -1000;
  const strikeDuration = Math.max(260, config.lightning.strikeMaxMs);
  let nextStrikeMs =
    startTimeMs +
    lerp(config.lightning.firstDelayS[0], config.lightning.firstDelayS[1], 0.35) * 1000;
  const activeStart = initialStart.clone();
  const activeEnd = initialEnd.clone();

  function spawnStrike(nowMs: number, isMobile: boolean) {
    strikeStartTime = nowMs;
    const zone = strikeZones[currentZone];
    currentZone = (currentZone + 1 + Math.floor(Math.random() * 2)) % strikeZones.length;

    // On narrow portrait viewports, pull X inward so the entire bolt stays on screen
    const xScale = isMobile ? 0.52 : 1.0;
    const sJitter = new THREE.Vector3(
      (Math.random() - 0.5) * 0.45 * xScale,
      (Math.random() - 0.5) * 0.3,
      (Math.random() - 0.5) * 0.4,
    );
    const eJitter = new THREE.Vector3(
      (Math.random() - 0.5) * 0.55 * xScale,
      (Math.random() - 0.5) * 0.35,
      (Math.random() - 0.5) * 0.4,
    );

    activeStart.set(zone.start.x * xScale, zone.start.y, zone.start.z).add(sJitter);
    activeEnd.set(zone.end.x * xScale, zone.end.y, zone.end.z).add(eJitter);

    const numBranches = 4 + Math.floor(Math.random() * 2);
    const newGeo = createBoltGeometry(activeStart, activeEnd, isMobile ? 0.48 : 0.68, numBranches);
    boltMesh.geometry.dispose();
    boltMesh.geometry = newGeo;

    glowMesh.position.copy(activeStart);
    boltMesh.visible = true;
    glowMesh.visible = true;
  }

  return {
    boltMesh,
    glowMesh,
    update(nowMs: number, isExiting: boolean, isMobile: boolean, reducedMotion: boolean) {
      if (isExiting || !config.lightning.enabled) {
        boltMat.uniforms.uIntensity.value = 0.0;
        glowMat.uniforms.uIntensity.value = 0.0;
        boltMesh.visible = false;
        glowMesh.visible = false;
        return { intensity: 0, growth: 0, startPos: activeStart, endPos: activeEnd, flash: 0 };
      }

      if (nowMs >= nextStrikeMs && nowMs > strikeStartTime + strikeDuration) {
        const gapMultiplier = reducedMotion ? 1.6 : 1.0;
        const gap =
          lerp(config.lightning.gapS[0], config.lightning.gapS[1], Math.random()) *
          1000 *
          gapMultiplier;
        nextStrikeMs = nowMs + gap;
        spawnStrike(nowMs, isMobile);
      }

      const elapsedStrike = nowMs - strikeStartTime;
      let intensity = 0;
      let growth = 1.0;

      if (elapsedStrike >= 0 && elapsedStrike < strikeDuration) {
        // Leader downward propagation during first 45ms
        growth = smoothstep(0, 45, elapsedStrike);

        if (reducedMotion) {
          // Gentle single pulse for reduced-motion accessibility
          const env = Math.sin((elapsedStrike / strikeDuration) * Math.PI);
          intensity = env * config.lightning.peak * 0.55;
        } else if (elapsedStrike < 40) {
          intensity = smoothstep(0, 40, elapsedStrike);
        } else if (elapsedStrike < 85) {
          intensity = 1.0 - 0.78 * smoothstep(40, 85, elapsedStrike);
        } else if (elapsedStrike < 140) {
          // Secondary restrike flicker
          intensity =
            0.22 +
            0.78 *
              (elapsedStrike < 110
                ? smoothstep(85, 110, elapsedStrike)
                : 1.0 - smoothstep(110, 140, elapsedStrike));
        } else if (elapsedStrike < 195) {
          intensity = 0.20 + 0.35 * (1.0 - smoothstep(140, 195, elapsedStrike));
        } else {
          intensity = 0.32 * (1.0 - smoothstep(195, strikeDuration, elapsedStrike));
        }

        intensity *= config.lightning.peak / 0.75;
        boltMesh.visible = true;
        glowMesh.visible = true;
      } else {
        intensity = 0;
        boltMesh.visible = false;
        glowMesh.visible = false;
      }

      boltMat.uniforms.uIntensity.value = intensity;
      boltMat.uniforms.uStrikeGrowth.value = growth;
      glowMat.uniforms.uIntensity.value = intensity;

      return {
        intensity,
        growth,
        startPos: activeStart,
        endPos: activeEnd,
        flash: intensity * 0.08,
      };
    },
    triggerStrike(isMobile: boolean = false) {
      const now = performance.now();
      spawnStrike(now, isMobile);
      boltMat.uniforms.uIntensity.value = 1.0;
      boltMat.uniforms.uStrikeGrowth.value = 1.0;
      glowMat.uniforms.uIntensity.value = 1.0;
    },
    dispose() {
      boltMesh.geometry.dispose();
      (boltMesh.material as THREE.Material).dispose();
      glowMesh.geometry.dispose();
      (glowMesh.material as THREE.Material).dispose();
    },
  };
}

// ─── Procedural Cumulus Puff Texture Generator ────────────────────────

function createCumulusPuffTexture(type = 0): THREE.CanvasTexture {
  const size = 512;
  const cvs = document.createElement("canvas");
  cvs.width = size;
  cvs.height = size;
  const ctx = cvs.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(cvs);

  ctx.clearRect(0, 0, size, size);

  const perm = new Uint8Array(512);
  const p = [
    151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,
    8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,
    35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,
    134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,
    55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,
    18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,
    250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,
    189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,
    172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,
    228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,
    107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,
    138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180,
  ];
  for (let i = 0; i < 256; i++) perm[i] = perm[i + 256] = p[i];

  function grad(hash: number, x: number, y: number): number {
    const h = hash & 7;
    const u = h < 4 ? x : y;
    const v = h < 4 ? y : x;
    return ((h & 1) ? -u : u) + ((h & 2) ? -2.0 * v : 2.0 * v);
  }

  function perlin(x: number, y: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const u = xf * xf * (3 - 2 * xf);
    const v = yf * yf * (3 - 2 * yf);
    const g00 = grad(perm[perm[X] + Y], xf, yf);
    const g10 = grad(perm[perm[X + 1] + Y], xf - 1, yf);
    const g01 = grad(perm[perm[X] + Y + 1], xf, yf - 1); // Fixed X index
    const g11 = grad(perm[perm[X + 1] + Y + 1], xf - 1, yf - 1);
    const x1 = g00 + u * (g10 - g00);
    const x2 = g01 + u * (g11 - g01);
    return x1 + v * (x2 - x1);
  }

  function fbm(x: number, y: number): number {
    let v = 0, a = 0.52, f = 1.0;
    for (let i = 0; i < 5; i++) {
      v += a * perlin(x * f, y * f);
      f *= 2.08;
      a *= 0.48;
    }
    return v;
  }

  // Distinct multi-lobe silhouettes (prevents uniform circular blobs)
  const lobes =
    type === 0
      ? [
          // Towering Cumulonimbus Anvil
          { x: 256, y: 265, r: 128, w: 0.95 },
          { x: 175, y: 230, r: 102, w: 0.90 },
          { x: 335, y: 225, r: 108, w: 0.92 },
          { x: 225, y: 155, r: 94, w: 0.98 },
          { x: 292, y: 150, r: 98, w: 1.00 },
          { x: 140, y: 290, r: 88, w: 0.80 },
          { x: 372, y: 285, r: 92, w: 0.82 },
          { x: 205, y: 335, r: 96, w: 0.72 },
          { x: 310, y: 340, r: 96, w: 0.74 },
        ]
      : type === 1
      ? [
          // Wide Layered Storm Bank
          { x: 256, y: 265, r: 122, w: 0.94 },
          { x: 155, y: 255, r: 108, w: 0.90 },
          { x: 358, y: 250, r: 112, w: 0.91 },
          { x: 208, y: 190, r: 92, w: 0.96 },
          { x: 305, y: 185, r: 95, w: 0.96 },
          { x: 110, y: 295, r: 78, w: 0.78 },
          { x: 402, y: 290, r: 82, w: 0.80 },
        ]
      : [
          // Irregular Framing Cloud Cluster
          { x: 240, y: 250, r: 115, w: 0.90 },
          { x: 320, y: 220, r: 98, w: 0.94 },
          { x: 170, y: 215, r: 92, w: 0.88 },
          { x: 275, y: 310, r: 95, w: 0.76 },
          { x: 195, y: 305, r: 88, w: 0.75 },
        ];

  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const warpX = fbm(x / 48, y / 48) * 32;
      const warpY = fbm(x / 48 + 4.3, y / 48 + 2.1) * 32;
      const px = x + warpX;
      const py = y + warpY;

      let bestLobe = 0;
      let secondLobe = 0;
      let bestTopness = 0;

      for (const l of lobes) {
        const d = Math.hypot(px - l.x, py - l.y);
        if (d < l.r) {
          const factor = 1.0 - d / l.r;
          const val = factor * factor * (3.0 - 2.0 * factor) * l.w;
          const lobeTop = clamp((l.y - py) / l.r * 0.5 + 0.5, 0, 1);
          if (val > bestLobe) {
            secondLobe = bestLobe;
            bestLobe = val;
            bestTopness = lobeTop;
          } else if (val > secondLobe) {
            secondLobe = val;
          }
        }
      }

      if (bestLobe <= 0.005) continue;

      // Smooth union without saturating/clamping the entire interior to 1.0
      const combinedLobe = Math.min(1.0, bestLobe + secondLobe * 0.24);
      const billowNoise = (fbm(x / 26, y / 26) + 0.5);
      const eroded = combinedLobe - (1.0 - combinedLobe) * (1.0 - billowNoise) * 0.48;
      const density = smoothstep(0.12, 0.82, eroded);

      if (density > 0.015) {
        const idx = (y * size + x) * 4;
        const normY = (size - y) / size;

        // Rim & turret lighting: silver-blue crests on top of each lobe, dark indigo cores
        const rimFactor = clamp(
          bestTopness * 0.65 + normY * 0.35 + (1.0 - density) * 0.35 + (billowNoise - 0.5) * 0.3,
          0,
          1,
        );
        const shadowDepth = smoothstep(0.25, 0.85, density) * (1.0 - normY * 0.55);

        // Dark indigo-violet base (18, 22, 44) -> Slate mid (54, 68, 104) -> Silver-blue crest (208, 228, 255)
        const r = clamp(
          20 + 42 * (1 - shadowDepth) + 148 * Math.pow(rimFactor, 2.1),
          14,
          248,
        );
        const g = clamp(
          24 + 52 * (1 - shadowDepth) + 158 * Math.pow(rimFactor, 2.0),
          18,
          250,
        );
        const b = clamp(
          46 + 72 * (1 - shadowDepth) + 136 * Math.pow(rimFactor, 1.85),
          38,
          255,
        );

        const alpha = Math.min(248, Math.floor(Math.pow(density, 0.78) * 245));

        data[idx] = Math.floor(r);
        data[idx + 1] = Math.floor(g);
        data[idx + 2] = Math.floor(b);
        data[idx + 3] = alpha;
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const tex = new THREE.CanvasTexture(cvs);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.minFilter = THREE.LinearMipMapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  return tex;
}

// ─── Volumetric Cloud Formation System ────────────────────────────────

export interface VolumetricCloudFormation {
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
  layer: "distant" | "midground" | "foreground";
}

export interface VolumetricCloudSystem {
  group: THREE.Group;
  formations: VolumetricCloudFormation[];
  update: (
    nowMs: number,
    elapsedS: number,
    lightningInfo: {
      intensity: number;
      startPos: THREE.Vector3;
      endPos: THREE.Vector3;
    },
    exitProgress: number,
    reducedMotion: boolean,
  ) => void;
  setTier: (tierName: QualityTierName) => void;
  setMobileLayout: (isMobile: boolean) => void;
  dispose: () => void;
}

function createVolumetricCloudFormations(
  config: OpeningConfig,
  noiseTex: THREE.DataTexture,
  tier: QualityTier,
): VolumetricCloudSystem {
  const group = new THREE.Group();
  const formations: VolumetricCloudFormation[] = [];

  const tex0 = createCumulusPuffTexture(0);
  const tex1 = createCumulusPuffTexture(1);
  const tex2 = createCumulusPuffTexture(2);

  const lightningCol = hexToVec3(config.palette.lightning);
  const shadowCol = new THREE.Vector3(0.08, 0.09, 0.21); // Deep midnight violet-indigo
  const cloudRim = new THREE.Vector3(0.76, 0.88, 1.0);   // Silver-blue rim highlight
  const horizonCol = hexToVec3(config.palette.gold);     // Restrained horizon amber

  function createMaterial(
    tex: THREE.Texture,
    layerType: number,
    nearFade: [number, number],
    driftSpeed: number,
  ): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
      vertexShader: volumetricCloudVertexShader,
      fragmentShader: volumetricCloudFragmentShader,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      side: THREE.DoubleSide,
      uniforms: {
        uTexture: { value: tex },
        uNoise: { value: noiseTex },
        uColor: { value: new THREE.Vector3(0.92, 0.95, 1.0) },
        uShadowColor: { value: shadowCol },
        uRimColor: { value: cloudRim },
        uHorizonColor: { value: horizonCol },
        uLightningStart: { value: new THREE.Vector3(-2.5, 2.0, -6.2) },
        uLightningEnd: { value: new THREE.Vector3(-1.5, -1.2, -5.8) },
        uLightningIntensity: { value: 0.0 },
        uLightningColor: { value: lightningCol },
        uExitProgress: { value: 0.0 },
        uNearFade: { value: new THREE.Vector2(nearFade[0], nearFade[1]) },
        uLayerType: { value: layerType },
        uTime: { value: 0.0 },
        uDriftSpeed: { value: driftSpeed },
        uCorridorRadius: { value: 1.05 },
      },
    });
  }

  // Layer 0: Distant backdrop clouds (Z = -9.5 to -15.5)
  const bgMat0 = createMaterial(tex0, 0.0, [0.8, 2.4], 0.008);
  const bgMat1 = createMaterial(tex1, 0.0, [0.8, 2.4], 0.008);

  // Layer 1: Midground storm columns & canopies (Z = -5.3 to -8.2)
  const midMat0 = createMaterial(tex0, 1.0, [0.5, 1.8], 0.014);
  const midMat1 = createMaterial(tex1, 1.0, [0.5, 1.8], 0.014);

  // Layer 2: Foreground framing clouds in front of logo (Z = -1.8 to -3.8; logo is at Z = -5.0)
  const fgMat0 = createMaterial(tex2, 2.0, [0.35, 1.35], 0.022);
  const fgMat1 = createMaterial(tex0, 2.0, [0.35, 1.35], 0.022);

  const materials = [bgMat0, bgMat1, midMat0, midMat1, fgMat0, fgMat1];

  const leftGroup = new THREE.Group();
  const rightGroup = new THREE.Group();
  const topGroup = new THREE.Group();
  const bottomGroup = new THREE.Group();
  const fgLeftGroup = new THREE.Group();
  const fgRightGroup = new THREE.Group();
  const bgGroup = new THREE.Group();

  group.add(bgGroup);
  group.add(leftGroup);
  group.add(rightGroup);
  group.add(topGroup);
  group.add(bottomGroup);
  group.add(fgLeftGroup);
  group.add(fgRightGroup);

  // Deterministic pseudo-random helper so cloud layout is consistent and structured
  let cSeed = 42027;
  const rand = () => {
    cSeed = (cSeed * 48271) % 2147483647;
    return (cSeed - 1) / 2147483646;
  };

  function addCluster(
    parent: THREE.Group,
    centerX: number,
    centerY: number,
    centerZ: number,
    w: number,
    h: number,
    zSpread: number,
    count: number,
    scaleMin: number,
    scaleMax: number,
    layer: "distant" | "midground" | "foreground",
  ) {
    // Keep at least 75% of cloud formations even on low tier so silhouettes never vanish
    const scaleFactor = tier.slabs <= 4 ? 0.75 : tier.slabs <= 6 ? 0.85 : 1.0;
    const actualCount = Math.max(4, Math.round(count * scaleFactor));

    for (let i = 0; i < actualCount; i++) {
      const s = scaleMin + rand() * (scaleMax - scaleMin);
      const aspectStretch = 1.08 + rand() * 0.28;
      const geo = new THREE.PlaneGeometry(s * aspectStretch, s);

      let useMat: THREE.ShaderMaterial;
      let order = 1;
      if (layer === "distant") {
        useMat = i % 2 === 0 ? bgMat0 : bgMat1;
        order = 0;
      } else if (layer === "midground") {
        useMat = i % 2 === 0 ? midMat0 : midMat1;
        order = 1;
      } else {
        useMat = i % 2 === 0 ? fgMat0 : fgMat1;
        order = 3; // Renders in front of logoMesh (renderOrder = 2)
      }

      const mesh = new THREE.Mesh(geo, useMat);
      const t = actualCount > 1 ? i / (actualCount - 1) - 0.5 : 0;
      const ox = t * w * 0.65 + (rand() - 0.5) * w * 0.45;
      const oy = (rand() - 0.5) * h;
      const oz = (rand() - 0.5) * zSpread;

      mesh.position.set(centerX + ox, centerY + oy, centerZ + oz);
      mesh.rotation.z = (rand() - 0.5) * 0.28;
      mesh.renderOrder = order;
      parent.add(mesh);
      formations.push({ mesh, material: useMat, layer });
    }
  }

  // ── LAYER 1: Distant Storm Wall & Horizon Clouds (Z = -10.0 to -15.5) ──
  // Visible frustum at Z = -12 is X in [-8.8, +8.8], Y in [-4.9, +4.9]
  addCluster(bgGroup, -3.8, -1.8, -11.5, 6.5, 3.2, 2.5, 10, 4.8, 6.8, "distant");
  addCluster(bgGroup,  3.8, -1.8, -11.8, 6.5, 3.2, 2.5, 10, 4.8, 6.8, "distant");
  addCluster(bgGroup, -4.2,  2.2, -13.0, 7.0, 2.8, 2.5,  8, 5.2, 7.2, "distant");
  addCluster(bgGroup,  4.2,  2.2, -13.2, 7.0, 2.8, 2.5,  8, 5.2, 7.2, "distant");
  addCluster(bgGroup,  0.0, -2.8, -14.5, 9.0, 2.4, 2.0,  8, 5.5, 7.5, "distant");

  // ── LAYER 2: Midground Towering Storm Banks (Z = -5.4 to -8.2) ──
  // Visible frustum at Z = -6.5 is X in [-4.79, +4.79], Y in [-2.69, +2.69]
  // Placed inside frustum so sculpted cloud edges frame the logo at scroll = 0
  addCluster(leftGroup,  -3.5,  0.2, -6.0, 1.8, 3.8, 1.4, 12, 2.8, 4.2, "midground");
  addCluster(leftGroup,  -4.4, -0.3, -7.6, 2.2, 4.6, 1.6, 10, 3.4, 5.0, "midground");

  addCluster(rightGroup,  3.5,  0.2, -6.0, 1.8, 3.8, 1.4, 12, 2.8, 4.2, "midground");
  addCluster(rightGroup,  4.4, -0.3, -7.6, 2.2, 4.6, 1.6, 10, 3.4, 5.0, "midground");

  // Overhanging upper storm canopy & rolling lower cloud deck
  addCluster(topGroup,    0.0,  2.35, -6.2, 6.8, 1.1, 1.4, 12, 2.6, 3.9, "midground");
  addCluster(topGroup,    0.0,  3.10, -7.8, 8.2, 1.3, 1.6, 10, 3.2, 4.6, "midground");

  addCluster(bottomGroup, 0.0, -2.25, -5.9, 6.8, 1.1, 1.4, 14, 2.6, 3.9, "midground");
  addCluster(bottomGroup, 0.0, -3.05, -7.6, 8.4, 1.4, 1.6, 10, 3.2, 4.6, "midground");

  // ── LAYER 3: Foreground Framing Clouds (Z = -1.9 to -3.8 — strictly IN FRONT of logo at Z = -5.0) ──
  // Visible frustum at Z = -2.8 is X in [-2.06, +2.06], Y in [-1.16, +1.16]
  addCluster(fgLeftGroup,  -1.65,  0.82, -2.3, 0.85, 0.65, 0.7, 5, 1.45, 2.15, "foreground");
  addCluster(fgLeftGroup,  -1.75, -0.78, -3.1, 0.95, 0.70, 0.8, 5, 1.60, 2.35, "foreground");
  addCluster(fgLeftGroup,  -1.25, -0.95, -3.7, 1.10, 0.55, 0.5, 4, 1.50, 2.10, "foreground");

  addCluster(fgRightGroup,  1.65,  0.82, -2.4, 0.85, 0.65, 0.7, 5, 1.45, 2.15, "foreground");
  addCluster(fgRightGroup,  1.75, -0.78, -3.2, 0.95, 0.70, 0.8, 5, 1.60, 2.35, "foreground");
  addCluster(fgRightGroup,  1.25,  0.95, -3.7, 1.10, 0.55, 0.5, 4, 1.50, 2.10, "foreground");

  let mobileMode = false;

  return {
    group,
    formations,
    update(
      _nowMs: number,
      elapsedS: number,
      lightningInfo: {
        intensity: number;
        startPos: THREE.Vector3;
        endPos: THREE.Vector3;
      },
      exitProgress: number,
      reducedMotion: boolean,
    ) {
      const effectiveTime = reducedMotion ? elapsedS * 0.25 : elapsedS;
      for (const mat of materials) {
        mat.uniforms.uTime.value = effectiveTime;
        mat.uniforms.uLightningIntensity.value = lightningInfo.intensity;
        mat.uniforms.uLightningStart.value.copy(lightningInfo.startPos);
        mat.uniforms.uLightningEnd.value.copy(lightningInfo.endPos);
        mat.uniforms.uExitProgress.value = exitProgress;
      }

      const midInwardX = mobileMode ? 1.25 : 0.0;
      const fgInwardX = mobileMode ? 0.58 : 0.0;
      const midInwardY = mobileMode ? 0.35 : 0.0;

      leftGroup.position.x = midInwardX - exitProgress * 10.0;
      rightGroup.position.x = -midInwardX + exitProgress * 10.0;
      fgLeftGroup.position.x = fgInwardX - exitProgress * 6.0;
      fgRightGroup.position.x = -fgInwardX + exitProgress * 6.0;
      topGroup.position.y = -midInwardY + exitProgress * 8.0;
      bottomGroup.position.y = midInwardY - exitProgress * 8.0;
    },
    setTier(_tierName: QualityTierName) {
      // Keep distant, midground, and foreground cloud layers visible across all tiers
      bgGroup.visible = true;
    },
    setMobileLayout(isMobile: boolean) {
      mobileMode = isMobile;
      for (const mat of [fgMat0, fgMat1]) {
        mat.uniforms.uCorridorRadius.value = isMobile ? 0.72 : 1.05;
      }
    },
    dispose() {
      tex0.dispose();
      tex1.dispose();
      tex2.dispose();
      for (const m of materials) {
        m.dispose();
      }
    },
  };
}

// ─── Logo plane ────────────────────────────────────────────────────────

async function createLogoPlane(
  config: OpeningConfig,
  noiseTex: THREE.DataTexture,
): Promise<THREE.Mesh> {
  const loader = new THREE.TextureLoader();
  const logoTex = await new Promise<THREE.Texture>((resolve, reject) => {
    loader.load(
      config.logo.src,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        resolve(tex);
      },
      undefined,
      reject,
    );
  });

  const img = logoTex.image as { width?: number; height?: number } | null | undefined;
  const imgAspect =
    img && img.width && img.height ? img.width / img.height : 3;

  const geo = new THREE.PlaneGeometry(1, 1);
  const mat = new THREE.ShaderMaterial({
    vertexShader: logoVertexShader,
    fragmentShader: logoFragmentShader(3.0),
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      uLogoTex: { value: logoTex },
      uNoise: { value: noiseTex },
      uDissolve: { value: 0 },
      uEdgeWidth: { value: config.logo.dissolve.edgeWidth },
      uFlash: { value: 0 },
      uGlowStrength: { value: config.logo.glow.strength },
      uGoldColor: { value: hexToVec3(config.palette.gold) },
      uEmberColor: { value: hexToVec3(config.palette.ember) },
    },
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(0, config.logo.yOffset, toWorldZ(config.world.depths.logo));
  mesh.renderOrder = 2;
  mesh.userData.logoAspect = imgAspect;
  mesh.userData.logoTex = logoTex;
  return mesh;
}

// ─── Mist wisps ────────────────────────────────────────────────────────

function createMistWisps(
  config: OpeningConfig,
  noiseTex: THREE.DataTexture,
  tier: QualityTier,
): THREE.Group {
  const group = new THREE.Group();
  const count = tier.mist;
  const [depthMin, depthMax] = config.mist.depthRange;

  for (let i = 0; i < count; i++) {
    const depth = lerp(depthMin, depthMax, i / Math.max(count - 1, 1));
    const vH = visibleHeight(depth + 1, 60);
    const vW = vH * 2;
    const geo = new THREE.PlaneGeometry(vW * 0.6, vH * 0.18);
    const mat = new THREE.ShaderMaterial({
      vertexShader: mistVertexShader,
      fragmentShader: mistFragmentShader,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      uniforms: {
        uNoise: { value: noiseTex },
        uOpacity: { value: config.mist.opacity },
        uDissolve: { value: 0 },
        uTime: { value: 0 },
        uDrift: { value: config.mist.drift * (0.5 + Math.random()) },
        uCloudColor: { value: hexToVec3(config.palette.cloud) },
      },
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(
      (Math.random() - 0.5) * vW * 0.3,
      (Math.random() - 0.5) * vH * 0.25,
      toWorldZ(depth),
    );
    mesh.renderOrder = 2;
    group.add(mesh);
  }
  return group;
}

// ─── Embers (dissolution particles) ────────────────────────────────────

function createEmbers(
  config: OpeningConfig,
  noiseTex: THREE.DataTexture,
  tier: QualityTier,
): THREE.Points {
  const count = tier.embers;
  const logoDepth = config.world.depths.logo;

  const positions = new Float32Array(count * 3);
  const uvs = new Float32Array(count * 2);
  const thresholds = new Float32Array(count);
  const seeds = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const u = Math.random();
    const v = Math.random();
    uvs[i * 2] = u;
    uvs[i * 2 + 1] = v;

    positions[i * 3 + 0] = (u - 0.5) * 3;
    positions[i * 3 + 1] = (v - 0.5) * 1 + config.logo.yOffset;
    positions[i * 3 + 2] = toWorldZ(logoDepth);

    thresholds[i] = Math.random();
    seeds[i] = Math.random();
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("aUv", new THREE.BufferAttribute(uvs, 2));
  geo.setAttribute("aNoiseThreshold", new THREE.BufferAttribute(thresholds, 1));
  geo.setAttribute("aRandSeed", new THREE.BufferAttribute(seeds, 1));

  const mat = new THREE.ShaderMaterial({
    vertexShader: embersVertexShader(3.0),
    fragmentShader: embersFragmentShader,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uNoise: { value: noiseTex },
      uDissolve: { value: 0 },
      uTime: { value: 0 },
      uDrift: { value: config.embers.drift },
      uTurbulence: { value: config.embers.turbulence },
      uEmberSize: { value: config.embers.size },
      uGoldColor: { value: hexToVec3(config.palette.gold) },
      uEmberColor: { value: hexToVec3(config.palette.ember) },
      uBrightness: { value: config.embers.brightness },
    },
  });

  return new THREE.Points(geo, mat);
}

// ─── Backdrop (horizon glow) ───────────────────────────────────────────

function createBackdrop(config: OpeningConfig): THREE.Mesh {
  const depth = config.world.depths.welcomeBackdrop;
  const vH = visibleHeight(depth + 2, 70);
  const vW = vH * 2.2;
  const geo = new THREE.PlaneGeometry(vW, vH);
  const mat = new THREE.ShaderMaterial({
    vertexShader: backdropVertexShader,
    fragmentShader: backdropFragmentShader,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      uGoldColor: { value: hexToVec3(config.palette.gold) },
      uEmberColor: { value: hexToVec3(config.palette.ember) },
      uIntensity: { value: config.backdrop.intensity },
      uFade: { value: 0 },
      uCenterY: { value: config.backdrop.centerY },
      uRadius: { value: config.backdrop.radius },
      uExitProgress: { value: 0.0 },
    },
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(0, 0, toWorldZ(depth));
  mesh.renderOrder = -1;
  return mesh;
}

// ─── Sky dome ──────────────────────────────────────────────────────────

function createSkyDome(config: OpeningConfig): THREE.Mesh {
  const geo = new THREE.SphereGeometry(100, 32, 32);
  const mat = new THREE.ShaderMaterial({
    vertexShader: skyVertexShader,
    fragmentShader: skyFragmentShader,
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      uSkyTop: { value: hexToVec3(config.palette.skyTop) },
      uSkyMid: { value: hexToVec3(config.palette.skyMid) },
      uSkyLow: { value: hexToVec3(config.palette.skyLow) },
      uFlash: { value: 0 },
      uFlashColor: { value: hexToVec3(config.palette.lightning) },
      uLightningPos: { value: new THREE.Vector3(0, 0, -6) },
      uLightningIntensity: { value: 0 },
    },
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.renderOrder = -2;
  return mesh;
}

// ─── Main factory ──────────────────────────────────────────────────────

export async function createOpeningScene(
  canvas: HTMLCanvasElement,
  rawConfig: OpeningConfig,
  getProgress: () => number,
  getAspect: () => number,
  getStageHeight: () => number,
  initialReducedMotion: boolean = false,
): Promise<SceneHandle> {
  const config = validateOpeningConfig(rawConfig);

  let tierName: QualityTierName = selectInitialTier(config);
  let tier: QualityTier = config.quality.tiers[tierName];
  let reducedMotion = initialReducedMotion;

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
      stencil: false,
      depth: true,
    });
  } catch (err) {
    throw new Error(
      `WebGL initialization failed: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
  renderer.setPixelRatio(Math.min(tier.dpr, window.devicePixelRatio));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(new THREE.Color(config.palette.skyLow), 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    config.camera.vfov.landscape,
    canvas.clientWidth / Math.max(canvas.clientHeight, 1),
    config.camera.near,
    config.camera.far,
  );

  const noiseTex = createNoiseTexture(256);

  const skyDome = createSkyDome(config);
  scene.add(skyDome);

  const cloudFormations = createVolumetricCloudFormations(config, noiseTex, tier);
  scene.add(cloudFormations.group);

  const startTimeMs = performance.now();
  const lightningSystem = createLightningSystem(config, startTimeMs);
  scene.add(lightningSystem.boltMesh);
  scene.add(lightningSystem.glowMesh);

  const mist = createMistWisps(config, noiseTex, tier);
  scene.add(mist);

  const backdrop = createBackdrop(config);
  scene.add(backdrop);

  const embers = createEmbers(config, noiseTex, tier);
  scene.add(embers);

  const logoMesh = await createLogoPlane(config, noiseTex);
  scene.add(logoMesh);

  let progress = 0;
  let disposed = false;
  let rafId = 0;
  let isExiting = false;
  let exitStartTime = 0;
  let exitProgress = 0;
  let exitCallback: (() => void) | null = null;
  let lastLightningState = {
    intensity: 0,
    startPos: new THREE.Vector3(-2.5, 2.1, -6.2),
    endPos: new THREE.Vector3(-1.5, -1.3, -5.8),
  };

  let stepDownChecks = 0;
  let slowFrameAccumMs = 0;
  let lastStepCheckMs = startTimeMs + config.quality.stepDown.afterMs;

  function stepDownTier(): void {
    if (stepDownChecks >= config.quality.stepDown.maxSteps) return;
    const tierOrder: QualityTierName[] = ["high", "medium", "low"];
    const idx = tierOrder.indexOf(tierName);
    if (idx < tierOrder.length - 1) {
      tierName = tierOrder[idx + 1];
      tier = config.quality.tiers[tierName];
      renderer.setPixelRatio(Math.min(tier.dpr, window.devicePixelRatio));
      handleResize();

      cloudFormations.setTier(tierName);
      mist.children.forEach((child, i) => {
        child.visible = i < tier.mist;
      });
      embers.geometry.setDrawRange(
        0,
        Math.min(tier.embers, embers.geometry.attributes.position.count),
      );

      stepDownChecks++;
      if (process.env.NODE_ENV === "development") {
        console.info(`[opening] stepped down to quality tier: ${tierName}`);
      }
    }
  }

  function handleResize(): void {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    const isMobile = camera.aspect < 0.85;
    cloudFormations.setMobileLayout(isMobile);
  }

  let lastFrameMs = 0;
  function render(nowMs: number): void {
    if (disposed) return;
    rafId = requestAnimationFrame(render);

    if (typeof document !== "undefined" && document.hidden) {
      lastFrameMs = nowMs;
      return;
    }
    if (getStageHeight() <= 0) {
      lastFrameMs = nowMs;
      return;
    }
    const gl = renderer.getContext();
    if (gl && "isContextLost" in gl && gl.isContextLost()) {
      return;
    }

    const dt = Math.min((nowMs - lastFrameMs) / 1000, 0.1);
    lastFrameMs = nowMs;
    const elapsedS = (nowMs - startTimeMs) / 1000;

    progress = getProgress();
    const aspect = getAspect();
    const isMobile = aspect < 0.85;

    const canvasW = canvas.clientWidth;
    const canvasH = canvas.clientHeight;
    if (
      canvas.width !== Math.floor(canvasW * renderer.getPixelRatio()) ||
      canvas.height !== Math.floor(canvasH * renderer.getPixelRatio())
    ) {
      handleResize();
    }

    // Damped camera sway under reduced motion
    const activeSway = reducedMotion
      ? {
          position: config.camera.sway.position * 0.2,
          rollDeg: config.camera.sway.rollDeg * 0.2,
          periodS: config.camera.sway.periodS * 1.5,
        }
      : config.camera.sway;

    const pose = cameraPose(
      progress,
      elapsedS,
      aspect,
      config.camera.keyframes,
      config.camera.vfov,
      config.camera.passThrough,
      activeSway,
      reducedMotion ? config.camera.pitchMaxRad * 0.2 : config.camera.pitchMaxRad,
      config.world.eyeY,
    );
    camera.position.set(pose.x, pose.y, pose.z);
    camera.rotation.set(pose.pitch, pose.yaw, pose.roll, "YXZ");
    camera.fov = pose.vfov;

    if (isExiting) {
      const exitElapsedS = (nowMs - exitStartTime) / 1000;
      const DURATION = 1.2;
      const p = Math.min(1.0, exitElapsedS / DURATION);
      exitProgress = smoothstep(0.0, 1.0, p);

      camera.position.z += exitProgress * 15.0;
      camera.fov = pose.vfov + exitProgress * 25.0;

      const bdMat = backdrop.material as THREE.ShaderMaterial;
      bdMat.uniforms.uExitProgress.value = exitProgress;

      if (p >= 1.0 && exitCallback) {
        const cb = exitCallback;
        exitCallback = null;
        cb();
      }
    }

    camera.updateProjectionMatrix();

    // ── Lightning ──
    const lightningInfo = lightningSystem.update(nowMs, isExiting, isMobile, reducedMotion);
    lastLightningState = {
      intensity: lightningInfo.intensity,
      startPos: lightningInfo.startPos,
      endPos: lightningInfo.endPos,
    };

    // ── Logo dissolve ──
    const cameraDepth = depthAt(progress, config.camera.keyframes);
    let dissolveValue = 0;
    if (cameraDepth <= 3.5) {
      dissolveValue = 0;
    } else if (cameraDepth >= 4.9) {
      dissolveValue = 1;
    } else {
      dissolveValue = smoothstep(3.5, 4.9, cameraDepth);
    }

    // ── Logo sizing ──
    const logoAspect = (logoMesh.userData.logoAspect as number) || 3;
    const dims = fitLogo(
      aspect,
      pose.vfov,
      logoAspect,
      config.camera.keyframes[0][1],
      config.world.depths.logo,
      config.logo.widthFraction,
      config.logo.maxHeightFraction,
      config.logo.fitAspectRange,
    );
    logoMesh.scale.set(dims.width, dims.height, 1);

    // ── Backdrop fade ──
    const [bdFadeStart, bdFadeEnd] = config.timing.backdropFadeDepth;
    const backdropFade = smoothstep(bdFadeStart, bdFadeEnd, cameraDepth);

    // ── Update uniforms ──
    const skyMat = skyDome.material as THREE.ShaderMaterial;
    skyMat.uniforms.uFlash.value = lightningInfo.flash;
    skyMat.uniforms.uLightningIntensity.value = lightningInfo.intensity;
    skyMat.uniforms.uLightningPos.value.copy(lightningInfo.startPos);

    cloudFormations.update(nowMs, elapsedS, lightningInfo, exitProgress, reducedMotion);

    const logoMat = logoMesh.material as THREE.ShaderMaterial;
    logoMat.uniforms.uDissolve.value = dissolveValue;
    logoMat.uniforms.uFlash.value = lightningInfo.flash;

    const embersMat = embers.material as THREE.ShaderMaterial;
    embersMat.uniforms.uDissolve.value = dissolveValue;
    embersMat.uniforms.uTime.value = elapsedS;

    for (const child of mist.children) {
      const mat = (child as THREE.Mesh).material as THREE.ShaderMaterial;
      mat.uniforms.uTime.value = reducedMotion ? elapsedS * 0.25 : elapsedS;
      mat.uniforms.uDissolve.value = dissolveValue;
    }

    const bdMat = backdrop.material as THREE.ShaderMaterial;
    bdMat.uniforms.uFade.value = backdropFade;

    renderer.render(scene, camera);

    if (nowMs > lastStepCheckMs) {
      const frameMs = dt * 1000;
      if (frameMs > config.quality.stepDown.frameMsAbove) {
        slowFrameAccumMs += frameMs;
        if (slowFrameAccumMs > config.quality.stepDown.sustainMs) {
          stepDownTier();
          slowFrameAccumMs = 0;
          lastStepCheckMs = nowMs + config.quality.stepDown.afterMs;
        }
      } else {
        slowFrameAccumMs = 0;
      }
    }
  }

  const handle: SceneHandle = {
    start() {
      if (disposed) return;
      handleResize();
      lastFrameMs = performance.now();
      rafId = requestAnimationFrame(render);
    },
    setProgress(p: number) {
      progress = p;
    },
    setReducedMotion(reduced: boolean) {
      reducedMotion = reduced;
    },
    triggerExit(onComplete: () => void) {
      if (isExiting) return;
      isExiting = true;
      exitStartTime = performance.now();
      exitCallback = onComplete;
    },
    triggerStrike() {
      lightningSystem.triggerStrike(getAspect() < 0.85);
    },
    getDebugInfo(): SceneDebugInfo {
      let fg = 0, mid = 0, dist = 0;
      let minFgZ = Infinity, maxFgZ = -Infinity;
      for (const f of cloudFormations.formations) {
        if (f.layer === "foreground") {
          fg++;
          minFgZ = Math.min(minFgZ, f.mesh.position.z);
          maxFgZ = Math.max(maxFgZ, f.mesh.position.z);
        } else if (f.layer === "midground") {
          mid++;
        } else {
          dist++;
        }
      }
      const posAttr = lightningSystem.boltMesh.geometry.getAttribute("position");
      return {
        tier: tierName,
        cloudLayerCounts: {
          foreground: fg,
          midground: mid,
          distant: dist,
          total: cloudFormations.formations.length,
        },
        cameraZ: camera.position.z,
        logoZ: logoMesh.position.z,
        foregroundZRange: [minFgZ, maxFgZ],
        lightning: {
          visible: lightningSystem.boltMesh.visible,
          intensity: lastLightningState.intensity,
          vertexCount: posAttr ? posAttr.count : 0,
          start: [
            lastLightningState.startPos.x,
            lastLightningState.startPos.y,
            lastLightningState.startPos.z,
          ],
          end: [
            lastLightningState.endPos.x,
            lastLightningState.endPos.y,
            lastLightningState.endPos.z,
          ],
        },
      };
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      exitCallback = null;
      if (rafId) cancelAnimationFrame(rafId);

      lightningSystem.dispose();
      cloudFormations.dispose();

      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Points) {
          obj.geometry?.dispose();
          const mat = obj.material;
          if (Array.isArray(mat)) {
            mat.forEach((m) => m.dispose());
          } else if (mat) {
            if ("uniforms" in mat) {
              const uniforms = (mat as THREE.ShaderMaterial).uniforms;
              for (const key of Object.keys(uniforms)) {
                const val = uniforms[key].value;
                if (val instanceof THREE.Texture) {
                  val.dispose();
                }
              }
            }
            mat.dispose();
          }
        }
      });

      noiseTex.dispose();
      renderer.dispose();
    },
    getTier() {
      return tierName;
    },
  };

  return handle;
}