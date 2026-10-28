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

export const toneOnGroupHover: Record<Tone, string> = {
  sky: "group-hover:bg-sky group-hover:text-cocoa",
  lime: "group-hover:bg-lime group-hover:text-cocoa",
  yellow: "group-hover:bg-yellow group-hover:text-cocoa",
  pink: "group-hover:bg-pink group-hover:text-cocoa",
  orange: "group-hover:bg-orange group-hover:text-cocoa",
  teal: "group-hover:bg-teal group-hover:text-cocoa",
  blue: "group-hover:bg-blue group-hover:text-white",
  magenta: "group-hover:bg-magenta-deep group-hover:text-white",
  cocoa: "group-hover:bg-cocoa group-hover:text-on-ink",
};
