
"use client";

import { useEffect, useState, type CSSProperties } from "react";
import styles from "./teams.module.css";

type Member = {
  id: number;
  name: string;
  alias: string;
  character: string;
  role: string;
  threat: string;
  ability: string;
  status: string;
  photo?: string;
};

type Team = {
  id: string;
  name: string;
  faction: string;
  description: string;
  color: string;
  accent: string;
  symbol: string;
  members: Member[];
};

const TEAMS: Team[] = [
  {
    id: "technical",
    name: "Technical Team",
    faction: "THE HEROES",
    description: "Technical setup and systems.",
    color: "#173c59",
    accent: "#43c8ff",
    symbol: "⚡",
    members: [
      {
        id: 1,
        name: "Name unavailable",
        alias: "THE ARCHITECT",
        character: "Iron Man",
        role: "Technical Team",
        threat: "EXTREME",
        ability: "Engineering, technology and innovation",
        status: "ACTIVE",
      },
      {
        id: 2,
        name: "Name unavailable",
        alias: "THE STRATEGIST",
        character: "Doctor Strange",
        role: "Technical Team",
        threat: "HIGH",
        ability: "Problem solving and strategic thinking",
        status: "ACTIVE",
      },
      {
        id: 3,
        name: "Name unavailable",
        alias: "THE INVENTOR",
        character: "Shuri",
        role: "Technical Team",
        threat: "HIGH",
        ability: "Creative engineering and experimentation",
        status: "ACTIVE",
      },
      {
        id: 4,
        name: "Name unavailable",
        alias: "THE GUARDIAN",
        character: "Spider-Man",
        role: "Technical Team",
        threat: "HIGH",
        ability: "Adaptability and quick thinking",
        status: "ACTIVE",
      },
    ],
  },
  {
    id: "sponsorship",
    name: "Sponsorship Team",
    faction: "THE VILLAINS",
    description: "Sponsorship and partner outreach.",
    color: "#541b23",
    accent: "#ff454f",
    symbol: "☠",
    members: [
      {
        id: 5,
        name: "Name unavailable",
        alias: "THE PUPPET MASTER",
        character: "Loki",
        role: "Sponsorship Team",
        threat: "MAXIMUM",
        ability: "Negotiation, persuasion and manipulation",
        status: "UNDER SURVEILLANCE",
      },
      {
        id: 6,
        name: "Name unavailable",
        alias: "THE MASTER MIND",
        character: "Lex Luthor",
        role: "Sponsorship Team",
        threat: "EXTREME",
        ability: "Strategy and resource acquisition",
        status: "ACTIVE",
      },
      {
        id: 7,
        name: "Name unavailable",
        alias: "THE CHAOS AGENT",
        character: "Joker",
        role: "Sponsorship Team",
        threat: "MAXIMUM",
        ability: "Unpredictable ideas and persuasion",
        status: "WANTED",
      },
      {
        id: 8,
        name: "Name unavailable",
        alias: "THE OVERLORD",
        character: "Thanos",
        role: "Sponsorship Team",
        threat: "MAXIMUM",
        ability: "Leadership and strategic planning",
        status: "ACTIVE",
      },
    ],
  },
  {
    id: "design",
    name: "Design Team",
    faction: "THE ILLUSIONISTS",
    description: "Design and visual identity.",
    color: "#38234e",
    accent: "#c18bff",
    symbol: "✦",
    members: [
      {
        id: 9,
        name: "Name unavailable",
        alias: "THE ILLUSIONIST",
        character: "Mysterio",
        role: "Design Team",
        threat: "HIGH",
        ability: "Visual storytelling and creative design",
        status: "ACTIVE",
      },
      {
        id: 10,
        name: "Name unavailable",
        alias: "THE ENCHANTRESS",
        character: "Scarlet Witch",
        role: "Design Team",
        threat: "EXTREME",
        ability: "Art direction and visual imagination",
        status: "ACTIVE",
      },
    ],
  },
  {
    id: "marketing",
    name: "Marketing Team",
    faction: "THE MANIPULATORS",
    description: "Marketing and communications.",
    color: "#594020",
    accent: "#ffbd55",
    symbol: "◈",
    members: [
      {
        id: 11,
        name: "Name unavailable",
        alias: "THE SHOWMAN",
        character: "Green Goblin",
        role: "Marketing Team",
        threat: "HIGH",
        ability: "Promotion and audience engagement",
        status: "ACTIVE",
      },
      {
        id: 12,
        name: "Name unavailable",
        alias: "THE TRICKSTER",
        character: "Harley Quinn",
        role: "Marketing Team",
        threat: "HIGH",
        ability: "Communication and creative campaigns",
        status: "ACTIVE",
      },
    ],
  },
  {
    id: "management",
    name: "Management Team",
    faction: "THE OVERLORDS",
    description: "Festival operations and coordination.",
    color: "#34383c",
    accent: "#d7d7d7",
    symbol: "♛",
    members: [
      {
        id: 13,
        name: "Name unavailable",
        alias: "THE COMMANDER",
        character: "Darth Vader",
        role: "Management Team",
        threat: "MAXIMUM",
        ability: "Leadership and coordination",
        status: "ACTIVE",
      },
      {
        id: 14,
        name: "Name unavailable",
        alias: "THE MASTER PLAN",
        character: "Doctor Doom",
        role: "Management Team",
        threat: "EXTREME",
        ability: "Organisation and strategic execution",
        status: "ACTIVE",
      },
    ],
  },
  {
    id: "content",
    name: "Content Team",
    faction: "THE STORYTELLERS",
    description: "Festival writing and communications.",
    color: "#4b2932",
    accent: "#ff8d9d",
    symbol: "✎",
    members: [
      {
        id: 15,
        name: "Name unavailable",
        alias: "THE NARRATOR",
        character: "Riddler",
        role: "Content Team",
        threat: "HIGH",
        ability: "Storytelling and communication",
        status: "ACTIVE",
      },
      {
        id: 16,
        name: "Name unavailable",
        alias: "THE CHAOS WRITER",
        character: "Deadpool",
        role: "Content Team",
        threat: "HIGH",
        ability: "Creative writing and humour",
        status: "ACTIVE",
      },
    ],
  },
];

