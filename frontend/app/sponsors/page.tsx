
"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";

import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SPONSORS_DATA } from "@/lib/data/festivalData";

// --------------------------------------------------
// GOLD DUST PARTICLES
// --------------------------------------------------

const MapDustParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", onResize);

    const motes = Array.from({ length: 28 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -(Math.random() * 0.3 + 0.1),
      size: Math.random() * 2.2 + 0.8,
      alpha: Math.random() * 0.45 + 0.15,
    }));

    const render = () => {
      ctx.clearRect(0, 0, w, h);

      motes.forEach((m) => {
        m.x += m.vx;
        m.y += m.vy;

        if (m.x > w + 10) m.x = -10;
        if (m.x < -10) m.x = w + 10;
        if (m.y < -10) m.y = h + 10;

        ctx.save();
        ctx.beginPath();

        const grad = ctx.createRadialGradient(
          m.x,
          m.y,
          0.1,
          m.x,
          m.y,
          m.size * 2
        );

        grad.addColorStop(0, `rgba(255, 240, 180, ${m.alpha})`);
        grad.addColorStop(0.5, `rgba(180, 115, 30, ${m.alpha * 0.6})`);
        grad.addColorStop(1, "rgba(120, 70, 10, 0)");

        ctx.fillStyle = grad;
        ctx.arc(m.x, m.y, m.size * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-10 h-full w-full"
    />
  );
};

// --------------------------------------------------
// SPONSORS PAGE
// --------------------------------------------------

export default function SponsorsPage() {
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const bgLayerRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const titleSponsors = SPONSORS_DATA.filter(
    (s) => s.tier === "Title Sponsor"
  );

  const poweredBy = SPONSORS_DATA.filter(
    (s) => s.tier === "Powered By"
  );

  const associates = SPONSORS_DATA.filter(
    (s) => s.tier === "Associate Partner"
  );

  const mediaPartners = SPONSORS_DATA.filter(
    (s) => s.tier === "Media & Beverage Partner"
  );

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headingRef.current,
        { y: -25, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
        }
      );

      if (contentRef.current) {
        gsap.fromTo(
          contentRef.current.children,
          { y: 35, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out",
            delay: 0.15,
          }
        );
      }

      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        const bgX = gsap.quickTo(bgLayerRef.current, "x", {
          duration: 1.1,
          ease: "power2.out",
        });

        const bgY = gsap.quickTo(bgLayerRef.current, "y", {
          duration: 1.1,
          ease: "power2.out",
        });

        const headX = gsap.quickTo(headingRef.current, "x", {
          duration: 0.9,
          ease: "power2.out",
        });

        const headY = gsap.quickTo(headingRef.current, "y", {
          duration: 0.9,
          ease: "power2.out",
        });

        const handleMouseMove = (e: MouseEvent) => {
          const nx = (e.clientX / window.innerWidth - 0.5) * 2;
          const ny = (e.clientY / window.innerHeight - 0.5) * 2;

          bgX(-nx * 4.5);
          bgY(-ny * 3.5);

          headX(nx * 3);
          headY(ny * 2);
        };

        window.addEventListener("mousemove", handleMouseMove);

        return () => {
          window.removeEventListener("mousemove", handleMouseMove);
        };
      });
    }, sceneRef);

    return () => ctx.revert();
  }, []);

  const tierStyles = [
    {
      tint: "#f4dfb5",
      strip: "#bd8739",
      accent: "#80501c",
    },
    {
      tint: "#e6d1a7",
      strip: "#9b743a",
      accent: "#62431d",
    },
    {
      tint: "#ead5b1",
      strip: "#a66b37",
      accent: "#743c20",
    },
  ];

  return (
    <div
      ref={sceneRef}
      className="font-merch-sans relative min-h-screen w-full overflow-hidden bg-[#d8be90] text-[#261607]"
    >
      {/* FONT SYSTEM */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');

        .font-merch-display {
          font-family: 'Cinzel', Georgia, serif;
        }

        .font-merch-sans {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        .rope-border {
          background-image: repeating-linear-gradient(
            45deg,
            #c69245 0px,
            #c69245 6px,
            #57330d 6px,
            #57330d 10px,
            #e8c27a 10px,
            #e8c27a 13px
          );
        }
      `}</style>

      {/* BACKGROUND MAP */}
      <div
        ref={bgLayerRef}
        className="pointer-events-none fixed -inset-3 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/onepiece-bg.png')",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 42%, rgba(255,248,228,0.12) 0%, rgba(122,82,34,0.28) 68%, rgba(46,26,8,0.58) 100%)",
          }}
        />
      </div>

      {/* PARTICLES */}
      <MapDustParticles />

      {/* MAIN CONTENT */}
      <main className="relative z-20 mx-auto flex min-h-screen w-full max-w-7xl flex-col items-center px-4 pt-16 pb-24 sm:px-6 lg:px-8">

        {/* HEADER */}
        <header
          ref={headingRef}
          className="mb-14 flex flex-col items-center text-center"
        >
          <div className="mb-3 flex items-center gap-3">
            <span className="h-[2px] w-12 sm:w-20 bg-gradient-to-r from-transparent to-[#5c160c]" />

            <span className="font-merch-display text-xs sm:text-sm font-extrabold tracking-[0.28em] text-[#5c160c] uppercase">
              ✦ ALLIANCES OF THE GRAND LINE ✦
            </span>

            <span className="h-[2px] w-12 sm:w-20 bg-gradient-to-l from-transparent to-[#5c160c]" />
          </div>

          <h1
            className="font-merch-display text-4xl font-black leading-tight tracking-[0.06em] uppercase sm:text-6xl md:text-[4.5rem]"
            style={{
              backgroundImage:
                "linear-gradient(180deg, #e63926 0%, #b51414 48%, #730808 88%, #3d0202 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              WebkitTextStroke: "2px #3b1704",
              filter:
                "drop-shadow(0 4px 0px #f6e3ba) drop-shadow(0 8px 16px rgba(45,20,4,0.45))",
            }}
          >
            OUR ALLIANCES
          </h1>

          <p className="font-merch-display mt-4 border-y border-[#5c3610]/40 bg-[#f4e2bc]/80 px-5 py-2 text-xs font-extrabold tracking-[0.15em] text-[#2e1805] uppercase shadow-sm sm:text-base">
            THE FORCES BEHIND YUVAAN 2027
          </p>

          <p className="mt-5 max-w-2xl text-sm font-semibold leading-relaxed text-[#39230d] sm:text-base">
            Every great voyage needs a powerful alliance. Meet the
            visionaries, innovators and partners making the grandest
            celebration at IIIT Guwahati possible.
          </p>
        </header>

        {/* SPONSOR TIERS */}
        <div
          ref={contentRef}
          className="flex w-full max-w-6xl flex-col gap-16"
        >

          {/* TITLE SPONSORS */}
          {titleSponsors.length > 0 && (
            <section className="flex flex-col gap-6">
              <div className="flex items-center justify-center gap-4 sm:justify-start">
                <Badge
                  variant="gold"
                  comicStamp
                  className="text-xs"
                >
                  ★ TIER 1
                </Badge>

                <h2 className="font-merch-display text-xl font-black tracking-wider text-[#4a210d] uppercase sm:text-3xl">
                  Title Sponsor
                </h2>

                <span className="hidden h-[2px] flex-1 bg-gradient-to-r from-[#80501c]/70 to-transparent sm:block" />
              </div>

              <div className="grid grid-cols-1 gap-8">
                {titleSponsors.map((sp) => (
                  <div
                    key={sp.id}
                    className="group relative p-[6px] shadow-[0_20px_38px_rgba(38,19,4,0.5)] transition-transform duration-300 hover:-translate-y-1"
                    style={{
                      background:
                        "linear-gradient(135deg,#3b230d,#8b632d,#261507,#7c5227,#2d1908)",
                      clipPath:
                        "polygon(16px 0%,calc(100% - 16px) 0%,100% 16px,100% calc(100% - 16px),calc(100% - 16px) 100%,16px 100%,0% calc(100% - 16px),0% 16px)",
                    }}
                  >
                    <div className="rope-border p-[5px]">
                      <div
                        className="relative grid grid-cols-1 items-center gap-8 border border-[#4a2c0f] p-5 sm:p-8 md:grid-cols-12"
                        style={{
                          background:
                            "radial-gradient(circle at 50% 32%,#fbf0d9 0%,#ead2a5 62%,#cfa96e 100%)",
                          boxShadow:
                            "inset 0 0 24px rgba(82,46,10,0.4)",
                        }}
                      >
                        {/* LOGO PLACEHOLDER */}
                        <div className="relative flex h-44 flex-col items-center justify-center overflow-hidden border-[3px] border-[#4a2b0d] bg-[#d6ba87] p-5 text-center shadow-[inset_0_4px_18px_rgba(38,19,4,0.3)] md:col-span-5">
                          <div className="absolute inset-0 opacity-30"
                            style={{
                              backgroundImage:
                                "repeating-conic-gradient(from 0deg at 50% 60%,rgba(255,246,220,0.6) 0deg 8deg,transparent 8deg 16deg)",
                            }}
                          />

                          <span className="relative z-10 font-merch-display text-[10px] font-bold tracking-[0.2em] text-[#80501c] uppercase">
                            Grand Line Alliance
                          </span>

                          <h3 className="font-merch-display relative z-10 mt-2 text-2xl font-black text-[#241304] sm:text-3xl">
                            {sp.name}
                          </h3>
                        </div>

                        {/* DETAILS */}
                        <div className="flex flex-col gap-3 md:col-span-7">
                          <div className="flex flex-wrap items-center gap-3">
                            <Badge variant="gold">
                              {sp.category}
                            </Badge>

                            <span className="text-[10px] font-black tracking-widest text-[#80501c] uppercase">
                              Chief Festival Presenter
                            </span>
                          </div>

                          <h3 className="font-merch-display text-2xl font-black text-[#291607] sm:text-4xl">
                            {sp.name}
                          </h3>

                          <p className="text-sm font-semibold leading-relaxed text-[#543818]">
                            {sp.description}
                          </p>

                          <div className="mt-2 flex items-center gap-2 text-[10px] font-black tracking-[0.15em] text-[#80501c] uppercase">
                            <span>✦</span>
                            <span>Official Title Alliance</span>
                            <span>✦</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* POWERED BY */}
          {poweredBy.length > 0 && (
            <section className="flex flex-col gap-6">
              <div className="flex items-center justify-center gap-4 sm:justify-start">
                <Badge
                  variant="cyan"
                  comicStamp
                  className="text-xs"
                >
                  ⚡ TIER 2
                </Badge>

                <h2 className="font-merch-display text-xl font-black tracking-wider text-[#4a210d] uppercase sm:text-3xl">
                  Powered By
                </h2>

                <span className="hidden h-[2px] flex-1 bg-gradient-to-r from-[#80501c]/70 to-transparent sm:block" />
              </div>

              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                {poweredBy.map((sp) => (
                  <article
                    key={sp.id}
                    className="group relative p-[5px] shadow-[0_14px_30px_rgba(38,19,4,0.45)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_22px_38px_rgba(38,19,4,0.6)]"
                    style={{
                      background:
                        "linear-gradient(135deg,#3b230d,#9b743a,#261507,#7c5227)",
                    }}
                  >
                    <div className="rope-border p-[4px]">
                      <div
                        className="relative flex h-full flex-col border border-[#4a2c0f] p-5"
                        style={{
                          background:
                            "radial-gradient(circle at 50% 32%,#fbf0d9 0%,#ead2a5 62%,#cfa96e 100%)",
                          boxShadow:
                            "inset 0 0 20px rgba(82,46,10,0.35)",
                        }}
                      >
                        <div className="relative flex h-32 flex-col items-center justify-center overflow-hidden border-2 border-[#4a2b0d] bg-[#d6ba87] p-4 text-center">
                          <div className="absolute inset-0 opacity-30"
                            style={{
                              backgroundImage:
                                "repeating-conic-gradient(from 0deg at 50% 60%,rgba(255,246,220,0.6) 0deg 8deg,transparent 8deg 16deg)",
                            }}
                          />

                          <span className="relative z-10 text-[9px] font-black tracking-widest text-[#80501c] uppercase">
                            Powered Alliance
                          </span>

                          <span className="font-merch-display relative z-10 mt-1 text-xl font-black text-[#291607]">
                            {sp.name}
                          </span>
                        </div>

                        <CardHeader className="relative z-10 mt-4 p-0">
                          <span className="text-xs font-black tracking-wider text-[#80501c] uppercase">
                            {sp.category}
                          </span>

                          <CardTitle className="font-merch-display mt-1 text-xl font-black text-[#291607]">
                            {sp.name}
                          </CardTitle>

                          <CardDescription className="mt-2 text-sm font-semibold leading-relaxed text-[#543818]">
                            {sp.description}
                          </CardDescription>
                        </CardHeader>

                        <div className="mt-5 border-t border-[#8c6230]/40 pt-3 text-center text-[9px] font-black tracking-[0.2em] text-[#80501c] uppercase">
                          ✦ Yuvaan 2027 Alliance ✦
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* ASSOCIATES & MEDIA PARTNERS */}
          {[...associates, ...mediaPartners].length > 0 && (
            <section className="flex flex-col gap-6">
              <div className="flex items-center justify-center gap-4 sm:justify-start">
                <Badge
                  variant="primary"
                  comicStamp
                  className="text-xs"
                >
                  ✦ TIER 3
                </Badge>

                <h2 className="font-merch-display text-xl font-black tracking-wider text-[#4a210d] uppercase sm:text-3xl">
                  Event & Media Partners
                </h2>

                <span className="hidden h-[2px] flex-1 bg-gradient-to-r from-[#80501c]/70 to-transparent sm:block" />
              </div>

              <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
                {[...associates, ...mediaPartners].map((sp, idx) => {
                  const style = tierStyles[idx % tierStyles.length];

                  return (
                    <article
                      key={sp.id}
                      className="group relative p-[4px] shadow-[0_12px_25px_rgba(38,19,4,0.4)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_35px_rgba(38,19,4,0.55)]"
                      style={{
                        background:
                          "linear-gradient(135deg,#3b230d,#9b743a,#261507,#7c5227)",
                      }}
                    >
                      <div className="rope-border p-[3px]">
                        <div
                          className="relative flex h-full flex-col border border-[#4a2c0f] p-4"
                          style={{
                            background: `radial-gradient(circle at 50% 32%, #fbf0d9 0%, ${style.tint} 100%)`,
                            boxShadow:
                              "inset 0 0 18px rgba(82,46,10,0.3)",
                          }}
                        >
                          <div className="relative flex h-24 flex-col items-center justify-center overflow-hidden border-2 border-[#4a2b0d] bg-[#d6ba87] p-3 text-center">
                            <div className="absolute inset-0 opacity-30"
                              style={{
                                backgroundImage:
                                  "repeating-conic-gradient(from 0deg at 50% 60%,rgba(255,246,220,0.6) 0deg 8deg,transparent 8deg 16deg)",
                              }}
                            />

                            <span className="relative z-10 text-[9px] font-black tracking-widest text-[#80501c] uppercase">
                              Official Partner
                            </span>

                            <span className="font-merch-display relative z-10 mt-1 text-lg font-black text-[#291607]">
                              {sp.name}
                            </span>
                          </div>

                          <CardHeader className="relative z-10 mt-3 p-0">
                            <span
                              className="text-[10px] font-black tracking-wider uppercase"
                              style={{ color: style.accent }}
                            >
                              {sp.category}
                            </span>

                            <CardTitle className="font-merch-display mt-1 text-base font-black text-[#291607]">
                              {sp.name}
                            </CardTitle>

                            <CardDescription className="mt-1 text-xs font-semibold leading-relaxed text-[#543818]">
                              {sp.description}
                            </CardDescription>
                          </CardHeader>

                          <div className="mt-4 border-t border-[#8c6230]/40 pt-2 text-center text-[9px] font-black tracking-widest text-[#80501c] uppercase">
                            ✦ Alliance Member ✦
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {/* PARTNER CTA */}
          <section
            className="relative overflow-hidden border-[5px] border-[#3b230d] p-[5px] shadow-[0_20px_40px_rgba(38,19,4,0.55)]"
            style={{
              background:
                "linear-gradient(135deg,#c69245,#57330d,#e8c27a,#57330d)",
            }}
          >
            <div
              className="relative flex flex-col items-center justify-between gap-7 border border-[#4a2c0f] p-6 sm:flex-row sm:p-9"
              style={{
                background:
                  "radial-gradient(circle at 50% 32%,#fbf0d9 0%,#ead2a5 62%,#cfa96e 100%)",
                boxShadow:
                  "inset 0 0 30px rgba(82,46,10,0.35)",
              }}
            >
              <div className="flex flex-col items-center gap-3 text-center sm:items-start sm:text-left">
                <Badge
                  variant="gold"
                  comicStamp
                  className="text-xs"
                >
                  JOIN THE ALLIANCE
                </Badge>

                <h2 className="font-merch-display text-xl font-black text-[#291607] sm:text-3xl">
                  Ready to Join Our Crew?
                </h2>

                <p className="max-w-xl text-sm font-semibold leading-relaxed text-[#543818]">
                  Become a part of Yuvaan 2027. Connect with
                  thousands of talented students from across
                  Northeast India and make your brand part of
                  something extraordinary.
                </p>
              </div>

              <Button
                href="/contact"
                variant="primary"
                size="lg"
                className="shrink-0 font-merch-display font-black tracking-wider"
              >
                JOIN THE ALLIANCE →
              </Button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
