import Link from "next/link";
import Image from "next/image";
import { R2D2SpaceLayer } from "@/components/effects/R2D2SpaceLayer";
import styles from "./page.module.css";
import { SPONSORS_DATA, type SponsorItem } from "@/lib/data/festivalData";

const hiddenPlaceholderNames = new Set([
  "National Technology Partner",
  "Regional Innovation Board",
  "Audio & Entertainment Collective",
  "Campus Refreshment Brand",
  "Gaming Gear Manufacturer",
  "Youth Media Network",
]);

const sponsorPlaceholders: SponsorItem[] = [
  {
    id: "placeholder-title",
    name: "Title sponsor to be announced",
    tier: "Title Sponsor",
    description: "",
    category: "PLACEHOLDER",
  },
  {
    id: "placeholder-powered-by",
    name: "Powered by sponsor to be announced",
    tier: "Powered By",
    description: "",
    category: "PLACEHOLDER",
  },
  {
    id: "placeholder-event-partner",
    name: "Event partner to be announced",
    tier: "Associate Partner",
    description: "",
    category: "PLACEHOLDER",
  },
];

function isPlaceholder(sponsor: SponsorItem) {
  return sponsor.category === "PLACEHOLDER";
}

function StarField() {
  return (
    <svg className={styles.stars} aria-hidden="true" focusable="false">
      <defs>
        <pattern id="sponsor-stars" width="180" height="170" patternUnits="userSpaceOnUse">
          <circle cx="17" cy="22" r="0.8" />
          <circle cx="94" cy="14" r="0.6" />
          <circle cx="149" cy="51" r="0.7" />
          <circle cx="54" cy="87" r="0.55" />
          <circle cx="126" cy="111" r="0.8" />
          <circle cx="30" cy="147" r="0.65" />
          <circle cx="168" cy="158" r="0.55" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#sponsor-stars)" />
    </svg>
  );
}

function DeathStar() {
  return (
    <Image
      src="/sponsors/death_star.png"
      alt=""
      width={812}
      height={811}
      sizes="(max-width: 700px) 440px, 560px"
      className={styles.deathStar}
      aria-hidden="true"
    />
  );
}

function TierHeading({
  id,
  number,
  title,
  tone,
}: {
  id: string;
  number: string;
  title: string;
  tone: "yellow" | "cyan" | "silver";
}) {
  return (
    <div className={styles.tierHeading} data-tone={tone}>
      <span className={styles.tierNumber}>TIER {number}</span>
      <h2 id={id}>{title}</h2>
      <span className={styles.tierRule} aria-hidden="true" />
    </div>
  );
}

function AnnouncementPanel({
  label,
  large = false,
}: {
  label: string;
  large?: boolean;
}) {
  return (
    <div className={styles.announcementPanel}>
      <div className={styles.announcementGrid} aria-hidden="true">
        {Array.from({ length: 24 }, (_, index) => (
          <span key={index} />
        ))}
      </div>
      <span className={styles.panelLabel}>{label}</span>
      <strong
        className={`${styles.panelTitle} ${large ? styles.panelTitleLarge : ""}`}
      >
        {large ? (
          <>
            ANNOUNCEMENT
            <br />
            INCOMING
          </>
        ) : (
          "ANNOUNCEMENT INCOMING"
        )}
      </strong>
    </div>
  );
}

function SponsorStatus({ sponsor }: { sponsor: SponsorItem }) {
  return (
    <span className={styles.statusTag}>
      {isPlaceholder(sponsor) ? "TO BE REVEALED" : sponsor.category}
    </span>
  );
}

function SponsorDescription({ sponsor }: { sponsor: SponsorItem }) {
  if (isPlaceholder(sponsor) || !sponsor.description.trim()) return null;
  return <p className={styles.sponsorDescription}>{sponsor.description}</p>;
}

function TitleSponsorCard({ sponsor, index }: { sponsor: SponsorItem; index: number }) {
  return (
    <article className={styles.titleCard} data-tone="yellow" data-r2-block>
      <AnnouncementPanel label={sponsor.tier.toUpperCase()} large />
      <div className={styles.titleCardDetails}>
        <SponsorStatus sponsor={sponsor} />
        <h3>{sponsor.name}</h3>
        <SponsorDescription sponsor={sponsor} />
        <div className={styles.titleCardMeta}>
          {String(index + 1).padStart(2, "0")} <span>/</span> {sponsor.tier.toUpperCase()}
        </div>
      </div>
    </article>
  );
}

