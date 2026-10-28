// scene.ts — WebGL renderer lifecycle, resize, loop, tiers, disposal.
// Implements the full 3D cinematic opening ("Yuvaan: The Golden Multiverse") using Three.js.

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
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
  emblemMetallicVertexShader,
  emblemMetallicFragmentShader,
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

    const extStart = seg.p1.clone().addScaledVector(dir, -0.025);
    const extEnd = seg.p2.clone().addScaledVector(dir, 0.025);

    const baseWidth = seg.generation === 0 ? 0.135 : seg.generation === 1 ? 0.072 : 0.042;
    const wStart = baseWidth * (1.0 - seg.tStart * 0.28);
    const wEnd = baseWidth * (1.0 - seg.tEnd * 0.28);
    const isB = seg.isBranch ? 1.0 : 0.0;

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

  const strikeZones = [
    { start: new THREE.Vector3(-2.8, 2.2, -6.2), end: new THREE.Vector3(-1.8, -1.2, -5.8) },
    { start: new THREE.Vector3(2.8, 2.2, -6.4), end: new THREE.Vector3(1.8, -1.2, -5.9) },
    { start: new THREE.Vector3(-2.0, 2.4, -7.2), end: new THREE.Vector3(-1.2, -0.8, -6.6) },
    { start: new THREE.Vector3(2.0, 2.3, -7.4), end: new THREE.Vector3(1.2, -0.9, -6.8) },
    { start: new THREE.Vector3(-3.2, 1.9, -8.2), end: new THREE.Vector3(-2.1, -1.6, -7.6) },
    { start: new THREE.Vector3(3.2, 1.9, -8.2), end: new THREE.Vector3(2.1, -1.5, -7.6) },
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

    let startX = zone.start.x;
    let startY = zone.start.y;
    let endX = zone.end.x;
    let endY = zone.end.y;

    if (isMobile) {
      startX = Math.sign(zone.start.x) * Math.max(0.85, Math.abs(zone.start.x) * 0.58);
      startY = zone.start.y + 0.35;
      endX = Math.sign(zone.end.x) * Math.max(0.70, Math.abs(zone.end.x) * 0.62);
      endY = Math.max(0.15, zone.end.y + 0.95);
    }

    const sJitter = new THREE.Vector3(
      (Math.random() - 0.5) * (isMobile ? 0.25 : 0.45),
      (Math.random() - 0.5) * 0.3,
      (Math.random() - 0.5) * 0.4,
    );
    const eJitter = new THREE.Vector3(
      (Math.random() - 0.5) * (isMobile ? 0.30 : 0.55),
      (Math.random() - 0.5) * 0.35,
      (Math.random() - 0.5) * 0.4,
    );

    activeStart.set(startX, startY, zone.start.z).add(sJitter);
    activeEnd.set(endX, endY, zone.end.z).add(eJitter);

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
        growth = smoothstep(0, 45, elapsedStrike);

        if (reducedMotion) {
          const env = Math.sin((elapsedStrike / strikeDuration) * Math.PI);
          intensity = env * config.lightning.peak * 0.55;
        } else if (elapsedStrike < 40) {
          intensity = smoothstep(0, 40, elapsedStrike);
        } else if (elapsedStrike < 85) {
          intensity = 1.0 - 0.78 * smoothstep(40, 85, elapsedStrike);
        } else if (elapsedStrike < 140) {
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
        flash: intensity * 0.14,
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

// ─── Procedural Volumetric 3D Normal & Density Cloud Map Generator ─────

function createCumulusPuffTexture(type = 0): THREE.CanvasTexture {
  const size = 512;
  const cvs = document.createElement("canvas");
  cvs.width = size;
  cvs.height = size;
  const ctx = cvs.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(cvs);

  ctx.clearRect(0, 0, size, size);

  const perm = new Uint8Array(512);
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  let s = 4567 + type * 8901;
  const rnd = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    const t = p[i];
    p[i] = p[j];
    p[j] = t;
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];

  function fade(t: number) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }
  function grad(hash: number, x: number, y: number) {
    const h = hash & 7;
    const u = h < 4 ? x : y,
      v = h < 4 ? y : x;
    return ((h & 1) ? -u : u) + ((h & 2) ? -2.0 * v : 2.0 * v);
  }
  function perlin(x: number, y: number) {
    const X = Math.floor(x) & 255,
      Y = Math.floor(y) & 255;
    const xf = x - Math.floor(x),
      yf = y - Math.floor(y);
    const u = fade(xf),
      v = fade(yf);
    const g00 = grad(perm[perm[X] + Y], xf, yf);
    const g10 = grad(perm[perm[X + 1] + Y], xf - 1, yf);
    const g01 = grad(perm[perm[X] + Y + 1], xf, yf - 1);
    const g11 = grad(perm[perm[X + 1] + Y + 1], xf - 1, yf - 1);
    return (1 - v) * ((1 - u) * g00 + u * g10) + v * ((1 - u) * g01 + u * g11);
  }
  function fbm(x: number, y: number, oct = 4) {
    let v = 0,
      a = 0.5,
      f = 1.0;
    for (let i = 0; i < oct; i++) {
      v += a * perlin(x * f, y * f);
      f *= 2.05;
      a *= 0.5;
    }
    return v;
  }

  const lobes =
    type === 0
      ? [
          { x: 256, y: 250, r: 175, z: 1.0 },
          { x: 165, y: 210, r: 140, z: 0.94 },
          { x: 345, y: 205, r: 145, z: 0.95 },
          { x: 235, y: 135, r: 125, z: 0.98 },
          { x: 295, y: 130, r: 130, z: 1.0 },
          { x: 115, y: 280, r: 118, z: 0.86 },
          { x: 395, y: 275, r: 122, z: 0.88 },
          { x: 195, y: 345, r: 125, z: 0.78 },
          { x: 320, y: 350, r: 128, z: 0.8 },
          { x: 260, y: 78, r: 98, z: 0.92 },
        ]
      : type === 1
      ? [
          { x: 256, y: 255, r: 170, z: 0.98 },
          { x: 130, y: 240, r: 150, z: 0.92 },
          { x: 385, y: 235, r: 155, z: 0.94 },
          { x: 195, y: 165, r: 130, z: 0.98 },
          { x: 330, y: 160, r: 135, z: 0.96 },
          { x: 60, y: 280, r: 110, z: 0.82 },
          { x: 450, y: 275, r: 115, z: 0.84 },
          { x: 256, y: 340, r: 135, z: 0.78 },
        ]
      : [
          { x: 245, y: 240, r: 160, z: 0.96 },
          { x: 345, y: 195, r: 135, z: 0.98 },
          { x: 145, y: 200, r: 130, z: 0.92 },
          { x: 295, y: 325, r: 135, z: 0.82 },
          { x: 170, y: 315, r: 125, z: 0.8 },
          { x: 405, y: 280, r: 110, z: 0.85 },
        ];

  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const wx = fbm(x / 68, y / 68, 3) * 35;
      const wy = fbm(x / 68 + 4.3, y / 68 + 2.6, 3) * 35;
      const px = x + wx;
      const py = y + wy;

      let maxH = 0;
      let weightedNx = 0;
      let weightedNy = 0;
      let weightedNz = 0;
      let totalW = 0;

      for (const l of lobes) {
        const dx = px - l.x;
        const dy = py - l.y;
        const d2 = dx * dx + dy * dy;
        const r2 = l.r * l.r;

        if (d2 < r2) {
          const radFactor = (r2 - d2) / r2;
          const h = Math.sqrt(radFactor) * l.z;
          const w = Math.pow(radFactor, 0.75);

          const nx = dx / l.r;
          const ny = -(dy / l.r);
          const nz = h * 1.35;

          weightedNx += nx * w;
          weightedNy += ny * w;
          weightedNz += nz * w;
          totalW += w;

          if (h > maxH) maxH = h;
        }
      }

      if (totalW > 0.0001 && maxH > 0.001) {
        const micro = fbm(x / 24, y / 24, 4);
        const erodedH = maxH * (0.82 + 0.36 * micro);
        const density = Math.min(1.0, Math.pow(erodedH, 0.65) * 1.38);

        if (density > 0.008) {
          const invLen = 1.0 / Math.hypot(weightedNx, weightedNy, weightedNz);
          let nx = weightedNx * invLen;
          let ny = weightedNy * invLen;
          let nz = weightedNz * invLen;

          const rip = (micro - 0.5) * 0.28;
          nx = nx + rip;
          ny = ny + rip;
          const renorm = 1.0 / Math.hypot(nx, ny, nz);
          nx *= renorm;
          ny *= renorm;
          nz *= renorm;

          const idx = (y * size + x) * 4;
          data[idx] = Math.floor((nx * 0.5 + 0.5) * 255);
          data[idx + 1] = Math.floor((ny * 0.5 + 0.5) * 255);
          data[idx + 2] = Math.floor((nz * 0.5 + 0.5) * 255);
          data[idx + 3] = Math.floor(density * 255);
        }
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
  void tier;
  const group = new THREE.Group();
  const formations: VolumetricCloudFormation[] = [];
  const geometries: THREE.BufferGeometry[] = [];

  const tex0 = createCumulusPuffTexture(0);
  const tex1 = createCumulusPuffTexture(1);
  const tex2 = createCumulusPuffTexture(2);

  // Tuned to match the warm golden-hour storm clouds in image_2ef521.jpg
  const lightningCol = hexToVec3(config.palette.lightning);
  const shadowCol    = new THREE.Vector3(0.08, 0.09, 0.15); // Soft storm charcoal-indigo
  const keyLightCol  = new THREE.Vector3(0.56, 0.60, 0.70); // Soft cool dusk silver on upper tops
  const backLightCol = new THREE.Vector3(0.85, 0.56, 0.34); // Soft golden-hour rim
  const sunsetCol    = new THREE.Vector3(0.76, 0.48, 0.30); // Warm golden-hour amber-peach
  const copperCol    = new THREE.Vector3(0.58, 0.32, 0.21); // Dusty rose-copper underbelly
  const ambientCol   = new THREE.Vector3(0.24, 0.25, 0.33); // Smoky slate body
  const horizonHaze  = new THREE.Vector3(0.56, 0.36, 0.26); // Warm golden-copper horizon haze

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
        uKeyLightDir: { value: new THREE.Vector3(-0.45, 0.75, 0.55).normalize() },
        uKeyLightColor: { value: keyLightCol },
        uBackLightDir: { value: new THREE.Vector3(0.35, -0.35, 0.85).normalize() },
        uBackLightColor: { value: backLightCol },
        uSunsetColor: { value: sunsetCol },
        uCopperColor: { value: copperCol },
        uShadowColor: { value: shadowCol },
        uAmbientColor: { value: ambientCol },
        uHorizonHazeColor: { value: horizonHaze },
        uLightningStart: { value: new THREE.Vector3(-2.5, 2.0, -6.2) },
        uLightningEnd: { value: new THREE.Vector3(-1.5, -1.2, -5.8) },
        uLightningIntensity: { value: 0.0 },
        uLightningColor: { value: lightningCol },
        uExitProgress: { value: 0.0 },
        uNearFade: { value: new THREE.Vector2(nearFade[0], nearFade[1]) },
        uLayerType: { value: layerType },
        uTime: { value: 0.0 },
        uDriftSpeed: { value: driftSpeed },
        uCorridorRadius: { value: 1.95 },
      },
    });
  }

  const bgMat0 = createMaterial(tex0, 0.0, [0.8, 2.4], 0.008);
  const bgMat1 = createMaterial(tex1, 0.0, [0.8, 2.4], 0.008);

  const midMat0 = createMaterial(tex0, 1.0, [0.5, 1.8], 0.014);
  const midMat1 = createMaterial(tex1, 1.0, [0.5, 1.8], 0.014);
  const midMat2 = createMaterial(tex2, 1.0, [0.5, 1.8], 0.014);

  const fgMat0 = createMaterial(tex2, 2.0, [0.35, 1.35], 0.022);
  const fgMat1 = createMaterial(tex0, 2.0, [0.35, 1.35], 0.022);

  const materials = [bgMat0, bgMat1, midMat0, midMat1, midMat2, fgMat0, fgMat1];

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

  function addFormation(
    parent: THREE.Group,
    mat: THREE.ShaderMaterial,
    w: number,
    h: number,
    x: number,
    y: number,
    z: number,
    rotZ: number,
    layer: "distant" | "midground" | "foreground",
  ) {
    const geo = new THREE.PlaneGeometry(w, h);
    geometries.push(geo);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.rotation.z = rotZ;
    mesh.renderOrder = layer === "distant" ? 0 : layer === "midground" ? 1 : 3;
    parent.add(mesh);
    formations.push({ mesh, material: mat, layer });
  }

  // ── LAYER 1: Distant Golden-Hour Cloud Sea (Z = -10.5 to -16.5) ──
  // Surrounds the YUVAAN 2027 welcome card (when camera stops at Z = -8.0) with
  // soft rolling golden-hour clouds exactly like image_2ef521.jpg!
  addFormation(bgGroup, bgMat1, 11.5, 8.8, -3.8, -1.4, -11.2,  0.03, "distant");
  addFormation(bgGroup, bgMat1, 11.5, 8.8,  3.8, -1.4, -11.5, -0.03, "distant");
  addFormation(bgGroup, bgMat0, 12.0, 9.2,  0.0, -1.8, -12.4,  0.00, "distant");
  addFormation(bgGroup, bgMat0, 11.0, 8.5, -3.5,  1.6, -12.8,  0.05, "distant");
  addFormation(bgGroup, bgMat0, 11.0, 8.5,  3.5,  1.6, -13.1, -0.05, "distant");
  addFormation(bgGroup, bgMat1, 13.0, 9.5,  0.0,  0.4, -14.2,  0.02, "distant");
  addFormation(bgGroup, bgMat0, 11.5, 9.0, -4.8, -0.8, -15.0, -0.04, "distant");
  addFormation(bgGroup, bgMat0, 11.5, 9.0,  4.8, -0.8, -15.4,  0.04, "distant");

  // ── LAYER 2: Midground Storm Chasm (Framing the Emblem at Z = -5.8 to -8.2) ──
  addFormation(leftGroup, midMat0, 7.5, 8.8, -4.3,  0.5, -7.0,  0.08, "midground");
  addFormation(leftGroup, midMat2, 6.8, 7.8, -3.6, -0.5, -6.0, -0.04, "midground");
  addFormation(leftGroup, midMat0, 7.2, 8.5, -5.2, -1.0, -7.8,  0.10, "midground");
  addFormation(leftGroup, midMat1, 6.0, 7.0, -3.9,  1.6, -6.8, -0.06, "midground");

  addFormation(rightGroup, midMat0, 7.6, 9.0,  4.3,  0.5, -7.2, -0.08, "midground");
  addFormation(rightGroup, midMat2, 7.0, 8.0,  3.6, -0.5, -6.2,  0.04, "midground");
  addFormation(rightGroup, midMat0, 7.4, 8.6,  5.2, -1.0, -8.0, -0.10, "midground");
  addFormation(rightGroup, midMat1, 6.2, 7.2,  3.9,  1.6, -6.9,  0.06, "midground");

  addFormation(topGroup, midMat1, 9.8, 6.5,  0.0,  3.1, -7.4,  0.02, "midground");
  addFormation(topGroup, midMat1, 8.5, 5.8, -2.6,  2.7, -6.5, -0.04, "midground");
  addFormation(topGroup, midMat1, 8.5, 5.8,  2.6,  2.7, -6.7,  0.04, "midground");

  addFormation(bottomGroup, midMat1, 10.0, 6.8,  0.0, -2.4, -6.6,  0.0, "midground");
  addFormation(bottomGroup, midMat2,  8.2, 5.5, -2.9, -1.9, -5.8,  0.05, "midground");
  addFormation(bottomGroup, midMat2,  8.2, 5.5,  2.9, -1.9, -5.9, -0.05, "midground");

  // ── LAYER 3: Foreground Framing Masses (Z = -2.2 to -3.8, framing outer corners) ──
  addFormation(fgLeftGroup, fgMat0, 4.2, 4.5, -3.1,  1.3, -2.7,  0.12, "foreground");
  addFormation(fgLeftGroup, fgMat1, 4.4, 4.8, -3.2, -1.2, -3.2, -0.10, "foreground");
  addFormation(fgLeftGroup, fgMat0, 3.8, 4.2, -2.6, -1.5, -3.6,  0.08, "foreground");

  addFormation(fgRightGroup, fgMat0, 4.2, 4.5,  3.1,  1.3, -2.8, -0.12, "foreground");
  addFormation(fgRightGroup, fgMat1, 4.4, 4.8,  3.2, -1.2, -3.3,  0.10, "foreground");
  addFormation(fgRightGroup, fgMat0, 3.8, 4.2,  2.6, -1.5, -3.7, -0.08, "foreground");

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

      const midInwardX = mobileMode ? 1.15 : 0.0;
      const fgInwardX = mobileMode ? 0.48 : 0.0;
      const midInwardY = mobileMode ? 0.30 : 0.0;

      leftGroup.position.x = midInwardX - exitProgress * 10.0;
      rightGroup.position.x = -midInwardX + exitProgress * 10.0;
      fgLeftGroup.position.x = fgInwardX - exitProgress * 6.0;
      fgRightGroup.position.x = -fgInwardX + exitProgress * 6.0;
      topGroup.position.y = -midInwardY + exitProgress * 8.0;
      bottomGroup.position.y = midInwardY - exitProgress * 8.0;
    },
    setTier(_tierName: QualityTierName) {
      void _tierName;
      bgGroup.visible = true;
    },
    setMobileLayout(isMobile: boolean) {
      mobileMode = isMobile;
      for (const mat of [fgMat0, fgMat1]) {
        mat.uniforms.uCorridorRadius.value = isMobile ? 1.35 : 1.95;
      }
    },
    dispose() {
      tex0.dispose();
      tex1.dispose();
      tex2.dispose();
      for (const m of materials) {
        m.dispose();
      }
      for (const g of geometries) {
        g.dispose();
      }
    },
  };
}

