import type { StorageTier } from "@/shared";

export type GuideTier = Exclude<StorageTier, "PALLET">;
export type Millimetres = [number, number, number];

export interface BoxGuideEntry {
  tier: GuideTier;
  maxMm: Millimetres;
  maxKg: number;
  examples: string[];
}

export const BOX_MATERIAL = "Double-wall corrugated cardboard";

export const BOX_GUIDE: readonly BoxGuideEntry[] = [
  { tier: "SMALL", maxMm: [310, 230, 230], maxKg: 10, examples: ["UK 12 × 9 × 9 in", "EU 30 × 20 × 20 cm"] },
  { tier: "MEDIUM", maxMm: [460, 310, 310], maxKg: 15, examples: ["UK 18 × 12 × 12 in", "EU 40 × 30 × 30 cm"] },
  { tier: "LARGE", maxMm: [460, 460, 460], maxKg: 20, examples: ["UK 18 × 18 × 18 in", "EU 40 × 40 × 40 cm"] },
  { tier: "X_LARGE", maxMm: [610, 460, 460], maxKg: 25, examples: ["UK 24 × 18 × 18 in", "EU 60 × 40 × 40 cm"] },
];

export const BOTTLE = { diameterMm: 40, heightMm: 130, capMm: 22, pitchMm: 45, kg: 0.12 } as const;
export const GARMENT = { lengthMm: 280, widthMm: 210, heightMm: 30, kg: 0.2 } as const;

function byLength(size: Millimetres): Millimetres {
  return [...size].sort((a, b) => b - a) as Millimetres;
}

export function tierForBox(size: Millimetres): GuideTier | null {
  const sorted = byLength(size);
  const entry = BOX_GUIDE.find(({ maxMm }) => sorted.every((side, index) => side <= maxMm[index]!));
  return entry?.tier ?? null;
}

export interface Placement {
  x: number;
  y: number;
  z: number;
}

export interface Packing {
  placements: Placement[];
  limitedByWeight: boolean;
}

function capByWeight(placements: Placement[], maxKg: number, itemKg: number): Packing {
  const allowed = Math.floor(maxKg / itemKg + 1e-9);
  return { placements: placements.slice(0, allowed), limitedByWeight: placements.length > allowed };
}

export function packBottles(entry: BoxGuideEntry): Packing {
  const [length, width, height] = entry.maxMm;
  const pitch = BOTTLE.pitchMm;
  const layerHeight = BOTTLE.heightMm + BOTTLE.capMm + 5;
  const columns = Math.floor(length / pitch);
  const rows = Math.floor(width / pitch);
  const layers = Math.floor(height / layerHeight);
  const offset = { x: (length - columns * pitch) / 2 + pitch / 2, y: (width - rows * pitch) / 2 + pitch / 2 };
  const placements: Placement[] = [];
  for (let layer = 0; layer < layers; layer += 1) {
    for (let column = 0; column < columns; column += 1) {
      for (let row = 0; row < rows; row += 1) {
        placements.push({ x: offset.x + column * pitch, y: offset.y + row * pitch, z: layer * layerHeight });
      }
    }
  }
  return capByWeight(placements, entry.maxKg, BOTTLE.kg);
}

export function garmentFootprint(entry: BoxGuideEntry): { x: number; y: number } {
  const [length, width] = entry.maxMm;
  const flat = Math.floor(length / GARMENT.lengthMm) * Math.floor(width / GARMENT.widthMm);
  const turned = Math.floor(length / GARMENT.widthMm) * Math.floor(width / GARMENT.lengthMm);
  return turned > flat ? { x: GARMENT.widthMm, y: GARMENT.lengthMm } : { x: GARMENT.lengthMm, y: GARMENT.widthMm };
}

export function packGarments(entry: BoxGuideEntry): Packing {
  const [length, width, height] = entry.maxMm;
  const footprint = garmentFootprint(entry);
  const columns = Math.floor(length / footprint.x);
  const rows = Math.floor(width / footprint.y);
  const layers = Math.floor(height / GARMENT.heightMm);
  const placements: Placement[] = [];
  for (let layer = 0; layer < layers; layer += 1) {
    for (let column = 0; column < columns; column += 1) {
      for (let row = 0; row < rows; row += 1) {
        placements.push({ x: column * footprint.x, y: row * footprint.y, z: layer * GARMENT.heightMm });
      }
    }
  }
  return capByWeight(placements, entry.maxKg, GARMENT.kg);
}

export function centimetres(size: Millimetres): string {
  return size.map((side) => Math.round(side / 10)).join(" × ") + " cm";
}
