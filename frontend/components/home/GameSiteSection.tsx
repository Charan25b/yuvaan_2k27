"use client";

import React, { useState } from "react";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";

export function GameSiteSection() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section data-home-section="quest" className="py-14 sm:py-20 relative">
      <Container>
        <div className="relative rounded-3xl bg-white border-2 border-[var(--color-border-dark)] comic-shadow-lg overflow-hidden">
          {/* Comic caution/hazard tape header bar */}
          <div className="comic-tape-amber py-2 px-6 flex items-center justify-between text-xs font-black uppercase tracking-widest text-[var(--color-text-dark)] select-none">
            <span>⚡ SEPARATE APPLICATION ⚡</span>
            <span className="hidden sm:inline">CAMPUS QUESTS &bull; FACTION ARENAS &bull; DUELS</span>
            <span>⚡ LAUNCHING ON-CAMPUS ⚡</span>
          </div>

          <div className="p-6 sm:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 flex flex-col gap-4 text-left">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="primary" comicStamp className="text-xs">
                    ★ SEPARATE INTERACTIVE APP
                  </Badge>
                  <Badge variant="gold" className="text-xs">
                    FACTION POINTS LEDGER
                  </Badge>
                </div>

                <h2 className="text-3xl sm:text-5xl font-black text-[var(--color-text-dark)] tracking-tight leading-tight">
                  Yuvaan Game Site: <br />
                  <span className="text-[var(--color-ember)] underline decoration-[var(--color-yellow)] decoration-wavy">
                    The Campus Quest Arena
                  </span>
                </h2>

                <p className="text-base text-[var(--color-text-muted)] font-medium leading-relaxed max-w-xl">
                  A dedicated interactive web experience where festival attendees scan
                  physical QR checkpoints hidden across landmarks at IIIT Guwahati, compete
                  in lightning 1v1 browser mini-games, and bank points for their assigned faction.
                </p>

                <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-black rounded-xl bg-[var(--color-ember)] text-white border-2 border-[var(--color-border-dark)] comic-shadow hover:bg-[var(--color-orange)] active:translate-x-[2px] active:translate-y-[2px] transition-all cursor-pointer select-none"
                  >
                    <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-yellow)] animate-ping" />
                    Enter Game Site Portal &rarr;
                  </button>
                  <div className="flex flex-col text-xs text-[var(--color-text-muted)]">
                    <span className="font-black text-[var(--color-text-dark)]">Separate Application Architecture</span>
                    <span>Activates during festival with student credentials</span>
                  </div>
                </div>
              </div>

              {/* 4 Feature Mini-Cards with comic colors */}
              <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-xl bg-[var(--tint-blush)] border-2 border-[var(--color-border-dark)] comic-shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-[var(--color-ember)]">01</span>
                      <span className="text-sm">📍</span>
                    </div>
                    <h4 className="font-black text-sm text-[var(--color-text-dark)] mt-1">Campus Checkpoints</h4>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1 font-medium">Physical QR markers across university venues.</p>
                  </div>
                  <span className="text-[10px] font-black text-[var(--color-ember)] uppercase tracking-wider mt-3">Scan to Claim</span>
                </div>

                <div className="p-4 rounded-xl bg-[var(--tint-peach)] border-2 border-[var(--color-border-dark)] comic-shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-[var(--color-orange)]">02</span>
                      <span className="text-sm">⚔️</span>
                    </div>
                    <h4 className="font-black text-sm text-[var(--color-text-dark)] mt-1">1v1 Mini-Game Duels</h4>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1 font-medium">Challenge peers in fast browser-based reaction duels.</p>
                  </div>
                  <span className="text-[10px] font-black text-[var(--color-orange)] uppercase tracking-wider mt-3">Instant Match</span>
                </div>

                <div className="p-4 rounded-xl bg-[var(--tint-cyan)] border-2 border-[var(--color-border-dark)] comic-shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-[var(--color-cyan)]">03</span>
                      <span className="text-sm">📊</span>
                    </div>
                    <h4 className="font-black text-sm text-[var(--color-text-dark)] mt-1">Live Faction Standings</h4>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1 font-medium">Server-verified points ledger driving live ranks.</p>
                  </div>
                  <span className="text-[10px] font-black text-[var(--color-cyan)] uppercase tracking-wider mt-3">Realtime Ledger</span>
                </div>

                <div className="p-4 rounded-xl bg-[var(--tint-gold)] border-2 border-[var(--color-border-dark)] comic-shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-[var(--color-gold)]">04</span>
                      <span className="text-sm">🎖️</span>
                    </div>
                    <h4 className="font-black text-sm text-[var(--color-text-dark)] mt-1">Milestone Badges</h4>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1 font-medium">Unlock exclusive festival perks &amp; sponsor coupons.</p>
                  </div>
                  <span className="text-[10px] font-black text-[var(--color-gold)] uppercase tracking-wider mt-3">Perk Rewards</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Info Modal */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white border-2 border-[var(--color-border-dark)] comic-shadow-lg p-6 sm:p-8 text-left animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b-2 border-[var(--color-border-dark)]">
              <Badge variant="primary" comicStamp className="text-xs">
                ARCHITECTURAL BOUNDARY
              </Badge>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="h-8 w-8 rounded-full bg-[var(--color-cream-canvas)] border border-[var(--color-border-dark)] flex items-center justify-center font-black text-sm text-[var(--color-text-dark)] hover:bg-rose-100 transition-colors"
                aria-label="Close dialog"
              >
                &times;
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <h3 className="text-2xl font-black text-[var(--color-text-dark)]">
                Yuvaan Game Site &amp; Quest Engine
              </h3>
              <p className="text-xs sm:text-sm text-[var(--color-text-muted)] font-medium leading-relaxed">
                The Yuvaan Game Site is engineered as a separate interactive application.
                It requires active attendee login, student verification, physical location
                scanners, and a dedicated backend WebSocket game server.
              </p>
              <div className="p-4 rounded-xl bg-[var(--tint-gold)] border border-[var(--color-border-dark)] text-xs text-[var(--color-text-dark)] space-y-2">
                <p className="font-black text-amber-900">
                  ⚡ Destination Status: Unconfigured &amp; Standalone
                </p>
                <p className="font-medium text-amber-950">
                  In accordance with the festival platform roadmap, the public website operates
                  strictly without student authentication or quest state. The Game Site entry URL
                  will be published upon official on-campus badge deployment.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[var(--color-border-subtle)] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-[var(--color-text-dark)] text-white text-xs font-black border border-[var(--color-border-dark)] comic-shadow-sm hover:bg-black transition-all cursor-pointer"
              >
                Understood &bull; Return to Website
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
