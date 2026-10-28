import type { Config } from "tailwindcss";

const token = (name: string) => `var(--${name})`;

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      white: "#ffffff",
      ground: token("ground"),
      paper: { DEFAULT: token("paper"), sunk: token("paper-sunk") },
      ink: { DEFAULT: token("ink"), soft: token("ink-soft"), faint: token("ink-faint") },
      line: { DEFAULT: token("line"), strong: token("line-strong") },
      "on-ink": { DEFAULT: token("on-ink"), soft: token("on-ink-soft") },
      cocoa: token("cocoa"),
      cream: token("cream"),
      blue: token("blue"),
      sky: token("sky"),
      teal: token("teal"),
      pink: token("pink"),
      magenta: { DEFAULT: token("magenta"), deep: token("magenta-deep") },
      lime: token("lime"),
      yellow: token("yellow"),
      orange: token("orange"),
      success: token("success"),
      danger: token("danger"),
      seal: token("seal"),
      vellum: token("vellum"),
    },
    fontFamily: {
      sans: ['"Instrument Sans Variable"', '"Helvetica Neue"', "Arial", "sans-serif"],
      mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      legal: ['"Source Serif 4 Variable"', "Georgia", '"Times New Roman"', "serif"],
      signature: ['"Great Vibes"', '"Brush Script MT"', "cursive"],
    },
    extend: {
      fontSize: {
        hero: ["112px", { lineHeight: "102px", letterSpacing: "-5px", fontWeight: "500" }],
        display: ["64px", { lineHeight: "62px", letterSpacing: "-2.6px", fontWeight: "500" }],
        h1: ["52px", { lineHeight: "52px", letterSpacing: "-2px", fontWeight: "500" }],
        h2: ["36px", { lineHeight: "38px", letterSpacing: "-1.1px", fontWeight: "500" }],
        h3: ["22px", { lineHeight: "26px", letterSpacing: "-0.5px", fontWeight: "500" }],
        lead: ["18px", { lineHeight: "28px" }],
        body: ["16px", { lineHeight: "24px" }],
        small: ["14px", { lineHeight: "20px" }],
        meta: ["12px", { lineHeight: "16px", fontWeight: "500" }],
        stamp: ["12px", { lineHeight: "14px", letterSpacing: "1.4px", fontWeight: "600" }],
        label: ["11px", { lineHeight: "14px", letterSpacing: "1.3px", fontWeight: "600" }],
      },
      borderRadius: {
        chip: "8px",
        control: "10px",
        nav: "12px",
        card: "14px",
        tile: "16px",
        frame: "24px",
        band: "32px",
        note: "4px",
      },
      boxShadow: {
        note: token("shadow-note"),
        frame: token("shadow-frame"),
        peek: token("shadow-peek"),
      },
      maxWidth: { container: "1160px" },
    },
  },
  plugins: [],
};

export default config;
