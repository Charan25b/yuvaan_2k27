"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import styles from "./R2D2SpaceLayer.module.css";

const MODEL_URL = "/models/r2d2/r2d2.glb";
const CRUISE_SPEED = 0.48;

type Flight = {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotation: THREE.Euler;
  initialized: boolean;
  dragging: boolean;
  thrown: boolean;
  camera: THREE.Camera | null;
};

type Sample = { point: THREE.Vector3; time: number };

function pointerOnFlightPlane(
  clientX: number,
  clientY: number,
  flight: Flight,
  layer: HTMLDivElement | null,
) {
  if (!flight.camera || !layer) return null;
  const bounds = layer.getBoundingClientRect();

  const pointer = new THREE.Vector2(
    ((clientX - bounds.left) / bounds.width) * 2 - 1,
    1 - ((clientY - bounds.top) / bounds.height) * 2,
  );
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(pointer, flight.camera);
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -flight.position.z);
  return raycaster.ray.intersectPlane(plane, new THREE.Vector3());
}

function R2D2Model({
  flight,
  hitTarget,
  pageRoot,
  blockers,
  layer,
}: {
  flight: React.RefObject<Flight>;
  hitTarget: React.RefObject<HTMLButtonElement | null>;
  pageRoot: React.RefObject<HTMLElement | null>;
  blockers: React.RefObject<HTMLElement[]>;
  layer: React.RefObject<HTMLDivElement | null>;
}) {
  const root = useRef<THREE.Group>(null);
  const { scene } = useGLTF(MODEL_URL);
  const { camera, size, viewport } = useThree();

  const model = useMemo(() => {
    const object = scene.clone(true);
    object.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
    object.updateMatrixWorld(true);
    const sourceBounds = new THREE.Box3().setFromObject(object);
    const center = sourceBounds.getCenter(new THREE.Vector3());
    const dimensions = sourceBounds.getSize(new THREE.Vector3());
    const scale = 1.55 / Math.max(dimensions.x, dimensions.y, dimensions.z);
    const bounds = new THREE.Box3(
      sourceBounds.min.clone().sub(center).multiplyScalar(scale),
      sourceBounds.max.clone().sub(center).multiplyScalar(scale),
    );

    return { object, center, scale, bounds };
  }, [scene]);

  const corners = useMemo(
    () => Array.from({ length: 8 }, () => new THREE.Vector3()),
    [],
  );
  const projectedCenter = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, frameDelta) => {
    const group = root.current;
    const target = hitTarget.current;
    const page = pageRoot.current;
    const interactionLayer = layer.current;
    if (!group || !target || !page || !interactionLayer) return;

    const delta = Math.min(frameDelta, 0.05);
    const state = flight.current;
    const zoom = camera instanceof THREE.OrthographicCamera ? camera.zoom : 100;
    const pageBounds = page.getBoundingClientRect();
    const pageWidth = pageBounds.width / zoom;
    const pageHeight = pageBounds.height / zoom;
    const cameraTopWorld = pageHeight + pageBounds.top / zoom;
    const cameraCenterY = cameraTopWorld - viewport.height / 2;

    const pageIntersectsViewport = pageBounds.bottom > 0 && pageBounds.top < size.height;
    group.visible = pageIntersectsViewport;
    if (!pageIntersectsViewport) {
      target.style.visibility = "hidden";
      return;
    }

    camera.position.set(0, cameraCenterY, 12);
    camera.lookAt(0, cameraCenterY, 0);
    camera.updateMatrixWorld();
    state.camera = camera;

    if (!state.initialized) {
      const visibleTop = Math.max(0, pageBounds.top);
      const visibleBottom = Math.min(size.height, pageBounds.bottom);
      const visibleWorldTop = pageHeight - (visibleTop - pageBounds.top) / zoom;
      const visibleWorldBottom = pageHeight - (visibleBottom - pageBounds.top) / zoom;
      const visibleWorldHeight = Math.max(0.6, visibleWorldTop - visibleWorldBottom);
      state.position.set(
        -pageWidth / 2 - 0.84,
        THREE.MathUtils.randFloat(
          visibleWorldBottom + Math.min(0.85, visibleWorldHeight * 0.25),
          visibleWorldTop - Math.min(0.85, visibleWorldHeight * 0.25),
        ),
        0,
      );
      state.velocity.set(1, THREE.MathUtils.randFloat(-0.35, 0.35), 0);
      state.velocity.normalize().multiplyScalar(CRUISE_SPEED);
      state.initialized = true;
    }

    if (!state.dragging) {
      if (state.thrown) {
        const direction = state.velocity.clone().normalize();
        const cruise = direction.multiplyScalar(CRUISE_SPEED);
        state.velocity.lerp(cruise, 1 - Math.exp(-delta / 1.7));
        if (Math.abs(state.velocity.length() - CRUISE_SPEED) < 0.012) {
          state.velocity.copy(cruise);
          state.thrown = false;
        }
      }

      state.position.addScaledVector(state.velocity, delta);

      const radius = 0.84;
      const halfWidth = pageWidth / 2;
      const outsideX = state.position.x > halfWidth + radius || state.position.x < -halfWidth - radius;
      const outsideY = state.position.y > pageHeight + radius || state.position.y < -radius;

      if (outsideX || outsideY) {
        const canEnterHorizontally = Math.abs(state.velocity.x) >= Math.abs(state.velocity.y) * 0.6;
        if (canEnterHorizontally) {
          state.position.x = state.velocity.x >= 0 ? -halfWidth - radius : halfWidth + radius;
          state.position.y = THREE.MathUtils.randFloat(radius, pageHeight - radius);
        } else {
          state.position.y = state.velocity.y >= 0 ? -radius : pageHeight + radius;
          state.position.x = THREE.MathUtils.randFloat(-halfWidth + radius, halfWidth - radius);
        }
      }
    }

    const spin = state.dragging ? 1 : 4;
    state.rotation.x += delta * 0.018 * spin;
    state.rotation.y += delta * 0.028 * spin;
    state.rotation.z += delta * 0.01 * spin;

    group.position.copy(state.position);
    group.rotation.copy(state.rotation);
    group.updateMatrixWorld(true);

    let left = Infinity;
    let top = Infinity;
    let right = -Infinity;
    let bottom = -Infinity;
    let nearestDepth = Infinity;
    let farthestDepth = -Infinity;
    let index = 0;

    for (const x of [model.bounds.min.x, model.bounds.max.x]) {
      for (const y of [model.bounds.min.y, model.bounds.max.y]) {
        for (const z of [model.bounds.min.z, model.bounds.max.z]) {
          const point = corners[index++].set(x, y, z).applyMatrix4(group.matrixWorld).project(camera);
          const px = ((point.x + 1) / 2) * size.width;
          const py = ((1 - point.y) / 2) * size.height;
          left = Math.min(left, px);
          right = Math.max(right, px);
          top = Math.min(top, py);
          bottom = Math.max(bottom, py);
          nearestDepth = Math.min(nearestDepth, point.z);
          farthestDepth = Math.max(farthestDepth, point.z);
        }
      }
    }

    const visible = farthestDepth > -1 && nearestDepth < 1 && right > 0 && bottom > 0 && left < size.width && top < size.height;
    if (!visible) {
      target.style.visibility = "hidden";
      return;
    }

    const layerBounds = interactionLayer.getBoundingClientRect();
    projectedCenter.setFromMatrixPosition(group.matrixWorld).project(camera);
    const centerX = layerBounds.left + ((projectedCenter.x + 1) / 2) * size.width;
    const centerY = layerBounds.top + ((1 - projectedCenter.y) / 2) * size.height;
    const overSponsorCard = blockers.current.some((element) => {
      if (!element.isConnected) return false;
      const bounds = element.getBoundingClientRect();
      return centerX >= bounds.left && centerX <= bounds.right && centerY >= bounds.top && centerY <= bounds.bottom;
    });
    if (overSponsorCard) {
      target.style.visibility = "hidden";
      return;
    }

    target.style.left = `${layerBounds.left + THREE.MathUtils.clamp(left, 0, size.width)}px`;
    target.style.top = `${layerBounds.top + THREE.MathUtils.clamp(top, 0, size.height)}px`;
    target.style.width = `${Math.max(30, THREE.MathUtils.clamp(right, 0, size.width) - THREE.MathUtils.clamp(left, 0, size.width))}px`;
    target.style.height = `${Math.max(30, THREE.MathUtils.clamp(bottom, 0, size.height) - THREE.MathUtils.clamp(top, 0, size.height))}px`;
    target.style.visibility = "visible";
  });

  return (
    <group ref={root}>
      <group scale={model.scale}>
        <group position={[-model.center.x, -model.center.y, -model.center.z]}>
          <primitive object={model.object} />
        </group>
      </group>
    </group>
  );
}

