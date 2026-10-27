// shaders.ts — GLSL template strings and shared noise chunk.
// All shader source code is co-located here for maintainability.

// ─── Shared noise utility (sampled from a baked noise texture) ───────

/** Shared GLSL function to sample baked noise texture. */
export const noiseChunk = /* glsl */ `
  uniform sampler2D uNoise;
  float bakedNoise(vec2 uv) {
    return texture2D(uNoise, uv).r;
  }
`;

// ─── Sky dome ────────────────────────────────────────────────────────

export const skyVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldPos;
  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export const skyFragmentShader = /* glsl */ `
  uniform vec3 uSkyTop;
  uniform vec3 uSkyMid;
  uniform vec3 uSkyLow;
  uniform float uFlash;
  uniform vec3 uFlashColor;
  uniform vec3 uLightningPos;
  uniform float uLightningIntensity;
  varying vec2 vUv;
  varying vec3 vWorldPos;

  void main() {
    float y = clamp(vUv.y, 0.0, 1.0);
    vec3 col;
    if (y > 0.48) {
      col = mix(uSkyMid, uSkyTop, smoothstep(0.48, 0.92, y));
    } else {
      col = mix(uSkyLow, uSkyMid, smoothstep(0.08, 0.48, y));
    }

    // Subtle atmospheric horizon band near equator
    float horizonHaze = exp(-pow((y - 0.42) * 5.5, 2.0));
    col += vec3(0.06, 0.08, 0.16) * horizonHaze;

    // Strictly localized directional scatter behind bolt ray (never a full-screen flash)
    if (uLightningIntensity > 0.001) {
      vec3 rayDir = normalize(vWorldPos);
      vec3 boltDir = normalize(uLightningPos);
      float angularDist = length(rayDir - boltDir);
      float localSkyScatter = exp(-angularDist * angularDist * 18.0) * uLightningIntensity * 0.22;
      col = mix(col, uFlashColor, clamp(localSkyScatter, 0.0, 0.25));
    }

    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

// ─── Cloud slab ──────────────────────────────────────────────────────

export const cloudSlabVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying float vViewZ;
  void main() {
    vUv = uv;
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vViewZ = -mvPos.z;
    gl_Position = projectionMatrix * mvPos;
  }
`;

export const cloudSlabFragmentShader = /* glsl */ `
  uniform sampler2D uNoise;
  uniform vec3 uCloudColor;
  uniform float uCoverage;
  uniform float uDrift;
  uniform float uTime;
  uniform float uNearFade0;
  uniform float uNearFade1;
  uniform float uCorridorRadius;
  uniform float uCorridorFalloff;
  uniform float uAlphaCap;
  uniform float uBehindDim;
  uniform float uIsBehindLogo;
  uniform float uFlash;
  uniform vec3 uFlashColor;
  uniform float uFlashFalloff;
  uniform float uExitProgress;
  varying vec2 vUv;
  varying float vViewZ;

  float sampleCloudNoise(vec2 uv) {
    float n1 = texture2D(uNoise, uv).r;
    float n2 = texture2D(uNoise, uv * 2.4 + vec2(0.3, 0.7)).r;
    float n3 = texture2D(uNoise, uv * 5.2 + vec2(0.6, 0.2)).r;
    return n1 * 0.55 + n2 * 0.32 + n3 * 0.13;
  }

  void main() {
    vec2 driftUv = vUv * 1.6 + vec2(uTime * uDrift, uTime * uDrift * 0.25);
    float n = sampleCloudNoise(driftUv);
    float alpha = smoothstep(1.0 - uCoverage, 0.92, n);
    alpha *= smoothstep(uNearFade0, uNearFade1, vViewZ);

    vec2 centreUv = vUv - 0.5;
    float dist = length(vec2(centreUv.x * 0.85, centreUv.y * 1.55));
    float activeCorridor = uCorridorRadius + uExitProgress * 1.8;
    float corridor = smoothstep(activeCorridor * 0.45, activeCorridor + uCorridorFalloff, dist);

    float corridorFloor = uIsBehindLogo > 0.5 ? 0.55 : 0.0;
    alpha *= mix(corridorFloor, 1.0, corridor);

    if (uExitProgress > 0.0) {
      alpha *= (1.0 - smoothstep(0.0, 1.2, uExitProgress * (1.2 - dist)));
    }

    alpha = min(alpha, uAlphaCap);
    alpha *= mix(1.0, uBehindDim, uIsBehindLogo);

    float contourEdge = smoothstep(1.0 - uCoverage, 1.0 - uCoverage + 0.15, n)
                      * (1.0 - smoothstep(1.0 - uCoverage + 0.15, 0.95, n));
    vec3 warmRim = mix(vec3(0.88, 0.68, 0.36), vec3(0.68, 0.82, 0.98), vUv.y);
    vec3 baseCol = uCloudColor * (0.65 + 0.50 * vUv.y);
    baseCol = mix(baseCol, warmRim, contourEdge * 0.48);

    vec3 col = mix(baseCol, uFlashColor, uFlash * (0.25 + 0.55 * n) * uFlashFalloff);

    gl_FragColor = vec4(col, alpha);
    #include <colorspace_fragment>
  }
`;

