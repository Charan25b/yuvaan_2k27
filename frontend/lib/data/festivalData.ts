export interface EventItem {
  id: string;
  slug: string;
  title: string;
  category: "Cultural" | "Technical" | "Gaming & Esports" | "Literary & Arts" | "Workshops";
  day: "Day 1" | "Day 2" | "Day 3";
  time: string;
  venue: string;
  shortDescription: string;
  description: string;
  rules: string[];
  teamSize: string;
  registrationStatus: "Open" | "Closing Soon" | "Invite Only";
}

export interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  category: string;
  venue: string;
  description: string;
  day: 1 | 2 | 3;
}

export interface MerchandiseItem {
  id: string;
  name: string;
  category: "Apparel" | "Accessories" | "Collectibles";
  price: string;
  description: string;
  availability: "Available at SAC Desk" | "Limited Stock" | "Pre-order Pickup";
  featuredBadge?: string;
}

export interface SponsorItem {
  id: string;
  name: string;
  tier: "Title Sponsor" | "Powered By" | "Associate Partner" | "Media & Beverage Partner";
  description: string;
  category: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  committee: "Core Council" | "Technical & Web" | "Events & Production" | "Design & Media" | "Logistics & PR";
}

export interface GalleryItem {
  id: string;
  title: string;
  category: "Pro-Nites & Concerts" | "Competitions" | "Campus Life" | "Exhibitions";
  year: string;
  caption: string;
}

export interface FactionPreview {
  name: string;
  element: string;
  accentBorder: string;
  tagline: string;
  lore: string;
  pointsHighlight: string;
}

export const FACTIONS_DATA: FactionPreview[] = [
  {
    name: "Ignis Faction",
    element: "Fire & Ambition",
    accentBorder: "#8F1D1D",
    tagline: "Bold, decisive, and unrelenting",
    lore: "Champions of rapid problem-solving, high-intensity gaming showdowns, and expressive theatrical energy.",
    pointsHighlight: "Dominates algorithmic races & battle arena stages",
  },
  {
    name: "Terra Faction",
    element: "Earth & Resilience",
    accentBorder: "#8B5E3C",
    tagline: "Steadfast, strategic, and meticulous",
    lore: "Built upon stamina, deep design thinking, and long-format engineering hackathons.",
    pointsHighlight: "Dominates hardware hackathons & structural design tracks",
  },
  {
    name: "Ventus Faction",
    element: "Wind & Innovation",
    accentBorder: "#E14B24",
    tagline: "Swift, creative, and boundary-pushing",
    lore: "Agile creators known for kinetic dance performances, rapid prototyping, and creative arts.",
    pointsHighlight: "Dominates solo choreography & speed innovation sprints",
  },
  {
    name: "Aqua Faction",
    element: "Water & Intellect",
    accentBorder: "#1D3557",
    tagline: "Deep, adaptable, and tactical",
    lore: "Calculated minds excelling in grand parliamentary debates, strategic trivia, and tactical coordination.",
    pointsHighlight: "Dominates inter-college quizzing & chess leagues",
  },
];