function getInitials(name: string) {
  if (name === "Name unavailable") return "—";

  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function TeamsPage() {
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [activeMember, setActiveMember] = useState<Member | null>(null);

  const closeMember = () => setActiveMember(null);

  const closeTeam = () => {
    setActiveMember(null);
    setActiveTeam(null);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (activeMember) {
          setActiveMember(null);
        } else {
          setActiveTeam(null);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeMember]);

  return (
    <main className={`${styles.page} team-page`}>
      {/* Background atmosphere */}
      <div className={styles.noise} />
      <div className={styles.vignette} />
      <div className={styles.scanlines} />

      {/* Main heading */}
      <section className={styles.intro}>
        <div className={styles.eyebrow}>
          <span />
          CLASSIFIED PERSONNEL DATABASE
          <span />
        </div>

        <h1>
          THE <span>WAR ROOM</span>
        </h1>

        <p>
          Choose a team to view its roster.
        </p>

        <div className={styles.instruction}>
          <span className={styles.crosshair}>⌖</span>
          SELECT A TEAM BOARD
        </div>
      </section>

      {/* War room */}
      <section className={styles.room}>
        <div className={styles.roomLabel}>
          <span>SECTOR 01</span>
          <span>TEAM ROSTER</span>
          <span>YUVAAN 2K27</span>
        </div>

        <div className={styles.roomWalls}>
          {TEAMS.map((team, index) => (
            <button
              key={team.id}
              className={`${styles.wallBoard} ${styles[`board${index + 1}`]}`}
              style={
                {
                  "--team-color": team.color,
                  "--team-accent": team.accent,
                } as CSSProperties
              }
              onClick={() => setActiveTeam(team)}
              aria-label={`Investigate ${team.name}`}
            >
              <div className={styles.boardTop}>
                <span>FILE // 0{index + 1}</span>
                <span className={styles.boardStatus}>● LIVE</span>
              </div>

              <div className={styles.boardPhotos} aria-hidden="true">
                {team.members.slice(0, 3).map((member, i) => (
                  <div
                    key={member.id}
                    className={`${styles.miniPhoto} ${styles[`mini${i}`]}`}
                  >
                    {member.photo && <img src={member.photo} alt="" />}
                  </div>
                ))}
              </div>

              <div className={styles.boardSymbol} aria-hidden="true">
                {team.symbol}
              </div>

              <div className={styles.boardInfo}>
                <h2>{team.name}</h2>
                <p>{team.members.length} MEMBERS</p>
              </div>

              <div className={styles.boardPin} />
              <div className={styles.boardCorner}>↗</div>
            </button>
          ))}
        </div>

        <div className={styles.roomFloor}>
          <div className={styles.floorLight} />
        </div>
      </section>

      {/* TEAM BOARD ZOOM */}
      {activeTeam && (
        <section
          className={styles.boardOverlay}
          style={
            {
              "--team-color": activeTeam.color,
              "--team-accent": activeTeam.accent,
            } as CSSProperties
          }
        >
          <button
            type="button"
            className={styles.boardBackdrop}
            onClick={closeTeam}
            aria-label="Close team file"
          />

          <div className={styles.expandedBoard}>
            <button
              type="button"
              className={styles.fileClose}
              onClick={closeTeam}
              aria-label="Close team file"
            >
              &times;
            </button>

            <div className={styles.expandedBoardHeader}>
              <div>
                <span className={styles.fileNumber}>
                  CLASSIFIED FILE // {activeTeam.id.toUpperCase()}
                </span>

                <h2>{activeTeam.name}</h2>
                <h3>{activeTeam.faction}</h3>
                <p>{activeTeam.description}</p>
              </div>
              <div className={styles.bigSymbol} aria-hidden="true">
                {activeTeam.symbol}
              </div>
            </div>

            <div className={styles.evidenceLabel}>
              <span>KNOWN ASSOCIATES</span>
              <span>
                {String(activeTeam.members.length).padStart(2, "0")} RECORDS
                FOUND
              </span>
            </div>

            <div className={styles.memberBoard}>
              {activeTeam.members.map((member, index) => (
                <button
                  key={member.id}
                  className={styles.memberPin}
                  style={
                    {
                      "--pin-rotation": `${(index % 3 - 1) * 3}deg`,
                      "--pin-color": activeTeam.accent,
                    } as CSSProperties
                  }
                  onClick={() => setActiveMember(member)}
                >
                  <span className={styles.stringLine} />

                  <div className={styles.memberPhoto}>
                    {member.photo ? (
                      <img src={member.photo} alt={member.name} />
                    ) : (
                      <div className={styles.photoPlaceholder}>
                        <span>{getInitials(member.name)}</span>
                        <small>
                          SUBJECT {String(member.id).padStart(3, "0")}
                        </small>
                      </div>
                    )}

                    <span className={styles.photoPin} />
                  </div>

                  <div className={styles.memberLabel}>
                    <span>{member.alias}</span>
                    <strong>{member.name}</strong>
                    <small>{member.character.toUpperCase()}</small>
                  </div>

                  <span className={styles.viewFile}>
                    OPEN FILE ↗
                  </span>
                </button>
              ))}
            </div>

            <div className={styles.boardFooter}>
              <span>DO NOT DISTRIBUTE // INTERNAL USE ONLY</span>
              <span>YUVAAN SECURITY DIVISION</span>
            </div>
          </div>
        </section>
      )}

      {/* INDIVIDUAL DOSSIER */}
      {activeMember && activeTeam && (
        <section className={styles.dossierOverlay}>
          <div
            className={styles.dossierBackdrop}
            onClick={closeMember}
          />

          <article className={styles.dossier}>
            <button
              className={styles.dossierClose}
              onClick={closeMember}
              aria-label="Close dossier"
            >
              ✕
            </button>

            <div className={styles.dossierTop}>
              <span>YUVAAN INTELLIGENCE AGENCY</span>
              <span className={styles.redacted}>CLASSIFIED</span>
            </div>

            <div className={styles.dossierContent}>
              <div className={styles.dossierPortrait}>
                {activeMember.photo ? (
                  <img src={activeMember.photo} alt={activeMember.name} />
                ) : (
                  <div className={styles.dossierPlaceholder}>
                    <span>{getInitials(activeMember.name)}</span>
                    <small>PHOTOGRAPH UNAVAILABLE</small>
                  </div>
                )}

                <span className={styles.subjectNumber}>
                  SUBJECT #{String(activeMember.id).padStart(3, "0")}
                </span>
              </div>

              <div className={styles.dossierDetails}>
                <span className={styles.dossierEyebrow}>
                  PERSONNEL IDENTIFICATION
                </span>

                <h2>{activeMember.alias}</h2>

                <p className={styles.characterName}>
                  CHARACTER: {activeMember.character.toUpperCase()}
                </p>

                <div className={styles.dossierDivider} />

                <div className={styles.detailRow}>
                  <span>REAL IDENTITY</span>
                  <strong>{activeMember.name}</strong>
                </div>

                <div className={styles.detailRow}>
                  <span>DEPARTMENT</span>
                  <strong>{activeMember.role}</strong>
                </div>

                <div className={styles.detailRow}>
                  <span>FACTION</span>
                  <strong>{activeTeam.faction}</strong>
                </div>

                <div className={styles.detailRow}>
                  <span>THREAT LEVEL</span>
                  <strong className={styles.threatValue}>
                    {activeMember.threat}
                  </strong>
                </div>

                <div className={styles.detailRow}>
                  <span>STATUS</span>
                  <strong>{activeMember.status}</strong>
                </div>

                <div className={styles.abilities}>
                  <span>KNOWN ABILITIES</span>
                  <p>{activeMember.ability}</p>
                </div>
              </div>
            </div>

            <div className={styles.dossierBottom}>
              <span>SUBJECT UNDER SURVEILLANCE</span>
              <span>FILE END // 0{activeMember.id}</span>
            </div>
          </article>
        </section>
      )}
    </main>
  );
}
