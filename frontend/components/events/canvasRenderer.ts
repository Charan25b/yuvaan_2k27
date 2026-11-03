import {PhysicalCard} from './physics';
import {WebChain} from './types';

export function drawRoundedRect(
    ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number,
    r: number): void {
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
}

export function drawSpiderWebSplat(
    ctx: CanvasRenderingContext2D, cx: number, cy: number, radius = 12): void {
  ctx.save();
  ctx.translate(cx, cy);

  // 8-Sided Smaller Comic Web Funnel / Latch Anchor
  ctx.strokeStyle = '#FFFFFF';
  ctx.fillStyle = '#FFFFFF';
  ctx.lineWidth = 1.6;

  const rays = 8;
  for (let i = 0; i < rays; i++) {
    const angle = (i * Math.PI * 2) / rays - Math.PI / 2;
    const rayLen = radius * 1.5;
    const ex = Math.cos(angle) * rayLen;
    const ey = Math.sin(angle) * rayLen;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(ex, ey);
    ctx.lineWidth = 1.8;
    ctx.stroke();
  }

  // Concentric octagonal web cross-links
  const rings = [0.5, 1.0];
  rings.forEach((rFactor) => {
    ctx.beginPath();
    for (let i = 0; i <= rays; i++) {
      const angle = (i * Math.PI * 2) / rays - Math.PI / 2;
      const wx = Math.cos(angle) * (radius * rFactor);
      const wy = Math.sin(angle) * (radius * rFactor);
      if (i === 0)
        ctx.moveTo(wx, wy);
      else
        ctx.lineTo(wx, wy);
    }
    ctx.lineWidth = 1.4;
    ctx.stroke();
  });

  ctx.restore();
}

export function drawWebStrands(
    ctx: CanvasRenderingContext2D, chain: WebChain): void {
  // Fewer curve samples with no temporary points array.
  const steps = 24;
  const numStrands = 4;

  for (const m of chain.webMidpoints) {
    const startPt = m.fromCardIndex === -1 ?
        chain.ceilingAnchor :
        chain.cards[m.fromCardIndex].getBottomAttachWorld();

    const endPt = chain.cards[m.toCardIndex].getTopAttachWorld();

    const startX = startPt.x;
    const startY = startPt.y;
    const controlX = m.x;
    const controlY = m.y;
    const endX = endPt.x;
    const endY = endPt.y;

    ctx.save();

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Dark outline strands.
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.lineWidth = 3.5;

    for (let s = 0; s < numStrands; s++) {
      ctx.beginPath();

      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const u = 1 - t;

        const x = u * u * startX + 2 * u * t * controlX + t * t * endX;

        const y = u * u * startY + 2 * u * t * controlY + t * t * endY;

        const twist = Math.sin(t * 25 + s * 1.57) * 3.5;

        const px = x + twist + 1.2;
        const py = y + 1.2;

        if (i === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }

      ctx.stroke();
    }

    // White foreground strands.
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.98)';
    ctx.lineWidth = 2.2;

    for (let s = 0; s < numStrands; s++) {
      ctx.beginPath();

      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const u = 1 - t;

        const x = u * u * startX + 2 * u * t * controlX + t * t * endX;

        const y = u * u * startY + 2 * u * t * controlY + t * t * endY;

        const twist = Math.sin(t * 25 + s * 1.57) * 3.5;

        const px = x + twist;
        const py = y;

        if (i === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }

      ctx.stroke();
    }

    // Midpoint node.
    ctx.fillStyle = 'rgba(255, 255, 255, 0.98)';
    ctx.beginPath();
    ctx.arc(m.x, m.y, 3.2, 0, Math.PI * 2);
    ctx.fill();

    // Attachment anchors.
    drawSpiderWebSplat(ctx, startX, startY, 14);
    drawSpiderWebSplat(ctx, endX, endY, 14);

    ctx.restore();
  }
}

