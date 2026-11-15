"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

// Subtle falling water drops
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
      alpha: number;
      isStreak: boolean;
    }

    // Keep the rain subtle and sparse, with every drop falling straight down.
    const droplets: Droplet[] = Array.from({ length: 18 }, (_, i) => {
      const isStreak = i < 3;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        r: isStreak ? Math.random() * 3 + 2.5 : Math.random() * 3 + 1,
        vy: isStreak ? Math.random() * 0.7 + 0.5 : Math.random() * 0.08 + 0.02,
        alpha: Math.random() * 0.35 + 0.2,
        isStreak,
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

      // Colorful refraction gradient
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
        d.y += d.vy;

        if (d.y > height + 20) {
          d.y = -20;
          d.x = Math.random() * width;
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

// Contact channels
const CONTACT_CHANNELS = [
  {
    code: "CONTACT 01",
    role: "GENERAL INQUIRIES",
    title: "General Contact",
    email: "yuvaan@iiitg.ac.in",
    phone: "+91 98765 43210",
    location: "IIIT Guwahati, Bongora, Assam 781015",
    badgeColor: "from-[#4355db] via-[#d6299b] to-[#ff8c42]",
  },
  {
    code: "CONTACT 02",
    role: "SPONSORSHIPS",
    title: "Partnership Inquiries",
    email: "sponsors.yuvaan@iiitg.ac.in",
    phone: "+91 91234 56789",
    location: "Corporate & Media Wing, Block A",
    badgeColor: "from-[#d6299b] via-[#ff477e] to-[#ffb703]",
  },
  {
    code: "CONTACT 03",
    role: "EVENTS & REGISTRATION",
    title: "Events Contact",
    email: "events.yuvaan@iiitg.ac.in",
    phone: "+91 87654 32109",
    location: "Student Activity Center, IIITG",
    badgeColor: "from-[#7209b7] via-[#f72585] to-[#ff9e00]",
  },
];

const INQUIRY_TYPES = [
  { value: "SPONSORSHIP", label: "Sponsorship & Partnerships", icon: "partnership", color: "text-[#ff8c42]" },
  { value: "EVENTS", label: "Event Participation & Registration", icon: "event", color: "text-[#facc15]" },
  { value: "PROSHOW", label: "Artist & Performance Bookings", icon: "performance", color: "text-[#f72585]" },
  { value: "ACCOMMODATION", label: "Accommodation & Travel", icon: "accommodation", color: "text-[#60a5fa]" },
  { value: "GENERAL", label: "General Inquiry", icon: "general", color: "text-[#ff9e00]" },
] as const;

type InquiryType = (typeof INQUIRY_TYPES)[number];

function InquiryTypeIcon({ type, className = "" }: { type: InquiryType["icon"]; className?: string }) {
  const iconProps = {
    "aria-hidden": true as const,
    className: `h-5 w-5 shrink-0 ${className}`,
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.7,
    viewBox: "0 0 24 24",
  };

  return (
    <svg {...iconProps}>
      {type === "partnership" && <>
        <path d="m9 15-1.4 1.4a4 4 0 0 1-5.7-5.7l3-3a4 4 0 0 1 5.7 0" />
        <path d="m15 9 1.4-1.4a4 4 0 0 1 5.7 5.7l-3 3a4 4 0 0 1-5.7 0" />
        <path d="m8 12 2-2a2.8 2.8 0 0 1 4 0l2 2-3 3a2 2 0 0 1-3 0l-2-2" />
      </>}
      {type === "event" && <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18M9 15l2 2 4-4" />
      </>}
      {type === "performance" && <>
        <rect x="9" y="2" width="6" height="12" rx="3" />
        <path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8" />
      </>}
      {type === "accommodation" && <>
        <path d="M3 19v-8a2 2 0 0 1 2-2h5a3 3 0 0 1 3 3v1h5a3 3 0 0 1 3 3v3" />
        <path d="M3 15h18M6 9V6a2 2 0 0 1 2-2h2M3 19v2M21 19v2" />
      </>}
      {type === "general" && <>
        <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H6l-3 2v-6a7.5 7.5 0 1 1 17-3.5Z" />
        <path d="M8 12h8M8 9h5" />
      </>}
    </svg>
  );
}

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    college: "",
    category: "GENERAL",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement | null>(null);
  const categoryTriggerRef = useRef<HTMLButtonElement | null>(null);
  const categoryOptionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedInquiry =
    INQUIRY_TYPES.find((inquiry) => inquiry.value === formState.category) ??
    INQUIRY_TYPES[INQUIRY_TYPES.length - 1];

  useEffect(() => {
    if (!categoryOpen) return;
    const handleOutsideClick = (event: PointerEvent) => {
      if (!categoryDropdownRef.current?.contains(event.target as Node)) {
        setCategoryOpen(false);
      }
    };
    document.addEventListener("pointerdown", handleOutsideClick);
    return () => document.removeEventListener("pointerdown", handleOutsideClick);
  }, [categoryOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4500);
    setFormState({
      name: "",
      email: "",
      college: "",
      category: "GENERAL",
      message: "",
    });
  };

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden bg-[#0c0617] text-white selection:bg-[#ff2a85] selection:text-white">
        {/* Background artwork and comic panel grid */}
      <div className="fixed inset-0 z-0">
        {/* Sunset background artwork */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 transition-transform duration-1000"
          style={{
            backgroundImage: "url('/gta-vi-bg.jpeg')",
            filter: "saturate(1.25) contrast(1.08)",
          }}
        />

        {/* Sunset color overlay */}
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

      {/* Subtle falling water drops */}
      <WaterDropletOverlay />

      {/* 3. FOREGROUND CONTENT */}
      <div className="relative z-30 mx-auto max-w-7xl px-4 pt-10 pb-24 sm:px-6 lg:px-8">
        {/* Hero header */}
        <section className="relative mb-16 flex flex-col items-center text-center">
          {/* Centerpiece title */}
          <div className="relative my-2 flex flex-col items-center justify-center">
            {/* Decorative backdrop lettering */}
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

            {/* Contact page title */}
            <div className="-mt-10 sm:-mt-14 relative z-10 flex flex-col items-center">
              <span className="bg-[#0f172a] border-2 border-white px-3 py-0.5 text-xs sm:text-sm font-black tracking-[0.22em] text-white uppercase -rotate-2 shadow-[4px_4px_0px_#ff2a85]">
                CONTACT YUVAAN
              </span>

              <h1
                className="mt-2 text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-tight italic -rotate-2"
                style={{
                  color: "#facc15",
                  textShadow:
                    "3px 3px 0px #000, -2px -2px 0px #000, 6px 6px 0px #f72585, 0 0 40px rgba(250, 204, 21, 0.55)",
                }}
              >
                Get in Touch
              </h1>

            </div>
          </div>
        </section>

        {/* Contact information and message form */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* Contact channels and campus location */}
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
                    <svg className="h-4 w-4 shrink-0 text-[#ff2a85]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M3 5h18v14H3z"/><path d="m3 7 9 6 9-6"/></svg>
                    <a
                      href={`mailto:${item.email}`}
                      className="hover:text-[#facc15] underline decoration-pink-500/50 underline-offset-4"
                    >
                      {item.email}
                    </a>
                  </p>
                  <p className="flex items-center gap-2 font-mono">
                    <svg className="h-4 w-4 shrink-0 text-[#ff8c42]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a15 15 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2C10 21 3 14 3 6a2 2 0 0 1 2-2Z"/></svg>
                    <a
                      href={`tel:${item.phone}`}
                      className="hover:text-[#facc15]"
                    >
                      {item.phone}
                    </a>
                  </p>
                  <p className="flex items-center gap-2 text-xs text-pink-200/70 pt-1">
                    <svg className="h-4 w-4 shrink-0 text-[#facc15]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>
                    {item.location}
                  </p>
                </div>
              </div>
            ))}

            {/* Campus location */}
            <div className="relative overflow-hidden border-2 border-[#ff9e00]/70 bg-[#120824]/85 p-5 backdrop-blur-xl shadow-[6px_6px_0px_#ff9e00]">
              <div className="flex items-center justify-between border-b border-pink-500/30 pb-3 mb-3">
                <div>
                  <span className="text-[10px] font-black tracking-[0.2em] text-[#ff9e00] uppercase">
                    CAMPUS LOCATION
                  </span>
                  <h4 className="text-lg font-black uppercase text-white">
                    IIIT GUWAHATI CAMPUS
                  </h4>
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#facc15]">Campus map</span>
              </div>

              <p className="text-xs text-pink-100/80 leading-relaxed mb-4">
                Bongora, Guwahati, Assam 781015. Use the link below for directions
                to the IIIT Guwahati campus.
              </p>

              <div className="flex flex-wrap gap-3">
                <a
                  href="https://maps.google.com/?q=IIIT+Guwahati"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 border-2 border-black bg-[#facc15] px-4 py-2 text-xs font-black tracking-wider text-black uppercase shadow-[3px_3px_0px_#f72585] transition-transform hover:-translate-y-0.5"
                >
                  GET DIRECTIONS
                </a>
                <Link
                  href="/events"
                  className="inline-flex items-center gap-2 border-2 border-pink-400/60 bg-white/10 px-4 py-2 text-xs font-black tracking-wider text-white uppercase hover:bg-white/20 transition"
                >
                  VIEW EVENTS
                </Link>
              </div>
            </div>
          </div>

          {/* Message form */}
          <div className="lg:col-span-7">
            <div className="relative overflow-visible border-2 border-[#ff8c42] bg-[#130726]/85 p-6 sm:p-8 backdrop-blur-2xl shadow-[10px_10px_0px_#d6299b]">
              {/* Accent bar */}
              <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-[#3b5bdb] via-[#f72585] to-[#ff9e00]" />

              {/* Form heading */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-pink-500/30 pb-5 mb-6">
                <div>
                  <span className="inline-block bg-[#facc15] px-2 py-0.5 text-[10px] font-black tracking-[0.22em] text-black uppercase">
                    CONTACT FORM
                  </span>
                  <h2 className="mt-1.5 text-2xl sm:text-3xl font-black uppercase tracking-tight text-white italic">
                    SEND A{" "}
                    <span className="bg-gradient-to-r from-[#ff2a85] via-[#ff8c42] to-[#facc15] bg-clip-text text-transparent">
                      MESSAGE
                    </span>
                  </h2>
                </div>

                {/* Yuvaan emblem */}
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-white bg-gradient-to-br from-[#7209b7] via-[#f72585] to-[#ff8c42] font-black text-xl text-white shadow-[0_0_20px_rgba(247,37,133,0.7)]">
                  Y
                </div>
              </div>

              {submitted ? (
                <div className="my-12 border-2 border-[#facc15] bg-[#1f0d3d]/90 p-8 text-center shadow-[6px_6px_0px_#facc15]">
                  <p className="text-xs font-black tracking-[0.3em] text-[#ff9e00] uppercase">
                    MESSAGE RECEIVED
                  </p>
                  <h3 className="mt-2 text-3xl font-black uppercase italic text-[#facc15]">
                    THANK YOU FOR CONTACTING YUVAAN
                  </h3>
                  <p className="mt-2 text-sm text-pink-100/90">
                    Your message has been received. Our team will get back to you
                    as soon as possible.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-black tracking-[0.18em] text-pink-200 uppercase">
                        FULL NAME *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Your full name"
                        value={formState.name}
                        onChange={(e) =>
                          setFormState({ ...formState, name: e.target.value })
                        }
                        className="w-full border-2 border-pink-400/40 bg-[#0b0418]/90 px-4 py-3 text-sm text-white placeholder-pink-300/35 focus:border-[#facc15] focus:outline-none focus:ring-2 focus:ring-[#f72585]/50"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-black tracking-[0.18em] text-pink-200 uppercase">
                        EMAIL ADDRESS *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
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
                        COLLEGE OR ORGANIZATION
                      </label>
                      <input
                        type="text"
                        placeholder="College or organization name"
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
                        INQUIRY TYPE *
                      </label>
                      <div ref={categoryDropdownRef} className="relative">
                        <input type="hidden" name="category" value={formState.category} />
                        <button
                          ref={categoryTriggerRef}
                          type="button"
                          aria-label={`Inquiry type: ${selectedInquiry.label}`}
                          aria-haspopup="listbox"
                          aria-expanded={categoryOpen}
                          aria-controls="inquiry-type-options"
                          onClick={() => setCategoryOpen((open) => !open)}
                          onKeyDown={(event) => {
                            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                              event.preventDefault();
                              setCategoryOpen(true);
                              const selectedIndex = INQUIRY_TYPES.findIndex(
                                (inquiry) => inquiry.value === formState.category
                              );
                              requestAnimationFrame(() => categoryOptionRefs.current[selectedIndex]?.focus());
                            } else if (event.key === "Escape") {
                              setCategoryOpen(false);
                            }
                          }}
                          className="flex w-full items-center justify-between gap-3 border-2 border-pink-400/40 bg-[#0b0418]/90 px-3 py-3 text-left text-sm font-bold text-white focus:border-[#facc15] focus:outline-none focus:ring-2 focus:ring-[#f72585]/50"
                        >
                          <span className="flex min-w-0 items-center gap-3">
                            <InquiryTypeIcon type={selectedInquiry.icon} className={selectedInquiry.color} />
                            <span className="truncate">{selectedInquiry.label}</span>
                          </span>
                          <svg className={`h-4 w-4 shrink-0 transition-transform ${categoryOpen ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <path d="m7 10 5 5 5-5" />
                          </svg>
                        </button>
                        {categoryOpen && (
                          <div
                            id="inquiry-type-options"
                            role="listbox"
                            aria-label="Inquiry type"
                            className="absolute left-0 right-0 top-full z-50 mt-2 max-h-64 overflow-y-auto border-2 border-[#ff8c42] bg-[#120824] p-1 shadow-[5px_5px_0px_#d6299b]"
                          >
                            {INQUIRY_TYPES.map((inquiry, index) => (
                              <button
                                key={inquiry.value}
                                ref={(node) => { categoryOptionRefs.current[index] = node; }}
                                type="button"
                                role="option"
                                aria-selected={formState.category === inquiry.value}
                                onClick={() => {
                                  setFormState({ ...formState, category: inquiry.value });
                                  setCategoryOpen(false);
                                  categoryTriggerRef.current?.focus();
                                }}
                                onKeyDown={(event) => {
                                  let nextIndex: number | null = null;
                                  if (event.key === "ArrowDown") nextIndex = (index + 1) % INQUIRY_TYPES.length;
                                  if (event.key === "ArrowUp") nextIndex = (index - 1 + INQUIRY_TYPES.length) % INQUIRY_TYPES.length;
                                  if (event.key === "Home") nextIndex = 0;
                                  if (event.key === "End") nextIndex = INQUIRY_TYPES.length - 1;
                                  if (event.key === "Escape") {
                                    setCategoryOpen(false);
                                    categoryTriggerRef.current?.focus();
                                  }
                                  if (nextIndex !== null) {
                                    event.preventDefault();
                                    categoryOptionRefs.current[nextIndex]?.focus();
                                  }
                                }}
                                className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-white transition-colors hover:bg-white/10 focus:bg-white/10 focus:outline-none"
                              >
                                <InquiryTypeIcon type={inquiry.icon} className={inquiry.color} />
                                <span className="flex-1">{inquiry.label}</span>
                                {formState.category === inquiry.value && (
                                  <svg className="h-4 w-4 text-[#facc15]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                                    <path d="m5 12 4 4L19 6" />
                                  </svg>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-black tracking-[0.18em] text-pink-200 uppercase">
                      MESSAGE *
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Tell us how we can help..."
                      value={formState.message}
                      onChange={(e) =>
                        setFormState({ ...formState, message: e.target.value })
                      }
                      className="w-full border-2 border-pink-400/40 bg-[#0b0418]/90 px-4 py-3 text-sm text-white placeholder-pink-300/35 focus:border-[#facc15] focus:outline-none focus:ring-2 focus:ring-[#f72585]/50"
                    />
                  </div>

                  {/* Submit button */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span className="text-[11px] font-mono text-pink-200/75">
                      Our team will respond as soon as possible.
                    </span>

                    <button
                      type="submit"
                      className="w-full sm:w-auto cursor-pointer border-2 border-black bg-gradient-to-r from-[#f72585] via-[#ff6b35] to-[#facc15] px-8 py-3.5 text-sm font-black tracking-[0.2em] text-black uppercase shadow-[5px_5px_0px_#ffffff] transition-all hover:-translate-y-0.5 hover:shadow-[7px_7px_0px_#facc15] active:translate-y-0"
                    >
                      SEND MESSAGE
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
