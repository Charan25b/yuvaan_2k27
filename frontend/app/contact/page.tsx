import React from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ContactInquiryForm } from "@/components/contact/ContactInquiryForm";

export function generateMetadata() {
  return {
    title: "Contact & Campus Desk | Yuvaan 2027",
    description: "Official contact information, campus address, and student festival desk for Yuvaan 2027 at IIIT Guwahati.",
  };
}

export default function ContactPage() {
  return (
    <div className="py-10 sm:py-16">
      <Container>
        <div className="flex flex-col gap-10 max-w-5xl mx-auto">
          {/* Header */}
          <div className="border-b-2 border-[var(--color-border-dark)] pb-8 text-center sm:text-left">
            <SectionHeading
              badge="Connect With Us"
              badgeVariant="primary"
              title="Official Contact &amp; Campus Desk"
              description="Have questions regarding event registrations, campus accommodations, corporate sponsorships, or press credentials? Reach out to the student organizing team at IIIT Guwahati."
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Official Info & Campus Location */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Campus Location Card */}
              <Card variant="comic" bgTint="peach" accentStrip="ember" className="p-2">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="primary" comicStamp className="text-[10px]">
                      CAMPUS LOCATION
                    </Badge>
                    <span className="text-base">📍</span>
                  </div>
                  <CardTitle className="text-2xl font-black">IIIT Guwahati</CardTitle>
                  <CardDescription className="text-xs sm:text-sm mt-2 text-[var(--color-text-dark)] font-medium leading-relaxed">
                    Indian Institute of Information Technology Guwahati
                    <br />
                    Bongora, Near SOS Children&apos;s Village
                    <br />
                    Kamrup, Assam 781015, India
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2 text-xs text-[var(--color-text-muted)] space-y-2 border-t border-[var(--color-border-subtle)]">
                  <div className="flex justify-between pt-2">
                    <span className="font-bold text-[var(--color-text-dark)]">Nearest Airport:</span>
                    <span className="font-extrabold text-[var(--color-ember)]">LGBI Airport (GAU) &bull; 4 km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-[var(--color-text-dark)]">Nearest Railway:</span>
                    <span className="font-extrabold text-[var(--color-text-dark)]">Kamakhya Junction &bull; 18 km</span>
                  </div>
                </CardContent>
              </Card>

              {/* Department Desks with Comic Styling */}
              <div className="flex flex-col gap-3">
                <div className="p-4 rounded-xl bg-[var(--tint-blush)] border-2 border-[var(--color-border-dark)] comic-shadow-sm text-xs">
                  <span className="font-black text-[var(--color-ember)] uppercase tracking-wider block">
                    General Inquiries &amp; Events Desk
                  </span>
                  <p className="font-black text-sm text-[var(--color-text-dark)] mt-0.5">
                    yuvaan@iiitg.ac.in
                  </p>
                  <span className="text-[11px] text-[var(--color-text-muted)] mt-0.5 block font-medium">
                    Event rules, eligibility, and stage coordination
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[var(--tint-cyan)] border-2 border-[var(--color-border-dark)] comic-shadow-sm text-xs">
                  <span className="font-black text-[var(--color-cyan)] uppercase tracking-wider block">
                    Corporate Partnerships &amp; Sponsors
                  </span>
                  <p className="font-black text-sm text-[var(--color-text-dark)] mt-0.5">
                    sponsorships.yuvaan@iiitg.ac.in
                  </p>
                  <span className="text-[11px] text-[var(--color-text-muted)] mt-0.5 block font-medium">
                    Brand activations, festival stalls, and stage sponsorships
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[var(--tint-gold)] border-2 border-[var(--color-border-dark)] comic-shadow-sm text-xs">
                  <span className="font-black text-amber-900 uppercase tracking-wider block">
                    Technical Board &amp; Web Platform
                  </span>
                  <p className="font-black text-sm text-[var(--color-text-dark)] mt-0.5">
                    techboard@iiitg.ac.in
                  </p>
                  <span className="text-[11px] text-[var(--color-text-muted)] mt-0.5 block font-medium">
                    HackQuest hackathons and web platform support
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Contact Inquiry Form Styled As Dispatch Card */}
            <div className="lg:col-span-7">
              <Card variant="comic" bgTint="white" className="p-4 sm:p-6 comic-shadow-lg">
                <CardHeader className="p-2 pb-4 border-b-2 border-[var(--color-border-dark)]">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="gold" comicStamp className="text-xs">
                      STUDENT DESK DISPATCH
                    </Badge>
                    <span className="text-xs font-black text-[var(--color-text-muted)]">FORM #2027</span>
                  </div>
                  <CardTitle className="text-2xl font-black">Send a Message</CardTitle>
                  <p className="text-xs sm:text-sm text-[var(--color-text-muted)] font-medium mt-1">
                    Direct inquiries are routed to the corresponding student committee coordinator.
                  </p>
                </CardHeader>

                <ContactInquiryForm />
              </Card>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
