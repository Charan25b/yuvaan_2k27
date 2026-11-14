
"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { CSSProperties } from "react";

import { Canvas, useFrame } from "@react-three/fiber";
import { Text, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";

type Event = {
  id: number;
  title: string;
  time: string;
  venue: string;
  category: string;
  description: string;
};

type Props = {
  day: number;
  trackFile: string;
  events: Event[];
  selectedEvent: number;
  onEventChange: (index: number) => void;
};

const SECTOR_COLORS = [
  "#d9362b",
  "#f4b942",
  "#4a9188",
  "#6499b3",
];

const SECTOR_NAMES = [
  "SECTOR 01",
  "SECTOR 02",
  "SECTOR 03",
  "SECTOR 04",
];

const TRACK_WIDTH = 1.0;
const KERB_WIDTH = 0.40;

function createTrackCurve(svgText: string) {
  const loader = new SVGLoader();
  const parsed = loader.parse(svgText);

  const subPaths = parsed.paths.flatMap(
    (path) => path.subPaths
  );

  if (!subPaths.length) {
    throw new Error("No track path found in SVG.");
  }

  const sourcePath = [...subPaths].sort(
    (a, b) => b.getLength() - a.getLength()
  )[0];

  const svgPoints = sourcePath.getSpacedPoints(1800);

  const points = svgPoints.map(
    (point) =>
      new THREE.Vector3(
        (point.x - 250) * 0.18,
        0,
        -(point.y - 250) * 0.18
      )
  );

  return new THREE.CatmullRomCurve3(
    points,
    true,
    "centripetal",
    0.02
  );
}

function createRoadGeometry(
  curve: THREE.CatmullRomCurve3,
  start: number,
  end: number,
  segments: number,
  halfWidth: number,
  height: number
) {
  const vertices: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= segments; i++) {
    const t = start + (end - start) * (i / segments);

    const point = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t).normalize();

    const side = new THREE.Vector3(
      -tangent.z,
      0,
      tangent.x
    ).normalize();

    const left = point.clone().addScaledVector(side, halfWidth);
    const right = point.clone().addScaledVector(side, -halfWidth);

    left.y += height;
    right.y += height;

    vertices.push(
      left.x, left.y, left.z,
      right.x, right.y, right.z
    );

    if (i < segments) {
      const current = i * 2;

      indices.push(
        current,
        current + 2,
        current + 1,
        current + 1,
        current + 2,
        current + 3
      );
    }
  }

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );

  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

function getTrackCurvature(
  curve: THREE.CatmullRomCurve3,
  t: number
) {
  const before = curve
    .getTangentAt((t - 0.006 + 1) % 1)
    .normalize();

  const after = curve
    .getTangentAt((t + 0.006) % 1)
    .normalize();

  return before.angleTo(after);
}

function getTrackSide(tangent: THREE.Vector3) {
  return new THREE.Vector3(
    -tangent.z,
    0,
    tangent.x
  ).normalize();
}

function Track({ curve }: { curve: THREE.CatmullRomCurve3 }) {
  const roadGeometry = useMemo(
    () =>
      createRoadGeometry(
        curve,
        0,
        1,
        2000,
        TRACK_WIDTH,
        0.12
      ),
    [curve]
  );

  const sectorGeometries = useMemo(
    () =>
      SECTOR_COLORS.map((_, index) =>
        createRoadGeometry(
          curve,
          index / 4,
          (index + 1) / 4,
          500,
          TRACK_WIDTH * 0.94,
          0.16
        )
      ),
    [curve]
  );

  const edgeGeometries = useMemo(
    () =>
      [-1, 1].map((direction) => {
        const points: THREE.Vector3[] = [];

        for (let i = 0; i <= 1200; i++) {
          const t = i / 1200;
          const point = curve.getPointAt(t);
          const tangent = curve.getTangentAt(t);
          const side = getTrackSide(tangent);

          points.push(
            point
              .clone()
              .addScaledVector(
                side,
                direction * (TRACK_WIDTH + 0.08)
              )
              .setY(0.2)
          );
        }

        const edgeCurve = new THREE.CatmullRomCurve3(
          points,
          true
        );

        return new THREE.TubeGeometry(
          edgeCurve,
          1200,
          0.035,
          6,
          true
        );
      }),
    [curve]
  );

  return (
    <group>
      {/* Black ground */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.2, 0]}
      >
        <planeGeometry args={[300, 300]} />
        <meshBasicMaterial color="#dfc49e" />
      </mesh>

      {/* Thin continuous asphalt road */}
      <mesh geometry={roadGeometry} receiveShadow>
        <meshStandardMaterial
          color="#51463c"
          roughness={0.95}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Four coloured sectors */}
      {sectorGeometries.map((geometry, index) => (
        <mesh key={index} geometry={geometry}>
          <meshBasicMaterial
            color={SECTOR_COLORS[index]}
            transparent
            opacity={0.20}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* Thin white road edges */}
      {edgeGeometries.map((geometry, index) => (
        <mesh key={index} geometry={geometry}>
          <meshBasicMaterial color="#f4e7ce" />
        </mesh>
      ))}
    </group>
  );
}