// ─── Cloud puff billboard ────────────────────────────────────────────

export const cloudPuffVertexShader = /* glsl */ `
  attribute float aScale;
  attribute float aAlpha;
  attribute vec3 aOffset;
  attribute float aDriftPhase;
  uniform float uTime;
  uniform float uPuffDrift;
  varying float vAlpha;
  varying vec2 vUv;

  void main() {
    vAlpha = aAlpha;
    vUv = uv;
    vec3 pos = position * aScale;
    float drift = sin(uTime * 0.1 + aDriftPhase) * uPuffDrift;
    vec3 offset = aOffset + vec3(drift, 0.0, 0.0);
    vec4 mvOffset = modelViewMatrix * vec4(offset, 1.0);
    mvOffset.xy += pos.xy;
    gl_Position = projectionMatrix * mvOffset;
  }
`;

export const cloudPuffFragmentShader = /* glsl */ `
  uniform vec3 uCloudColor;
  uniform float uFlash;
  uniform vec3 uFlashColor;
  uniform float uExitProgress;
  varying float vAlpha;
  varying vec2 vUv;

  void main() {
    float d = length(vUv - 0.5) * 2.0;
    float soft = 1.0 - smoothstep(0.2, 1.0, d);
    float alpha = vAlpha * soft;
    if (uExitProgress > 0.0) {
      alpha *= (1.0 - uExitProgress);
    }
    vec3 basePuffCol = uCloudColor * (0.8 + 0.5 * (vUv.y - 0.2));
    vec3 col = mix(basePuffCol, uFlashColor, uFlash * 0.5);
    gl_FragColor = vec4(col, alpha);
    #include <colorspace_fragment>
  }
`;

// ─── Logo plane ──────────────────────────────────────────────────────

export const logoVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export function logoFragmentShader(noiseScale: number): string {
  return /* glsl */ `
    uniform sampler2D uLogoTex;
    uniform sampler2D uNoise;
    uniform float uDissolve;
    uniform float uEdgeWidth;
    uniform float uFlash;
    uniform float uGlowStrength;
    uniform vec3 uGoldColor;
    uniform vec3 uEmberColor;
    varying vec2 vUv;

    float bakedNoise(vec2 uv) {
      return texture2D(uNoise, uv).r;
    }

    void main() {
      vec4 texColor = texture2D(uLogoTex, vUv);
      if (texColor.a < 0.01) discard;

      if (uDissolve <= 0.001) {
        float lum = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));
        vec3 aura = mix(uGoldColor, vec3(1.0, 0.95, 0.8), lum) * 0.32;
        vec3 pristineCol = texColor.rgb + aura * texColor.a + uFlash * 0.08;
        gl_FragColor = vec4(pristineCol, texColor.a);
        #include <colorspace_fragment>
        return;
      }

      float noise = bakedNoise(vUv * ${noiseScale.toFixed(1)});
      float threshold = uDissolve * (1.0 + uEdgeWidth * 2.0) - uEdgeWidth;
      float dissolveEdge = smoothstep(threshold - uEdgeWidth, threshold, noise);
      float alpha = texColor.a * (1.0 - dissolveEdge);

      float edgeGlow = smoothstep(threshold - uEdgeWidth, threshold, noise)
                     * (1.0 - smoothstep(threshold, threshold + uEdgeWidth, noise));
      edgeGlow = clamp(edgeGlow * 3.5, 0.0, 1.0);
      vec3 glowColor = mix(uGoldColor, uEmberColor, edgeGlow);
      vec3 col = mix(texColor.rgb, glowColor, edgeGlow * max(uGlowStrength, 1.0));
      col += uFlash * 0.08;

      gl_FragColor = vec4(col, alpha);
      #include <colorspace_fragment>
    }
  `;
}

