# YUVAAN responsive UI and decorative effects

The existing Next.js/React/Tailwind application and npm lockfile are retained. No dependencies were added. Routes, festival data, registration links, and contact flows were not changed.

## Files and tuning

| File | Responsibility / adjustments |
| --- | --- |
| `components/layout/Navbar.tsx` + `Navbar.module.css` | Reference-based navigation: Bangers/Barlow, cream mobile and inner pages, navy desktop home, lightning mark, ordered links and separate game action. Collapse below 1100 px. Bar including border: 82 px mobile, 96 px desktop. |
| `components/home/HeroSection.tsx` | `HERO_IMAGES` selects the replaceable comic artwork. Scroll progress eases the two outer rails from hidden to visible, expanding the composition from three columns to five; it does not move or scale the artwork. Each rail has five fixed image sequences, avoiding scroll-time remounts. |
| `components/home/HeroSection.module.css` | `--comic-duration` sets the rolling-panel speed (32 seconds fallback). Each five-sequence track translates by one sequence (20%) for a seamless loop, leaving four sequences available to cover the rail. The artwork keeps a fixed position and scale within the hero. Panel widths, tint, headline sizing and safe-area spacing are also here. |
| `components/effects/PointerTrails.tsx` | Procedural sketch-marker trail for mouse hover and touch. `MARKER_SETTINGS.palette` sets the RGB colors (yellow, coral, blue, lavender); `colorDistance` is the distance in px between colors (280); `followMs` controls smoothing (24). Desktop: 96 points, 900 ms fade, 10 px nib. Touch: 72 points, 720 ms fade, 7 px nib. Low-power devices cap at 48 points and 30 fps. No image assets are used. |
| `components/effects/useMotion.ts` | Shared pause/resume state and live OS reduced-motion preference. No animation-driven React updates. The hero pause button stops both the hero and trails. |
| `components/ui/Reveal.tsx` | Progressive section reveal. Content remains available without JavaScript, with reduced motion, or without IntersectionObserver. |
| `components/ui/GameSiteEntryModal.tsx` | Existing game information preserved, with native dialog focus trapping, Escape, scroll containment and focus restoration. The destination remains unconfigured, as before. |
| `app/layout.tsx`, `app/globals.css` | Scoped font variables, decorative canvas, skip link, visible focus, reduced-motion safeguards. |
| `next.config.ts` | Tailwind loader applies only to `globals.css`; its former `*.css` rule reclassified CSS modules and removed their class exports. |

## Artwork

The first-edition strip reuses nine project files that remain in `public/` (`spiderman.jpg`, `horimiya.webp`, `dr doom.jpg`, `beserk.jpg`, `batman.jpeg`, `jojo.jpg`, `vagabond.jpg`, `superman.jpg`, `zoro.jpg`) as replaceable artwork. No external placeholder was downloaded. Next Image generates appropriately sized optimized images. Change `HERO_IMAGES` for final art, including each source image's intrinsic dimensions; leave enough panels to cover the viewport, and keep both sequences identical. All hero artwork and the trails are decorative and hidden from assistive technology.

The supplied mobile reference is a navigation guide, not a complete mobile homepage. The navigation follows it; the mobile hero composition is an interpretation using the existing festival content and artwork.

The marker replaces both the previous character sprites and the touch fog. It draws three-layer quadratic curves: a restrained ink edge, a broad colored felt-tip stroke, and a fine dry-brush highlight. Color blends with drawing distance and stroke width narrows with speed. All pages share the same effect; header, navigation, controls and dialogs are excluded. Separate gestures and large pointer jumps start new strokes so they never draw connecting lines across the page. Old character SVGs remain in `public/trails/` for reuse, but are no longer loaded or drawn.

Normal cursors are preserved. Desktop uses a fine hovering mouse; mobile uses passive Touch Events so ordinary scrolling and pinch-to-zoom are preserved. Multitouch lifts the marker. Synthetic mouse events immediately after touch are suppressed on hybrid devices. A height-only resize (mobile browser bar movement) preserves the active touch. All drawing is held in the effect closure, with no React state updates on movement. Canvas DPR is capped at 1.5 (1 on low-power devices). Rendering stops when ink fades, when the page is hidden, on unmount, or when motion is paused/reduced.

## Previous verification (31 October 2026)

The checks below describe the implementation before the later hero, navigation-button, and page-wide mouse-trail changes. Those changes have not yet been visually or mechanically verified.

- Inspected the original running site at desktop and 390 px before edits; original browser console had no errors.
- Visually inspected updated 320×740, 390×844, 768×1024, 844×390 landscape, and 1440×900 layouts. No document horizontal overflow at these sizes. Landscape menu scrolls internally to keep all actions reachable.
- Compared the 390 px closed/expanded navigation to the attachment. Checked seven links in the supplied order, events route navigation, game dialog, Tab navigation, Escape and focus restoration.
- Observed desktop character trails in the browser with native mouse dragging over the hero.
- Observed horizontal motion, checked equal duplicated-sequence dimensions, and checked scroll-down transform values, return-to-top zoom, off-screen pause, and pause/resume button behavior.
- `node --test tests/decorative-effects.test.mjs`: 5 passing tests. Deterministic event/RAF doubles exercise passive listeners, reduced-motion gating, cancellation, pinch interruption, hybrid input exclusion, budgets, DPR cap, hidden-page suspension and cleanup. These are logic tests, not physical-device tests.
- Fresh browser load after the CSS-loader fix: no console errors or warnings.
- `npx --no-install tsc --noEmit`: passed.
- Targeted ESLint on all changed TypeScript/TSX and test files: passed.
- `npm run build`: passed, generating all 18 pages. The first sandboxed attempt failed to fetch fonts and left a cached Turbopack worker-port failure. A clean build cache and the required execution permissions resolved it. The existing multiple-lockfile warning remains.
- Full-project `npm run lint`: still fails on the pre-existing `app/schedule/page.tsx:72` synchronous state-in-effect error, plus the existing unused `comicStamp` warning in `components/ui/Badge.tsx:53`. The old Reveal error and hero image warning are resolved.

Checks still outstanding: physical iOS/Android scrolling, taps, pinch-to-zoom, touch mist appearance, real low-end frame pacing, and OS-level reduced-motion rendering. Viewport resizing is not touch-device emulation. Reduced-motion logic and CSS safeguards are implemented, but the browser interface used here does not expose media-preference emulation. No registration or contact submission was performed.

Run locally from `frontend`: `npm ci`, then `npm run dev -- --hostname 127.0.0.1`. Preview: http://127.0.0.1:3000.

## Marker replacement verification

The marker lifecycle tests replace the old particle assertions. Seven tests cover passive input, fade/cancel behavior, hybrid and pinch handling, point budgets, reduced-motion gating, cleanup, color interpolation, separate strokes, and mobile browser-bar resizing. TypeScript, targeted ESLint and the production build pass. The marker was visually checked in the live browser, with no console warnings/errors; the shared pause control works, and the 390 px viewport has no horizontal overflow and a non-intercepting canvas. Desktop marker preview was also checked at 1280 px. Native touch-device appearance still requires a physical-device check; touch event handling was tested with deterministic event/RAF doubles.