function PartnerCard({
  sponsor,
  index,
  featured = false,
}: {
  sponsor: SponsorItem;
  index: number;
  featured?: boolean;
}) {
  return (
    <article
      className={styles.partnerCard}
      data-tone={featured ? "cyan" : "silver"}
      data-r2-block
    >
      <AnnouncementPanel label={sponsor.tier.toUpperCase()} />
      <div className={styles.partnerCardDetails}>
        <SponsorStatus sponsor={sponsor} />
        <h3>{sponsor.name}</h3>
        <SponsorDescription sponsor={sponsor} />
      </div>
      <div className={styles.partnerCardMeta}>
        <span>{featured ? "YUVAAN 2027" : sponsor.tier.toUpperCase()}</span>
        {featured && <span>{String(index + 1).padStart(2, "0")}</span>}
      </div>
    </article>
  );
}

export default function SponsorsPage() {
  const confirmedSponsors = SPONSORS_DATA.filter(
    (sponsor) => !hiddenPlaceholderNames.has(sponsor.name)
  );
  const sponsors = confirmedSponsors.length ? confirmedSponsors : sponsorPlaceholders;
  const titleSponsors = sponsors.filter((sponsor) => sponsor.tier === "Title Sponsor");
  const poweredBy = sponsors.filter((sponsor) => sponsor.tier === "Powered By");
  const partners = sponsors.filter(
    (sponsor) =>
      sponsor.tier === "Associate Partner" ||
      sponsor.tier === "Media & Beverage Partner"
  );

  return (
    <div className={styles.page} data-sponsor-page>
      <div className={styles.background} aria-hidden="true">
        <StarField />
        <DeathStar />
      </div>
      <R2D2SpaceLayer />

      <div className={styles.content}>
        <section className={styles.hero} aria-labelledby="sponsors-title">
          <p className={styles.eyebrow}>
            YUVAAN 2027 <span>/</span> THE ALLIANCE
          </p>
          <h1 id="sponsors-title">SPONSORS</h1>
          <p className={styles.tagline}>THE FORCE BEHIND YUVAAN.</p>
          <span className={styles.heroRule} aria-hidden="true" />
        </section>

        <div className={styles.tiers}>
          {titleSponsors.length > 0 && (
            <section className={styles.tierSection} aria-labelledby="title-sponsor-tier">
              <TierHeading id="title-sponsor-tier" number="01" title="TITLE SPONSOR" tone="yellow" />
              <div className={styles.titleCards}>
                {titleSponsors.map((sponsor, index) => (
                  <TitleSponsorCard key={sponsor.id} sponsor={sponsor} index={index} />
                ))}
              </div>
            </section>
          )}

          {poweredBy.length > 0 && (
            <section className={styles.tierSection} aria-labelledby="powered-by-tier">
              <TierHeading id="powered-by-tier" number="02" title="POWERED BY" tone="cyan" />
              <div className={styles.poweredGrid}>
                {poweredBy.map((sponsor, index) => (
                  <PartnerCard
                    key={sponsor.id}
                    sponsor={sponsor}
                    index={index + 1}
                    featured
                  />
                ))}
              </div>
            </section>
          )}

          {partners.length > 0 && (
            <section className={styles.tierSection} aria-labelledby="partners-tier">
              <TierHeading id="partners-tier" number="03" title="EVENT & MEDIA PARTNERS" tone="silver" />
              <div className={styles.partnerGrid}>
                {partners.map((sponsor, index) => (
                  <PartnerCard key={sponsor.id} sponsor={sponsor} index={index + 1} />
                ))}
              </div>
            </section>
          )}
        </div>

        <section className={styles.contactPanel} data-r2-block aria-labelledby="sponsor-contact-title">
          <div>
            <p className={styles.contactEyebrow}>SPONSOR YUVAAN</p>
            <h2 id="sponsor-contact-title">Sponsorship enquiries</h2>
            <p>Contact us to discuss sponsorship for Yuvaan 2027.</p>
          </div>
          <Link className={styles.contactLink} href="/contact">
            <span>CONTACT THE TEAM</span>
            <svg viewBox="0 0 18 18" aria-hidden="true" focusable="false">
              <path d="M4 14 14 4M5 4h9v9" />
            </svg>
          </Link>
        </section>
        <p className={styles.modelCredit}>
          3D model: <a href="https://sketchfab.com/3d-models/r2d2-e9eca957d4224766b45c5ace176e13be" target="_blank" rel="noreferrer">R2D2 by Dudu Oliveira</a>
          <span aria-hidden="true"> · </span>
          <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>
        </p>
      </div>
    </div>
  );
}
