"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GameSiteEntryModal } from "@/components/ui/GameSiteEntryModal";
import styles from "./Navbar.module.css";

const navItems = [
  ["Events", "/events"], ["Schedule", "/schedule"],
  ["Merchandise", "/merchandise"], ["Sponsors", "/sponsors"],
  ["Team", "/team"], ["Gallery", "/gallery"], ["Contact", "/contact"],
] as const;

export function Navbar() {
  const pathname = usePathname();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const [gameModalOpen, setGameModalOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const header = useRef<HTMLElement>(null);
  const menuOpen = openPath === pathname;
  const close = () => setOpenPath(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenPath(null);
        toggle.current?.focus();
      }
    };
    const onOutside = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) setOpenPath(null);
    };
    const desktop = matchMedia("(min-width: 1100px)");
    const onResize = () => { if (desktop.matches) setOpenPath(null); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onOutside, { passive: true });
    desktop.addEventListener("change", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onOutside);
      desktop.removeEventListener("change", onResize);
    };
  }, [menuOpen]);

  const links = navItems.map(([label, href]) => (
    <Link key={href} href={href} onClick={close}
      aria-current={pathname === href || pathname.startsWith(`${href}/`) ? "page" : undefined}>
      {label}<span className={styles.linkArrow} aria-hidden="true">↗</span>
    </Link>
  ));
  const gameAction = () => { close(); setGameModalOpen(true); };
  const gameEntryContent = (
    <>
      <span className={styles.pulseIndicator} aria-hidden="true">
        <span className={styles.pulse} />
        <span className={styles.dot} />
      </span>
      <span>✦ Game Site Entry →</span>
    </>
  );

  return (
    <>
      <header ref={header} className={`${styles.header} ${pathname === "/" ? styles.dark : ""}`}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) close();
        }}>
        <div className={styles.bar}>
          <Link href="/" onClick={close} className={styles.brand} aria-label="YUVAAN 2027 — IIIT Guwahati home">
            <span className={styles.emblem} aria-hidden="true">
              <svg viewBox="0 0 24 32" fill="currentColor"><path d="M13 0 2 18h8L8 32l14-20h-9z" /></svg>
            </span>
            <span><span className={styles.wordmark}>YUVAAN <small>2027</small></span>
              <span className={styles.institute}>IIIT GUWAHATI</span></span>
          </Link>
          <nav className={styles.desktopLinks} aria-label="Main navigation">{links}</nav>
          <button className={`${styles.gameButton} ${styles.desktopAction}`} onClick={gameAction}>
            {gameEntryContent}
          </button>
          <button ref={toggle} className={styles.toggle} aria-controls="mobile-navigation"
            aria-expanded={menuOpen} aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setOpenPath(menuOpen ? null : pathname)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d={menuOpen ? "M6 6l12 12M6 18 18 6" : "M5 7h14M5 12h14M5 17h14"} />
            </svg>
          </button>
        </div>
        <div id="mobile-navigation" className={styles.drawer} hidden={!menuOpen}>
          <nav aria-label="Mobile navigation">{links}</nav>
          <button className={styles.gameButton} onClick={gameAction}>{gameEntryContent}</button>
          <p className={styles.caption}>FEBRUARY 2027 · IIIT GUWAHATI</p>
        </div>
      </header>
      <GameSiteEntryModal open={gameModalOpen} onClose={() => setGameModalOpen(false)} />
    </>
  );
}
