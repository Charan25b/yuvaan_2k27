import { PhysicalCard } from "./physics";
import { WebChain } from "./types";

function containsCardPoint(card: PhysicalCard, x: number, y: number): boolean {
  const dx = x - card.x;
  const dy = y - card.y;
  const cos = Math.cos(-card.angle);
  const sin = Math.sin(-card.angle);
  const localX = dx * cos - dy * sin;
  const localY = dx * sin + dy * cos;

  return (
    Math.abs(localX) <= card.cardWidth / 2 &&
    Math.abs(localY) <= card.cardHeight / 2
  );
}

export function findCardAtPoint(
  chains: WebChain[],
  x: number,
  y: number
): PhysicalCard | null {
  for (const chain of chains) {
    for (let index = chain.cards.length - 1; index >= 0; index--) {
      const card = chain.cards[index];
      if (containsCardPoint(card, x, y)) return card;
    }
  }

  return null;
}
