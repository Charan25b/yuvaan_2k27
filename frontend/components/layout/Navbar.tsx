"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { GameSiteEntryModal } from "@/components/ui/GameSiteEntryModal";

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
      <header className="sticky top-0 z-40 bg-[#121110] border-b-2 border-[#121110] transition-colors">
        <Container>
          <div className="flex h-16 sm:h-20 items-center justify-between gap-4">
            {/* Brand Identity */}
            <Link
              href="/"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 select-none group"
            >
              <div className="relative">
                <span className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-[var(--color-ember)] text-white font-black text-xl border-2 border-[var(--color-border-dark)] comic-shadow group-hover:bg-[#F2AE30] group-hover:text-[#121110] group-hover:rotate-[-3deg] transition-all">
                  Y
                </span>
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-[var(--color-yellow)] border border-[var(--color-border-dark)]" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-lg sm:text-xl tracking-tight text-[#fffaf1] leading-tight">
                    YUVAAN
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-[var(--color-yellow)] text-[var(--color-text-dark)] text-xs font-black border border-[var(--color-border-dark)] rotate-[-2deg]">
                    &apos;27
                  </span>
                </div>
                <span className="text-[10px] font-extrabold tracking-widest text-white/55 uppercase">
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
                        ? "text-[#121110] bg-[#f3b32e] border-2 border-[#121110] shadow-[3px_3px_0_#f7f1e8] rotate-[-1deg]"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Game Site Action Button: red dot turns green on hover */}
            <div className="hidden lg:flex items-center gap-3">
              <button
                type="button"
                onClick={() => setGameModalOpen(true)}
                className="group inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-black rounded-lg bg-[#F2AE30] hover:bg-[#f04b2b] text-[#121110] hover:text-white border-2 border-[#121110] shadow-[2px_2px_0_#121110] hover:shadow-[3px_3px_0_#121110] transition-all cursor-pointer"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 group-hover:bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600 group-hover:bg-[#22c55e] transition-colors shadow-[0_0_6px_#ef4444] group-hover:shadow-[0_0_6px_#22c55e]" />
                </span>
                <span>Game Site Entry</span>
              </button>
            </div>

            {/* Mobile Menu Controls */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                type="button"
                onClick={() => setGameModalOpen(true)}
                className="group inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-black rounded-lg bg-[#FEF3C7] border-2 border-[#121110] text-[#121110] cursor-pointer"
              >
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse group-hover:bg-[#22c55e] transition-colors" />
                Game Site
              </button>
              <button
                type="button"
                onClick={toggleMobileMenu}
                aria-expanded={mobileMenuOpen}
                aria-label="Toggle navigation menu"
                className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-white/50 bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
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
          <div className="lg:hidden border-b-2 border-[#121110] bg-[#121110] px-4 py-5 shadow-lg animate-in fade-in duration-150">
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
                          ? "bg-[#f3b32e] text-[#121110] border-2 border-black shadow-[3px_3px_0_#f7f1e8]"
                          : "text-white/85 hover:bg-white/10"
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
                    className="group w-full inline-flex items-center justify-center gap-2.5 px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl bg-[#F2AE30] hover:bg-[#f04b2b] text-[#121110] hover:text-white border-2 border-[#121110] shadow-[3px_3px_0px_#121110] hover:shadow-[5px_5px_0px_#121110] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
                  >
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 group-hover:bg-green-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600 group-hover:bg-[#22c55e] transition-colors shadow-[0_0_8px_#ef4444] group-hover:shadow-[0_0_8px_#22c55e]" />
                    </span>
                    <span>✦ Game Site Entry</span>
                  </button>
                </div>
              </nav>
            </Container>
          </div>
        )}
      </header>

      <GameSiteEntryModal open={gameModalOpen} onClose={() => setGameModalOpen(false)} />
    </>
  );
}
