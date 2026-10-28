import type { Mood } from "./use-questions";

const SKIN = "var(--skin)";
const HAIR = "var(--hair)";
const OUTLINE = { stroke: "var(--ink)", strokeWidth: 2 } as const;
const PETALS = [0, 72, 144, 216, 288];

function Eyes({ mood }: { mood: Mood }) {
  if (mood === "happy") {
    return (
      <g fill="none" stroke="var(--ink)" strokeWidth="2.2" strokeLinecap="round">
        <path d="M41 42q3-4 6 0" />
        <path d="M53 42q3-4 6 0" />
      </g>
    );
  }
  const big = mood === "notice";
  const look = mood === "think" ? -2 : 0;
  return (
    <g className="posy-eyes" fill="var(--ink)">
      <ellipse cx={44 + look} cy={41 + look} rx={big ? 2.8 : 2.4} ry={big ? 3.6 : 3.1} />
      <ellipse cx={56 + look} cy={41 + look} rx={big ? 2.8 : 2.4} ry={big ? 3.6 : 3.1} />
      <circle cx={44.9 + look} cy={39.8 + look} r="0.9" fill="var(--ground)" />
      <circle cx={56.9 + look} cy={39.8 + look} r="0.9" fill="var(--ground)" />
    </g>
  );
}

function Mouth({ mood }: { mood: Mood }) {
  if (mood === "talk") {
    return <ellipse className="posy-mouth-talk" cx="50" cy="50" rx="2.8" ry="2.1" fill="var(--ink)" />;
  }
  if (mood === "notice") {
    return <ellipse cx="50" cy="50.5" rx="1.8" ry="2" fill="var(--ink)" />;
  }
  if (mood === "think") {
    return <path d="M47.5 50.5h5" stroke="var(--ink)" strokeWidth="1.9" strokeLinecap="round" />;
  }
  return <path d={mood === "happy" ? "M45.5 48q4.5 5.5 9 0" : "M46.5 48.5q3.5 3.2 7 0"} fill="none" stroke="var(--ink)" strokeWidth="1.9" strokeLinecap="round" />;
}

function Arm({ from, to }: { from: [number, number]; to: [number, number] }) {
  const path = `M${from[0]} ${from[1]}L${to[0]} ${to[1]}`;
  return (
    <g strokeLinecap="round">
      <path d={path} stroke="var(--ink)" strokeWidth="8" />
      <path d={path} stroke={SKIN} strokeWidth="4.6" />
    </g>
  );
}

function Flower() {
  return (
    <g>
      <path d="M77 92q-1-18 3-36" fill="none" stroke="var(--success)" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M78.5 74q7-5 9 1q-6 3-9-1z" fill="var(--lime)" {...OUTLINE} strokeWidth="1.5" />
      <g className="posy-bloom">
        {PETALS.map((angle) => (
          <ellipse key={angle} cx="80" cy="43" rx="4.6" ry="6.4" transform={`rotate(${angle} 80 50)`} fill="var(--pink)" {...OUTLINE} strokeWidth="1.5" />
        ))}
        <circle cx="80" cy="50" r="3.8" fill="var(--yellow)" {...OUTLINE} strokeWidth="1.5" />
      </g>
    </g>
  );
}

export function PosyAvatar({ mood, size = 56 }: { mood: Mood; size?: number }) {
  return (
    <svg viewBox="0 0 100 130" width={size} height={Math.round(size * 1.3)} aria-hidden className={`posy posy-${mood}`}>
      <ellipse cx="50" cy="126" rx="24" ry="3" fill="var(--ink)" opacity="0.12" />
      <g className="posy-body">
        <g className="posy-legs">
          <rect x="40" y="104" width="7" height="16" rx="3" fill={SKIN} {...OUTLINE} />
          <rect x="53" y="104" width="7" height="16" rx="3" fill={SKIN} {...OUTLINE} />
          <ellipse cx="42.5" cy="122" rx="6.5" ry="3.6" fill="var(--magenta)" {...OUTLINE} />
          <ellipse cx="57.5" cy="122" rx="6.5" ry="3.6" fill="var(--magenta)" {...OUTLINE} />
        </g>
        <g className="posy-wave">
          <Arm from={[39, 72]} to={[27, 88]} />
        </g>
        <path d="M38 66q12-6 24 0l12 40q-24 8-48 0z" fill="var(--yellow)" {...OUTLINE} strokeLinejoin="round" />
        <path d="M30 98q20 6 40 0" fill="none" stroke="var(--orange)" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="50" cy="74" r="1.6" fill="var(--orange)" />
        <circle cx="50" cy="82" r="1.6" fill="var(--orange)" />
        <g className="posy-hold">
          <Flower />
          <Arm from={[61, 72]} to={[74, 90]} />
        </g>
        <g className="posy-head">
          <circle cx="27.5" cy="44" r="5" fill={SKIN} {...OUTLINE} />
          <circle cx="72.5" cy="44" r="5" fill={SKIN} {...OUTLINE} />
          <circle cx="50" cy="42" r="22" fill={SKIN} {...OUTLINE} strokeWidth="2.2" />
          <path d="M28.5 37q2-18 21.5-19q19.5 1 21.5 19q-7-8-21.5-9q-14.5 1-21.5 9z" fill={HAIR} />
          <circle cx="50" cy="13" r="8.5" fill={HAIR} />
          <path d="M43 21q7 3 14 0" fill="none" stroke="var(--pink)" strokeWidth="3" strokeLinecap="round" />
          <circle cx="38" cy="47" r="3.3" fill="var(--pink)" opacity="0.8" />
          <circle cx="62" cy="47" r="3.3" fill="var(--pink)" opacity="0.8" />
          <Eyes mood={mood} />
          <Mouth mood={mood} />
        </g>
      </g>
    </svg>
  );
}
