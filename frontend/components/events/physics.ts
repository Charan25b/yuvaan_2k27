import { ComicBookData, WebChain } from "./types";

export class PhysicalCard {
  x: number;
  y: number;
  vx = 0;
  vy = 0;
  angle: number;
  angularVelocity = 0;
  restAngle: number;
  restX: number;
  restY: number;
  cardWidth: number;
  cardHeight: number;
  comic: ComicBookData;
  topAttachOffset: { x: number; y: number };
  bottomAttachOffset: { x: number; y: number };

  constructor(
    initX: number,
    initY: number,
    restX: number,
    restY: number,
    restAngle: number,
    cardWidth: number,
    cardHeight: number,
    comic: ComicBookData,
    topAttachOffset: { x: number; y: number },
    bottomAttachOffset: { x: number; y: number }
  ) {
    this.x = initX;
    this.y = initY;
    this.restX = restX;
    this.restY = restY;
    this.restAngle = restAngle;
    this.angle = restAngle;
    this.cardWidth = cardWidth;
    this.cardHeight = cardHeight;
    this.comic = comic;
    this.topAttachOffset = topAttachOffset;
    this.bottomAttachOffset = bottomAttachOffset;
  }

  // World position of top attachment point
  getTopAttachWorld(): { x: number; y: number } {
    const cos = Math.cos(this.angle);
    const sin = Math.sin(this.angle);
    return {
      x: this.x + this.topAttachOffset.x * cos - this.topAttachOffset.y * sin,
      y: this.y + this.topAttachOffset.x * sin + this.topAttachOffset.y * cos,
    };
  }

  // World position of bottom attachment point
  getBottomAttachWorld(): { x: number; y: number } {
    const cos = Math.cos(this.angle);
    const sin = Math.sin(this.angle);
    return {
      x: this.x + this.bottomAttachOffset.x * cos - this.bottomAttachOffset.y * sin,
      y: this.y + this.bottomAttachOffset.x * sin + this.bottomAttachOffset.y * cos,
    };
  }
}

export class PhysicalWebMidpoint {
  x: number;
  y: number;
  vx = 0;
  vy = 0;
  chainIndex: number;
  fromCardIndex: number; // -1 if ceiling anchor
  toCardIndex: number;
  isDragging = false;

  constructor(
    x: number,
    y: number,
    chainIndex: number,
    fromCardIndex: number,
    toCardIndex: number
  ) {
    this.x = x;
    this.y = y;
    this.chainIndex = chainIndex;
    this.fromCardIndex = fromCardIndex;
    this.toCardIndex = toCardIndex;
  }
}

/**
 * Step forward the physics simulation for all chains
 */
