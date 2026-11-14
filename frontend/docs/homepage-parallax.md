# Homepage title motion and branding

Scope: landing route `/` only. Standalone Events, Schedule, Merchandise, Sponsors, Team, Gallery and Contact pages are not edited. The supplied navbar logo is selected only on `/`; other routes retain their existing brand mark.

## Current interaction

There is no pause/parallax button. The existing comic rails loop automatically behind the title. The background is made from local comic images, not a video. Off-screen/hidden animation is suspended to save work, and OS reduced motion is respected.

Scrolling down preserves the existing `YUVAAN` zoom, while `ENTER THE` and `VERSE` shrink and move vertically outward (up/down) from the center. Scrolling back up restores the close, centered stack. All three lines share one centered red comic cloud based on the supplied cloud.jpeg reference. The isolated cloud has a transparent exterior, scalloped black outline and lower-right speech tail; all title text remains live HTML. Extra vertical room contains the outward-moving labels throughout their bounded motion. Scrolling reveals the two outer comic rails, expanding the artwork from three rolling columns to five. The artwork itself stays fixed in position and scale relative to the hero while its panels continue their independent rail animation. Only the foreground lettering animates; the title container, splash and CTA stay in fixed positions in normal document flow. Lower-page section headings, cards and content have no added scroll transforms or reveal translations.

## Adjustments

- `components/home/HeroSection.tsx`: `HERO_IMAGES` selects the comic panels. Scroll progress is bounded and eased in requestAnimationFrame to reveal the two outer rails; it leaves the artwork's position and scale unchanged. Each rail has five fixed image sequences so scrolling does not remount panels.
- `components/home/HeroSection.module.css`: defines text transform origins, spacing, splash dimensions, continuous comic animation and reduced-motion rules. Each rail advances one sequence every 32 seconds by default. The decorative cloud image is positioned around its body rather than its tail; max-width: none overrides the global image reset so it can safely surround the title.
- `app/page.tsx`: renders sections directly, keeping ordinary scrolling and stable content layout.
- Navbar logo source: user-supplied `logo.jpg`, copied to `public/brand/yuvaan-logo.jpg`. Next Image serves an optimized small rendition.

## Cloud artwork

Replace `public/brand/hero-cloud-red.png` to change the cloud. Its current intrinsic size is 1537 × 1023 with true alpha; Next Image serves responsive optimized renditions. Keep transparent margins and a similar body/tail placement, or adjust `.bubble` in the hero stylesheet. The image was edited with the built-in image generation tool, using `/Users/tsinha/Documents/YUVAAN/img/cloud.jpeg` as the source. The exact edit prompt is saved in [hero-cloud-prompt.txt](hero-cloud-prompt.txt).

## Verification

The hero motion tests verify the unchanged YUVAAN scale, outward/shrinking satellite lines, reverse-scroll restoration, mobile bounds, absence of a pause button, reduced-motion gating and cleanup. The existing marker-trail tests continue to pass. Production build includes TypeScript checking. Desktop and mobile browser checks verify no horizontal overflow, stable title/container positioning and automatically playing comic rails. Physical touch-device frame pacing remains a device check.