function drawComicCardUncached(
    ctx: CanvasRenderingContext2D, c: PhysicalCard, isHovered: boolean,
    isMobile: boolean): void {
  const cw = c.cardWidth;
  const ch = c.cardHeight;

  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.rotate(c.angle);

  // Card Drop Shadow
  ctx.fillStyle = 'rgba(28, 25, 23, 0.45)';
  drawRoundedRect(ctx, -cw / 2 + 8, -ch / 2 + 10, cw, ch, 16);
  ctx.fill();

  // Hover Glow Aura
  if (isHovered) {
    ctx.strokeStyle = '#FDE047';
    ctx.lineWidth = 7;
    ctx.shadowColor = '#FDE047';
    ctx.shadowBlur = 16;
    drawRoundedRect(ctx, -cw / 2 - 4, -ch / 2 - 4, cw + 8, ch + 8, 18);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // SOLID VIBRANT COLOR CARD BODY
  ctx.fillStyle = c.comic.bgColor;
  drawRoundedRect(ctx, -cw / 2, -ch / 2, cw, ch, 16);
  ctx.fill();

  // Heavy Comic Book Ink Border
  ctx.strokeStyle = '#1C1917';
  ctx.lineWidth = 4.5;
  ctx.stroke();

  // Inner Comic Frame Border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.40)';
  ctx.lineWidth = 1.6;
  drawRoundedRect(ctx, -cw / 2 + 7, -ch / 2 + 7, cw - 14, ch - 14, 12);
  ctx.stroke();

  // Spine strip on left edge
  ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
  ctx.fillRect(-cw / 2, -ch / 2 + 4, 16, ch - 8);

  // Silver metallic staples
  ctx.fillStyle = '#E2E8F0';
  ctx.fillRect(-cw / 2 + 3, -ch / 2 + ch * 0.22, 4, 15);
  ctx.fillRect(-cw / 2 + 3, ch / 2 - ch * 0.28, 4, 15);
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 1.0;
  ctx.strokeRect(-cw / 2 + 3, -ch / 2 + ch * 0.22, 4, 15);
  ctx.strokeRect(-cw / 2 + 3, ch / 2 - ch * 0.28, 4, 15);

  // Connecting Spider Thread across card face (stuck to the web!)
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(c.topAttachOffset.x, c.topAttachOffset.y);
  ctx.lineTo(c.bottomAttachOffset.x, c.bottomAttachOffset.y);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 2.2;
  ctx.stroke();
  ctx.restore();

  // TOP STRIP: BRAND & ISSUE NUMBER
  const topY = -ch / 2 + 22;

  ctx.fillStyle = '#1C1917';
  ctx.fillRect(-cw / 2 + 20, topY - 9, 78, 19);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 10.5px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('YUVAAN \'27', -cw / 2 + 59, topY + 5);

  ctx.fillStyle = '#FFFFFF';
  drawRoundedRect(ctx, cw / 2 - 82, topY - 9, 68, 19, 5);
  ctx.fill();
  ctx.strokeStyle = '#1C1917';
  ctx.lineWidth = 1.6;
  ctx.stroke();

  ctx.fillStyle = '#1C1917';
  ctx.font = '900 9.5px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(
      `ISSUE #${c.comic.issueNumber.toString().padStart(2, '0')}`, cw / 2 - 48,
      topY + 4.5);

  // CATEGORY & DAY BADGE
  const badgeY = topY + 30;
  ctx.fillStyle = c.comic.accentColor;
  drawRoundedRect(ctx, -cw / 2 + 20, badgeY - 8, 64, 17, 5);
  ctx.fill();
  ctx.strokeStyle = '#1C1917';
  ctx.lineWidth = 1.4;
  ctx.stroke();

  ctx.fillStyle = '#1C1917';
  ctx.font = '900 9px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(c.comic.event.day.toUpperCase(), -cw / 2 + 52, badgeY + 4.5);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  drawRoundedRect(ctx, -cw / 2 + 90, badgeY - 8, cw - 110, 17, 5);
  ctx.fill();
  ctx.strokeStyle = '#1C1917';
  ctx.lineWidth = 1.4;
  ctx.stroke();

  ctx.fillStyle = '#1C1917';
  ctx.font = '900 8.5px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(
      c.comic.event.category.toUpperCase(), -cw / 2 + 90 + (cw - 110) / 2,
      badgeY + 4.5);

  // MAIN COMIC TITLE (with dynamic auto-fit font scaling)
  const titleY = badgeY + 46;
  const words = c.comic.event.title.split(' ');
  let line1 = '';
  let line2 = '';
  for (let wIdx = 0; wIdx < words.length; wIdx++) {
    if (wIdx < 3)
      line1 += (line1 ? ' ' : '') + words[wIdx];
    else
      line2 += (line2 ? ' ' : '') + words[wIdx];
  }

  let titleFontSize = isMobile ? 17 : 19;
  ctx.font = `900 ${titleFontSize}px Impact, Arial Black, sans-serif`;
  while (titleFontSize > 12 &&
         (ctx.measureText(line1.toUpperCase()).width > cw - 36 ||
          (line2 && ctx.measureText(line2.toUpperCase()).width > cw - 36))) {
    titleFontSize -= 0.5;
    ctx.font = `900 ${titleFontSize}px Impact, Arial Black, sans-serif`;
  }

  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.shadowColor = '#1C1917';
  ctx.shadowOffsetX = 2.2;
  ctx.shadowOffsetY = 2.2;

  ctx.fillText(line1.toUpperCase(), 3, titleY);
  if (line2) {
    ctx.fillText(line2.toUpperCase(), 3, titleY + titleFontSize + 4);
  }
  ctx.shadowColor = 'transparent';
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // ACTION BURST STICKER
  const burstY = titleY + (line2 ? titleFontSize + 34 : 44);
  ctx.fillStyle = c.comic.accentColor;
  ctx.beginPath();
  const burstR = 38;
  const spikes = 12;
  for (let sIdx = 0; sIdx < spikes * 2; sIdx++) {
    const r = sIdx % 2 === 0 ? burstR : burstR * 0.72;
    const a = (sIdx * Math.PI) / spikes;
    const bx = 3 + Math.cos(a) * r;
    const by = burstY + Math.sin(a) * (r * 0.68);
    if (sIdx === 0)
      ctx.moveTo(bx, by);
    else
      ctx.lineTo(bx, by);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#1C1917';
  ctx.lineWidth = 2.2;
  ctx.stroke();

  ctx.fillStyle = '#1C1917';
  ctx.font = '900 9.5px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(c.comic.burstText, 3, burstY + 3.5);

  // VENUE & ENTRY STATUS
  const venueY = burstY + 50;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.48)';
  drawRoundedRect(ctx, -cw / 2 + 18, venueY - 9, cw - 36, 28, 7);
  ctx.fill();
  ctx.strokeStyle = '#1C1917';
  ctx.lineWidth = 1.4;
  ctx.stroke();

  let venueText = `📍 ${c.comic.event.venue}`;
  ctx.font = 'bold 9px sans-serif';
  if (ctx.measureText(venueText).width > cw - 44) {
    while (venueText.length > 8 &&
           ctx.measureText(venueText + '...').width > cw - 44) {
      venueText = venueText.slice(0, -1);
    }
    venueText += '...';
  }

  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText(venueText, 0, venueY + 2);
  ctx.fillStyle = '#A7F3D0';
  ctx.font = '900 8.5px sans-serif';
  ctx.fillText(
      `ENTRY: ${c.comic.event.registrationStatus.toUpperCase()}`, 0,
      venueY + 15);

  // BOTTOM CTA STRIP
  const ctaY = ch / 2 - 22;
  ctx.fillStyle = isHovered ? '#FEF08A' : '#FFFFFF';
  drawRoundedRect(ctx, -cw / 2 + 18, ctaY - 10, cw - 36, 24, 7);
  ctx.fill();
  ctx.strokeStyle = '#1C1917';
  ctx.lineWidth = 2.2;
  ctx.stroke();

  ctx.fillStyle = '#1C1917';
  ctx.font = '900 9.5px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(
      isHovered ? '👉 CLICK TO OPEN RULEBOOK ↗' : 'TAP TO EXPLORE ISSUE ↗', 0,
      ctaY + 5);

  // Spider Web Funnels at attachment points on card
  drawSpiderWebSplat(ctx, c.topAttachOffset.x, c.topAttachOffset.y, 14);
  drawSpiderWebSplat(ctx, c.bottomAttachOffset.x, c.bottomAttachOffset.y, 14);

  ctx.restore();
}

