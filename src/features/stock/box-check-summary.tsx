"use client";

import { BOX_FULLNESS, type BoxCheckView, type BoxFullness } from "@/shared";
import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/client";
import { formatDateTime } from "@/lib/format";

const LOCALE = "en-GB";
const PHOTO_STALE_MS = 4 * 60 * 1000;

export const FULLNESS_LABELS: Record<BoxFullness, string> = { 10: "Almost empty", 25: "About a quarter full", 50: "About half full", 75: "About three-quarters full", 100: "Full" };

export const FULLNESS_OPTIONS = BOX_FULLNESS.map((value) => ({ value, label: FULLNESS_LABELS[value] }));

function BoxPhoto({ path }: { path: string }) {
  const photo = useQuery({ queryKey: ["box-photo", path], queryFn: () => apiRequest<{ url: string }>(path), staleTime: PHOTO_STALE_MS });
  if (!photo.data) {
    return <span className="block h-20 w-20 shrink-0 rounded-card bg-paper-sunk" aria-hidden />;
  }
  return (
    <a href={photo.data.url} target="_blank" rel="noreferrer" className="block shrink-0">
      <img src={photo.data.url} alt="What's left in the boxes" className="h-20 w-20 rounded-card object-cover" />
    </a>
  );
}

export function BoxCheckSummary({ check, photoPath }: { check: BoxCheckView | null; photoPath: (fileId: string) => string }) {
  if (!check) {
    return <p className="text-meta text-ink-faint">No photo of these boxes yet. The hub adds one after packing orders.</p>;
  }
  return (
    <div className="flex items-start gap-3">
      <BoxPhoto path={photoPath(check.photoFileIds[0]!)} />
      <div className="min-w-0 text-small">
        <p className="font-medium">{FULLNESS_LABELS[check.fullnessPct]}</p>
        <div className="mt-1 h-2 w-40 overflow-hidden rounded-full bg-paper-sunk" role="img" aria-label={`${check.fullnessPct}% full`}>
          <div className="h-full rounded-full bg-ink" style={{ width: `${check.fullnessPct}%` }} />
        </div>
        <p className="mt-1 text-meta text-ink-faint">
          Photo {formatDateTime(check.checkedAt, LOCALE)}
          {check.ordersSince > 0 ? ` · ${check.ordersSince} ${check.ordersSince === 1 ? "order" : "orders"} since` : ""}
        </p>
        {check.note ? <p className="text-meta text-ink-soft">{check.note}</p> : null}
      </div>
    </div>
  );
}
