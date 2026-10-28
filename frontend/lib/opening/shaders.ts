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

// ─── Sky dome (Deep Storm Slate Zenith -> Warm Golden-Hour Horizon) ──

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
  uniform vec3 uGoldColor;
  uniform vec3 uEmberColor;
  uniform float uFlash;
  uniform vec3 uFlashColor;
  uniform vec3 uLightningPos;
  uniform float uLightningIntensity;
  varying vec2 vUv;
  varying vec3 vWorldPos;

  void main() {
    vec3 dir = normalize(vWorldPos);
    float elev = clamp(dir.y * 1.25 + 0.42, 0.0, 1.0);

    // Rich cinematic twilight: deep midnight slate zenith -> smoky dusk -> warm golden-copper horizon
    vec3 zenithCol   = vec3(0.05, 0.07, 0.13);
    vec3 midSlate    = vec3(0.14, 0.17, 0.25);
    vec3 warmDusk    = vec3(0.38, 0.23, 0.18);
    vec3 goldenRose  = vec3(0.62, 0.36, 0.24);

    vec3 col = mix(goldenRose, warmDusk, smoothstep(0.0, 0.38, elev));
    col = mix(col, midSlate, smoothstep(0.32, 0.68, elev));
    col = mix(col, zenithCol, smoothstep(0.65, 0.98, elev));

    // Soft golden-hour horizon warmth (never blows out to white)
    float horizonBand = exp(-pow((dir.y + 0.08) * 3.0, 2.0));
    vec3 amberTint = vec3(0.72, 0.44, 0.26);
    col = mix(col, amberTint, horizonBand * 0.45);

    // Strictly localized directional scatter behind lightning bolt
    if (uLightningIntensity > 0.001) {
      vec3 boltDir = normalize(uLightningPos);
      float angularDist = length(dir - boltDir);
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
    gl_FragColor = vec4(uCloudColor, alpha);
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
    float alpha = vAlpha * soft * (1.0 - uExitProgress);
    gl_FragColor = vec4(uCloudColor, alpha);
    #include <colorspace_fragment>
  }
`;

// ─── 3D Blender (.glb) Realistic Dark-Silver / Gunmetal Emblem Shader ──
// Matches the dark brushed silver-steel reference (image_2eda99.jpg) with
// dark shadowed side walls, crisp silver bevels, and subtle golden-hour rim light.

export const emblemMetallicVertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vLocalNormal;
  varying vec3 vWorldPos;
  varying vec3 vViewPos;
  varying vec2 vSurfCoord;

  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    vec4 mvPos = viewMatrix * worldPos;
    vViewPos = mvPos.xyz;
    vNormal = normalize(mat3(modelMatrix) * normal);
    vLocalNormal = normalize(normal);
    vSurfCoord = worldPos.xy * 0.72;
    gl_Position = projectionMatrix * mvPos;
  }
`;

export const emblemMetallicFragmentShader = /* glsl */ `
  uniform sampler2D uNoise;
  uniform float uTime;
  uniform float uFlash;
  uniform vec3 uGoldColor;
  uniform vec3 uEmberColor;

  varying vec3 vNormal;
  varying vec3 vLocalNormal;
  varying vec3 vWorldPos;
  varying vec3 vViewPos;
  varying vec2 vSurfCoord;

  float hash21(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
  }

  float noise2D(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash21(i + vec2(0.0, 0.0)), hash21(i + vec2(1.0, 0.0)), u.x),
      mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  // Subtle micro-scratches & brushed steel grain (never harsh white lines)
  float microScratch(vec2 uv, float angle, float scale) {
    float c = cos(angle), s = sin(angle);
    vec2 ruv = mat2(c, -s, s, c) * uv;
    float n = noise2D(vec2(ruv.x * 2.2, ruv.y * scale));
    float mask = noise2D(ruv * 3.0);
    float line = 1.0 - abs(n * 2.0 - 1.0);
    return pow(clamp(line, 0.0, 1.0), 8.0) * smoothstep(0.45, 0.90, mask);
  }

  void main() {
    // 1. Distinguish Flat Front Faces vs. Bevel Edges vs. Extruded Side Walls
    vec3 ddx = dFdx(vWorldPos);
    vec3 ddy = dFdy(vWorldPos);
    vec3 faceN = normalize(cross(ddx, ddy));
    vec3 smoothN = normalize(vNormal);
    vec3 V = normalize(-vViewPos);

    // frontMask = 1.0 on flat front face, 0.0 on extruded side walls
    float frontMask = smoothstep(0.38, 0.78, abs(faceN.z));

    // bevelMask isolates the sharp chamfered edge between the front face and side walls
    float edgeDeviation = length(smoothN.xy - faceN.xy * 0.35);
    float chamferZone = smoothstep(0.15, 0.65, abs(faceN.z)) * (1.0 - smoothstep(0.65, 0.94, abs(faceN.z)));
    float bevelMask = clamp(
      smoothstep(0.22, 0.72, edgeDeviation) * (0.45 + 0.55 * frontMask) + chamferZone * 1.15,
      0.0,
      1.0
    );

    // 2. Realistic Brushed Gunmetal & Silver Steel Surface Texture
    vec2 p = vSurfCoord;
    float m1 = texture2D(uNoise, p * 0.85 + vec2(0.15, 0.42)).r;
    float m2 = texture2D(uNoise, p * 2.40 + vec2(0.62, 0.18)).r;
    float m3 = texture2D(uNoise, p * 6.50 + vec2(0.33, 0.77)).r;
    float metalMottle = m1 * 0.50 + m2 * 0.32 + m3 * 0.18;

    float fineGrain = microScratch(p, 0.55, 65.0) * 0.45
                    + microScratch(p, -0.72, 80.0) * 0.35
                    + (noise2D(p * 38.0) - 0.5) * 0.12;

    // 3. Front Face Shading (Dark Brushed Silver-Steel like image_2eda99.jpg)
    // Broad, soft studio reflection across the upper curve of the G and tops of the bars
    float radialDist = length(p);
    float upperSheen = smoothstep(-0.55, 0.65, p.y * 0.75 - p.x * 0.25)
                     * exp(-pow(radialDist - 0.52, 2.0) * 2.2);
    float barTopSheen = smoothstep(-0.25, 0.35, p.y) * exp(-pow(p.x * 1.4, 2.0) * 1.8);
    float faceLight = clamp(upperSheen * 0.75 + barTopSheen * 0.55 + (metalMottle - 0.45) * 0.45, 0.0, 1.0);

    vec3 darkGunmetal = vec3(0.12, 0.14, 0.16); // #1F2429 deep steel
    vec3 midSilver    = vec3(0.24, 0.27, 0.30); // #3D454D brushed steel
    vec3 litSilver    = vec3(0.44, 0.48, 0.53); // #707A87 bright brushed silver

    vec3 frontCol = mix(darkGunmetal, midSilver, smoothstep(0.15, 0.65, metalMottle));
    frontCol = mix(frontCol, litSilver, faceLight * 0.78);
    frontCol += vec3(0.16, 0.18, 0.20) * fineGrain;

    // Subtle dark inner edge vignette on the flat face next to the bright bevel
    frontCol *= (0.86 + 0.14 * (1.0 - bevelMask * 0.5));

    // 4. Extruded Side Walls (Deep Shadowed Gunmetal Steel — never bright peach/white)
    vec3 L_topLeft = normalize(vec3(-0.55, 0.72, 0.42));
    vec3 L_golden  = normalize(vec3(0.75, -0.35, 0.56));
    float sideTopLight = clamp(dot(smoothN, L_topLeft), 0.0, 1.0);
    float sideWarmLight = clamp(dot(smoothN, L_golden), 0.0, 1.0);

    vec3 deepSideShadow = vec3(0.06, 0.07, 0.09); // #0F1217 dark recessed steel
    vec3 litSideSteel   = vec3(0.22, 0.25, 0.28);
    vec3 sideCol = mix(deepSideShadow, litSideSteel, sideTopLight * 0.65 + sideWarmLight * 0.35);

    // Blend front face and side walls
    vec3 col = mix(sideCol, frontCol, frontMask);

    // 5. Crisp Metallic Bevel Highlights + Subtle Golden-Hour Rim Reflection
    // Top/left bevels catch cool platinum-silver sky light;
    // Right/lower bevels & inner G curve catch a subtle warm golden-hour champagne glint.
    vec3 H_cool = normalize(L_topLeft + V);
    vec3 H_warm = normalize(L_golden + V);

    float bevelCool = pow(max(0.0, dot(smoothN, H_cool)), 6.0) * 0.75 + sideTopLight * 0.45;
    float bevelWarm = pow(max(0.0, dot(smoothN, H_warm)), 5.0) * 0.80 + sideWarmLight * 0.55;

    // Subtle moving glint as the camera descends or emblem floats
    float motionGlint = 0.88 + 0.12 * sin(uTime * 0.8 + p.x * 2.5 - p.y * 2.0);

    vec3 platinumEdge  = vec3(0.78, 0.83, 0.89); // Crisp silver highlight
    vec3 champagneGold = vec3(0.88, 0.71, 0.46); // Subtle golden-hour reflection

    // Mix silver with a restrained golden-hour tint on edges facing the sunset
    float warmEdgeMask = clamp(smoothN.x * 0.65 - smoothN.y * 0.35 + 0.35, 0.0, 1.0);
    vec3 bevelHighlightCol = mix(platinumEdge, champagneGold, warmEdgeMask * 0.58);

    float bevelIntensity = bevelMask * clamp(bevelCool * 0.75 + bevelWarm * 0.85, 0.0, 1.15) * motionGlint;
    col = mix(col, bevelHighlightCol, clamp(bevelIntensity * 0.82, 0.0, 0.88));

    // Extra crisp specular catchlight on the sharpest bevel corners
    float sharpCorner = pow(bevelMask, 2.2) * pow(max(bevelCool, bevelWarm), 2.5);
    col += mix(vec3(0.92, 0.95, 1.0), vec3(1.0, 0.86, 0.65), warmEdgeMask * 0.5) * sharpCorner * 0.32;

    // 6. Lightning Strike Response (Brief cool silver-blue glint on bevels)
    if (uFlash > 0.001) {
      col += vec3(0.82, 0.90, 1.0) * (bevelMask * 0.9 + faceLight * 0.35) * uFlash * 1.2;
    }

    // Output exact perceptual sRGB values directly (prevents linearToSRGB gamma blowout)
    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
  }
`;

// ─── 2D Fallback Logo Shader (if .glb is absent) ─────────────────────

export const logoVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldPos;
  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export function logoFragmentShader(_noiseScale: number): string {
  void _noiseScale;
  return /* glsl */ `
    uniform sampler2D uLogoTex;
    uniform sampler2D uNoise;
    uniform float uDissolve;
    uniform float uEdgeWidth;
    uniform float uFlash;
    uniform float uGlowStrength;
    uniform vec3 uGoldColor;
    uniform vec3 uEmberColor;
    uniform float uTime;
    varying vec2 vUv;
    varying vec3 vWorldPos;

    void main() {
      vec4 texColor = texture2D(uLogoTex, vUv);
      float solidAlpha = smoothstep(0.22, 0.62, texColor.a);
      if (solidAlpha < 0.02) discard;

      float lum = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));
      vec2 centred = vUv - 0.5;
      float lowerRightMask = smoothstep(-0.35, 0.55, centred.x - centred.y * 0.85);
      float spec = pow(clamp(lum * 1.25, 0.0, 1.0), 2.0);

      vec3 warmGold = mix(vec3(0.88, 0.42, 0.14), vec3(1.0, 0.78, 0.38), spec);
      vec3 warmReflection = warmGold * lowerRightMask * (0.35 + spec * 0.75);
      vec3 silverFlash = vec3(0.88, 0.95, 1.0) * spec * uFlash * 1.3;

      vec3 col = texColor.rgb * 0.92 + warmReflection + silverFlash;
      gl_FragColor = vec4(col, solidAlpha);
      #include <colorspace_fragment>
    }
  `;
}

// ─── Ambient Multiverse Golden Sparks (Horizon Embers) ───────────────

export function embersVertexShader(noiseScale: number): string {
  void noiseScale;
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

    void main() {
      float cycle = fract(uTime * 0.08 + aRandSeed);
      vLife = cycle;

      float angle = aRandSeed * 6.28318 + uTime * 0.12 * (aNoiseThreshold - 0.5);
      float radius = 1.6 + aNoiseThreshold * 4.8;
      vec3 pos = vec3(
        cos(angle) * radius + sin(uTime * 0.9 + aRandSeed * 10.0) * uTurbulence,
        (cycle - 0.45) * 5.5 + cos(uTime * 0.7 + aRandSeed * 7.0) * uTurbulence * 0.5,
        position.z - 1.5 - aNoiseThreshold * 4.0
      );

      vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPos;

      float pulse = sin(cycle * 3.14159);
      float size = uEmberSize * (0.6 + 0.8 * pulse);
      gl_PointSize = max(1.0, size * (260.0 / max(-mvPos.z, 1.0)));

      vAlpha = pulse * 0.55 * (0.40 + 0.45 * uDissolve);
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
    float soft = pow(1.0 - d, 1.8);

    vec3 col = mix(uGoldColor, vec3(1.0, 0.88, 0.65), 1.0 - d);
    col = mix(col, uEmberColor, vLife * 0.45);
    float alpha = vAlpha * soft * uBrightness;

    gl_FragColor = vec4(col, min(alpha, 0.85));
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
    float centerClear = smoothstep(0.18, 0.45, length(vUv - 0.5));
    float alpha = smoothstep(0.38, 0.80, n) * softEdge * centerClear * uOpacity * 0.35;

    gl_FragColor = vec4(uCloudColor, alpha);
    #include <colorspace_fragment>
  }
`;

// ─── Golden-Hour Horizon Backdrop (No White Blowout!) ────────────────
// Provides soft, warm amber-copper sunset continuity from scroll = 0%
// all the way through the YUVAAN 2027 welcome card (scroll = 100%).

export const backdropVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const backdropFragmentShader = /* glsl */ `
  uniform sampler2D uNoise;
  uniform vec3 uGoldColor;
  uniform vec3 uEmberColor;
  uniform float uIntensity;
  uniform float uFade;
  uniform float uCenterY;
  uniform float uRadius;
  uniform float uExitProgress;
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    vec2 centred = (vUv - vec2(0.5, 0.46 + uCenterY * 0.25)) * vec2(1.25, 1.0);
    float d = length(centred);
    float angle = atan(centred.y, centred.x);

    // Subtle multiverse ring texture inside the warm sunset glow
    float n1 = texture2D(uNoise, vec2(angle * 0.45 + uTime * 0.025, d * 2.0 - uTime * 0.015)).r;
    float ringWave = exp(-pow(abs(d - 0.36), 2.0) * 55.0) * smoothstep(0.3, 0.8, n1) * 0.28;

    float radialFalloff = smoothstep(uRadius * 1.15, 0.0, d);

    // Palette matched to image_2ef521.jpg:
    // Smoky slate-indigo outer sky -> warm dusty copper-rose -> soft golden-amber horizon
    // Strictly capped so it NEVER turns white on the YUVAAN 2027 welcome screen!
    vec3 outerSlate = vec3(0.14, 0.16, 0.23);
    vec3 warmCopper = vec3(0.56, 0.32, 0.21);
    vec3 softAmber  = vec3(0.78, 0.48, 0.28);

    vec3 col = mix(outerSlate, warmCopper, smoothstep(0.0, 0.65, radialFalloff));
    col = mix(col, softAmber, clamp(pow(radialFalloff, 1.8) * 0.75 + ringWave, 0.0, 0.85));

    // Only brightens into the portal flash after the user clicks "READY TO ENTER" (uExitProgress > 0)
    col = mix(col, vec3(0.98, 0.84, 0.58), uExitProgress * 0.85);

    float activeAlpha = radialFalloff * (0.45 + 0.25 * uFade + 0.30 * uExitProgress);
    if (activeAlpha < 0.005) discard;

    gl_FragColor = vec4(col, min(activeAlpha, 0.78));
    #include <colorspace_fragment>
  }
`;

// ─── Realistic Volumetric Cloud Formations (Soft Golden-Hour Storm) ──

export const cumulusCloudPuffVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying vec3 vViewPos;
  varying float vViewZ;

  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    vec4 mvPos = viewMatrix * worldPos;
    vViewPos = mvPos.xyz;
    vViewZ = -mvPos.z;
    gl_Position = projectionMatrix * mvPos;
  }
`;

export const cumulusCloudPuffFragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform sampler2D uNoise;
  uniform vec3 uKeyLightDir;
  uniform vec3 uKeyLightColor;
  uniform vec3 uBackLightDir;
  uniform vec3 uBackLightColor;
  uniform vec3 uSunsetColor;
  uniform vec3 uCopperColor;
  uniform vec3 uShadowColor;
  uniform vec3 uAmbientColor;
  uniform vec3 uHorizonHazeColor;
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
  varying vec3 vViewPos;
  varying float vViewZ;

  float fbmCloud(vec2 p) {
    float n1 = texture2D(uNoise, p).r;
    float n2 = texture2D(uNoise, p * 2.15 + vec2(0.35, 0.65)).r;
    float n3 = texture2D(uNoise, p * 4.50 + vec2(0.68, 0.22)).r;
    return n1 * 0.54 + n2 * 0.31 + n3 * 0.15;
  }

  void main() {
    vec4 mapSample = texture2D(uTexture, vUv);
    float baseDensity = mapSample.a;
    if (baseDensity < 0.01) discard;

    // Unpack 3D surface normal from continuous ellipsoidal cloud lobes
    vec3 N = normalize(mapSample.rgb * 2.0 - 1.0);
    vec3 V = normalize(-vViewPos);

    vec2 drift = vec2(uTime * uDriftSpeed, uTime * uDriftSpeed * 0.30);
    vec2 worldCoord = vWorldPos.xy * 0.07 + vec2(vWorldPos.z * 0.035);
    float noiseErosion = fbmCloud(vUv * 2.2 + worldCoord + drift);

    // Smooth quad boundary feathering
    float quadFeather = smoothstep(0.0, 0.18, vUv.x) * smoothstep(1.0, 0.82, vUv.x)
                      * smoothstep(0.0, 0.18, vUv.y) * smoothstep(1.0, 0.82, vUv.y);

    float density = smoothstep(0.10, 0.65, baseDensity * (0.75 + 0.45 * noiseErosion)) * quadFeather;
    if (density < 0.008) discard;

    // ── 1. Soft Physical Directional Shading (No harsh artificial edge outlines!) ──
    vec3 L_key = normalize(uKeyLightDir);
    float wrapKey = clamp((dot(N, L_key) + 0.35) / 1.35, 0.0, 1.0);
    float directLight = pow(wrapKey, 2.0);

    float upFactor = clamp(N.y * 0.55 + 0.45, 0.0, 1.0);
    float cavityAO = clamp(N.z * 0.72 + 0.28, 0.20, 1.0) * (0.40 + 0.60 * upFactor);

    // Cool smoky storm slate on upper cloud billows -> deep indigo shadows in crevices
    vec3 deepShadow = uShadowColor * cavityAO;
    vec3 stormSlate = mix(deepShadow, uAmbientColor, wrapKey * 0.65 + 0.35 * upFactor);
    vec3 litCrest   = uKeyLightColor * (directLight * 0.85 + 0.08);

    vec3 col = mix(deepShadow, stormSlate, clamp(wrapKey * 0.78 + upFactor * 0.38, 0.0, 1.0));
    col = mix(col, litCrest, directLight * (0.48 + 0.42 * upFactor));

    // ── 2. Soft Golden-Hour Sunset & Warm Copper Diffusion (Like image_2ef521.jpg) ──
    vec3 L_sunset = normalize(vec3(0.28, -0.38, 0.88));
    float sunsetWrap = clamp((dot(N, L_sunset) + 0.45) / 1.45, 0.0, 1.0);
    float lowerWarmth = smoothstep(2.8, -2.6, vWorldPos.y);
    float centerGlow = exp(-length(vWorldPos.xy - vec2(0.15, -0.35)) * 0.18);

    // Warm rose-copper and soft amber-gold diffuse smoothly through the cloud volume
    vec3 warmSunset = mix(uCopperColor, uSunsetColor, sunsetWrap * 0.65 + 0.35 * centerGlow);
    float warmBlend = sunsetWrap * (0.35 + 0.48 * lowerWarmth + 0.32 * centerGlow);
    col = mix(col, warmSunset, clamp(warmBlend * 0.72, 0.0, 0.78));

    // ── 3. Golden-Hour Atmospheric Depth Continuity (Preserves warm clouds at YUVAAN 2027 card) ──
    float depthDist = -vWorldPos.z;
    float hazeFactor = smoothstep(5.0, 16.5, depthDist);
    vec3 goldenHaze = mix(
      vec3(0.26, 0.27, 0.34), // Upper smoky slate haze
      uHorizonHazeColor,      // Lower warm amber-copper haze (matches image_2ef521.jpg)
      smoothstep(2.4, -2.0, vWorldPos.y) * 0.75 + 0.25 * centerGlow
    );
    col = mix(col, goldenHaze, hazeFactor * 0.62);

    // ── 4. Localized 3D Lightning Illumination ──
    if (uLightningIntensity > 0.001) {
      vec3 pa = vWorldPos - uLightningStart;
      vec3 ba = uLightningEnd - uLightningStart;
      float h = clamp(dot(pa, ba) / max(dot(ba, ba), 0.0001), 0.0, 1.0);
      float segDist = length(pa - ba * h);

      float localAtten = exp(-segDist * segDist * 0.18);
      vec3 lDir = normalize((uLightningStart + ba * h) - vWorldPos);
      float lDiffuse = clamp((dot(N, lDir) + 0.35) / 1.35, 0.0, 1.0);
      float lScatter = uLightningIntensity * localAtten * (lDiffuse * 0.85 + 0.35);

      vec3 strikeCol = mix(uLightningColor, vec3(1.0, 1.0, 1.0), 0.65);
      col = mix(col, strikeCol, clamp(lScatter * 1.15, 0.0, 0.92));
    }

    float alpha = density;

    // Keep foreground clouds completely clear of the central 3D emblem
    if (uLayerType > 1.5) {
      float lateralDist = length(vec2(vWorldPos.x * 0.72, vWorldPos.y * 0.82));
      float logoCorridor = smoothstep(uCorridorRadius * 1.05, uCorridorRadius * 2.1, lateralDist);
      alpha *= logoCorridor;
    }

    alpha *= smoothstep(uNearFade.x, uNearFade.y, vViewZ);

    if (uExitProgress > 0.0) {
      alpha *= (1.0 - smoothstep(0.0, 0.92, uExitProgress));
    }

    if (alpha < 0.008) discard;
    gl_FragColor = vec4(col, min(alpha, 0.96));
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
    float growthMask = 1.0 - smoothstep(uStrikeGrowth - 0.12, uStrikeGrowth + 0.02, vUv.y);
    if (growthMask < 0.01) discard;

    float dist = abs(vUv.x - 0.5) * 2.0;

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
    float glow = exp(-d * d * 4.5) * (1.0 - d) * uIntensity * 0.42;
    if (glow < 0.005) discard;
    gl_FragColor = vec4(uGlowColor, min(glow, 0.45));
    #include <colorspace_fragment>
  }
`;