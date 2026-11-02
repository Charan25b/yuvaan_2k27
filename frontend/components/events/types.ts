import { EventItem } from "@/lib/data/festivalData";

export interface ComicBookData {
  event: EventItem;
  issueNumber: number;
  bgColor: string;
  accentColor: string;
  burstText: string;
}

export interface WebChain {
  id: number;
  anchorX: number;
  ceilingAnchor: { x: number; y: number };
  cards: import("./physics").PhysicalCard[];
  webMidpoints: import("./physics").PhysicalWebMidpoint[];
}

export const COMIC_THEMES = [
  { bgColor: "#EF4444", accentColor: "#FDE047", burstText: "★ SOUND CLASH ★" }, // 1: Crimson Red
  { bgColor: "#0284C7", accentColor: "#38BDF8", burstText: "★ 24H SPRINT ★" },  // 2: Cyber Cyan
  { bgColor: "#D97706", accentColor: "#FDE68A", burstText: "★ ARENA LAN ★" },   // 3: Comic Amber
  { bgColor: "#7C3AED", accentColor: "#C084FC", burstText: "★ CYPHER BATTLE ★" }, // 4: Neon Violet
  { bgColor: "#059669", accentColor: "#6EE7B7", burstText: "★ MASTERCLASS ★" },  // 5: Emerald Mint
  { bgColor: "#EA580C", accentColor: "#FDBA74", burstText: "★ ORATORY SLAM ★" }, // 6: Blaze Orange
  { bgColor: "#4F46E5", accentColor: "#A5B4FC", burstText: "★ ROBOT WARS ★" },  // 7: Indigo Blue
  { bgColor: "#DB2777", accentColor: "#F472B6", burstText: "★ RUNWAY GALA ★" },  // 8: Fuchsia Pink
  { bgColor: "#65A30D", accentColor: "#BEF264", burstText: "★ 48H ENGINE ★" },  // 9: Acid Lime
  { bgColor: "#E11D48", accentColor: "#FDA4AF", burstText: "★ LIVE VERSE ★" },  // 10: Rose Red
];
