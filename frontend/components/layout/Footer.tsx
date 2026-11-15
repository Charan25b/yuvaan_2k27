import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";

export function Footer() {
  const currentYear = 2027;

  return (
    <footer className="mt-auto bg-[var(--color-cream-canvas)] text-[var(--color-text-dark)] relative overflow-hidden">
      {/* Subtle halftone background */}
      <div className="absolute inset-0 comic-dots-subtle pointer-events-none opacity-40" />

      <Container className="relative z-10 py-8 lg:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1.3fr_1.3fr_1.5fr_1.5fr_1.8fr] gap-x-6 gap-y-8">
          {/* Festival identity */}
          <div className="md:col-span-2 xl:col-span-2 xl:mt-10">
            <Link href="/" className="flex items-center gap-3">
              <span className="grid h-[52px] w-[52px] shrink-0 place-items-center overflow-hidden rounded-lg border border-[#142039] bg-white">
                <Image src="/brand/yuvaan-logo.jpg" alt="" width={52} height={52} sizes="52px" className="h-full w-full object-contain" />
              </span>
              <span>
                <span className="block whitespace-nowrap text-[27px] leading-none" style={{ fontFamily: "var(--font-bangers), Impact, sans-serif" }}>
                  YUVAAN 2027
                </span>
                <span className="mt-1 block text-xs font-bold" style={{ fontFamily: "var(--font-barlow), Arial, sans-serif" }}>
                  IIIT Guwahati Annual Cultural &amp; Technical Festival
                </span>
              </span>
            </Link>
          </div>

          {/* Column 1: Festival Program */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 border-b-2 border-[var(--color-ember)] pb-1 w-fit">
              <span className="h-2 w-2 rounded-full bg-[var(--color-ember)]" />
              <h4 className="text-xs font-black tracking-wider text-[var(--color-text-dark)] uppercase">
                Festival Program
              </h4>
            </div>
            <ul className="flex flex-col gap-2.5 text-sm font-bold text-[var(--color-text-muted)]" style={{ fontFamily: "var(--font-barlow), Arial, sans-serif" }}>
              <li>
                <Link href="/events" className="hover:text-[var(--color-ember)] hover:translate-x-1 transition-all inline-block whitespace-nowrap">
                  &rarr; All Events &amp; Arenas
                </Link>
              </li>
              <li>
                <Link href="/schedule" className="hover:text-[var(--color-ember)] hover:translate-x-1 transition-all inline-block whitespace-nowrap">
                  &rarr; Day-by-Day Schedule
                </Link>
              </li>
              <li>
                <Link href="/merchandise" className="hover:text-[var(--color-ember)] hover:translate-x-1 transition-all inline-block whitespace-nowrap">
                  &rarr; Official Merchandise
                </Link>
              </li>
              <li>
                <Link href="/sponsors" className="hover:text-[var(--color-ember)] hover:translate-x-1 transition-all inline-block whitespace-nowrap">
                  &rarr; Festival Sponsors
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Community & Media */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 border-b-2 border-[var(--color-cyan)] pb-1 w-fit">
              <span className="h-2 w-2 rounded-full bg-[var(--color-cyan)]" />
              <h4 className="text-xs font-black tracking-wider text-[var(--color-text-dark)] uppercase">
                Community &amp; Media
              </h4>
            </div>
            <ul className="flex flex-col gap-2.5 text-sm font-bold text-[var(--color-text-muted)]" style={{ fontFamily: "var(--font-barlow), Arial, sans-serif" }}>
              <li>
                <Link href="/gallery" className="hover:text-[var(--color-cyan)] hover:translate-x-1 transition-all inline-block whitespace-nowrap">
                  &rarr; Photo Archives &amp; Gallery
                </Link>
              </li>
              <li>
                <Link href="/team" className="hover:text-[var(--color-cyan)] hover:translate-x-1 transition-all inline-block whitespace-nowrap">
                  &rarr; Organizing Committees
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[var(--color-cyan)] hover:translate-x-1 transition-all inline-block whitespace-nowrap">
                  &rarr; Contact &amp; Desk Inquiries
                </Link>
              </li>
            </ul>
          </div>

          {/* Campus details */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 border-b-2 border-[var(--color-yellow)] pb-1 w-fit">
              <span className="h-2 w-2 rounded-full bg-[var(--color-yellow)]" />
              <h4 className="text-xs font-black tracking-wider text-[var(--color-text-dark)] uppercase">
                Campus Location
              </h4>
            </div>
            <div className="rounded-xl bg-white p-3.5 border-2 border-[var(--color-border-dark)] comic-shadow-sm text-xs text-[var(--color-text-muted)] leading-relaxed space-y-1">
              <p className="font-extrabold text-[var(--color-text-dark)] text-sm">IIIT Guwahati</p>
              <p className="font-medium">Bongora, Near SOS Village</p>
              <p className="font-medium">Kamrup, Assam 781015</p>
              <div className="pt-2 border-t border-[var(--color-border-subtle)] flex items-center justify-between text-[11px] font-bold text-[var(--color-ember)]">
                <span>SAC &amp; Technical Board</span>
                <span className="text-[var(--color-text-dark)]">&#10022; 2027</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar styled as comic strip credit */}
        <div className="mt-8 pt-6 border-t-2 border-[var(--color-border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-[var(--color-text-muted)]">
          <p className="flex items-center gap-2">
            <span>&copy; {currentYear} Yuvaan, IIIT Guwahati.</span>
            <span className="hidden sm:inline">&bull;</span>
            <span className="text-[var(--color-text-dark)]">Festival Foundation v1.0</span>
          </p>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/" className="hover:text-[var(--color-ember)] transition-colors">
              Home
            </Link>
            <Link href="/events" className="hover:text-[var(--color-ember)] transition-colors">
              Events
            </Link>
            <Link href="/schedule" className="hover:text-[var(--color-ember)] transition-colors">
              Schedule
            </Link>
            <Link href="/merchandise" className="hover:text-[var(--color-ember)] transition-colors">
              Merchandise
            </Link>
            <Link href="/contact" className="hover:text-[var(--color-ember)] transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