// ─── Embers (dissolution particles) ─────────────────────────────────

export function embersVertexShader(noiseScale: number): string {
  return /* glsl */ `
    attribute vec2 aUv;
    attribute float aNoiseThreshold;
    attribute float aRandSeed;
    uniform float uDissolve;
    uniform float uTime;
    uniform float uDrift;
    uniform float uTurbulence;
    uniform float uEmberSize;
    uniform sampler2D uNoise;

    varying float vLife;
    varying float vAlpha;

    float bakedNoise(vec2 uv) {
      return texture2D(uNoise, uv).r;
    }

    void main() {
      float noise = bakedNoise(aUv * ${noiseScale.toFixed(1)});
      float emitProgress = smoothstep(aNoiseThreshold - 0.05, aNoiseThreshold + 0.05, uDissolve);
      vLife = emitProgress;

      if (uDissolve <= 0.001 || emitProgress < 0.01) {
        gl_Position = vec4(0.0, 0.0, -10.0, 1.0);
        gl_PointSize = 0.0;
        vAlpha = 0.0;
        return;
      }

      float timeOffset = aRandSeed * 6.28;
      vec3 pos = position;
      pos.z += emitProgress * uDrift;
      pos.x += sin(uTime * 2.0 + timeOffset) * uTurbulence * emitProgress;
      pos.y += cos(uTime * 1.5 + timeOffset * 1.3) * uTurbulence * 0.7 * emitProgress;

      vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPos;

      float size = uEmberSize * (1.0 - emitProgress * 0.7);
      gl_PointSize = size * (300.0 / -mvPos.z);

      vAlpha = (1.0 - emitProgress) * 0.85;
    }
  `;
}

export const embersFragmentShader = /* glsl */ `
  uniform vec3 uGoldColor;
  uniform vec3 uEmberColor;
  uniform float uBrightness;
  varying float vLife;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    if (d > 1.0) discard;
    float soft = 1.0 - d * d;

    vec3 col = mix(uGoldColor, uEmberColor, vLife);
    float alpha = vAlpha * soft * uBrightness;

    gl_FragColor = vec4(col * alpha, alpha);
    #include <colorspace_fragment>
  }
`;

// ─── Mist wisps ──────────────────────────────────────────────────────

export const mistVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const mistFragmentShader = /* glsl */ `
  uniform sampler2D uNoise;
  uniform float uOpacity;
  uniform float uDissolve;
  uniform float uTime;
  uniform float uDrift;
  uniform vec3 uCloudColor;
  varying vec2 vUv;

  float bakedNoise(vec2 uv) {
    return texture2D(uNoise, uv).r;
  }

  void main() {
    vec2 driftUv = vUv + vec2(uTime * uDrift, 0.0);
    float n = bakedNoise(driftUv * 2.2);
    float softEdge = smoothstep(0.0, 0.3, vUv.x) * smoothstep(1.0, 0.7, vUv.x)
                   * smoothstep(0.0, 0.3, vUv.y) * smoothstep(1.0, 0.7, vUv.y);
    float basePresence = mix(0.32, 1.0, smoothstep(0.05, 0.65, uDissolve));
    float alpha = smoothstep(0.35, 0.78, n) * softEdge * uOpacity * basePresence;

    gl_FragColor = vec4(uCloudColor, alpha);
    #include <colorspace_fragment>
  }
`;

// ─── Welcome backdrop (horizon glow) ─────────────────────────────────

export const backdropVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const backdropFragmentShader = /* glsl */ `
  uniform vec3 uGoldColor;
  uniform vec3 uEmberColor;
  uniform float uIntensity;
  uniform float uFade;
  uniform float uCenterY;
  uniform float uRadius;
  uniform float uExitProgress;
  varying vec2 vUv;

  void main() {
    vec2 centred = vUv - vec2(0.5, 0.5 + uCenterY);
    float d = length(centred);

    float effectiveRadius = mix(uRadius, uRadius * 3.5, uExitProgress);
    float activeFade = max(0.18 + uFade * 0.82, uExitProgress);
    float glow = smoothstep(effectiveRadius, 0.0, d) * uIntensity * activeFade;

    vec3 col = mix(uEmberColor, uGoldColor, smoothstep(0.0, effectiveRadius * 0.65, d));
    col = mix(col, vec3(1.0, 0.98, 0.92), uExitProgress * 0.9);

    gl_FragColor = vec4(col, glow);
    #include <colorspace_fragment>
  }
`;

