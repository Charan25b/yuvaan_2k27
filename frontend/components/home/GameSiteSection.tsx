"use client";

import React, { useState } from "react";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export function GameSiteSection() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section data-home-section="quest" className="py-14 sm:py-20 relative">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Main Left White Card */}
          <div className="lg:col-span-7 bg-white rounded-2xl border-2 border-[var(--color-border-dark)] comic-shadow-lg p-8 sm:p-12 lg:p-14 flex flex-col justify-between gap-8">
            <div className="flex flex-col gap-6 text-left">
              {/* Taglines: strictly static */}
              <div className="flex flex-wrap items-center gap-2.5">
                <Badge variant="blush" className="text-xs">
                  SEPARATE INTERACTIVE APP
                </Badge>
                <Badge variant="gold" className="text-xs">
                  FACTION POINTS LEDGER
                </Badge>
              </div>

              {/* Headline with clean comfortable margins and clear hierarchy */}
              <div className="space-y-2">
                <h2 className="comic-heading font-anton font-normal text-4xl sm:text-6xl lg:text-7xl text-[#121110] tracking-tight uppercase leading-[0.78]">
                  The Campus <br />
                  <span className="text-[var(--color-ember)]">
                    Quest Arena
                  </span>
                </h2>
                <div className="w-24 h-2 bg-[var(--color-yellow)] rounded-full border border-[var(--color-border-dark)]" />
              </div>

              <p className="text-sm sm:text-base text-[var(--color-text-dark)] font-medium leading-relaxed max-w-lg">
                A dedicated interactive web experience where festival attendees scan
                physical QR checkpoints hidden across landmarks at IIIT Guwahati, compete
                in lightning 1v1 browser mini-games, and bank points for their assigned faction.
              </p>
            </div>

            {/* Bottom Actions: Red dot turns green on hover */}
            <div className="pt-4 border-t-2 border-[var(--color-border-subtle)] flex flex-col sm:flex-row sm:items-center gap-4">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="group inline-flex items-center gap-3 px-6 py-3.5 text-sm font-black uppercase tracking-wider rounded-xl bg-[#F2AE30] hover:bg-[#f04b2b] text-[#121110] hover:text-white border-2 border-[#121110] shadow-[4px_4px_0px_#121110] hover:shadow-[6px_6px_0px_#121110] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer select-none"
              >
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 group-hover:bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600 group-hover:bg-[#22c55e] transition-colors shadow-[0_0_8px_#ef4444] group-hover:shadow-[0_0_8px_#22c55e]" />
                </span>
                <span>✦ Game Site Entry &rarr;</span>
              </button>
              <div className="flex flex-col text-xs text-[var(--color-text-muted)]">
                <span className="font-black text-[var(--color-text-dark)]">Separate Application Architecture</span>
                <span>Activates during festival with student credentials</span>
              </div>
            </div>
          </div>

          {/* 4 Feature Mini-Cards: All small white boxes have default tilt. No hover tilt animations or color jumps. */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Card 01 */}
            <div className="p-5 rounded-2xl bg-white border-2 border-[var(--color-border-dark)] comic-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="tilt-box-1 h-9 w-9 rounded-lg bg-white border-2 border-[#121110] flex items-center justify-center font-black text-sm text-[var(--color-ember)] shadow-[2.5px_2.5px_0px_#121110] select-none">
                    01
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider text-[var(--color-text-muted)]">TRACK</span>
                </div>
                <h4 className="font-black text-base text-[var(--color-text-dark)] leading-snug">Campus Checkpoints</h4>
                <p className="text-xs text-[var(--color-text-dark)] mt-1.5 font-medium leading-relaxed">
                  Physical QR markers across university venues.
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-dashed border-[var(--color-border-subtle)]">
                <div className="tilt-box-2 px-2.5 py-1 rounded bg-white border-2 border-[#121110] text-[10px] font-black text-[#121110] shadow-[2px_2px_0px_#121110] uppercase tracking-wider select-none">
                  Scan to Claim
                </div>
              </div>
            </div>

            {/* Card 02 */}
            <div className="p-5 rounded-2xl bg-white border-2 border-[var(--color-border-dark)] comic-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="tilt-box-3 h-9 w-9 rounded-lg bg-white border-2 border-[#121110] flex items-center justify-center font-black text-sm text-[var(--color-orange)] shadow-[2.5px_2.5px_0px_#121110] select-none">
                    02
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider text-[var(--color-text-muted)]">DUEL</span>
                </div>
                <h4 className="font-black text-base text-[var(--color-text-dark)] leading-snug">1v1 Mini-Game Duels</h4>
                <p className="text-xs text-[var(--color-text-dark)] mt-1.5 font-medium leading-relaxed">
                  Challenge peers in fast browser-based reaction duels.
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-dashed border-[var(--color-border-subtle)]">
                <div className="tilt-box-4 px-2.5 py-1 rounded bg-white border-2 border-[#121110] text-[10px] font-black text-[#121110] shadow-[2px_2px_0px_#121110] uppercase tracking-wider select-none">
                  Instant Match
                </div>
              </div>
            </div>

            {/* Card 03 */}
            <div className="p-5 rounded-2xl bg-white border-2 border-[var(--color-border-dark)] comic-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="tilt-box-5 h-9 w-9 rounded-lg bg-white border-2 border-[#121110] flex items-center justify-center font-black text-sm text-[var(--color-cyan)] shadow-[2.5px_2.5px_0px_#121110] select-none">
                    03
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider text-[var(--color-text-muted)]">RANKS</span>
                </div>
                <h4 className="font-black text-base text-[var(--color-text-dark)] leading-snug">Live Faction Standings</h4>
                <p className="text-xs text-[var(--color-text-dark)] mt-1.5 font-medium leading-relaxed">
                  Server-verified points ledger driving live ranks.
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-dashed border-[var(--color-border-subtle)]">
                <div className="tilt-box-6 px-2.5 py-1 rounded bg-white border-2 border-[#121110] text-[10px] font-black text-[#121110] shadow-[2px_2px_0px_#121110] uppercase tracking-wider select-none">
                  Realtime Ledger
                </div>
              </div>
            </div>

            {/* Card 04 */}
            <div className="p-5 rounded-2xl bg-white border-2 border-[var(--color-border-dark)] comic-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="tilt-box-2 h-9 w-9 rounded-lg bg-white border-2 border-[#121110] flex items-center justify-center font-black text-sm text-[var(--color-violet)] shadow-[2.5px_2.5px_0px_#121110] select-none">
                    04
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider text-[var(--color-text-muted)]">LOOT</span>
                </div>
                <h4 className="font-black text-base text-[var(--color-text-dark)] leading-snug">Milestone Badges</h4>
                <p className="text-xs text-[var(--color-text-dark)] mt-1.5 font-medium leading-relaxed">
                  Unlock exclusive festival perks &amp; sponsor coupons.
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-dashed border-[var(--color-border-subtle)]">
                <div className="tilt-box-1 px-2.5 py-1 rounded bg-white border-2 border-[#121110] text-[10px] font-black text-[#121110] shadow-[2px_2px_0px_#121110] uppercase tracking-wider select-none">
                  Perk Rewards
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
              <Badge variant="primary" className="text-xs">
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
                  Destination Status: Unconfigured &amp; Standalone
                </p>
                <p className="font-medium text-amber-950">
                  In accordance with the festival platform roadmap, the public website operates
                  strictly without student authentication or quest state. The Game Site entry URL
                  will be published upon official on-campus badge deployment.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[var(--color-border-subtle)] flex items-center justify-end gap-3">
              <Button
                variant="black"
                size="sm"
                onClick={() => setModalOpen(false)}
              >
                Understood &bull; Return to Website
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}