// Cache static card artwork so text, borders, stickers and shadows
// are not recalculated and redrawn on every animation frame.
const cardArtworkCache = new WeakMap < PhysicalCard, {
  canvas: HTMLCanvasElement;
  isMobile: boolean;
}
>();

export function drawComicCard(
    ctx: CanvasRenderingContext2D, card: PhysicalCard, isHovered: boolean,
    isMobile: boolean): void {
  let cached = cardArtworkCache.get(card);

  // Create the static artwork once for each card.
  if (!cached || cached.isMobile !== isMobile) {
    const padding = 16;

    const offscreen = document.createElement('canvas');
    offscreen.width = Math.ceil(card.cardWidth + padding * 2);
    offscreen.height = Math.ceil(card.cardHeight + padding * 2);

    const offscreenCtx = offscreen.getContext('2d');

    if (!offscreenCtx) {
      drawComicCardUncached(ctx, card, isHovered, isMobile);
      return;
    }

    offscreenCtx.translate(offscreen.width / 2, offscreen.height / 2);

    // Draw the card in local coordinates.
    // The main canvas handles its actual position and rotation.
    const localCard =
        Object.assign(Object.create(Object.getPrototypeOf(card)), card, {
          x: 0,
          y: 0,
          angle: 0,
        }) as PhysicalCard;

    drawComicCardUncached(offscreenCtx, localCard, false, isMobile);

    cached = {
      canvas: offscreen,
      isMobile,
    };

    cardArtworkCache.set(card, cached);
  }

  const image = cached.canvas;

  ctx.save();
  ctx.translate(card.x, card.y);
  ctx.rotate(card.angle);

  ctx.drawImage(image, -image.width / 2, -image.height / 2);

  // Only draw the hover effects dynamically.
  if (isHovered) {
    const cw = card.cardWidth;
    const ch = card.cardHeight;

    ctx.strokeStyle = '#FDE047';
    ctx.lineWidth = 7;
    ctx.shadowColor = '#FDE047';
    ctx.shadowBlur = 16;

    drawRoundedRect(ctx, -cw / 2 - 4, -ch / 2 - 4, cw + 8, ch + 8, 18);

    ctx.stroke();
    ctx.shadowBlur = 0;

    const ctaY = ch / 2 - 22;

    ctx.fillStyle = '#FEF08A';

    drawRoundedRect(ctx, -cw / 2 + 18, ctaY - 10, cw - 36, 24, 7);

    ctx.fill();

    ctx.strokeStyle = '#1C1917';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    ctx.fillStyle = '#1C1917';
    ctx.font = '900 9.5px sans-serif';
    ctx.textAlign = 'center';

    ctx.fillText('👉 CLICK TO OPEN RULEBOOK ↗', 0, ctaY + 5);
  }

  ctx.restore();
}