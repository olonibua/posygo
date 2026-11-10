import type { ReactNode } from "react";

import { BOTTLE, type BoxGuideEntry, GARMENT, garmentFootprint, packBottles, packGarments, type Placement } from "./box-guide-data";

export type BoxContents = "bottles" | "clothes";

const COS = Math.cos(Math.PI / 6);
const SIN = Math.sin(Math.PI / 6);
const SCALE = 0.42;
const LARGEST = { length: 610, width: 460, height: 460 };
const MARGIN = 110;

type Point = [number, number, number];

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function project([x, y, z]: Point, origin: { x: number; y: number }): [number, number] {
  return [round(origin.x + (x - y) * COS * SCALE), round(origin.y + ((x + y) * SIN - z) * SCALE)];
}

function face(points: Point[], origin: { x: number; y: number }, fill: string, opacity = 1, key?: string): ReactNode {
  const path = points.map((point) => project(point, origin).join(",")).join(" ");
  return <polygon key={key} points={path} fill={fill} fillOpacity={opacity} stroke="#5b4426" strokeWidth={1.2} strokeLinejoin="round" />;
}

function cuboid(at: Point, size: Point, origin: { x: number; y: number }, colours: { top: string; left: string; right: string }, key: string): ReactNode {
  const [x, y, z] = at;
  const [dx, dy, dz] = size;
  return (
    <g key={key}>
      {face(
        [
          [x, y + dy, z],
          [x + dx, y + dy, z],
          [x + dx, y + dy, z + dz],
          [x, y + dy, z + dz],
        ],
        origin,
        colours.left,
      )}
      {face(
        [
          [x + dx, y, z],
          [x + dx, y + dy, z],
          [x + dx, y + dy, z + dz],
          [x + dx, y, z + dz],
        ],
        origin,
        colours.right,
      )}
      {face(
        [
          [x, y, z + dz],
          [x + dx, y, z + dz],
          [x + dx, y + dy, z + dz],
          [x, y + dy, z + dz],
        ],
        origin,
        colours.top,
      )}
    </g>
  );
}

function cylinder(centre: Point, diameter: number, height: number, origin: { x: number; y: number }, colours: { body: string; top: string; line: string }): ReactNode {
  const radiusX = round((diameter / 2) * Math.SQRT2 * COS * SCALE);
  const radiusY = round((diameter / 2) * Math.SQRT2 * SIN * SCALE);
  const [bottomX, bottomY] = project(centre, origin);
  const [topX, topY] = project([centre[0], centre[1], centre[2] + height], origin);
  return (
    <>
      <path
        d={`M${bottomX - radiusX},${bottomY} A${radiusX},${radiusY} 0 0 0 ${bottomX + radiusX},${bottomY} L${topX + radiusX},${topY} L${topX - radiusX},${topY} Z`}
        fill={colours.body}
        stroke={colours.line}
        strokeWidth={0.6}
      />
      <ellipse cx={topX} cy={topY} rx={radiusX} ry={radiusY} fill={colours.top} stroke={colours.line} strokeWidth={0.6} />
    </>
  );
}

function bottle(at: Placement, origin: { x: number; y: number }, index: number): ReactNode {
  return (
    <g key={index}>
      {cylinder([at.x, at.y, at.z], BOTTLE.diameterMm, BOTTLE.heightMm, origin, { body: "#eef4f8", top: "#ffffff", line: "#7f8f9b" })}
      {cylinder([at.x, at.y, at.z + BOTTLE.heightMm], BOTTLE.diameterMm / 2, BOTTLE.capMm, origin, { body: "#2b2f36", top: "#4a505a", line: "#1b1e23" })}
    </g>
  );
}

const GARMENT_COLOURS = [
  { top: "#f3a5b6", left: "#d9879a", right: "#e595a8" },
  { top: "#b9d97c", left: "#9cbd62", right: "#aacb6f" },
  { top: "#9cc7ea", left: "#7eaad0", right: "#8db8dd" },
];

function contentsOf(entry: BoxGuideEntry, contents: BoxContents, origin: { x: number; y: number }): ReactNode[] {
  if (contents === "bottles") {
    const order = [...packBottles(entry).placements].sort((a, b) => a.z - b.z || a.x + a.y - (b.x + b.y));
    return order.map((at, index) => bottle(at, origin, index));
  }
  const footprint = garmentFootprint(entry);
  const order = [...packGarments(entry).placements].sort((a, b) => a.x + a.y - (b.x + b.y) || a.z - b.z);
  return order.map((at, index) =>
    cuboid([at.x + 4, at.y + 4, at.z], [footprint.x - 8, footprint.y - 8, GARMENT.heightMm], origin, GARMENT_COLOURS[Math.floor(at.z / GARMENT.heightMm) % 3]!, `g${index}`),
  );
}