export const EVENTS_DATA: EventItem[] = [
  {
    id: "ev-1",
    slug: "battle-of-bands",
    title: "Symphony Clash: Battle of the Bands",
    category: "Cultural",
    day: "Day 2",
    time: "06:30 PM - 09:30 PM",
    venue: "Main Open-Air Amphitheatre",
    shortDescription: "Electric stage showdown for collegiate rock, fusion, and indie bands across India.",
    description: "The marquee musical competition of Yuvaan 2027 brings together high-octane rock, fusion, and regional indie collectives on the main amphitheatre stage. Compete for major cash trophies and festival headliner opening slots.",
    rules: [
      "Maximum stage time: 20 minutes (including 5 minutes sound check).",
      "Bands must perform at least one original composition and one cover.",
      "Drum kit and standard stage amplification provided; bands must bring own guitars, processors, and synthesizers.",
      "Decision of the national celebrity jury is final and binding.",
    ],
    teamSize: "3 to 8 Members",
    registrationStatus: "Open",
  },
  {
    id: "ev-2",
    slug: "hack-yuvaan",
    title: "HackYuvaan: 24-Hour AI & Web Sprint",
    category: "Technical",
    day: "Day 1",
    time: "10:00 AM (24-Hour Overnight)",
    venue: "Computer Center Labs & SAC Hall",
    shortDescription: "Flagship overnight hackathon building AI-driven solutions and creative web applications.",
    description: "An intensive 24-hour product sprint challenging student developers, designers, and innovators to solve real-world problems in open-source AI, campus utility, and sustainable technology.",
    rules: [
      "Teams may have 2 to 4 members from recognized educational institutions.",
      "All code must be written during the hackathon sprint window; pre-existing libraries permitted with disclosure.",
      "Final submissions require a public GitHub repository and live demonstration.",
      "Judging criteria: Innovation (30%), Technical Execution (30%), Usability (20%), Pitch (20%).",
    ],
    teamSize: "2 to 4 Members",
    registrationStatus: "Open",
  },
  {
    id: "ev-3",
    slug: "esports-showdown",
    title: "Apex Arena: Inter-College LAN Championship",
    category: "Gaming & Esports",
    day: "Day 2",
    time: "11:00 AM - 05:00 PM",
    venue: "Indoor Gaming Arena (SAC 2nd Floor)",
    shortDescription: "Competitive tournament featuring tactical 5v5 shooter & fighting game brackets.",
    description: "High-stakes esports brackets bringing together top regional collegiate teams in tactical FPS and fighting games with live stage commentary and audience streams.",
    rules: [
      "Standard competitive tournament rules apply for each bracket.",
      "Players must use tournament-sanctioned equipment or approved personal peripherals.",
      "Any toxic behavior or unsportsmanlike conduct results in immediate disqualification.",
    ],
    teamSize: "5 Players + 1 Sub",
    registrationStatus: "Closing Soon",
  },
  {
    id: "ev-4",
    slug: "street-dance-battle",
    title: "Street Cypher: All-Style Dance Battle",
    category: "Cultural",
    day: "Day 1",
    time: "04:30 PM - 07:00 PM",
    venue: "Central Courtyard Plaza",
    shortDescription: "High-energy 1v1 cypher and crew battles across hip-hop, popping, and breaking.",
    description: "Witness the rhythm and improvisational raw skill as dancers face off in 1-on-1 cyphers and crew showcases judged by prominent street dance choreographers.",
    rules: [
      "1v1 elimination rounds with 60-second rounds to live DJ tracks.",
      "Judges vote immediately after each exchange.",
      "Originality, musicality, and crowd interaction heavily weighed.",
    ],
    teamSize: "Solo or Crew (up to 6)",
    registrationStatus: "Open",
  },
  {
    id: "ev-5",
    slug: "prompt-craft-workshop",
    title: "Generative Media & Promptcraft Masterclass",
    category: "Workshops",
    day: "Day 3",
    time: "02:00 PM - 04:30 PM",
    venue: "Lecture Hall Complex 1",
    shortDescription: "Hands-on session exploring creative generative AI tools for digital artists and coders.",
    description: "A practical masterclass led by industry designers demonstrating modern generative pipelines, diffusion tools, and ethical creative AI workflows for student portfolios.",
    rules: [
      "Participants are encouraged to bring laptops with modern web browsers.",
      "Free access credits provided for workshop exercises.",
      "Participation certificate issued to all verified attendees.",
    ],
    teamSize: "Individual Attendance",
    registrationStatus: "Open",
  },
  {
    id: "ev-6",
    slug: "parliamentary-debate",
    title: "The Brahmaputra Parliamentary Debate",
    category: "Literary & Arts",
    day: "Day 1",
    time: "11:30 AM - 04:00 PM",
    venue: "Auditorium Seminar Hall",
    shortDescription: "Asian Parliamentary debate debating contemporary policy, technology, and ethics.",
    description: "The hallmark oratory competition of Yuvaan, featuring rigorous rounds of Asian Parliamentary debating on technology governance, culture, and geopolitics.",
    rules: [
      "Asian Parliamentary format (3 members per team).",
      "7 minutes per substantive speech; 4 minutes per reply speech.",
      "Adjudicator panels comprise experienced institutional adjudicators.",
    ],
    teamSize: "3 Members",
    registrationStatus: "Open",
  },
];