// ─── Solid 3D Blender (.glb) Emblem Loader + Soft Shining Metal ────────

interface EmblemHandle {
  group: THREE.Group;
  aspect: number;
  isGlb: boolean;
  update: (elapsedS: number, flash: number, cameraDepth: number) => void;
  dispose: () => void;
}

async function createEmblemObject(
  config: OpeningConfig,
  noiseTex: THREE.DataTexture,
): Promise<EmblemHandle> {
  const rootGroup = new THREE.Group();
  rootGroup.position.set(0, config.logo.yOffset, toWorldZ(config.world.depths.logo));
  rootGroup.renderOrder = 2;

  const glbUrl = config.logo.src.endsWith(".glb") ? config.logo.src : "/yuvaan/emblem.glb";
  const gltfLoader = new GLTFLoader();

  try {
    const gltf = await new Promise<{ scene: THREE.Group }>((resolve, reject) => {
      gltfLoader.load(glbUrl, resolve, undefined, reject);
    });

    const model = gltf.scene;

    // Auto-orient if exported with Z-up from Blender
    const initialBox = new THREE.Box3().setFromObject(model);
    const initialSize = new THREE.Vector3();
    initialBox.getSize(initialSize);
    if (initialSize.z > initialSize.y * 2.0) {
      model.rotation.x = Math.PI * 0.5;
      model.updateMatrixWorld(true);
    }

    // Center & normalize 3D mesh to a 1x1 unit frame
    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const maxW = Math.max(size.x, 0.001);
    const maxH = Math.max(size.y, 0.001);
    const aspect = maxW / maxH;

    const pivot = new THREE.Group();
    model.position.sub(center);
    pivot.scale.set(1 / maxW, 1 / maxH, 0.28 / Math.max(maxW, maxH));
    pivot.add(model);
    rootGroup.add(pivot);

    // Soft, Shining Satin-Polished Gunmetal & Golden-Hour Copper Shader
    const gunmetalMat = new THREE.ShaderMaterial({
      vertexShader: emblemMetallicVertexShader,
      fragmentShader: emblemMetallicFragmentShader,
      transparent: false,
      depthWrite: true,
      depthTest: true,
      side: THREE.DoubleSide,
      uniforms: {
        uNoise: { value: noiseTex },
        uTime: { value: 0.0 },
        uFlash: { value: 0.0 },
        uGoldColor: { value: hexToVec3(config.palette.gold) },
        uEmberColor: { value: hexToVec3(config.palette.ember) },
      },
    });

    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.geometry) {
          child.geometry.computeVertexNormals();
        }
        child.material = gunmetalMat;
        child.renderOrder = 2;
      }
    });

    return {
      group: rootGroup,
      aspect,
      isGlb: true,
      update(elapsedS: number, flash: number, _cameraDepth: number) {
        gunmetalMat.uniforms.uTime.value = elapsedS;
        gunmetalMat.uniforms.uFlash.value = flash;
      },
      dispose() {
        gunmetalMat.dispose();
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry?.dispose();
          }
        });
      },
    };
  } catch {
    const fallbackUrl = config.logo.src.endsWith(".glb") ? "/yuvaan/iiitg-emblem.png" : config.logo.src;
    const texLoader = new THREE.TextureLoader();
    const logoTex = await new Promise<THREE.Texture>((resolve, reject) => {
      texLoader.load(
        fallbackUrl,
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          resolve(tex);
        },
        undefined,
        reject,
      );
    });

    const img = logoTex.image as { width?: number; height?: number } | null | undefined;
    const imgAspect = img && img.width && img.height ? img.width / img.height : 1.0;

    const geo = new THREE.PlaneGeometry(1, 1);
    const mat = new THREE.ShaderMaterial({
      vertexShader: logoVertexShader,
      fragmentShader: logoFragmentShader(3.0),
      transparent: true,
      depthWrite: true,
      depthTest: true,
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
        uTime: { value: 0 },
      },
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.renderOrder = 2;
    rootGroup.add(mesh);

    return {
      group: rootGroup,
      aspect: imgAspect,
      isGlb: false,
      update(elapsedS: number, flash: number, _cameraDepth: number) {
        mat.uniforms.uTime.value = elapsedS;
        mat.uniforms.uFlash.value = flash;
      },
      dispose() {
        geo.dispose();
        mat.dispose();
        logoTex.dispose();
      },
    };
  }
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
        uCloudColor: { value: new THREE.Vector3(0.45, 0.30, 0.20) },
      },
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(
      (Math.random() - 0.5) * vW * 0.3,
      (Math.random() - 0.5) * vH * 0.25,
      toWorldZ(depth),
    );
    mesh.renderOrder = 1;
    group.add(mesh);
  }
  return group;
}

