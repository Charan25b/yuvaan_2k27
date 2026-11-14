"use client";

import { useState } from "react";
import RaceTrackScene from "../../components/schedule/RaceTrack";
import styles from "./race-schedule.module.css";

type Event = {
  id: number;
  title: string;
  time: string;
  venue: string;
  category: string;
  description: string;
};

const schedule: Record<number, Event[]> = {
  1: [
    {
      id: 1,
      title: "Grand Inauguration",
      time: "09:00 AM",
      venue: "Main Auditorium",
      category: "Ceremony",
      description: "Kick off the festival with the opening ceremony.",
    },
    {
      id: 2,
      title: "HackQuest Begins",
      time: "10:30 AM",
      venue: "Innovation Hub",
      category: "Technology",
      description: "The coding challenge officially starts.",
    },
    {
      id: 3,
      title: "Cosplay Registration",
      time: "12:00 PM",
      venue: "Registration Arena",
      category: "Comic Con",
      description: "Check in for the cosplay competition.",
    },
    {
      id: 4,
      title: "Battle of the Bands",
      time: "05:00 PM",
      venue: "Open Air Stage",
      category: "Music",
      description: "An evening of live music and performances.",
    },
  ],
  2: [
    {
      id: 5,
      title: "Esports Championship",
      time: "09:30 AM",
      venue: "Gaming Arena",
      category: "Gaming",
      description: "Competitive gaming enters its final rounds.",
    },
    {
      id: 6,
      title: "Cosplay Showcase",
      time: "12:00 PM",
      venue: "Main Stage",
      category: "Comic Con",
      description: "Showcase your favourite characters.",
    },
    {
      id: 7,
      title: "Robotics Showdown",
      time: "02:30 PM",
      venue: "Technical Arena",
      category: "Technology",
      description: "Robotics teams compete in an exciting showdown.",
    },
    {
      id: 8,
      title: "Star Night",
      time: "06:00 PM",
      venue: "Open Air Stage",
      category: "Entertainment",
      description: "The evening's headline performance.",
    },
  ],
  3: [
    {
      id: 9,
      title: "Gaming Finals",
      time: "10:00 AM",
      venue: "Gaming Arena",
      category: "Gaming",
      description: "The final battle for the championship.",
    },
    {
      id: 10,
      title: "Tech Exhibition",
      time: "12:00 PM",
      venue: "Exhibition Hall",
      category: "Technology",
      description: "Explore innovative student projects.",
    },
    {
      id: 11,
      title: "Prize Distribution",
      time: "04:00 PM",
      venue: "Main Auditorium",
      category: "Ceremony",
      description: "Celebrate the winners and participants.",
    },
    {
      id: 12,
      title: "Closing Ceremony",
      time: "06:00 PM",
      venue: "Main Stage",
      category: "Ceremony",
      description: "The final lap of the festival.",
    },
  ],
};

const sectorColors = [
  "#d9362b", // McQueen red
  "#f4b942", // Racing yellow
  "#4a9188", // Radiator Springs teal
  "#6499b3", // Sky blue
];

const tracks: Record<number, string> = {
  1: "suzuka",
  2: "spa",
  3: "red-bull-ring",
};