function LeftKeyLight({ flight }: { flight: React.RefObject<Flight> }) {
  const rig = useRef<THREE.Group>(null);
  const light = useRef<THREE.DirectionalLight>(null);
  const target = useMemo(() => new THREE.Object3D(), []);

  useFrame(() => {
    if (rig.current) rig.current.position.copy(flight.current.position);
    if (light.current && light.current.target !== target) light.current.target = target;
  });

  return (
    <group ref={rig}>
      <primitive object={target} />
      <directionalLight
        ref={light}
        position={[-4.5, 3.5, 5]}
        intensity={3.2}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
        shadow-camera-near={0.1}
        shadow-camera-far={20}
        shadow-bias={-0.00015}
        shadow-normalBias={0.02}
        shadow-radius={2}
      />
    </group>
  );
}

function Scene({
  flight,
  hitTarget,
  pageRoot,
  blockers,
  layer,
}: {
  flight: React.RefObject<Flight>;
  hitTarget: React.RefObject<HTMLButtonElement | null>;
  pageRoot: React.RefObject<HTMLElement | null>;
  blockers: React.RefObject<HTMLElement[]>;
  layer: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <>
      <Environment background={false} environmentIntensity={0.55} frames={1} resolution={64}>
        <Lightformer
          form="rect"
          intensity={2.2}
          color="#ffffff"
          position={[-4, 3, 5]}
          scale={[5, 4, 1]}
          target={[0, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={0.8}
          color="#dce7f3"
          position={[4, 1, -3]}
          scale={[4, 5, 1]}
          target={[0, 0, 0]}
        />
      </Environment>
      <ambientLight intensity={0.38} color="#e8eef7" />
      <LeftKeyLight flight={flight} />
      <Suspense fallback={null}>
        <R2D2Model flight={flight} hitTarget={hitTarget} pageRoot={pageRoot} blockers={blockers} layer={layer} />
      </Suspense>
    </>
  );
}

export function R2D2SpaceLayer() {
  const [dragging, setDragging] = useState(false);
  const layer = useRef<HTMLDivElement>(null);
  const pageRoot = useRef<HTMLElement | null>(null);
  const blockers = useRef<HTMLElement[]>([]);
  const hitTarget = useRef<HTMLButtonElement>(null);
  const dragOffset = useRef(new THREE.Vector3());
  const samples = useRef<Sample[]>([]);
  const flight = useRef<Flight>({
    position: new THREE.Vector3(0, 0, 0),
    velocity: new THREE.Vector3(CRUISE_SPEED, 0, 0),
    rotation: new THREE.Euler(0, 0, 0),
    initialized: false,
    dragging: false,
    thrown: false,
    camera: null,
  });

  useEffect(() => {
    pageRoot.current = document.querySelector<HTMLElement>("[data-sponsor-page]");
    blockers.current = Array.from(document.querySelectorAll<HTMLElement>("[data-r2-block]"));
    return () => {
      pageRoot.current = null;
      blockers.current = [];
    };
  }, []);

  const track = (event: React.PointerEvent<HTMLButtonElement>) => {
    const state = flight.current;
    if (!state.dragging || state.camera === null) return;
    const point = pointerOnFlightPlane(event.clientX, event.clientY, state, layer.current);
    if (!point) return;

    state.position.copy(point.add(dragOffset.current));
    const now = performance.now();
    samples.current.push({ point: point.clone(), time: now });
    while (samples.current.length > 2 && now - samples.current[0].time > 140) {
      samples.current.shift();
    }
  };

  const startDrag = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0 && event.pointerType === "mouse") return;
    event.preventDefault();
    const state = flight.current;
    const point = pointerOnFlightPlane(event.clientX, event.clientY, state, layer.current);
    if (!point) return;

    dragOffset.current.copy(state.position).sub(point);
    state.dragging = true;
    state.thrown = false;
    samples.current = [{ point: state.position.clone(), time: performance.now() }];
    state.velocity.set(0, 0, 0);
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const finishDrag = (event: React.PointerEvent<HTMLButtonElement>) => {
    const state = flight.current;
    if (!state.dragging) return;
    track(event);
    state.dragging = false;
    setDragging(false);

    const points = samples.current;
    const first = points[0];
    const last = points[points.length - 1];
    const elapsed = first && last ? Math.max((last.time - first.time) / 1000, 0.016) : 0;
    const throwVelocity = first && last && elapsed > 0
      ? last.point.clone().sub(first.point).divideScalar(elapsed)
      : new THREE.Vector3();
    throwVelocity.z = 0;
    const throwSpeed = throwVelocity.length();

    if (throwSpeed > 0.25) {
      state.velocity.copy(throwVelocity.clampLength(0, 10));
      state.thrown = state.velocity.length() > CRUISE_SPEED;
    } else {
      if (state.velocity.lengthSq() < 0.001) state.velocity.set(CRUISE_SPEED, 0, 0);
      else state.velocity.setLength(CRUISE_SPEED);
      state.thrown = false;
    }

    samples.current = [];
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const moveWithKeyboard = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const directions: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, 1],
      ArrowDown: [0, -1],
    };
    const direction = directions[event.key];
    if (!direction) return;
    event.preventDefault();
    const state = flight.current;
    state.position.x += direction[0] * 0.28;
    state.position.y += direction[1] * 0.28;
    state.velocity.set(direction[0], direction[1], 0).normalize().multiplyScalar(2.6);
    state.thrown = true;
  };

  return (
    <>
      <div className={styles.layer} aria-hidden="true">
        <Canvas
          className={styles.canvas}
          orthographic
        shadows
          camera={{ position: [0, 0, 12], zoom: 100, near: 0.1, far: 40 }}
          dpr={[1, 1.35]}
          gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
          fallback={<span className={styles.fallback}>R2-D2 model requires WebGL.</span>}
        >
          <Scene flight={flight} hitTarget={hitTarget} pageRoot={pageRoot} blockers={blockers} layer={layer} />
        </Canvas>
      </div>
      <div ref={layer} className={styles.interactionLayer}>
        <button
          ref={hitTarget}
          type="button"
          className={`${styles.hitTarget} ${dragging ? styles.dragging : ""}`}
          aria-label="R2-D2 model. Drag to move and release to throw. Use arrow keys to steer."
          aria-pressed={dragging}
          title="Drag to move and release to throw."
          onPointerDown={startDrag}
          onPointerMove={track}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
          onKeyDown={moveWithKeyboard}
        />
      </div>
    </>
  );
}

useGLTF.preload(MODEL_URL);