export const SCHEDULE_DATA: ScheduleItem[] = [
  // Day 1
  {
    id: "sch-1",
    day: 1,
    time: "09:30 AM - 11:00 AM",
    title: "Yuvaan 2027 Inauguration Ceremony",
    category: "Ceremony",
    venue: "Main Auditorium",
    description: "Lighting of the lamp, director's inaugural address, and grand opening showcase.",
  },
  {
    id: "sch-2",
    day: 1,
    time: "10:00 AM (Ongoing 24h)",
    title: "HackYuvaan 24-Hour Sprint Kickoff",
    category: "Technical",
    venue: "Computer Center & SAC Hall",
    description: "Problem statement unveiling and commencement of overnight technical sprint.",
  },
  {
    id: "sch-3",
    day: 1,
    time: "11:30 AM - 04:00 PM",
    title: "The Brahmaputra Parliamentary Debate",
    category: "Literary & Arts",
    venue: "Seminar Hall 2",
    description: "Preliminary and quarterfinal debating rounds.",
  },
  {
    id: "sch-4",
    day: 1,
    time: "04:30 PM - 07:00 PM",
    title: "Street Cypher: All-Style Dance Battle",
    category: "Cultural",
    venue: "Central Courtyard Plaza",
    description: "High-energy 1v1 dance battles with live DJ beats.",
  },
  {
    id: "sch-5",
    day: 1,
    time: "07:30 PM - 10:00 PM",
    title: "Acoustic Night & Classical Fusion",
    category: "Pro-Nite",
    venue: "Main Open-Air Amphitheatre",
    description: "Serene evening of acoustic melodies, regional folk, and fusion bands.",
  },
  // Day 2
  {
    id: "sch-6",
    day: 2,
    time: "10:00 AM - 12:00 PM",
    title: "HackYuvaan Final Submissions & Pitching",
    category: "Technical",
    venue: "LHC Hall 3",
    description: "Final project demonstrations before jury and industry mentors.",
  },
  {
    id: "sch-7",
    day: 2,
    time: "11:00 AM - 05:00 PM",
    title: "Apex Arena: Inter-College LAN Finals",
    category: "Gaming & Esports",
    venue: "Indoor Gaming Arena",
    description: "Semifinal and grand final matches with stage projection.",
  },
  {
    id: "sch-8",
    day: 2,
    time: "02:00 PM - 04:30 PM",
    title: "Comic Con Cosplay Parade & Showcase",
    category: "Cultural",
    venue: "Auditorium Arena",
    description: "Costume craft showcase, character skits, and comic lore awards.",
  },
  {
    id: "sch-9",
    day: 2,
    time: "06:30 PM - 10:00 PM",
    title: "Symphony Clash: Battle of the Bands",
    category: "Cultural",
    venue: "Main Open-Air Amphitheatre",
    description: "Live stage performances by competing collegiate bands.",
  },
  // Day 3
  {
    id: "sch-10",
    day: 3,
    time: "10:30 AM - 01:00 PM",
    title: "RoboCombat & Drone Obstacle Derby",
    category: "Technical",
    venue: "Sports Complex Arena",
    description: "Custom combat robot battles and timed indoor drone precision navigation.",
  },
  {
    id: "sch-11",
    day: 3,
    time: "02:00 PM - 04:30 PM",
    title: "Generative Media Masterclass",
    category: "Workshops",
    venue: "Lecture Hall Complex 1",
    description: "Hands-on creative promptcraft and digital design session.",
  },
  {
    id: "sch-12",
    day: 3,
    time: "05:00 PM - 06:30 PM",
    title: "Grand Valedictory & Faction Trophy Presentation",
    category: "Ceremony",
    venue: "Main Auditorium",
    description: "Prize distribution, felicitation of sponsors, and festival championship coronation.",
  },
  {
    id: "sch-13",
    day: 3,
    time: "07:30 PM - 10:30 PM",
    title: "Star Night: Celebrity Artist Concert",
    category: "Pro-Nite",
    venue: "Main Open-Air Amphitheatre",
    description: "Grand finale concert featuring headlining musical artists.",
  },
];