export default function SchedulePage() {
  const [activeDay, setActiveDay] = useState(1);
  const [selectedByDay, setSelectedByDay] = useState<Record<number, number>>({
    1: 0,
    2: 0,
    3: 0,
  });

  const events = schedule[activeDay];
  const selectedEvent = selectedByDay[activeDay] ?? 0;
  const currentEvent = events[selectedEvent];

  const handleEventChange = (index: number) => {
    setSelectedByDay((prev) => ({
      ...prev,
      [activeDay]: index,
    }));
  };

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroTop}>
          <span className={styles.eyebrow}>
            YUVAAN 2K27 / OFFICIAL SCHEDULE
          </span>
          <span className={styles.live}>
            <span className={styles.liveDot} />
            EVENT CONTROL
          </span>
        </div>

        <div className={styles.heroContent}>
          <div>
            <p className={styles.heroLabel}>THREE DAYS. ONE FESTIVAL.</p>
            <h1>
              THE
              <br />
              <span>RACE</span> IS ON.
            </h1>
            <p className={styles.heroDescription}>
              Every event is a new lap. Explore the complete Yuvaan
              schedule and choose your next destination.
            </p>
          </div>

          <div className={styles.heroNumber}>
            <span>EDITION</span>
            <strong>27</strong>
            <span>GUWAHATI, INDIA</span>
          </div>
        </div>

        <div className={styles.heroBottom}>
          <span>01 — SCHEDULE</span>
          <span>02 — CIRCUIT MAP</span>
          <span>03 — EVENT DETAILS</span>
        </div>
      </section>

      <section className={styles.scheduleSection}>
        <div className={styles.sectionHeading}>
          <div>
            <span className={styles.sectionEyebrow}>THE ITINERARY</span>
            <h2>RACE SCHEDULE<span>.</span></h2>
          </div>

          <p>SELECT A DAY TO EXPLORE THE CIRCUIT</p>
        </div>

        <div className={styles.daySelector}>
          {[1, 2, 3].map((day) => (
            <button
              key={day}
              className={`${styles.dayButton} ${
                activeDay === day ? styles.activeDay : ""
              }`}
              onClick={() => setActiveDay(day)}
            >
              <span>DAY 0{day}</span>
              <strong>{["FRIDAY", "SATURDAY", "SUNDAY"][day - 1]}</strong>
              <span className={styles.dayArrow}>↗</span>
            </button>
          ))}
        </div>

        <div className={styles.trackHeader}>
          <div>
            <span className={styles.sectionEyebrow}>LIVE CIRCUIT VIEW</span>
            <h2>THE TRACK<span>.</span></h2>
          </div>

          <span className={styles.trackName}>
            {["SUZUKA", "SPA-FRANCORCHAMPS", "RED BULL RING"][
              activeDay - 1
            ]}
          </span>
        </div>

        <div className={styles.trackContainer}>
          <RaceTrackScene
            day={activeDay}
            trackFile={tracks[activeDay]}
            events={events}
            selectedEvent={selectedEvent}
            onEventChange={handleEventChange}
          />
        </div>

        <div className={styles.legend}>
          {sectorColors.map((color, index) => (
            <div key={index} className={styles.legendItem}>
              <span style={{ backgroundColor: color }} />
              SECTOR 0{index + 1}
            </div>
          ))}
        </div>
      </section>

      <section className={styles.eventsSection}>
        <div className={styles.sectionHeading}>
          <div>
            <span className={styles.sectionEyebrow}>
              DAY 0{activeDay} / EVENT GRID
            </span>
            <h2>CHOOSE YOUR EVENT<span>.</span></h2>
          </div>

          <p>04 EVENTS / 04 SECTORS</p>
        </div>

        <div className={styles.eventGrid}>
          {events.map((event, index) => (
            <button
              key={event.id}
              className={`${styles.eventCard} ${
                selectedEvent === index ? styles.selectedCard : ""
              }`}
              style={
                {
                  "--sector-color": sectorColors[index],
                } as React.CSSProperties
              }
              onClick={() => handleEventChange(index)}
            >
              <div className={styles.eventTop}>
                <span>SECTOR 0{index + 1}</span>
                <span>0{event.id}</span>
              </div>

              <div className={styles.eventContent}>
                <h3>{event.title}</h3>
                <span className={styles.eventCategory}>
                  {event.category}
                </span>
              </div>

              <div className={styles.eventBottom}>
                <span>{event.time}</span>
                <span>↗</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className={styles.detailsSection}>
        <div className={styles.detailsLabel}>
          <span className={styles.sectionEyebrow}>SELECTED EVENT</span>
          <h2>RACE<br />INTEL<span>.</span></h2>
        </div>

        <div className={styles.detailsContent}>
          <div className={styles.detailsTop}>
            <span
              className={styles.detailsSector}
              style={{ color: sectorColors[selectedEvent] }}
            >
              SECTOR 0{selectedEvent + 1}
            </span>
            <span>EVENT 0{currentEvent.id} / 12</span>
          </div>

          <h3>{currentEvent.title}</h3>
          <p>{currentEvent.description}</p>

          <div className={styles.detailsInfo}>
            <div>
              <span>TIME</span>
              <strong>{currentEvent.time}</strong>
            </div>
            <div>
              <span>LOCATION</span>
              <strong>{currentEvent.venue}</strong>
            </div>
            <div>
              <span>CATEGORY</span>
              <strong>{currentEvent.category}</strong>
            </div>
          </div>
        </div>
      </section>

      <footer className={styles.pageFooter}>
        <span>YUVAAN 2K27</span>
        <span>END OF THE LINE. START OF THE EXPERIENCE.</span>
      </footer>
    </main>
  );
}