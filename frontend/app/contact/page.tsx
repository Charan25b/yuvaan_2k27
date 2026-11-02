"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

// --- GTA VI Water Droplet & Rain Trail Canvas Effect ---
const WaterDropletOverlay: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    interface Droplet {
      x: number;
      y: number;
      r: number;
      vy: number;
      vx: number;
      alpha: number;
      isStreak: boolean;
      trail: { x: number; y: number; r: number }[];
    }

    // Create static lens beads + sliding hurricane streaks (like the top-right streak in the VI image)
    const droplets: Droplet[] = Array.from({ length: 65 }, (_, i) => {
      const isStreak = i < 8;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        r: isStreak ? Math.random() * 4 + 3.5 : Math.random() * 4.5 + 1.5,
        vy: isStreak ? Math.random() * 1.4 + 0.6 : Math.random() * 0.15 + 0.02,
        vx: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.55 + 0.35,
        isStreak,
        trail: [],
      };
    });

    const drawDroplet = (
      x: number,
      y: number,
      r: number,
      alpha: number,
      isStreak: boolean
    ) => {
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(
        x,
        y,
        r * 0.88,
        isStreak ? r * 1.35 : r * 1.08,
        0,
        0,
        Math.PI * 2
      );

      // Dark bottom shadow for 3D lens bead depth
      ctx.shadowColor = "rgba(10, 2, 20, 0.85)";
      ctx.shadowBlur = r * 1.5;
      ctx.shadowOffsetX = r * 0.25;
      ctx.shadowOffsetY = r * 0.45;

      // Inner refraction gradient (Vice City magenta/cyan/orange tint)
      const grad = ctx.createRadialGradient(
        x - r * 0.25,
        y - r * 0.3,
        r * 0.05,
        x,
        y,
        r * 1.2
      );
      grad.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.95})`);
      grad.addColorStop(0.25, `rgba(255, 120, 220, ${alpha * 0.35})`);
      grad.addColorStop(0.65, `rgba(20, 10, 38, ${alpha * 0.55})`);
      grad.addColorStop(1, `rgba(255, 170, 80, ${alpha * 0.4})`);

      ctx.fillStyle = grad;
      ctx.fill();

      // Crisp specular Rim Highlight
      ctx.shadowColor = "transparent";
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Tiny specular glint dot
      ctx.beginPath();
      ctx.arc(x - r * 0.28, y - r * 0.32, Math.max(0.7, r * 0.22), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, alpha * 1.2)})`;
      ctx.fill();

      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (const d of droplets) {
        if (d.isStreak) {
          d.y += d.vy;
          d.x += Math.sin(d.y * 0.025) * 0.45 + d.vx;

          if (Math.random() < 0.35) {
            d.trail.push({
              x: d.x + (Math.random() - 0.5) * 1.2,
              y: d.y - d.r,
              r: Math.random() * 1.8 + 0.8,
            });
          }
          if (d.trail.length > 22) d.trail.shift();

          // Draw wet rivulet line connecting trail
          if (d.trail.length > 2) {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(d.trail[0].x, d.trail[0].y);
            for (let i = 1; i < d.trail.length; i++) {
              ctx.lineTo(d.trail[i].x, d.trail[i].y);
            }
            ctx.strokeStyle = "rgba(255, 190, 245, 0.22)";
            ctx.lineWidth = d.r * 0.65;
            ctx.lineCap = "round";
            ctx.stroke();
            ctx.restore();
          }

          for (const t of d.trail) {
            drawDroplet(t.x, t.y, t.r, d.alpha * 0.65, false);
          }
        } else {
          d.y += d.vy;
        }

        if (d.y > height + 20) {
          d.y = -20;
          d.x = Math.random() * width;
          d.trail = [];
        }

        drawDroplet(d.x, d.y, d.r, d.alpha, d.isStreak);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-20 h-full w-full"
    />
  );
};

