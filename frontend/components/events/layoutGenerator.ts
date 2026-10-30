import { EventItem } from "@/lib/data/festivalData";
import { ComicBookData, WebChain, COMIC_THEMES } from "./types";
import { PhysicalCard, PhysicalWebMidpoint } from "./physics";

export interface GeneratedLayout {
  chains: WebChain[];
  totalHeight: number;
  cardW: number;
  cardH: number;
}

/**
 * Rolls procedural tilt angle with comic diamond variance
 */
function rollAngle(isDiamond: boolean): number {
  const sign = Math.random() < 0.5 ? -1 : 1;
  let mag: number;
  if (isDiamond) {
    mag = 0.72 + (Math.random() - 0.5) * 0.16; // ~38° to 48° (Diamond slant)
  } else {
    const r = Math.random();
    if (r < 0.6) mag = 0.38 + (Math.random() - 0.5) * 0.16; // ~18° to 27° (Expressive)
    else mag = 0.22 + (Math.random() - 0.5) * 0.10; // ~11° to 17° (Mellow)
  }
  return sign * mag;
}

/**
 * Generates procedurally placed hanging chains with guaranteed non-parallel & non-complementary angles
 */
export function generateWebChains(
  events: EventItem[],
  width: number,
  isMobile: boolean
): GeneratedLayout {
  const cardW = isMobile ? 240 : 280;
  const cardH = isMobile ? 330 : 380;
  // Snug initial drop from ceiling so the first cards sit high and visible
  const topWebGap = isMobile ? 70 : 85;

  // Prepare comic books data in defined issue order (1 to 10)
  const comicItems: ComicBookData[] = events.slice(0, 10).map((ev, idx) => {
    const theme = COMIC_THEMES[idx % COMIC_THEMES.length];
    return {
      event: ev,
      issueNumber: idx + 1,
      bgColor: theme.bgColor,
      accentColor: theme.accentColor,
      burstText: theme.burstText,
    };
  });

  const leftAngles: number[] = [];
  const rightAngles: number[] = [];
  const leftOffsets: number[] = [];
  const rightOffsets: number[] = [];

  // Stagger diamond placements between left and right so their shapes are completely unsynchronized
  // Left chain has diamonds at index 1 and 3; Right chain has diamonds at index 0 and 2
  for (let i = 0; i < 5; i++) {
    const lAngle = rollAngle(i === 1 || i === 3);
    let rAngle = rollAngle(i === 0 || i === 2);

    // 1. Ensure NON-PARALLEL
    if (Math.sign(lAngle) === Math.sign(rAngle) && Math.abs(lAngle - rAngle) < 0.28) {
      rAngle = -rAngle;
    }

    // 2. Ensure NON-COMPLEMENTARY
    if (Math.abs(lAngle + rAngle) < 0.16) {
      if (Math.abs(lAngle) > 0.5) {
        rAngle = Math.sign(rAngle) * (0.24 + Math.random() * 0.12);
      } else {
        rAngle = Math.sign(rAngle) * (0.68 + Math.random() * 0.18);
      }
    }

    leftAngles.push(lAngle);
    rightAngles.push(rAngle);

    leftOffsets.push(Math.sign(lAngle) * (55 + Math.random() * 45));
    rightOffsets.push(Math.sign(rAngle) * (55 + Math.random() * 45));
  }

  const chains: WebChain[] = [];

  const initChain = (
    chainIdx: number,
    chainBooks: ComicBookData[],
    anchorFraction: number,
    chainAngles: number[],
    chainOffsets: number[]
  ) => {
    const anchorX = width * anchorFraction;
    const ceilingAnchor = { x: anchorX, y: 0 };
    const chainCards: PhysicalCard[] = [];
    const chainMidpoints: PhysicalWebMidpoint[] = [];

    let currentRestY = topWebGap;

    chainBooks.forEach((comic, idx) => {
      const restAngle = chainAngles[idx % chainAngles.length];
      const offset = chainOffsets[idx % chainOffsets.length];

      // Ensure non-clipping boundary with center corridor and screen edges
      const cosA = Math.abs(Math.cos(restAngle));
      const sinA = Math.abs(Math.sin(restAngle));
      const halfW = (cardW / 2) * cosA + (cardH / 2) * sinA;

      let restX = anchorX + offset;
      if (!isMobile) {
        if (chainIdx === 0) {
          // Left chain right edge cannot cross center corridor
          const maxAllowed = width * 0.50 - 25;
          if (restX + halfW > maxAllowed) {
            restX = maxAllowed - halfW;
          }
          if (restX - halfW < 20) {
            restX = 20 + halfW;
          }
        } else {
          // Right chain left edge cannot cross center corridor
          const minAllowed = width * 0.50 + 25;
          if (restX - halfW < minAllowed) {
            restX = minAllowed + halfW;
          }
          if (restX + halfW > width - 20) {
            restX = width - 20 - halfW;
          }
        }
      }

      // Web Gap: snug top drop, generous inter-card silk
      const webGap = idx === 0 ? topWebGap : Math.round(240 + Math.random() * 50);
      currentRestY += webGap + cardH / 2;
      const restY = currentRestY;

      // Varied lateral corner attachments
      const lateralCorner = Math.sign(restAngle) > 0 ? cardW * 0.28 : -cardW * 0.28;
      const topAttachOffset = {
        x: -lateralCorner + (Math.random() - 0.5) * 24,
        y: -cardH * (0.38 + Math.random() * 0.08),
      };
      const bottomAttachOffset = {
        x: lateralCorner + (Math.random() - 0.5) * 24,
        y: cardH * (0.38 + Math.random() * 0.08),
      };

      // Initial drop position
      const initialY = restY - 140 - idx * 25;
      const initialX = restX + (Math.random() - 0.5) * 20;

      const card = new PhysicalCard(
        initialX,
        initialY,
        restX,
        restY,
        restAngle,
        cardW,
        cardH,
        comic,
        topAttachOffset,
        bottomAttachOffset
      );
      chainCards.push(card);

      const fromCardIdx = idx === 0 ? -1 : idx - 1;
      const toCardIdx = idx;
      const midX = (anchorX + restX) / 2;
      const midY = initialY - cardH / 2 - webGap / 2;
      chainMidpoints.push(
        new PhysicalWebMidpoint(midX, midY, chainIdx, fromCardIdx, toCardIdx)
      );

      currentRestY += cardH / 2;
    });

    chains.push({
      id: chainIdx,
      anchorX,
      ceilingAnchor,
      cards: chainCards,
      webMidpoints: chainMidpoints,
    });
  };

  if (isMobile) {
    // Mobile: 1 centered hanging chain of 10 books in defined order (Issues 1 to 10)
    const mobileAngles: number[] = [];
    const mobileOffsets: number[] = [];
    for (let i = 0; i < 10; i++) {
      const sign = i % 2 === 0 ? -1 : 1;
      const isDiamond = i % 3 === 1;
      const mag = isDiamond ? 0.68 + Math.random() * 0.20 : 0.32 + Math.random() * 0.18;
      mobileAngles.push(sign * mag);
      mobileOffsets.push(sign * (45 + Math.random() * 35));
    }
    initChain(0, comicItems, 0.5, mobileAngles, mobileOffsets);
  } else {
    // Desktop: 2 balanced chains in defined order:
    // Left Chain: Issues 1 to 5
    // Right Chain: Issues 6 to 10
    initChain(0, comicItems.slice(0, 5), 0.30, leftAngles, leftOffsets);
    initChain(1, comicItems.slice(5, 10), 0.70, rightAngles, rightOffsets);
  }

  const maxChainY = Math.max(
    ...chains.map((c) => c.cards[c.cards.length - 1].restY + cardH / 2 + 350)
  );

  return {
    chains,
    totalHeight: maxChainY,
    cardW,
    cardH,
  };
}