// ─── Realistic Volumetric Cloud Formations & Cumulus Puffs ───────────

export const cumulusCloudPuffVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying float vViewZ;

  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    vec4 mvPos = viewMatrix * worldPos;
    vViewZ = -mvPos.z;
    gl_Position = projectionMatrix * mvPos;
  }
`;

export const cumulusCloudPuffFragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform sampler2D uNoise;
  uniform vec3 uColor;
  uniform vec3 uShadowColor;
  uniform vec3 uRimColor;
  uniform vec3 uHorizonColor;
  uniform vec3 uLightningStart;
  uniform vec3 uLightningEnd;
  uniform float uLightningIntensity;
  uniform vec3 uLightningColor;
  uniform float uExitProgress;
  uniform vec2 uNearFade;
  uniform float uLayerType; // 0.0 = distant, 1.0 = midground, 2.0 = foreground
  uniform float uTime;
  uniform float uDriftSpeed;
  uniform float uCorridorRadius;

  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying float vViewZ;

  float fbmCloud(vec2 p) {
    float n1 = texture2D(uNoise, p).r;
    float n2 = texture2D(uNoise, p * 2.15 + vec2(0.37, 0.61)).r;
    float n3 = texture2D(uNoise, p * 4.50 + vec2(0.73, 0.19)).r;
    return n1 * 0.54 + n2 * 0.31 + n3 * 0.15;
  }

  float distToSegment(vec3 p, vec3 a, vec3 b) {
    vec3 pa = p - a;
    vec3 ba = b - a;
    float h = clamp(dot(pa, ba) / max(dot(ba, ba), 0.0001), 0.0, 1.0);
    return length(pa - ba * h);
  }

  void main() {
    vec4 tex = texture2D(uTexture, vUv);
    if (tex.a < 0.01) discard;

    // Domain-warped FBM erosion for recognizable, irregular cloud silhouettes
    vec2 seedOffset = vWorldPos.xy * 0.11 + vec2(vWorldPos.z * 0.07);
    vec2 drift = vec2(uTime * uDriftSpeed, uTime * uDriftSpeed * 0.25);
    float warp = fbmCloud(vUv * 1.4 + seedOffset + drift);
    float detail = fbmCloud(vUv * 2.6 + seedOffset + vec2(warp * 0.28) - drift * 0.6);

    // Sculpted silhouette density: erodes outer edges into billowy cauliflower forms
    float rawAlpha = tex.a * mix(0.68, 1.28, detail);
    float sculptedAlpha = smoothstep(0.14, 0.66, rawAlpha);
    if (sculptedAlpha < 0.01) discard;

    // Internal volumetric density (0 at wispy edge, 1 in deep cloud belly)
    float coreWeight = smoothstep(0.22, 0.85, sculptedAlpha * detail);
    float rimMask = smoothstep(0.12, 0.48, sculptedAlpha) * (1.0 - smoothstep(0.48, 0.88, sculptedAlpha));
    float topCrest = smoothstep(0.35, 0.88, vUv.y) * (0.45 + 0.55 * detail);

    // Renaissance chiaroscuro storm palette:
    // Deep violet-indigo underbelly -> storm slate body -> silver-blue illuminated crest
    vec3 darkUnderbelly = uShadowColor * 0.72;
    vec3 stormBody = tex.rgb * uColor;
    vec3 col = mix(darkUnderbelly, stormBody, 0.35 + 0.65 * vUv.y);
    col = mix(col, darkUnderbelly, coreWeight * 0.42);
    col = mix(col, uRimColor, clamp(rimMask * 0.58 + topCrest * 0.36, 0.0, 0.85));

    // Restrained warm amber horizon glow on lower/distant cloud banks
    float horizonFactor = smoothstep(0.45, -2.5, vWorldPos.y) * (1.0 - uLayerType * 0.35);
    col += uHorizonColor * horizonFactor * (0.14 + 0.18 * rimMask);

    // Atmospheric depth separation (distant layers blend subtly toward midnight sky)
    if (uLayerType < 0.5) {
      col = mix(col, vec3(0.08, 0.12, 0.24), 0.25);
    }

    // ── Localized 3D Line-Segment Lightning Illumination ──
    if (uLightningIntensity > 0.001) {
      float segDist = distToSegment(vWorldPos, uLightningStart, uLightningEnd);
      // Tight localized falloff so only clouds near the bolt path light up
      float localAtten = exp(-segDist * segDist * 0.26);
      float scatter = uLightningIntensity * localAtten;
      float edgeBoost = 0.45 + 0.95 * (1.0 - coreWeight * 0.65);
      vec3 strikeCol = mix(uLightningColor, vec3(1.0, 1.0, 1.0), 0.5);
      col = mix(col, strikeCol, clamp(scatter * edgeBoost * 1.15, 0.0, 0.92));
      col += uRimColor * scatter * rimMask * 0.85;
    }

    float alpha = sculptedAlpha;

    // Foreground corridor mask: clouds at Z > -5.0 sit in front of the logo in 3D space,
    // framing its perimeter while keeping the central YUVAAN 2027 letters 100% readable.
    if (uLayerType > 1.5) {
      float lateralDist = length(vec2(vWorldPos.x * 0.62, vWorldPos.y * 1.05));
      float logoCorridor = smoothstep(uCorridorRadius * 0.85, uCorridorRadius * 2.4, lateralDist);
      alpha *= mix(0.12, 0.88, logoCorridor);
    }

    // Near-camera fade for smooth fly-through without hard plane clipping
    alpha *= smoothstep(uNearFade.x, uNearFade.y, vViewZ);

    // Exit transition parting
    if (uExitProgress > 0.0) {
      alpha *= (1.0 - smoothstep(0.0, 0.92, uExitProgress));
    }

    if (alpha < 0.008) discard;
    gl_FragColor = vec4(col, min(alpha, 0.95));
    #include <colorspace_fragment>
  }
`;

