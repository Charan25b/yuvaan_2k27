"use client";

import React, { useEffect, useRef } from "react";

interface GameSiteEntryModalProps {
  open: boolean;
  onClose: () => void;
}

export function GameSiteEntryModal({ open, onClose }: GameSiteEntryModalProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    if (!open || !element) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    element.showModal();
    return () => {
      element.close();
      document.body.style.overflow = overflow;
      if (previous?.isConnected && previous !== document.body && previous.getClientRects().length) previous.focus();
      else document.querySelector<HTMLButtonElement>("[aria-controls='mobile-navigation']")?.focus();
    };
  }, [open]);
  if (!open) return null;

  return (
    <dialog
      ref={dialog}
      onCancel={onClose}
      aria-modal="true"
      aria-labelledby="game-site-modal-title"
      className="fixed inset-0 z-50 m-0 h-dvh w-screen max-h-none max-w-none border-0 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-[var(--color-surface)] border-2 border-[var(--color-border-dark)] comic-shadow-lg p-0 max-h-full overflow-y-auto text-left"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="comic-tape-amber h-3 w-full border-b-2 border-[var(--color-border-dark)]" />

        <div className="p-6">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)]">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-[var(--color-cream)] text-[var(--color-ember)] border border-[var(--color-border-dark)] comic-shadow-sm">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              Separate Experience
            </span>
            <button
              type="button"
              onClick={onClose}
              className="h-11 w-11 rounded-lg flex items-center justify-center font-black text-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-dark)] hover:bg-[var(--color-cream)] transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              &times;
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            <h3 id="game-site-modal-title" className="text-2xl font-black text-[var(--color-text-dark)] leading-tight">
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
              onClick={onClose}
              className="px-5 py-2 text-xs font-black uppercase tracking-wider rounded-xl bg-[#F2AE30] border-2 border-[#121110] shadow-[3.5px_3.5px_0px_#121110] text-[#121110] hover:bg-[#f04b2b] hover:text-white transition-all cursor-pointer"
            >
              Understood
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