// --- Contact Channels & Crew Data ---
const CONTACT_CHANNELS = [
  {
    code: "FREQ // 01",
    role: "FESTIVAL HQ & GENERAL",
    title: "Vice City Dispatch",
    email: "yuvaan@iiitg.ac.in",
    phone: "+91 98765 43210",
    location: "IIIT Guwahati, Bongora, Assam 781015",
    badgeColor: "from-[#4355db] via-[#d6299b] to-[#ff8c42]",
  },
  {
    code: "FREQ // 02",
    role: "SPONSORSHIPS & ALLIANCES",
    title: "Syndicate Relations",
    email: "sponsors.yuvaan@iiitg.ac.in",
    phone: "+91 91234 56789",
    location: "Corporate & Media Wing, Block A",
    badgeColor: "from-[#d6299b] via-[#ff477e] to-[#ffb703]",
  },
  {
    code: "FREQ // 03",
    role: "EVENTS, GAMING & COMICON",
    title: "Arena Operations",
    email: "events.yuvaan@iiitg.ac.in",
    phone: "+91 87654 32109",
    location: "Student Activity Center, IIITG",
    badgeColor: "from-[#7209b7] via-[#f72585] to-[#ff9e00]",
  },
];

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    college: "",
    category: "SPONSORSHIP",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4500);
    setFormState({
      name: "",
      email: "",
      college: "",
      category: "SPONSORSHIP",
      message: "",
    });
  };

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden bg-[#0c0617] text-white selection:bg-[#ff2a85] selection:text-white">
      {/* 1. BACKGROUND LAYER: Uploaded GTA VI Car/Beach Sunset Art + Comic Panel Grid */}
      <div className="fixed inset-0 z-0">
        {/* Main GTA VI Sunset Wallpaper */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 transition-transform duration-1000"
          style={{
            backgroundImage: "url('/gta-vi-bg.jpeg')",
            filter: "saturate(1.25) contrast(1.08)",
          }}
        />

        {/* GTA VI "VI" Logo Lighting Overlay (Indigo Top -> Neon Magenta Mid -> Sunset Gold Horizon -> Deep Violet Bottom) */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(16, 10, 38, 0.84) 0%, rgba(78, 22, 112, 0.58) 38%, rgba(219, 39, 119, 0.45) 68%, rgba(255, 138, 59, 0.35) 85%, rgba(12, 6, 23, 0.96) 100%)",
          }}
        />

        {/* Subtle Comic-Book Halftone & Manga Grid Lines (matching Yuvaan Home Page) */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              radial-gradient(rgba(255, 255, 255, 0.18) 1px, transparent 1px),
              linear-gradient(to right, rgba(15, 23, 42, 0.65) 2px, transparent 2px),
              linear-gradient(to bottom, rgba(15, 23, 42, 0.65) 2px, transparent 2px)
            `,
            backgroundSize: "16px 16px, 320px 100%, 100% 320px",
          }}
        />

        {/* Ambient Neon Lens Flares */}
        <div className="pointer-events-none absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-[#ff2a85]/30 blur-[130px]" />
        <div className="pointer-events-none absolute top-1/3 right-10 h-96 w-96 rounded-full bg-[#ff8c42]/25 blur-[140px]" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-80 w-[36rem] rounded-full bg-[#6366f1]/25 blur-[130px]" />
      </div>

      {/* 2. WATER DROPLET / HURRICANE LENS OVERLAY */}
      <WaterDropletOverlay />

      {/* 3. FOREGROUND CONTENT */}
      <div className="relative z-30 mx-auto max-w-7xl px-4 pt-10 pb-24 sm:px-6 lg:px-8">
        {/* --- HERO HEADER: Matching Home Page Comic Skew + GTA VI "VI" Emblem --- */}
        <section className="relative mb-16 flex flex-col items-center text-center">
          {/* Top Tagline ("FLOWER IN A HURRICANE" / "CULTURE. CHAOS. CONNECTION." vibe) */}

          {/* Centerpiece GTA VI + YUVAAN Stacked Title */}
          <div className="relative my-2 flex flex-col items-center justify-center">
            {/* Giant Glowing "VI" Backdrop Watermark with Palm Silhouette & Starburst */}
            <div className="relative flex items-center justify-center select-none">
              {/* Starburst Glints */}
              <div className="pointer-events-none absolute -top-3 right-12 z-20 h-6 w-6 animate-pulse">
                <div className="absolute inset-0 rotate-45 bg-white blur-[2px]" />
                <div className="absolute top-1/2 left-[-18px] h-[2px] w-12 -translate-y-1/2 bg-gradient-to-r from-transparent via-white to-transparent" />
                <div className="absolute left-1/2 top-[-18px] h-12 w-[2px] -translate-x-1/2 bg-gradient-to-b from-transparent via-white to-transparent" />
              </div>

              <span
                aria-hidden="true"
                className="font-black text-[7.5rem] sm:text-[10.5rem] leading-none tracking-tighter italic"
                style={{
                  backgroundImage:
                    "linear-gradient(180deg, #3b5bdb 0%, #9c36b5 30%, #f72585 60%, #ff922b 95%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  WebkitTextStroke: "3px #ff9e00",
                  filter:
                    "drop-shadow(0 0 28px rgba(247, 37, 133, 0.7)) drop-shadow(0 8px 0px #2b0938)",
                }}
              >
                VI
              </span>
            </div>

            {/* Comic Skewed Title ("CONTACT THE YUVAAN VERSE!") */}
            <div className="-mt-10 sm:-mt-14 relative z-10 flex flex-col items-center">
              <span className="bg-[#0f172a] border-2 border-white px-3 py-0.5 text-xs sm:text-sm font-black tracking-[0.22em] text-white uppercase -rotate-2 shadow-[4px_4px_0px_#ff2a85]">
                ESTABLISH COMMS WITH
              </span>

              <h1
                className="mt-2 text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-tight italic -rotate-2"
                style={{
                  color: "#facc15",
                  textShadow:
                    "3px 3px 0px #000, -2px -2px 0px #000, 6px 6px 0px #f72585, 0 0 40px rgba(250, 204, 21, 0.55)",
                }}
              >
                YUVAANHQ
              </h1>

              <div className="mt-1 self-end -mr-4 sm:-mr-10 rotate-[-3deg] bg-[#140a24]/95 border-2 border-[#ff9e00] px-3.5 py-0.5 shadow-[4px_4px_0px_#ef4444]">
                <span className="text-lg sm:text-2xl font-black italic tracking-wider text-white">
                  LINE<span className="text-[#ef4444]">!</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* --- MAIN GRID: Left GTA VI Mission Dossier Cards | Right Comic-Neon Terminal Form --- */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* LEFT COLUMN: 3 GTA VI Hotline Cards + Wanted Level / Location Card (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {CONTACT_CHANNELS.map((item, idx) => (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-none border-2 border-pink-400/50 bg-[#120824]/80 p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#facc15] shadow-[6px_6px_0px_rgba(247,37,133,0.55)] hover:shadow-[8px_8px_0px_#facc15]"
              >
                {/* Top Gradient Accent Bar */}
                <div
                  className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${item.badgeColor}`}
                />

                <div className="flex items-center justify-between mb-2">
                  <span className="inline-block bg-gradient-to-r from-[#f72585] to-[#ff8c42] px-2.5 py-0.5 text-[10px] font-black tracking-[0.2em] text-white uppercase">
                    {item.code}
                  </span>
                  <span className="text-[11px] font-bold tracking-widest text-amber-300/90 uppercase">
                    {item.role}
                  </span>
                </div>

                <h3 className="text-xl font-black tracking-wide text-white uppercase group-hover:text-[#facc15] transition-colors">
                  {item.title}
                </h3>

                <div className="mt-3 space-y-1.5 text-sm text-pink-100/85">
                  <p className="flex items-center gap-2 font-mono">
                    <span className="text-[#ff2a85] font-bold">✉</span>
                    <a
                      href={`mailto:${item.email}`}
                      className="hover:text-[#facc15] underline decoration-pink-500/50 underline-offset-4"
                    >
                      {item.email}
                    </a>
                  </p>
                  <p className="flex items-center gap-2 font-mono">
                    <span className="text-[#ff8c42] font-bold">☎</span>
                    <a
                      href={`tel:${item.phone}`}
                      className="hover:text-[#facc15]"
                    >
                      {item.phone}
                    </a>
                  </p>
                  <p className="flex items-center gap-2 text-xs text-pink-200/70 pt-1">
                    <span className="text-[#facc15]">📍</span>
                    {item.location}
                  </p>
                </div>
              </div>
            ))}

            {/* GTA VI Safe House / Radar Map Card */}
            <div className="relative overflow-hidden border-2 border-[#ff9e00]/70 bg-[#120824]/85 p-5 backdrop-blur-xl shadow-[6px_6px_0px_#ff9e00]">
              <div className="flex items-center justify-between border-b border-pink-500/30 pb-3 mb-3">
                <div>
                  <span className="text-[10px] font-black tracking-[0.2em] text-[#ff9e00] uppercase">
                    SAFEHOUSE COORDINATES
                  </span>
                  <h4 className="text-lg font-black uppercase text-white">
                    IIIT GUWAHATI CAMPUS
                  </h4>
                </div>
                {/* GTA Wanted Stars */}
                <div className="flex items-center gap-1 text-lg text-[#facc15] drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]">
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                </div>
              </div>

              <p className="text-xs text-pink-100/80 leading-relaxed mb-4">
                Bongora, Guwahati, Assam — 781015. 15 mins from LGBI Airport
                (GAU). Fast-travel shuttles active during Yuvaan 2027 fest days.
              </p>

              <div className="flex flex-wrap gap-3">
                <a
                  href="https://maps.google.com/?q=IIIT+Guwahati"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 border-2 border-black bg-[#facc15] px-4 py-2 text-xs font-black tracking-wider text-black uppercase shadow-[3px_3px_0px_#f72585] transition-transform hover:-translate-y-0.5"
                >
                  OPEN GPS RADAR ↗
                </a>
                <Link
                  href="/events"
                  className="inline-flex items-center gap-2 border-2 border-pink-400/60 bg-white/10 px-4 py-2 text-xs font-black tracking-wider text-white uppercase hover:bg-white/20 transition"
                >
                  EXPLORE EVENTS ↗
                </Link>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: GTA VI "VI" Styled Interactive Comms Form (7 Cols) */}
          <div className="lg:col-span-7">
            <div className="relative overflow-hidden border-2 border-[#ff8c42] bg-[#130726]/85 p-6 sm:p-8 backdrop-blur-2xl shadow-[10px_10px_0px_#d6299b]">
              {/* Top Neon Bar matching the "VI" logo border */}
              <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-[#3b5bdb] via-[#f72585] to-[#ff9e00]" />

              {/* Corner Rockstar / Comicon Stamp */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-pink-500/30 pb-5 mb-6">
                <div>
                  <span className="inline-block bg-[#facc15] px-2 py-0.5 text-[10px] font-black tracking-[0.22em] text-black uppercase">
                    ENCRYPTED VICE-NET TERMINAL
                  </span>
                  <h2 className="mt-1.5 text-2xl sm:text-3xl font-black uppercase tracking-tight text-white italic">
                    SEND A{" "}
                    <span className="bg-gradient-to-r from-[#ff2a85] via-[#ff8c42] to-[#facc15] bg-clip-text text-transparent">
                      DIRECT DISPATCH
                    </span>
                  </h2>
                </div>

                {/* R* Inspired Yuvaan Emblem */}
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-white bg-gradient-to-br from-[#7209b7] via-[#f72585] to-[#ff8c42] font-black text-xl text-white shadow-[0_0_20px_rgba(247,37,133,0.7)]">
                  Y<span className="text-xs align-top">★</span>
                </div>
              </div>

              {submitted ? (
                <div className="my-12 border-2 border-[#facc15] bg-[#1f0d3d]/90 p-8 text-center shadow-[6px_6px_0px_#facc15]">
                  <p className="text-xs font-black tracking-[0.3em] text-[#ff9e00] uppercase">
                    MISSION PASSED + RESPECT
                  </p>
                  <h3 className="mt-2 text-3xl font-black uppercase italic text-[#facc15]">
                    TRANSMISSION LOCKED IN!
                  </h3>
                  <p className="mt-2 text-sm text-pink-100/90">
                    Our Vice City Yuvaan crew has received your dossier and will
                    get back to you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-black tracking-[0.18em] text-pink-200 uppercase">
                        OPERATIVE NAME *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Lucia / Jason"
                        value={formState.name}
                        onChange={(e) =>
                          setFormState({ ...formState, name: e.target.value })
                        }
                        className="w-full border-2 border-pink-400/40 bg-[#0b0418]/90 px-4 py-3 text-sm text-white placeholder-pink-300/35 focus:border-[#facc15] focus:outline-none focus:ring-2 focus:ring-[#f72585]/50"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-black tracking-[0.18em] text-pink-200 uppercase">
                        COMMS FREQUENCY (EMAIL) *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="operative@iiitg.ac.in"
                        value={formState.email}
                        onChange={(e) =>
                          setFormState({ ...formState, email: e.target.value })
                        }
                        className="w-full border-2 border-pink-400/40 bg-[#0b0418]/90 px-4 py-3 text-sm text-white placeholder-pink-300/35 focus:border-[#facc15] focus:outline-none focus:ring-2 focus:ring-[#f72585]/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-black tracking-[0.18em] text-pink-200 uppercase">
                        AFFILIATION / COLLEGE / ORG
                      </label>
                      <input
                        type="text"
                        placeholder="IIIT Guwahati / Brand Name"
                        value={formState.college}
                        onChange={(e) =>
                          setFormState({
                            ...formState,
                            college: e.target.value,
                          })
                        }
                        className="w-full border-2 border-pink-400/40 bg-[#0b0418]/90 px-4 py-3 text-sm text-white placeholder-pink-300/35 focus:border-[#facc15] focus:outline-none focus:ring-2 focus:ring-[#f72585]/50"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-black tracking-[0.18em] text-pink-200 uppercase">
                        MISSION BRIEF TYPE *
                      </label>
                      <select
                        value={formState.category}
                        onChange={(e) =>
                          setFormState({
                            ...formState,
                            category: e.target.value,
                          })
                        }
                        className="w-full border-2 border-pink-400/40 bg-[#0b0418]/90 px-4 py-3 text-sm font-bold text-white focus:border-[#facc15] focus:outline-none"
                      >
                        <option value="SPONSORSHIP">
                          💰 SPONSORSHIP & PARTNERSHIP
                        </option>
                        <option value="EVENTS">
                          🎮 COMICON & GAMING EVENTS
                        </option>
                        <option value="PROSHOW">
                          🎸 ARTIST / PRO-SHOW BOOKING
                        </option>
                        <option value="ACCOMMODATION">
                          🏨 CONTINGENT & HOSPITALITY
                        </option>
                        <option value="GENERAL">⚡ GENERAL INQUIRY</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-black tracking-[0.18em] text-pink-200 uppercase">
                      TRANSMISSION PAYLOAD (MESSAGE) *
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Drop the details of your inquiry, collab proposal, or event question..."
                      value={formState.message}
                      onChange={(e) =>
                        setFormState({ ...formState, message: e.target.value })
                      }
                      className="w-full border-2 border-pink-400/40 bg-[#0b0418]/90 px-4 py-3 text-sm text-white placeholder-pink-300/35 focus:border-[#facc15] focus:outline-none focus:ring-2 focus:ring-[#f72585]/50"
                    />
                  </div>

                  {/* Submit Button Styled Like Homepage "Explore the events" + GTA VI Neon Gradient */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span className="text-[11px] font-mono text-pink-200/75">
                      * Avg. response time: &lt; 12 hrs • Vice-Net Protocol v2.7
                    </span>

                    <button
                      type="submit"
                      className="w-full sm:w-auto cursor-pointer border-2 border-black bg-gradient-to-r from-[#f72585] via-[#ff6b35] to-[#facc15] px-8 py-3.5 text-sm font-black tracking-[0.2em] text-black uppercase shadow-[5px_5px_0px_#ffffff] transition-all hover:-translate-y-0.5 hover:shadow-[7px_7px_0px_#facc15] active:translate-y-0"
                    >
                      TRANSMIT DISPATCH ↗
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}