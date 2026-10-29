export interface LabelSize {
  id: string;
  name: string;
  widthMm: number;
  heightMm: number;
}

export const LABEL_SIZES: readonly LabelSize[] = [
  { id: "62x40", name: "62 × 40 mm", widthMm: 62, heightMm: 40 },
  { id: "50x25", name: "50 × 25 mm", widthMm: 50, heightMm: 25 },
  { id: "100x50", name: "100 × 50 mm", widthMm: 100, heightMm: 50 },
  { id: "4x6", name: "4 × 6 in", widthMm: 101.6, heightMm: 152.4 },
];

export const DEFAULT_LABEL_SIZE = LABEL_SIZES[0]!;

const BASE = { widthMm: 62, heightMm: 40 };

export function labelScale(size: LabelSize): number {
  return Math.min(size.widthMm / BASE.widthMm, size.heightMm / BASE.heightMm);
}

export function labelSizeById(id: string | null): LabelSize {
  return LABEL_SIZES.find((size) => size.id === id) ?? DEFAULT_LABEL_SIZE;
}
