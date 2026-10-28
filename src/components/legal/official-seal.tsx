import { useId } from "react";

import { cn } from "@/lib/cn";

const PETALS = [0, 45, 90, 135, 180, 225, 270, 315];
const SCALLOPS = Array.from({ length: 36 }, (_, index) => index * 10);

interface OfficialSealProps {
  caption?: string;
  date?: string;
  className?: string;
}

export function OfficialSeal({ caption = "Electronically executed", date, className }: OfficialSealProps) {
  const id = useId().replace(/:/g, "");
  const ring = `seal-ring-${id}`;
  const lower = `seal-lower-${id}`;
  return (
    <svg viewBox="0 0 200 200" role="img" aria-label={`Posygo seal: ${caption}${date ? `, ${date}` : ""}`} className={cn("text-seal", className)}>
      <defs>
        <path id={ring} d="M100,100 m-68,0 a68,68 0 1,1 136,0" />
        <path id={lower} d="M100,100 m-74,0 a74,74 0 0,0 148,0" />
      </defs>
      <g fill="currentColor" opacity="0.92">
        {SCALLOPS.map((angle) => (
          <circle key={angle} cx="100" cy="6" r="6" transform={`rotate(${angle} 100 100)`} />
        ))}
        <circle cx="100" cy="100" r="92" />
      </g>
      <circle cx="100" cy="100" r="86" fill="none" stroke="var(--paper)" strokeWidth="1.6" />
      <circle cx="100" cy="100" r="54" fill="none" stroke="var(--paper)" strokeWidth="1.2" />
      <circle cx="100" cy="100" r="50" fill="none" stroke="var(--paper)" strokeWidth="0.6" strokeDasharray="1.5 2.5" />
      <text fill="var(--paper)" fontSize="13.5" fontWeight="700" letterSpacing="3.2" className="font-legal">
        <textPath href={`#${ring}`} startOffset="50%" textAnchor="middle">
          POSYGO
        </textPath>
      </text>
      <text fill="var(--paper)" fontSize="9.5" fontWeight="600" letterSpacing="2.4" className="font-legal">
        <textPath href={`#${lower}`} startOffset="50%" textAnchor="middle">
          {caption.toUpperCase()}
        </textPath>
      </text>
      <g transform="translate(100 88) scale(0.36) translate(-50 -50)" fill="var(--paper)">
        {PETALS.map((angle) => (
          <ellipse key={angle} cx="50" cy="21" rx="9.5" ry="18" transform={`rotate(${angle} 50 50)`} />
        ))}
        <circle cx="50" cy="50" r="10" />
      </g>
      <circle cx="100" cy="88" r="2" fill="currentColor" />
      <text x="100" y="124" fill="var(--paper)" fontSize="8" fontWeight="700" letterSpacing="1.6" textAnchor="middle" className="font-legal">
        {date ?? "VERIFIED"}
      </text>
      <text x="73" y="104" fill="var(--paper)" fontSize="9" textAnchor="middle">
        ★
      </text>
      <text x="127" y="104" fill="var(--paper)" fontSize="9" textAnchor="middle">
        ★
      </text>
    </svg>
  );
}