// ─── Embers (Ambient Multiverse Sparks) ────────────────────────────────

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
    blending: THREE.AdditiveBlending,
    uniforms: {
      uNoise: { value: noiseTex },
      uDissolve: { value: 0.5 },
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

// ─── Backdrop (Soft Golden-Hour Horizon — Never Blows Out to White) ───

function createBackdrop(config: OpeningConfig, noiseTex: THREE.DataTexture): THREE.Mesh {
  const depth = 17.5; // Placed behind all distant clouds so it never washes out the welcome card
  const vH = visibleHeight(depth + 2, 70);
  const vW = vH * 2.2;
  const geo = new THREE.PlaneGeometry(vW, vH);
  const mat = new THREE.ShaderMaterial({
    vertexShader: backdropVertexShader,
    fragmentShader: backdropFragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    side: THREE.DoubleSide,
    uniforms: {
      uNoise: { value: noiseTex },
      uGoldColor: { value: hexToVec3(config.palette.gold) },
      uEmberColor: { value: hexToVec3(config.palette.ember) },
      uIntensity: { value: config.backdrop.intensity },
      uFade: { value: 0 },
      uCenterY: { value: config.backdrop.centerY },
      uRadius: { value: config.backdrop.radius },
      uExitProgress: { value: 0.0 },
      uTime: { value: 0.0 },
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
      uGoldColor: { value: hexToVec3(config.palette.gold) },
      uEmberColor: { value: hexToVec3(config.palette.ember) },
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
      antialias: true,
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
  renderer.setClearColor(new THREE.Color(config.palette.skyTop), 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    config.camera.vfov.landscape,
    canvas.clientWidth / Math.max(canvas.clientHeight, 1),
    0.05,
    config.camera.far,
  );

  const noiseTex = createNoiseTexture(256);

  const skyDome = createSkyDome(config);
  scene.add(skyDome);

  const backdrop = createBackdrop(config, noiseTex);
  scene.add(backdrop);

  const cloudFormations = createVolumetricCloudFormations(config, noiseTex, tier);
  scene.add(cloudFormations.group);

  const startTimeMs = performance.now();
  const lightningSystem = createLightningSystem(config, startTimeMs);
  scene.add(lightningSystem.boltMesh);
  scene.add(lightningSystem.glowMesh);

  const mist = createMistWisps(config, noiseTex, tier);
  scene.add(mist);

  const embers = createEmbers(config, noiseTex, tier);
  scene.add(embers);

  const emblem = await createEmblemObject(config, noiseTex);
  scene.add(emblem.group);

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

    const cameraDepth = depthAt(progress, config.camera.keyframes);
    const portalReveal = smoothstep(2.0, 6.8, cameraDepth);

    // ── Emblem Sizing & Subtle 3D Floating Motion ──
    const dims = fitLogo(
      aspect,
      pose.vfov,
      emblem.aspect,
      config.camera.keyframes[0][1],
      config.world.depths.logo,
      config.logo.widthFraction,
      config.logo.maxHeightFraction,
      config.logo.fitAspectRange,
    );
    emblem.group.scale.set(dims.width, dims.height, (dims.width + dims.height) * 0.5);

    if (!reducedMotion) {
      const floatY = Math.sin(elapsedS * 1.1) * 0.045 + Math.sin(elapsedS * 0.53) * 0.02;
      const tiltZ = Math.sin(elapsedS * 0.75) * 0.018;
      const tiltX = Math.cos(elapsedS * 0.88) * 0.015;
      const tiltY = Math.sin(elapsedS * 0.45) * 0.035;
      emblem.group.position.y = config.logo.yOffset + floatY;
      emblem.group.rotation.set(tiltX, tiltY, tiltZ);
    } else {
      emblem.group.position.y = config.logo.yOffset;
      emblem.group.rotation.set(0, 0, 0);
    }

    emblem.update(elapsedS, lightningInfo.flash, cameraDepth);

    // ── Backdrop (Golden-Hour Horizon) ──
    const [bdFadeStart, bdFadeEnd] = config.timing.backdropFadeDepth;
    const backdropFade = smoothstep(bdFadeStart, bdFadeEnd, cameraDepth);

    // ── Update Uniforms ──
    const skyMat = skyDome.material as THREE.ShaderMaterial;
    skyMat.uniforms.uFlash.value = lightningInfo.flash;
    skyMat.uniforms.uLightningIntensity.value = lightningInfo.intensity;
    skyMat.uniforms.uLightningPos.value.copy(lightningInfo.startPos);

    cloudFormations.update(nowMs, elapsedS, lightningInfo, exitProgress, reducedMotion);

    const embersMat = embers.material as THREE.ShaderMaterial;
    embersMat.uniforms.uDissolve.value = 0.45 + portalReveal * 0.55;
    embersMat.uniforms.uTime.value = reducedMotion ? elapsedS * 0.25 : elapsedS;

    for (const child of mist.children) {
      const mat = (child as THREE.Mesh).material as THREE.ShaderMaterial;
      mat.uniforms.uTime.value = reducedMotion ? elapsedS * 0.25 : elapsedS;
      mat.uniforms.uDissolve.value = portalReveal;
    }

    const bdMat = backdrop.material as THREE.ShaderMaterial;
    bdMat.uniforms.uFade.value = backdropFade;
    bdMat.uniforms.uTime.value = reducedMotion ? elapsedS * 0.25 : elapsedS;

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
        logoZ: emblem.group.position.z,
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
      emblem.dispose();

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