export function updateWebChainsPhysics(
  chains: WebChain[],
  activeDragCard: PhysicalCard | null,
  width: number,
  isMobile: boolean
): void {
  for (const chain of chains) {
    // 1. Cards Update
    for (let i = 0; i < chain.cards.length; i++) {
      const c = chain.cards[i];

      if (activeDragCard !== c) {
        // Gravity
        c.vy += 0.55;

        // Restitution spring pulling toward natural resting pose
        c.vx += (c.restX - c.x) * 0.018;
        c.vy += (c.restY - c.y) * 0.024;

        // Elastic coupling with adjacent cards in the SAME chain
        if (i > 0) {
          const prev = chain.cards[i - 1];
          const dy = c.y - prev.y;
          const targetDy = c.restY - prev.restY;
          const diffY = dy - targetDy;

          c.vy -= diffY * 0.015;
          prev.vy += diffY * 0.010;

          const dx = c.x - prev.x;
          const targetDx = c.restX - prev.restX;
          const diffX = dx - targetDx;

          c.vx -= diffX * 0.015;
          prev.vx += diffX * 0.010;

          // Non-penetration separator: strictly within SAME chain
          const minDist = (prev.cardHeight + c.cardHeight) * 0.44;
          if (dy < minDist) {
            const push = (minDist - dy) * 0.4;
            c.y += push;
            c.vy = Math.max(c.vy, 0);
            prev.y -= push * 0.25;
            prev.vy = Math.min(prev.vy, 0);
          }
        }

        // Air damping
        c.vx *= 0.94;
        c.vy *= 0.94;

        // Clamp max velocity to eliminate any explosive jumping
        const speed = Math.hypot(c.vx, c.vy);
        if (speed > 25) {
          c.vx = (c.vx / speed) * 25;
          c.vy = (c.vy / speed) * 25;
        }

        c.x += c.vx;
        c.y += c.vy;

        // Inter-chain non-clipping boundary protection
        if (!isMobile && chains.length >= 2) {
          const cosA = Math.abs(Math.cos(c.angle));
          const sinA = Math.abs(Math.sin(c.angle));
          const halfW = (c.cardWidth / 2) * cosA + (c.cardHeight / 2) * sinA;

          if (chain.id === 0) {
            // Left chain cards stay strictly left of the center corridor
            const maxAllowed = width * 0.50 - 25;
            if (c.x + halfW > maxAllowed) {
              const push = c.x + halfW - maxAllowed;
              c.x -= push;
              c.vx = Math.min(c.vx, 0) - push * 0.08;
            }
            if (c.x - halfW < 15) {
              const push = 15 - (c.x - halfW);
              c.x += push;
              c.vx = Math.max(c.vx, 0);
            }
          } else if (chain.id === 1) {
            // Right chain cards stay strictly right of the center corridor
            const minAllowed = width * 0.50 + 25;
            if (c.x - halfW < minAllowed) {
              const push = minAllowed - (c.x - halfW);
              c.x += push;
              c.vx = Math.max(c.vx, 0) + push * 0.08;
            }
            if (c.x + halfW > width - 15) {
              const push = c.x + halfW - (width - 15);
              c.x -= push;
              c.vx = Math.min(c.vx, 0);
            }
          }
        }
      }

      // Slanted Equilibrium Angular Physics
      const angleDiff = c.restAngle - c.angle;
      c.angularVelocity += angleDiff * 0.075;
      // Dynamic swing lean: tilts into horizontal motion
      c.angularVelocity += c.vx * 0.0025;
      // Angular damping
      c.angularVelocity *= 0.88;
      // Clamp angular speed
      c.angularVelocity = Math.max(-0.2, Math.min(0.2, c.angularVelocity));
      c.angle += c.angularVelocity;
    }

    // 2. Web Midpoints Update
    for (let mIdx = 0; mIdx < chain.webMidpoints.length; mIdx++) {
      const m = chain.webMidpoints[mIdx];

      let startPt: { x: number; y: number };
      if (m.fromCardIndex === -1) {
        startPt = chain.ceilingAnchor;
      } else {
        startPt = chain.cards[m.fromCardIndex].getBottomAttachWorld();
      }

      const endPt = chain.cards[m.toCardIndex].getTopAttachWorld();
      const naturalMidX = (startPt.x + endPt.x) / 2;
      const naturalMidY = (startPt.y + endPt.y) / 2;

      if (!m.isDragging) {
        // Elastic snap returning midpoint towards center of strand
        m.vx += (naturalMidX - m.x) * 0.16;
        m.vy += (naturalMidY - m.y) * 0.16;
        m.vx *= 0.85;
        m.vy *= 0.85;
        m.x += m.vx;
        m.y += m.vy;
      } else {
        // Exert spring pull on connected cards when midpoint is dragged
        const toCard = chain.cards[m.toCardIndex];
        toCard.vx += (m.x - toCard.x) * 0.035;
        toCard.vy += (m.y - toCard.y) * 0.035;
        if (m.fromCardIndex !== -1) {
          const fromCard = chain.cards[m.fromCardIndex];
          fromCard.vx += (m.x - fromCard.x) * 0.025;
          fromCard.vy += (m.y - fromCard.y) * 0.025;
        }
      }
    }
  }
}
