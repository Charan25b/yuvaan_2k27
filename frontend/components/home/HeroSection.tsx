import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

type SceneProps = { variant: "stage" | "orbit" | "arena"; label: string };

function ComicScene({ variant, label }: SceneProps) {
  return (
    <div className={`hero-comic-scene hero-comic-scene--${variant}`} aria-hidden="true">
      <div className="hero-scene-caption">{label}</div>
      {variant === "stage" && (
        <svg viewBox="0 0 520 360" role="presentation">
          <path d="M0 264 112 224l83 38 113-68 212 70v96H0Z" fill="#f5a623" />
          <path d="m0 296 126-45 115 52 120-64 159 52v69H0Z" fill="#e84a26" />
          <path d="M124 230 220 62l96 168Z" fill="#f9d75c" stroke="#171717" strokeWidth="10" />
          <path d="M161 230 220 123l59 107Z" fill="#ed4b24" />
          <path d="M83 191h-35m401 0h-35M92 148H25m470 0h-67M118 108 72 62m376 46 46-46" stroke="#171717" strokeWidth="12" strokeLinecap="round" />
          <path d="M162 290v-44m44 44v-59m48 59v-45m52 45v-66m48 66v-43m52 43v-58m-293 87h290" stroke="#171717" strokeWidth="12" strokeLinecap="round" />
          <circle cx="259" cy="80" r="19" fill="#171717" />
        </svg>
      )}
      {variant === "orbit" && (
        <svg viewBox="0 0 520 360" role="presentation">
          <circle cx="266" cy="180" r="142" fill="#f8ce4b" stroke="#171717" strokeWidth="10" />
          <ellipse cx="266" cy="180" rx="205" ry="70" transform="rotate(-22 266 180)" fill="none" stroke="#171717" strokeWidth="12" />
          <path d="m300 94 26 52 57 8-42 40 10 57-51-27-51 27 10-57-42-40 58-8Z" fill="#ed4b24" stroke="#171717" strokeWidth="9" strokeLinejoin="round" />
          <circle cx="108" cy="80" r="17" fill="#ef4d28" stroke="#171717" strokeWidth="8" />
          <circle cx="431" cy="281" r="22" fill="#35b6cf" stroke="#171717" strokeWidth="8" />
          <path d="M72 300h117m185-237h80M51 135h69m260 124h72" stroke="#171717" strokeWidth="10" strokeLinecap="round" />
        </svg>
      )}
      {variant === "arena" && (
        <svg viewBox="0 0 520 360" role="presentation">
          <path d="M0 280 140 168l77 68 107-145 196 142v127H0Z" fill="#35b6cf" />
          <path d="m38 294 133-73 90 51 103-93 121 91v90H38Z" fill="#f2a523" stroke="#171717" strokeWidth="10" />
          <path d="M0 326h520M90 274v72m342-81v81" stroke="#171717" strokeWidth="12" />
          <path d="m244 258 30-78 30 78m-67-14h74m-62 14v53m48-53v53" stroke="#171717" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
          <path d="m157 96 12 28 31 4-23 21 6 30-26-16-27 16 6-30-22-21 30-4Z" fill="#ed4b24" stroke="#171717" strokeWidth="8" strokeLinejoin="round" />
          <path d="m376 53 8 20 22 3-16 15 4 22-18-12-19 12 4-22-16-15 22-3Z" fill="#f8ce4b" stroke="#171717" strokeWidth="7" strokeLinejoin="round" />
        </svg>
      )}
      <span className="hero-scene-sfx">{variant === "stage" ? "BOOM!" : variant === "orbit" ? "WOW!" : "GO!"}</span>
    </div>
  );
}

const scenes: SceneProps[] = [
  { variant: "stage", label: "01 · LIGHTS UP" },
  { variant: "orbit", label: "02 · DREAM BIG" },
  { variant: "arena", label: "03 · GAME ON" },
];

function ComicRail({ reverse = false }: { reverse?: boolean }) {
  return (
    <div className={`hero-comic-rail${reverse ? " hero-comic-rail--reverse" : ""}`}>
      <div className="hero-comic-track">
        {[0, 1].map((group) => (
          <div className="hero-comic-sequence" key={group}>
            {scenes.map((scene) => <ComicScene key={scene.variant} {...scene} />)}
          </div>
        ))}
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="yuvaan-hero" aria-labelledby="hero-title">
      <div className="hero-artwork" aria-hidden="true">
        <ComicRail />
        <ComicRail reverse />
        <ComicRail />
      </div>
      <div className="hero-ink-wash" aria-hidden="true" />
      <div className="hero-speed-lines" aria-hidden="true" />

      <Container className="hero-content">
        <div className="hero-copy">
          <div className="hero-kicker"><span /> IIIT GUWAHATI · FEBRUARY 19–21, 2027 <span /></div>
          <p className="hero-issue">THE NEXT BIG THING STARTS HERE <b>✦ ISSUE 27</b></p>
          <h1 id="hero-title" className="hero-title-comic">
            <span className="hero-title-row hero-title-row--top">
              <span className="hero-word">ENTER</span>
              <span className="hero-word">THE</span>
            </span>
            <span className="hero-title-row hero-title-row--bottom">
              <span className="hero-word hero-word--brand">YUVAAN</span>
              <span className="hero-word">VERSE</span><span className="hero-word hero-word--bang">!</span>
            </span>
          </h1>
          <p className="hero-description">
            Three days. One campus. A universe of music, makers, and moments you won’t find anywhere else.
          </p>
          <div className="hero-actions">
            <Button href="/events" variant="primary" size="lg">Explore the festival <span aria-hidden="true">↗</span></Button>
            <Link className="hero-text-link" href="/schedule">See what’s on <span aria-hidden="true">↓</span></Link>
          </div>
          <div className="hero-footnote"><span className="hero-spark">✳</span> THE ANNUAL CULTURAL &amp; TECHNICAL FESTIVAL <span>·</span> 3 DAYS OF ACTION</div>
        </div>
      </Container>

      <div className="hero-scroll-cue" aria-hidden="true"><span /> SCROLL TO EXPLORE</div>
      <div className="hero-stamp" aria-hidden="true"><span>Guwahati</span><b>’27</b></div>
    </section>
  );
}