function TrackKerbs({
  curve,
}: {
  curve: THREE.CatmullRomCurve3;
}) {
  const kerbs = useMemo(() => {
    const result: {
      position: THREE.Vector3;
      rotation: number;
      color: string;
    }[] = [];

    const samples = 1200;

    for (let i = 3; i < samples - 3; i += 4) {
      const t = i / samples;
      const curvature = getTrackCurvature(curve, t);

      if (curvature < 0.045) continue;

      const point = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t).normalize();
      const side = getTrackSide(tangent);

      const rotation = Math.atan2(tangent.x, tangent.z);

      for (const direction of [-1, 1]) {
        const position = point
          .clone()
          .addScaledVector(
            side,
            direction * (TRACK_WIDTH + KERB_WIDTH / 2)
          );

        position.y = 0.23;

        result.push({
          position,
          rotation,
          color:
            Math.floor(i / 4) % 2 === 0
              ? "#d9362b"
              : "#f4b942",
        });
      }
    }

    return result;
  }, [curve]);

  return (
    <group>
      {kerbs.map((kerb, index) => (
        <mesh
          key={index}
          position={kerb.position}
          rotation={[0, kerb.rotation, 0]}
        >
          <boxGeometry args={[0.45, 0.12, 0.38]} />
          <meshStandardMaterial
            color={kerb.color}
            roughness={0.8}
          />
        </mesh>
      ))}
    </group>
  );
}

function EventMarkers({
  curve,
  events,
}: {
  curve: THREE.CatmullRomCurve3;
  events: Event[];
}) {
  return (
    <group>
      {events.slice(0, 4).map((event, index) => {
        const t = (index + 0.5) / 4;
        const point = curve.getPointAt(t);

        return (
          <group
            key={event.id}
            position={[point.x, 0, point.z]}
          >
            {/* Floating marker pole */}
            <mesh position={[0, 2.2, 0]}>
              <boxGeometry args={[0.09, 4.4, 0.09]} />
              <meshStandardMaterial
                color={SECTOR_COLORS[index]}
                emissive={SECTOR_COLORS[index]}
                emissiveIntensity={0.5}
              />
            </mesh>

            {/* Sector label */}
            <Text
              position={[0, 4.7, 0]}
              fontSize={0.7}
              color={SECTOR_COLORS[index]}
              anchorX="center"
              outlineWidth={0.03}
              outlineColor="#30251f"
            >
              {SECTOR_NAMES[index]}
            </Text>

            {/* Event name */}
            <Text
              position={[0, 3.9, 0]}
              fontSize={0.42}
              color="white"
              anchorX="center"
              outlineWidth={0.025}
              outlineColor="#101419"
            >
              {event.title.toUpperCase()}
            </Text>
          </group>
        );
      })}
    </group>
  );
}

function RaceCar() {
  const { scene } = useGLTF("/models/mcqueen/scene.gltf");

  const car = useMemo(() => {
    const clone = scene.clone();

    clone.scale.setScalar(0.55);

    clone.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = true;
      }
    });

    return clone;
  }, [scene]);

  return <primitive object={car} />;
}

function RacingWorld({
  curve,
  selectedEvent,
  onEventChange,
  cameraMode,
}: {
  curve: THREE.CatmullRomCurve3;
  events: Event[];
  selectedEvent: number;
  onEventChange: (index: number) => void;
  cameraMode: "overview" | "chase";
}) {
  const carRef = useRef<THREE.Group>(null);
  const progress = useRef(0);
  const lastEvent = useRef(-1);
  const cameraTarget = useRef(new THREE.Vector3());

  useEffect(() => {
    progress.current = (selectedEvent + 0.002) / 4;
    lastEvent.current = selectedEvent;
  }, [selectedEvent]);

  useFrame((state, delta) => {
    if (!carRef.current) return;

    progress.current =
      (progress.current + delta * 0.055) % 1;

    const t = progress.current;
    const point = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);

    carRef.current.position.set(
      point.x,
      0.4,
      point.z
    );

    carRef.current.rotation.y = Math.atan2(
      tangent.x,
      tangent.z
    );

    const eventIndex = Math.min(3, Math.floor(t * 4));

    if (eventIndex !== lastEvent.current) {
      lastEvent.current = eventIndex;
      onEventChange(eventIndex);
    }

    if (cameraMode === "chase") {
      const behind = tangent.clone().multiplyScalar(-9);

      cameraTarget.current.set(
        point.x + behind.x,
        point.y + 4.5,
        point.z + behind.z
      );

      state.camera.position.lerp(
        cameraTarget.current,
        1 - Math.exp(-delta * 2)
      );

      state.camera.lookAt(
        point.x,
        point.y + 0.8,
        point.z
      );
    } else {
      cameraTarget.current.set(0, 88, 65);

      state.camera.position.lerp(
        cameraTarget.current,
        1 - Math.exp(-delta * 2)
      );

      state.camera.lookAt(0, 0, 0);
    }
  });

  return (
    <group ref={carRef}>
      <RaceCar />
    </group>
  );
}