export const MERCHANDISE_DATA: MerchandiseItem[] = [
  {
    id: "merch-1",
    name: "Yuvaan '27 Comic Heavyweight Hoodie",
    category: "Apparel",
    price: "₹1,299",
    description: "Premium 380 GSM fleece hoodie featuring subtle comic line-art embroidery on the chest and custom sleeve cuffs.",
    availability: "Available at SAC Desk",
    featuredBadge: "Best Seller",
  },
  {
    id: "merch-2",
    name: "Oversized Festival Graphic Tee",
    category: "Apparel",
    price: "₹699",
    description: "100% combed cotton 240 GSM drop-shoulder tee with screen-printed festival mascot illustration in vintage comic tones.",
    availability: "Available at SAC Desk",
    featuredBadge: "New Arrival",
  },
  {
    id: "merch-3",
    name: "Faction Collector Enamel Pins (Set of 4)",
    category: "Collectibles",
    price: "₹399",
    description: "Die-cast metallic pins representing Ignis, Terra, Ventus, and Aqua factions with magnetic clasp backings.",
    availability: "Limited Stock",
  },
  {
    id: "merch-4",
    name: "Halftone Campus Tote Bag",
    category: "Accessories",
    price: "₹349",
    description: "Durable organic canvas tote featuring halftone grid patterns and heavy-duty reinforced shoulder straps.",
    availability: "Available at SAC Desk",
  },
  {
    id: "merch-5",
    name: "Yuvaan Comic Die-Cut Sticker Pack",
    category: "Collectibles",
    price: "₹149",
    description: "Waterproof vinyl sticker pack with 10 original comic badges, speech bubbles, and festival artwork.",
    availability: "Available at SAC Desk",
  },
  {
    id: "merch-6",
    name: "Thermal Commuter Bottle (750ml)",
    category: "Accessories",
    price: "₹599",
    description: "Double-walled stainless steel insulated bottle keeping beverages cold for 24 hours or hot for 12 hours.",
    availability: "Pre-order Pickup",
  },
];

export const SPONSORS_DATA: SponsorItem[] = [
  {
    id: "sp-1",
    name: "National Technology Partner",
    tier: "Title Sponsor",
    description: "Leading enterprise cloud and AI infrastructure provider supporting collegiate innovation across the northeast.",
    category: "Cloud & Technology",
  },
  {
    id: "sp-2",
    name: "Regional Innovation Board",
    tier: "Powered By",
    description: "State entrepreneurship and startup development mission supporting hackathon prize tracks.",
    category: "Public Sector & Innovation",
  },
  {
    id: "sp-3",
    name: "Audio & Entertainment Collective",
    tier: "Associate Partner",
    description: "Official sound, stage acoustics, and pro-night production equipment partner.",
    category: "Audio & Stage",
  },
  {
    id: "sp-4",
    name: "Campus Refreshment Brand",
    tier: "Media & Beverage Partner",
    description: "Hydration and refreshment stalls across all campus venues and outdoor stages.",
    category: "Beverages & Food",
  },
  {
    id: "sp-5",
    name: "Gaming Gear Manufacturer",
    tier: "Associate Partner",
    description: "High-refresh monitors and mechanical peripherals for the Apex LAN gaming arena.",
    category: "Esports Hardware",
  },
  {
    id: "sp-6",
    name: "Youth Media Network",
    tier: "Media & Beverage Partner",
    description: "Official digital streaming and campus journalism broadcasting partner.",
    category: "Digital Media",
  },
];

