import type { Mood } from "./use-questions";

const PETALS = [0, 45, 90, 135, 180, 225, 270, 315];

function Eyes({ mood }: { mood: Mood }) {
  if (mood === "happy") {
    return (
      <g fill="none" stroke="var(--ink)" strokeWidth="2.6" strokeLinecap="round">
        <path d="M40 49q3.5-4.5 7 0" />
        <path d="M53 49q3.5-4.5 7 0" />
      </g>
    );
  }
  const big = mood === "notice";
  const look = mood === "think" ? -2.5 : 0;
  return (
    <g className="posy-eyes" fill="var(--ink)">
      <ellipse cx={43.5 + look} cy={48 + look} rx={big ? 3.3 : 2.7} ry={big ? 4.4 : 3.6} />
      <ellipse cx={56.5 + look} cy={48 + look} rx={big ? 3.3 : 2.7} ry={big ? 4.4 : 3.6} />
      <circle cx={44.5 + look} cy={46.5 + look} r="0.9" fill="var(--paper)" />
      <circle cx={57.5 + look} cy={46.5 + look} r="0.9" fill="var(--paper)" />
    </g>
  );
}

function Mouth({ mood }: { mood: Mood }) {
  if (mood === "talk") {
    return <ellipse className="posy-mouth-talk" cx="50" cy="58" rx="3.6" ry="2.6" fill="var(--ink)" />;
  }
  if (mood === "notice") {
    return <ellipse cx="50" cy="58.5" rx="2.2" ry="2.4" fill="var(--ink)" />;
  }
  if (mood === "think") {
    return <path d="M46.5 58.5h7" stroke="var(--ink)" strokeWidth="2.4" strokeLinecap="round" />;
  }
  return <path d={mood === "happy" ? "M44 55.5q6 7 12 0" : "M45.5 56.5q4.5 4 9 0"} fill="none" stroke="var(--ink)" strokeWidth="2.4" strokeLinecap="round" />;
}

export function FlowerAvatar({ mood, size = 56 }: { mood: Mood; size?: number }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden className={`posy posy-${mood}`}>
      <g className="posy-petals">
        {PETALS.map((angle, index) => (
          <ellipse key={angle} cx="50" cy="20" rx="11" ry="17" transform={`rotate(${angle} 50 50)`} fill={index % 2 === 0 ? "var(--yellow)" : "var(--pink)"} stroke="var(--ink)" strokeWidth="2" />
        ))}
      </g>
      <g className="posy-face">
        <circle cx="50" cy="51" r="24" fill="var(--cream)" stroke="var(--ink)" strokeWidth="2.2" />
        <circle cx="38" cy="56" r="3.4" fill="var(--pink)" opacity="0.85" />
        <circle cx="62" cy="56" r="3.4" fill="var(--pink)" opacity="0.85" />
        <Eyes mood={mood} />
        <Mouth mood={mood} />
      </g>
    </svg>
  );
}