export const volumetricCloudVertexShader = cumulusCloudPuffVertexShader;
export const volumetricCloudFragmentShader = cumulusCloudPuffFragmentShader;

// ─── Natural Branching Lightning Bolt ─────────────────────────────────

export const lightningBoltVertexShader = /* glsl */ `
  attribute float aBranch;
  varying vec2 vUv;
  varying float vBranch;

  void main() {
    vUv = uv;
    vBranch = aBranch;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const lightningBoltFragmentShader = /* glsl */ `
  uniform float uIntensity;
  uniform float uStrikeGrowth;
  uniform vec3 uCoreColor;
  uniform vec3 uInnerGlowColor;
  uniform vec3 uOuterGlowColor;

  varying vec2 vUv;
  varying float vBranch;

  void main() {
    // Leader downward propagation along bolt length (vUv.y: 0 at top origin -> 1 at tip)
    float growthMask = 1.0 - smoothstep(uStrikeGrowth - 0.12, uStrikeGrowth + 0.02, vUv.y);
    if (growthMask < 0.01) discard;

    float dist = abs(vUv.x - 0.5) * 2.0; // 0 at center core, 1 at ribbon edge

    // Crisp, high-visibility white-blue core + electric cyan sheath + violet-blue halo
    float core = 1.0 - smoothstep(0.0, 0.34, dist);
    float inner = 1.0 - smoothstep(0.14, 0.72, dist);
    float outer = 1.0 - smoothstep(0.42, 1.0, dist);

    vec3 col = mix(uOuterGlowColor, uInnerGlowColor, inner);
    col = mix(col, uCoreColor, core);

    float branchDim = mix(1.0, 0.78, vBranch);
    float tipTaper = 1.0 - smoothstep(0.75, 1.0, vUv.y) * 0.35;
    float alpha = (core * 1.0 + inner * 0.90 + outer * 0.50) * uIntensity * branchDim * growthMask * tipTaper;

    if (alpha < 0.01) discard;
    gl_FragColor = vec4(col * (1.1 + core * 0.6), min(alpha, 1.0));
    #include <colorspace_fragment>
  }
`;

export const lightningGlowVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const lightningGlowFragmentShader = /* glsl */ `
  uniform float uIntensity;
  uniform vec3 uGlowColor;
  varying vec2 vUv;

  void main() {
    float d = length(vUv - 0.5) * 2.0;
    if (d > 1.0) discard;
    // Localized origin corona inside the cloud anvil (no screen-wide wash)
    float glow = exp(-d * d * 4.5) * (1.0 - d) * uIntensity * 0.42;
    if (glow < 0.005) discard;
    gl_FragColor = vec4(uGlowColor, min(glow, 0.45));
    #include <colorspace_fragment>
  }
`;