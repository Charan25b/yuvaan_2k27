"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

interface MerchItem {
  id: string;
  tag: string;
  price: string;
  title: string;
  image: string;
}

const MERCH_ITEMS: MerchItem[] = [
  {
    id: "yuvaan-hoodie",
    tag: "FESTIVAL COLLECTION",
    price: "₹549",
    title: "Yuvaan Hoodie",
    image: "/tshirt-1.png",
  },
  {
    id: "festival-cap",
    tag: "ADJUSTABLE FIT",
    price: "₹299",
    title: "Festival Cap",
    image: "/tshirt-1.png",
  },
  {
    id: "graphic-tee",
    tag: "COTTON COLLECTION",
    price: "₹399",
    title: "Graphic T-shirt",
    image: "/tshirt-1.png",
  },
];

// --- Subtle Floating Gold Dust & Cartography Motes (suited for the light parchment map) ---
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
      if (!canvas) return;
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
      for (const m of motes) {
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
      }
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

export default function MerchandisePage() {
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const bgLayerRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLDivElement | null>(null);
  const cardsGridRef = useRef<HTMLDivElement | null>(null);

  const [selectedItem, setSelectedItem] = useState<MerchItem | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("L");
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const [showZoro, setShowZoro] = useState(false);
  const [luffyBehindCard, setLuffyBehindCard] = useState(false);
  const [zoroInFront, setZoroInFront] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Smooth entrance animation for the heading and product cards
      gsap.fromTo(
        headingRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      );

      if (cardsGridRef.current) {
        gsap.fromTo(
          cardsGridRef.current.children,
          { y: 35, opacity: 0, scale: 0.96 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.75,
            stagger: 0.12,
            ease: "power3.out",
            delay: 0.05,
          }
        );
      }

      // 2. Very Gentle Desktop-Only Mouse Parallax (Reduced scale for subtle depth)
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
        const cardsX = gsap.quickTo(cardsGridRef.current, "x", {
          duration: 0.8,
          ease: "power2.out",
        });
        const cardsY = gsap.quickTo(cardsGridRef.current, "y", {
          duration: 0.8,
          ease: "power2.out",
        });

        const handleMouseMove = (e: MouseEvent) => {
          const nx = (e.clientX / window.innerWidth - 0.5) * 2; // -1 to 1
          const ny = (e.clientY / window.innerHeight - 0.5) * 2; // -1 to 1

          // Low, refined movement values so nothing feels floaty or excessive
          bgX(-nx * 4.5);
          bgY(-ny * 3.5);
          headX(nx * 3.5);
          headY(ny * 2.5);
          cardsX(nx * 6.5);
          cardsY(ny * 4.5);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
      });
    }, sceneRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={sceneRef}
      className="font-merch-sans relative min-h-screen w-full overflow-hidden bg-[#d8be90] text-[#261607] select-none"
    >
      {/* Unified 2-Font System: Cinzel (Display/Serif) + Plus Jakarta Sans (UI/Body) */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');

        @font-face {
          font-family: 'One Piece';
          src: url('/fonts/one-piece.ttf') format('truetype');
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }
        .font-one-piece {
          font-family: 'One Piece', 'Cinzel', Georgia, serif;
        }
        .font-merch-display {
          font-family: 'Cinzel', Georgia, serif;
        }
        .font-merch-sans {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
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

      {/* 1. VINTAGE MAP BACKGROUND LAYER (Reduced inset so edges never clip) */}
      <div
        ref={bgLayerRef}
        className="pointer-events-none fixed -inset-3 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/onepiece-bg.png')",
        }}
      >
        {/* Soft burnt-parchment vignette around the map edges to make the center content pop */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 42%, rgba(255, 248, 228, 0.08) 0%, rgba(122, 82, 34, 0.22) 68%, rgba(46, 26, 8, 0.52) 100%)",
          }}
        />
      </div>

      {/* 2. SUBTLE GOLD CARTOGRAPHY DUST */}
      <MapDustParticles />

      {/* 3. MAIN FOREGROUND CONTENT */}
      <div className="relative z-20 mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-4 pt-6 pb-20 sm:px-6 lg:px-8">
        {/* Merchandise heading */}
        <header
          ref={headingRef}
          className="relative -top-4 mb-8 sm:mb-11 flex flex-col items-center text-center"
        >
          {/* Decorative Compass Rose Divider Above Title */}
          <div className="mb-2 flex items-center gap-3">
            <span className="h-[2px] w-12 sm:w-20 bg-gradient-to-r from-transparent to-[#5c160c]" />
            <span className="font-merch-display text-xs sm:text-sm font-extrabold tracking-[0.28em] text-[#5c160c] uppercase">
              YUVAAN 2027 OFFICIAL STORE
            </span>
            <span className="h-[2px] w-12 sm:w-20 bg-gradient-to-l from-transparent to-[#5c160c]" />
          </div>

          {/* Single Commanding "MERCHANDISE" Title */}
          <h1
            className="font-one-piece text-[2.6rem] sm:text-7xl md:text-[6rem] font-black tracking-[0.06em] uppercase leading-none"
            style={{
              backgroundImage:
                "linear-gradient(180deg, #e63926 0%, #b51414 48%, #730808 88%, #3d0202 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              WebkitTextStroke: "2px #3b1704",
              filter:
                "drop-shadow(0 4px 0px #f6e3ba) drop-shadow(0 8px 16px rgba(45, 20, 4, 0.45))",
            }}
          >
            MERCHANDISE
          </h1>

          {/* Subtitle Pill */}
          <p className="font-merch-display mt-3 border-y border-[#5c3610]/40 bg-[#f4e2bc]/75 px-5 py-1 text-xs sm:text-base md:text-lg font-extrabold tracking-[0.2em] text-[#2e1805] uppercase backdrop-blur-[2px] shadow-sm">
            OFFICIAL FESTIVAL MERCHANDISE
          </p>
        </header>

        {/* Featured merchandise cards */}
        <section
          ref={cardsGridRef}
          className="grid w-full max-w-6xl grid-cols-1 gap-8 md:grid-cols-3 lg:gap-10"
        >
          {MERCH_ITEMS.map((item) => (
            <article
              key={item.id}
              className="group isolate relative mx-auto flex w-full max-w-[370px] flex-col opacity-0 transition-all duration-300 hover:-translate-y-2"
            >
              {item.id === "graphic-tee" && (
                <>
                  <div className={`pointer-events-none absolute right-0 top-[6px] aspect-square w-32 -translate-x-16 -translate-y-[87%] sm:w-36 md:-right-4 xl:-right-16 xl:-translate-x-24 ${luffyBehindCard ? "z-0" : "z-30"}`}>
                    <button
                      type="button"
                      aria-label="Bring Luffy down and reveal Zoro"
                      disabled={showZoro}
                      onClick={() => setShowZoro(true)}
                      onTransitionEnd={(event) => {
                        if (event.propertyName === "transform") setLuffyBehindCard(showZoro);
                      }}
                      style={{ transform: showZoro ? "translateY(160px)" : "translateY(0)" }}
                      className={`pointer-events-auto absolute inset-0 flex h-full w-full cursor-pointer items-center justify-center border-0 bg-transparent p-0 transition-[transform,opacity] duration-[2000ms] ease-in-out ${showZoro ? "opacity-0" : "opacity-100"}`}
                    >
                      <img src="/merchandise/luffy.png" alt="" className="h-full w-full object-contain" />
                    </button>
                  </div>
                  <div className={`pointer-events-none absolute right-0 top-[11px] aspect-square w-32 -translate-x-[51.5px] -translate-y-[87%] sm:w-36 md:-right-4 xl:-right-16 xl:-translate-x-[83.5px] ${zoroInFront ? "z-30" : "z-0"}`}>
                    <button
                      type="button"
                      aria-label="Bring Zoro down and bring Luffy back"
                      disabled={!showZoro}
                      onClick={() => setShowZoro(false)}
                      onTransitionEnd={(event) => {
                        if (event.propertyName === "transform") setZoroInFront(showZoro);
                      }}
                      style={{
                        transform: showZoro ? "translateY(0)" : "translateY(160px)",
                        transitionDelay: showZoro ? "2250ms" : "0ms",
                      }}
                      className={`pointer-events-auto absolute inset-0 flex h-full w-full cursor-pointer items-center justify-center border-0 bg-transparent p-0 transition-[transform,opacity] duration-[2000ms] ease-in-out ${showZoro ? "opacity-100" : "opacity-0"}`}
                    >
                      <img src="/merchandise/zoro.png" alt="" className="h-full w-full object-contain" />
                    </button>
                  </div>
                </>
              )}

              {/* Dark Mahogany & Antique Brass Frame (Provides high contrast against the light map background) */}
              <div
                className="relative z-10 p-[6px] shadow-[0_20px_38px_rgba(38,19,4,0.55),0_4px_10px_rgba(38,19,4,0.35)] transition-shadow duration-300 group-hover:shadow-[0_26px_48px_rgba(38,19,4,0.72)]"
                style={{
                  background:
                    "linear-gradient(135deg, #3b230d 0%, #6e4720 28%, #261507 52%, #7c5227 78%, #2d1908 100%)",
                  clipPath:
                    "polygon(16px 0%, calc(100% - 16px) 0%, 100% 16px, 100% calc(100% - 16px), calc(100% - 16px) 100%, 16px 100%, 0% calc(100% - 16px), 0% 16px)",
                }}
              >
                {/* Twisted Nautical Rope Inner Trim */}
                <div
                  className="rope-border p-[5px]"
                  style={{
                    clipPath:
                      "polygon(13px 0%, calc(100% - 13px) 0%, 100% 13px, 100% calc(100% - 13px), calc(100% - 13px) 100%, 13px 100%, 0% calc(100% - 13px), 0% 13px)",
                  }}
                >
                  {/* Cream-Gold Aged Parchment Poster Body */}
                  <div
                    className="relative flex flex-col border border-[#4a2c0f] px-5 pt-4 pb-5"
                    style={{
                      background:
                        "radial-gradient(circle at 50% 32%, #fbf0d9 0%, #ead2a5 62%, #cfa96e 100%)",
                      boxShadow: "inset 0 0 24px rgba(82, 46, 10, 0.45)",
                    }}
                  >
                    {/* Subtle Paper Grain Texture */}
                    <div
                      className="pointer-events-none absolute inset-0 opacity-12"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(90deg, rgba(60,30,5,0.2) 0px, rgba(60,30,5,0.2) 1px, transparent 1px, transparent 10px)",
                      }}
                    />

                    {/* Corner Brass Rivets */}
                    <span className="pointer-events-none absolute top-2.5 left-2.5 h-2 w-2 rounded-full border border-[#2b1704] bg-[#c89646]" />
                    <span className="pointer-events-none absolute top-2.5 right-2.5 h-2 w-2 rounded-full border border-[#2b1704] bg-[#c89646]" />

                    {/* Side Iron Chain Links Decoration */}
                    <div className="pointer-events-none absolute top-14 bottom-24 left-1.5 flex flex-col justify-between opacity-35">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <span
                          key={i}
                          className="h-3.5 w-2 rounded-full border-2 border-[#3b220c]"
                        />
                      ))}
                    </div>
                    <div className="pointer-events-none absolute top-14 bottom-24 right-1.5 flex flex-col justify-between opacity-35">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <span
                          key={i}
                          className="h-3.5 w-2 rounded-full border-2 border-[#3b220c]"
                        />
                      ))}
                    </div>

                    {/* Larger product image window */}
                    <div className="relative z-10 mt-0 h-80 w-full overflow-hidden border-[3px] border-[#4a2b0d] bg-[#d6ba87] shadow-[inset_0_4px_18px_rgba(38,19,4,0.48)] sm:h-96">
                      {/* Vintage Sunburst Rays inside the frame */}
                      <div
                        className="absolute inset-0 opacity-40"
                        style={{
                          backgroundImage:
                            "repeating-conic-gradient(from 0deg at 50% 60%, rgba(255, 246, 220, 0.6) 0deg 8deg, transparent 8deg 16deg)",
                        }}
                      />

                      {/* Deep Nautical Slate Horizon at bottom of window for badge contrast */}
                      <div
                        className="absolute inset-x-0 bottom-0 h-16 opacity-75"
                        style={{
                          background:
                            "linear-gradient(180deg, transparent 0%, #2b3945 48%, #18222b 100%)",
                        }}
                      />

                      {/* Large T-Shirt Image (`scale-135` base, `group-hover:scale-150`) */}
                      <div className="relative z-10 flex h-full w-full items-center justify-center p-1">
                        {!imgErrors[item.id] ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            onError={() =>
                              setImgErrors((prev) => ({
                                ...prev,
                                [item.id]: true,
                              }))
                            }
                            className="max-h-[98%] max-w-[98%] object-contain scale-135 transition-transform duration-500 group-hover:scale-150 drop-shadow-[0_14px_18px_rgba(0,0,0,0.65)]"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-center">
                            <svg
                              viewBox="0 0 120 110"
                              className="h-48 w-48 scale-115 drop-shadow-[0_8px_12px_rgba(0,0,0,0.6)] transition-transform duration-500 group-hover:scale-125"
                            >
                              <path
                                d="M35 12 L10 30 L22 50 L36 40 L36 98 L84 98 L84 40 L98 50 L110 30 L85 12 Q60 24 35 12 Z"
                                fill={
                                  item.id === "yuvaan-hoodie"
                                    ? "#4a0e17"
                                    : item.id === "festival-cap"
                                    ? "#1e293b"
                                    : "#7c2d12"
                                }
                                stroke="#f5c156"
                                strokeWidth="3"
                              />
                              <circle cx="60" cy="48" r="11" fill="#fff" />
                              <ellipse
                                cx="60"
                                cy="45"
                                rx="17"
                                ry="4.5"
                                fill="#facc15"
                                stroke="#b45309"
                                strokeWidth="1.5"
                              />
                              <path
                                d="M46 45 Q60 41 74 45"
                                stroke="#dc2626"
                                strokeWidth="2.5"
                                fill="none"
                              />
                              <circle cx="56" cy="49" r="2.2" fill="#111" />
                              <circle cx="64" cy="49" r="2.2" fill="#111" />
                              <text
                                x="60"
                                y="76"
                                textAnchor="middle"
                                fill="#fde68a"
                                fontSize="8"
                                fontWeight="bold"
                              >
                                {item.image.replace("/", "")}
                              </text>
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Slanted Gold Ribbon Badge */}
                      <div
                        className="absolute bottom-2.5 left-1.5 z-20 -rotate-4 border-2 border-[#2b1704] bg-gradient-to-r from-[#facc15] via-[#fbbf24] to-[#f59e0b] px-3 py-0.5 shadow-[2px_3px_0px_#1c0f02]"
                        style={{
                          clipPath:
                            "polygon(0% 0%, 94% 0%, 100% 50%, 94% 100%, 0% 100%)",
                        }}
                      >
                        <span className="block pr-2 text-[10px] sm:text-[11px] font-extrabold tracking-wider text-[#1c1004] uppercase">
                          {item.tag}
                        </span>
                      </div>

                    </div>

                    {/* Product name and price */}
                    <div className="relative z-10 mt-3 text-left">
                      <h3 className="font-merch-display text-2xl sm:text-[1.6rem] font-extrabold tracking-wide text-[#211205] leading-snug">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-lg sm:text-xl font-extrabold text-[#7c1d12]">
                        {item.price}
                      </p>
                    </div>

                    {/* Product details button */}
                    <div className="relative z-10 mt-4 px-0.5">
                      <button
                        type="button"
                        onClick={() => setSelectedItem(item)}
                        className="font-merch-display w-full cursor-pointer rounded border-2 border-[#d49b4b] bg-gradient-to-b from-[#a81818] via-[#780f0f] to-[#420505] py-2.5 px-4 text-center text-sm sm:text-[15px] font-bold tracking-[0.12em] text-[#fdf3dd] uppercase shadow-[0_4px_12px_rgba(66,5,5,0.5),inset_0_1px_1px_rgba(255,255,255,0.3)] transition-all duration-200 hover:brightness-110 hover:border-[#fde68a] active:scale-[0.98]"
                      >
                        VIEW DETAILS
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>

      {/* Product details modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setSelectedItem(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md border-4 border-[#4a2b0d] bg-gradient-to-b from-[#f7e7c4] to-[#d8b477] p-6 text-[#231405] shadow-[0_25px_60px_rgba(0,0,0,0.85)]"
          >
            <div className="flex items-center justify-between border-b-2 border-[#6e4719]/50 pb-2.5">
              <span className="font-merch-display text-xs font-extrabold tracking-[0.18em] text-[#5c3610] uppercase">
                MERCHANDISE DETAILS
              </span>
              <button
                onClick={() => setSelectedItem(null)}
                aria-label="Close product details"
                className="cursor-pointer text-[#5c1313] transition-transform hover:scale-110"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
            </div>

            <h3 className="font-merch-display mt-3 text-2xl font-black uppercase text-[#241304]">
              {selectedItem.title}
            </h3>
            <p className="mt-0.5 text-xs font-bold tracking-wider text-[#7c1d12] uppercase">
              {selectedItem.tag} / {selectedItem.price}
            </p>

            <div className="mt-4 space-y-3 text-sm">
              <div>
                <label className="block text-xs font-extrabold tracking-wider uppercase text-[#3d2308]">
                  SELECT SIZE
                </label>
                <div className="mt-1.5 flex gap-2">
                  {["S", "M", "L", "XL", "XXL"].map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`flex-1 cursor-pointer border-2 py-1.5 font-extrabold transition-colors ${
                        selectedSize === sz
                          ? "border-[#420505] bg-[#8c1414] text-[#fdf3dd]"
                          : "border-[#4d2e0d] bg-[#fbf0d9] text-[#231405] hover:bg-[#edd4a4]"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-xs font-medium text-[#4a2f10]">
                Selected size: <span className="font-bold">{selectedSize}</span>. Pickup is available at the IIIT Guwahati Merchandise Desk.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedItem(null)}
              className="font-merch-display mt-5 w-full cursor-pointer border-2 border-[#d49b4b] bg-gradient-to-b from-[#a81818] to-[#420505] py-2.5 text-sm font-bold tracking-[0.14em] text-[#fdf3dd] uppercase shadow-md hover:brightness-110"
            >
              DONE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
