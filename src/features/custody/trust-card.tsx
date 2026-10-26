"use client";

import { CountUp } from "@/components/ui/count-up";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SkeletonLines } from "@/components/ui/skeleton";
import { Paper, Stamp } from "@/components/ui/surfaces";

import { useTrust } from "./use-custody";

export function TrustCard({ partnerId, audience }: { partnerId?: string; audience: "STAFF" | "PARTNER" }) {
  const trust = useTrust(partnerId);
  const data = trust.data;
  const healthy = data ? data.score >= data.floor + 15 : true;
  return (
    <Paper className="flex flex-col gap-3 px-6 py-5">
      <div className="flex items-baseline justify-between gap-3">
        <Stamp>Trust score</Stamp>
        {data ? <span className="text-meta text-ink-faint">Hubs below {data.floor} are paused</span> : null}
      </div>
      {!data ? (
        <SkeletonLines lines={3} />
      ) : (
        <>
          <p className="text-h1 tabular-nums">
            <CountUp value={String(data.score)} />
            <span className="text-h3 text-ink-faint"> / 100</span>
          </p>
          <ProgressBar value={data.score} max={100} label="Trust score" tone={healthy ? "bg-lime" : data.score >= data.floor ? "bg-yellow" : "bg-pink"} />
          {data.factors.length === 0 ? (
            <p className="text-small text-ink-soft">{audience === "PARTNER" ? "A clean record. Keep sending dispatch photos and accurate counts." : "Nothing is pulling this hub's score down."}</p>
          ) : (
            <ul className="stagger flex flex-col divide-y divide-line text-small">
              {data.factors.map((factor) => (
                <li key={factor.label} className="motion-rise flex items-center justify-between gap-3 py-2">
                  <span>{factor.label}</span>
                  <span className="font-semibold tabular-nums text-ink-soft">{factor.points}</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </Paper>
  );
}