function Circuit({
  curve,
  events,
  selectedEvent,
  onEventChange,
  cameraMode,
}: {
  curve: THREE.CatmullRomCurve3 | null;
  events: Event[];
  selectedEvent: number;
  onEventChange: (index: number) => void;
  cameraMode: "overview" | "chase";
}) {
  if (!curve) {
    return null;
  }

  return (
    <>
      <Track curve={curve} />

      {/* Corner kerbs retained */}
      <TrackKerbs curve={curve} />

      {/* No TrackBarriers component */}

      {/* Floating event markers retained */}
      <EventMarkers curve={curve} events={events} />

      <RacingWorld
        curve={curve}
        events={events}
        selectedEvent={selectedEvent}
        onEventChange={onEventChange}
        cameraMode={cameraMode}
      />
    </>
  );
}

export default function RaceTrackScene({
  day,
  trackFile,
  events,
  selectedEvent,
  onEventChange,
}: Props) {
  const [cameraMode, setCameraMode] = useState<
    "overview" | "chase"
  >("overview");
  const [trackAsset, setTrackAsset] = useState<
    | { trackFile: string; svgText: string }
    | { trackFile: string; error: true }
    | null
  >(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`/tracks/${trackFile}.svg`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Track SVG not found");
        }

        return response.text();
      })
      .then((svgText) => {
        if (!cancelled) {
          setTrackAsset({ trackFile, svgText });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTrackAsset({ trackFile, error: true });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [trackFile]);

  const currentTrackAsset =
    trackAsset?.trackFile === trackFile ? trackAsset : null;
  const svgText =
    currentTrackAsset && "svgText" in currentTrackAsset
      ? currentTrackAsset.svgText
      : null;
  const trackLoadError =
    currentTrackAsset !== null && "error" in currentTrackAsset;

  const curve = useMemo(() => {
    if (!svgText) return null;

    try {
      return createTrackCurve(svgText);
    } catch {
      return null;
    }
  }, [svgText]);

  const trackError = trackLoadError || (svgText !== null && !curve);

  return (
    <div className="race-scene">
      <div className="race-camera-controls">
        <button
          className={
            cameraMode === "overview" ? "camera-active" : ""
          }
          onClick={() => setCameraMode("overview")}
        >
          OVERVIEW CAM
        </button>

        <button
          className={
            cameraMode === "chase" ? "camera-active" : ""
          }
          onClick={() => setCameraMode("chase")}
        >
          CHASE CAM
        </button>
      </div>

      <div className="race-canvas">
        <Canvas
          shadows
          camera={{
            position: [0, 88, 65],
            fov: 45,
            near: 0.1,
            far: 500,
          }}
        >
          <color attach="background" args={["#dfc49e"]} />

          <ambientLight intensity={1.5} />

          <directionalLight
            position={[30, 50, 20]}
            intensity={2.5}
            castShadow
          />

          <pointLight
            position={[-20, 15, -20]}
            intensity={2}
            color="#f4b942"
          />

          <Circuit
            curve={curve}
            events={events}
            selectedEvent={selectedEvent}
            onEventChange={onEventChange}
            cameraMode={cameraMode}
          />
        </Canvas>

        {!curve && (
          <div
            className="race-track-message"
            role={trackError ? "alert" : "status"}
            aria-live="polite"
          >
            <div>
              {trackError
                ? "Could not load the circuit SVG. Check public/tracks."
                : "PREPARING THE CIRCUIT..."}
            </div>
          </div>
        )}
      </div>

      <div className="race-event-strip">
        {events.map((event, index) => (
          <button
            key={event.id}
            className={
              selectedEvent === index
                ? "race-event active"
                : "race-event"
            }
            style={
              {
                "--sector-color": SECTOR_COLORS[index % 4],
              } as CSSProperties
            }
            onClick={() => onEventChange(index)}
          >
            <span>SECTOR 0{index + 1}</span>
            <strong>{event.title}</strong>
            <small>{event.time}</small>
          </button>
        ))}
      </div>

      <div className="race-hud">
        <span>DAY 0{day}</span>
        <span>
          SECTOR 0{selectedEvent + 1} / CURRENT EVENT
        </span>
        <span>YUVAAN 2K27</span>
      </div>
    </div>
  );
}

useGLTF.preload("/models/mcqueen/scene.gltf");
