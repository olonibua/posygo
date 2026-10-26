export const TONES = ["sky", "lime", "yellow", "pink", "orange", "teal", "blue", "magenta", "cocoa"] as const;

export type Tone = (typeof TONES)[number];

export const toneSurface: Record<Tone, string> = {
  sky: "bg-sky text-cocoa",
  lime: "bg-lime text-cocoa",
  yellow: "bg-yellow text-cocoa",
  pink: "bg-pink text-cocoa",
  orange: "bg-orange text-cocoa",
  teal: "bg-teal text-cocoa",
  blue: "bg-blue text-white",
  magenta: "bg-magenta-deep text-white",
  cocoa: "bg-cocoa text-on-ink",
};

export const toneDot: Record<Tone, string> = {
  sky: "bg-sky",
  lime: "bg-lime",
  yellow: "bg-yellow",
  pink: "bg-pink",
  orange: "bg-orange",
  teal: "bg-teal",
  blue: "bg-blue",
  magenta: "bg-magenta",
  cocoa: "bg-cocoa",
};
