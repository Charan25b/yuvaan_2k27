import * as THREE from "three";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";

export const TRACK_WIDTH = 1.0;
export const KERB_WIDTH = 0.4;

export function createTrackCurve(svgText: string) {
  const loader = new SVGLoader();
  const parsed = loader.parse(svgText);

  const subPaths = parsed.paths.flatMap((path) => path.subPaths);
  if (!subPaths.length) {
    throw new Error("No track path found in SVG.");
  }

  const sourcePath = [...subPaths].sort(
    (a, b) => b.getLength() - a.getLength()
  )[0];
  const svgPoints = sourcePath.getSpacedPoints(720);
  const points = svgPoints.map(
    (point) =>
      new THREE.Vector3(
        (point.x - 250) * 0.18,
        0,
        -(point.y - 250) * 0.18
      )
  );

  return new THREE.CatmullRomCurve3(points, true, "centripetal", 0.02);
}

export function createRoadGeometry(
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
    const side = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
    const left = point.clone().addScaledVector(side, halfWidth);
    const right = point.clone().addScaledVector(side, -halfWidth);

    left.y += height;
    right.y += height;
    vertices.push(left.x, left.y, left.z, right.x, right.y, right.z);

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

export function getTrackCurvature(
  curve: THREE.CatmullRomCurve3,
  t: number
) {
  const before = curve
    .getTangentAt((t - 0.006 + 1) % 1)
    .normalize();
  const after = curve.getTangentAt((t + 0.006) % 1).normalize();
  return before.angleTo(after);
}

export function getTrackSide(tangent: THREE.Vector3) {
  return new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
}