export const TEAM_DATA: TeamMember[] = [
  {
    id: "tm-1",
    name: "Student Festival Convenor",
    role: "Overall General Convenor",
    committee: "Core Council",
  },
  {
    id: "tm-2",
    name: "Technical Board Representative",
    role: "Secretary, Technical Affairs",
    committee: "Core Council",
  },
  {
    id: "tm-3",
    name: "Cultural Council Lead",
    role: "Secretary, Cultural Affairs",
    committee: "Core Council",
  },
  {
    id: "tm-4",
    name: "Lead Web Architect",
    role: "Frontend & Systems Coordinator",
    committee: "Technical & Web",
  },
  {
    id: "tm-5",
    name: "API & Infrastructure Lead",
    role: "Backend & Systems Engineer",
    committee: "Technical & Web",
  },
  {
    id: "tm-6",
    name: "Stage & Lighting Director",
    role: "Production & Arena Manager",
    committee: "Events & Production",
  },
  {
    id: "tm-7",
    name: "Competitions Coordinator",
    role: "Inter-College Events Lead",
    committee: "Events & Production",
  },
  {
    id: "tm-8",
    name: "Creative Brand Designer",
    role: "Comic Con Identity & Visuals",
    committee: "Design & Media",
  },
  {
    id: "tm-9",
    name: "Social Media & Coverage Lead",
    role: "Campus Journalism & Broadcast",
    committee: "Design & Media",
  },
  {
    id: "tm-10",
    name: "Hospitality & Guest Relations",
    role: "Artist & College Welcome Desk",
    committee: "Logistics & PR",
  },
  {
    id: "tm-11",
    name: "Campus Security & Safety Coordinator",
    role: "Logistics & Crowd Operations",
    committee: "Logistics & PR",
  },
];

export const GALLERY_DATA: GalleryItem[] = [
  {
    id: "gal-1",
    title: "Amphitheatre Pro-Night Crowd",
    category: "Pro-Nites & Concerts",
    year: "Yuvaan 2026",
    caption: "Thousands of students gathering for the grand finale musical concert.",
  },
  {
    id: "gal-2",
    title: "Overnight Hackathon Coding Sprint",
    category: "Competitions",
    year: "Yuvaan 2026",
    caption: "Teams collaborating in the computer labs during the 24-hour sprint.",
  },
  {
    id: "gal-3",
    title: "Cosplay & Character Showcase",
    category: "Campus Life",
    year: "Yuvaan 2026",
    caption: "Handcrafted comic and anime costumes presented on the main stage.",
  },
  {
    id: "gal-4",
    title: "Battle of the Bands Guitar Solo",
    category: "Competitions",
    year: "Yuvaan 2025",
    caption: "High-octane rock performances under the evening floodlights.",
  },
  {
    id: "gal-5",
    title: "Brahmaputra Sunset Campus Vibe",
    category: "Campus Life",
    year: "Yuvaan 2025",
    caption: "Festival lights illuminating the walkway between academic blocks.",
  },
  {
    id: "gal-6",
    title: "Digital Art & Comic Exhibition",
    category: "Exhibitions",
    year: "Yuvaan 2026",
    caption: "Original graphic illustrations and posters exhibited in the SAC foyer.",
  },
  {
    id: "gal-7",
    title: "Street Dance Cypher Circle",
    category: "Competitions",
    year: "Yuvaan 2026",
    caption: "All-style dancers battling in the central courtyard arena.",
  },
  {
    id: "gal-8",
    title: "Hardware Robotics Arena Collision",
    category: "Competitions",
    year: "Yuvaan 2025",
    caption: "Combat bots clashing in the enclosed metal arena.",
  },
];
