"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/components/ui/Container";

interface NavItem {
  label: string;
  href: string;
  accent: string;
}

const navItems: NavItem[] = [
  { label: "Events", href: "/events", accent: "hover:text-[var(--color-ember)]" },
  { label: "Schedule", href: "/schedule", accent: "hover:text-[var(--color-orange)]" },
  { label: "Merchandise", href: "/merchandise", accent: "hover:text-[var(--color-gold)]" },
  { label: "Sponsors", href: "/sponsors", accent: "hover:text-[var(--color-cyan)]" },
  { label: "Team", href: "/team", accent: "hover:text-[var(--color-emerald)]" },
  { label: "Gallery", href: "/gallery", accent: "hover:text-[var(--color-violet)]" },
  { label: "Contact", href: "/contact", accent: "hover:text-[var(--color-ember)]" },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [gameModalOpen, setGameModalOpen] = useState(false);
  const pathname = usePathname();

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[var(--color-cream-canvas)]/95 backdrop-blur-md border-b border-[var(--color-border-subtle)] transition-colors">
        {/* Subtle top comic energy bar */}
        <div className="h-1 w-full bg-gradient-to-r from-[var(--color-ember)] via-[var(--color-orange)] to-[var(--color-yellow)]" />

        <Container>
          <div className="flex h-16 sm:h-20 items-center justify-between gap-4">
            {/* Brand Identity */}
            <Link
              href="/"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 select-none group"
            >
              <div className="relative">
                <span className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-[var(--color-ember)] text-white font-black text-xl border-2 border-[var(--color-border-dark)] comic-shadow group-hover:bg-[var(--color-orange)] group-hover:rotate-[-3deg] transition-all">
                  Y
                </span>
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-[var(--color-yellow)] border border-[var(--color-border-dark)]" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-lg sm:text-xl tracking-tight text-[var(--color-text-dark)] leading-tight">
                    YUVAAN
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-[var(--color-yellow)] text-[var(--color-text-dark)] text-xs font-black border border-[var(--color-border-dark)] rotate-[-2deg]">
                    &apos;27
                  </span>
                </div>
                <span className="text-[10px] font-extrabold tracking-widest text-[var(--color-text-muted)] uppercase">
                  IIIT GUWAHATI
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-1.5 text-xs font-black tracking-wide rounded-lg transition-all ${
                      isActive
                        ? "text-[var(--color-text-dark)] bg-[var(--color-cream)] border-2 border-[var(--color-border-dark)] comic-shadow-sm rotate-[-1deg]"
                        : `text-[var(--color-text-dark)] ${item.accent} hover:bg-[var(--color-cream)]/70`
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Game Site Action Button */}
            <div className="hidden lg:flex items-center gap-3">
              <button
                type="button"
                onClick={() => setGameModalOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-black uppercase tracking-wider rounded-xl bg-[#FEF3C7] border-2 border-[var(--color-border-dark)] comic-shadow hover:bg-[var(--color-yellow)] active:translate-x-[1.5px] active:translate-y-[1.5px] active:shadow-none transition-all cursor-pointer"
              >
                <span className="h-2 w-2 rounded-full bg-[var(--color-orange)] animate-pulse" />
                <span>✦ Game Site Entry</span>
              </button>
            </div>

            {/* Mobile Menu Controls */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                type="button"
                onClick={() => setGameModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-black rounded-lg bg-[#FEF3C7] border-2 border-[var(--color-border-dark)] comic-shadow-sm text-[var(--color-text-dark)]"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-orange)] animate-pulse" />
                Game Site
              </button>
              <button
                type="button"
                onClick={toggleMobileMenu}
                aria-expanded={mobileMenuOpen}
                aria-label="Toggle navigation menu"
                className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[var(--color-border-dark)] bg-[var(--color-surface)] text-[var(--color-text-dark)] comic-shadow-sm hover:bg-[var(--color-cream)] transition-colors cursor-pointer"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                  stroke="currentColor"
                >
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </Container>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b-2 border-[var(--color-border-dark)] bg-[var(--color-cream-canvas)] px-4 py-5 shadow-lg animate-in fade-in duration-150">
            <Container>
              <nav className="flex flex-col gap-1.5">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMobileMenu}
                      className={`px-4 py-2.5 text-sm font-black rounded-xl transition-all ${
                        isActive
                          ? "bg-[var(--color-cream)] text-[var(--color-ember)] border-2 border-[var(--color-border-dark)] comic-shadow-sm"
                          : "text-[var(--color-text-dark)] hover:bg-[var(--color-cream)]/70"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}

                <div className="pt-3 mt-2 border-t border-[var(--color-border-subtle)]">
                  <button
                    type="button"
                    onClick={() => {
                      closeMobileMenu();
                      setGameModalOpen(true);
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl bg-[#FEF3C7] border-2 border-[var(--color-border-dark)] comic-shadow text-[var(--color-text-dark)]"
                  >
                    <span className="h-2 w-2 rounded-full bg-[var(--color-orange)] animate-pulse" />
                    Yuvaan Game Site (Launch Info)
                  </button>
                </div>
              </nav>
            </Container>
          </div>
        )}
      </header>

      {/* Game Site Info Modal (Accessible Action) */}
      {gameModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={() => setGameModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-[var(--color-surface)] border-2 border-[var(--color-border-dark)] comic-shadow-lg p-0 overflow-hidden text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Comic Caution Tape Header */}
            <div className="comic-tape-amber h-3 w-full border-b-2 border-[var(--color-border-dark)]" />

            <div className="p-6">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)]">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-[var(--color-cream)] text-[var(--color-ember)] border border-[var(--color-border-dark)] comic-shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-[var(--color-orange)] animate-pulse" />
                  Separate Experience
                </span>
                <button
                  type="button"
                  onClick={() => setGameModalOpen(false)}
                  className="h-8 w-8 rounded-lg flex items-center justify-center font-black text-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-dark)] hover:bg-[var(--color-cream)] transition-colors cursor-pointer"
                  aria-label="Close dialog"
                >
                  &times;
                </button>
              </div>

              <div className="mt-4 flex flex-col gap-3">
                <h3 className="text-2xl font-black text-[var(--color-text-dark)] leading-tight">
                  Yuvaan Game Site
                </h3>
                <p className="text-xs sm:text-sm text-[var(--color-text-muted)] font-medium leading-relaxed">
                  The interactive Game Site is a dedicated student competition platform separate from this public festival website.
                </p>

                <div className="rounded-xl bg-[#FEF3C7] p-3.5 text-xs text-[var(--color-text-dark)] space-y-1.5 border-2 border-[var(--color-border-dark)] comic-shadow-sm">
                  <p className="font-black text-xs uppercase tracking-wider text-[var(--color-ember)]">
                    Upcoming Game Site Features:
                  </p>
                  <ul className="list-disc pl-4 space-y-1 font-semibold">
                    <li>Student authentication &amp; faction profiles</li>
                    <li>Campus physical QR checkpoint scanners</li>
                    <li>1v1 duel arena &amp; browser mini-games</li>
                    <li>Live faction championship leaderboards</li>
                  </ul>
                </div>

                <div className="p-2.5 rounded-lg bg-[var(--color-cream-canvas)] border border-[var(--color-border-subtle)] text-[11px] font-bold text-[var(--color-ember)]">
                  ✦ Destination unconfigured — access portal activates during on-campus festival registration.
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-[var(--color-border-subtle)] flex justify-end">
                <button
                  type="button"
                  onClick={() => setGameModalOpen(false)}
                  className="px-5 py-2 text-xs font-black uppercase tracking-wider rounded-xl bg-[var(--color-yellow)] border-2 border-[var(--color-border-dark)] comic-shadow text-[var(--color-text-dark)] hover:bg-[var(--color-orange)] hover:text-white transition-all cursor-pointer"
                >
                  Understood
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