function Dimension({ from, to, shift, text, origin }: { from: Point; to: Point; shift: [number, number]; text: string; origin: { x: number; y: number } }) {
  const [x1, y1] = project(from, origin);
  const [x2, y2] = project(to, origin);
  const a = [round(x1 + shift[0]), round(y1 + shift[1])] as const;
  const b = [round(x2 + shift[0]), round(y2 + shift[1])] as const;
  let angle = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
  if (angle > 90 || angle < -90) angle += 180;
  const middle = [round((a[0] + b[0]) / 2 + shift[0] * 1.3), round((a[1] + b[1]) / 2 + shift[1] * 1.3)];
  return (
    <g>
      <line x1={x1} y1={y1} x2={a[0]} y2={a[1]} stroke="#8a7a66" strokeDasharray="3 3" />
      <line x1={x2} y1={y2} x2={b[0]} y2={b[1]} stroke="#8a7a66" strokeDasharray="3 3" />
      <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="var(--danger, #d1462f)" strokeWidth={3} markerStart="url(#box-arrow)" markerEnd="url(#box-arrow)" />
      <text transform={`translate(${middle[0]},${middle[1]}) rotate(${round(angle)})`} y={9} textAnchor="middle" fontSize={28} fontWeight={700} fill="var(--danger, #d1462f)">
        {text}
      </text>
    </g>
  );
}

export function IsoBox({ entry, contents, label }: { entry: BoxGuideEntry; contents: BoxContents; label: string }) {
  const [length, width, height] = entry.maxMm;
  const view = { width: (LARGEST.length + LARGEST.width) * COS * SCALE + MARGIN * 2, height: ((LARGEST.length + LARGEST.width) * SIN + LARGEST.height * 1.45) * SCALE + MARGIN };
  const origin = { x: round((view.width - (length + width) * COS * SCALE) / 2 + width * COS * SCALE), y: round(view.height - MARGIN * 1.1 - (length + width) * SIN * SCALE) };
  const flap = { left: width * 0.5, back: length * 0.4 };
  return (
    <svg viewBox={`0 0 ${view.width.toFixed(0)} ${view.height.toFixed(0)}`} className="h-auto w-full" role="img" aria-label={label}>
      <defs>
        <marker id="box-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,1 L9,5 L0,9 Z" fill="var(--danger, #d1462f)" />
        </marker>
      </defs>
      {face(
        [
          [0, 0, 0],
          [length, 0, 0],
          [length, width, 0],
          [0, width, 0],
        ],
        origin,
        "#a9824a",
      )}
      {face(
        [
          [0, 0, 0],
          [0, width, 0],
          [0, width, height],
          [0, 0, height],
        ],
        origin,
        "#b98f55",
      )}
      {face(
        [
          [0, 0, 0],
          [length, 0, 0],
          [length, 0, height],
          [0, 0, height],
        ],
        origin,
        "#c49a5e",
      )}
      {face(
        [
          [0, 0, height],
          [0, width, height],
          [0, width * 0.98, height + flap.left],
          [0, width * 0.02, height + flap.left],
        ],
        origin,
        "#d2a96c",
      )}
      {face(
        [
          [0, 0, height],
          [length, 0, height],
          [length * 0.98, 0, height + flap.back],
          [length * 0.02, 0, height + flap.back],
        ],
        origin,
        "#d8b175",
      )}
      {contentsOf(entry, contents, origin)}
      {face(
        [
          [length, 0, 0],
          [length, width, 0],
          [length, width, height],
          [length, 0, height],
        ],
        origin,
        "#d9b47c",
        0.42,
      )}
      {face(
        [
          [0, width, 0],
          [length, width, 0],
          [length, width, height],
          [0, width, height],
        ],
        origin,
        "#e3bf88",
        0.42,
      )}
      <Dimension from={[0, width, 0]} to={[length, width, 0]} shift={[-16, 30]} text={`${length / 10} cm`} origin={origin} />
      <Dimension from={[length, width, 0]} to={[length, 0, 0]} shift={[16, 30]} text={`${width / 10} cm`} origin={origin} />
      <Dimension from={[length, 0, 0]} to={[length, 0, height]} shift={[34, 0]} text={`${height / 10} cm`} origin={origin} />
    </svg>
  );
}
