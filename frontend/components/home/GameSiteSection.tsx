"use client";

import React, { useState } from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GameSiteEntryModal } from "@/components/ui/GameSiteEntryModal";

export function GameSiteSection() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section data-home-section="quest" className="py-14 sm:py-20 relative">
      <Container>
        <div className="flex flex-col gap-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b-2 border-black/25 pb-6">
            <SectionHeading
              badge="Quest Arena · Interactive Game Site"
              badgeVariant="highlight"
              title="The Campus Quest Arena"
              description="Scan campus checkpoints, challenge other attendees in quick mini-games, and earn points for your faction."
              className="home-section-heading"
            />
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="group inline-flex shrink-0 items-center gap-2 px-5 py-3 text-sm font-black uppercase tracking-wide rounded-lg bg-[#F2AE30] text-[#121110] border-2 border-[#121110] shadow-[4px_4px_0px_#121110] transition-all cursor-pointer select-none"
            >
              <span className="relative flex h-3 w-3" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 group-hover:bg-green-400 opacity-75 transition-colors" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600 group-hover:bg-[#22c55e] transition-colors shadow-[0_0_8px_#ef4444] group-hover:shadow-[0_0_8px_#22c55e]" />
              </span>
              <span>✦ Game Site Entry &rarr;</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 01 */}
            <div className="quest-feature-card p-5 rounded-2xl bg-white border-2 border-[var(--color-border-dark)] comic-shadow flex flex-col justify-between">
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
            <div className="quest-feature-card p-5 rounded-2xl bg-white border-2 border-[var(--color-border-dark)] comic-shadow flex flex-col justify-between">
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
            <div className="quest-feature-card p-5 rounded-2xl bg-white border-2 border-[var(--color-border-dark)] comic-shadow flex flex-col justify-between">
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
            <div className="quest-feature-card p-5 rounded-2xl bg-white border-2 border-[var(--color-border-dark)] comic-shadow flex flex-col justify-between">
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

      <GameSiteEntryModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </section>
  );
}
