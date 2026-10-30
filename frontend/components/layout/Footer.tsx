import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";

export function Footer() {
  const currentYear = 2027;

  return (
    <footer className="mt-auto bg-[var(--color-cream-canvas)] text-[var(--color-text-dark)] relative overflow-hidden">
      {/* Subtle halftone background */}
      <div className="absolute inset-0 comic-dots-subtle pointer-events-none opacity-40" />

      <Container className="relative z-10 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Festival Identity */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-ember)] text-white font-black text-xl border-2 border-[var(--color-border-dark)] comic-shadow-sm rotate-[-2deg]">
                Y
              </span>
              <div>
                <span className="font-black text-2xl tracking-tight text-[var(--color-text-dark)] flex items-center gap-2">
                  YUVAAN 2027
                  <Badge variant="gold" className="text-[10px] py-0 px-1.5">
                    VOL. 27
                  </Badge>
                </span>
                <p className="text-xs font-bold text-[var(--color-text-muted)]">
                  IIIT Guwahati Annual Cultural &amp; Technical Festival
                </p>
              </div>
            </div>

            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed max-w-sm font-medium">
              The premier annual gathering uniting student talent across Northeast India
              and beyond. Three high-octane days of engineering hackathons, musical spectacles,
              esports tournaments, and campus celebrations.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[var(--color-border-dark)] comic-shadow-sm text-xs font-bold text-[var(--color-text-dark)]">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Public Information Portal</span>
              </div>
              <Badge variant="cyan" className="text-[10px]">
                Open Access
              </Badge>
            </div>
          </div>

          {/* Column 1: Festival Program */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 border-b-2 border-[var(--color-ember)] pb-1 w-fit">
              <span className="h-2 w-2 rounded-full bg-[var(--color-ember)]" />
              <h4 className="text-xs font-black tracking-wider text-[var(--color-text-dark)] uppercase">
                Festival Program
              </h4>
            </div>
            <ul className="flex flex-col gap-2.5 text-sm font-bold text-[var(--color-text-muted)]">
              <li>
                <Link href="/events" className="hover:text-[var(--color-ember)] hover:translate-x-1 transition-all inline-block">
                  &rarr; All Events &amp; Arenas
                </Link>
              </li>
              <li>
                <Link href="/schedule" className="hover:text-[var(--color-ember)] hover:translate-x-1 transition-all inline-block">
                  &rarr; Day-by-Day Schedule
                </Link>
              </li>
              <li>
                <Link href="/merchandise" className="hover:text-[var(--color-ember)] hover:translate-x-1 transition-all inline-block">
                  &rarr; Official Merchandise
                </Link>
              </li>
              <li>
                <Link href="/sponsors" className="hover:text-[var(--color-ember)] hover:translate-x-1 transition-all inline-block">
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
            <ul className="flex flex-col gap-2.5 text-sm font-bold text-[var(--color-text-muted)]">
              <li>
                <Link href="/gallery" className="hover:text-[var(--color-cyan)] hover:translate-x-1 transition-all inline-block">
                  &rarr; Photo Archives &amp; Gallery
                </Link>
              </li>
              <li>
                <Link href="/team" className="hover:text-[var(--color-cyan)] hover:translate-x-1 transition-all inline-block">
                  &rarr; Organizing Committees
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[var(--color-cyan)] hover:translate-x-1 transition-all inline-block">
                  &rarr; Contact &amp; Desk Inquiries
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Campus Details */}
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
                <span className="text-[var(--color-text-dark)]">✦ 2027</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar styled as comic strip credit */}
        <div className="mt-12 pt-8 border-t-2 border-[var(--color-border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-[var(--color-text-muted)]">
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
