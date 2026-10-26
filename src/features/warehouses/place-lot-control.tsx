"use client";

import type { LocationView, LotView } from "@/shared";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/form-controls";

export function PlaceLotControl({ lot, locations, busy, onPlace }: { lot: LotView; locations: readonly LocationView[]; busy: boolean; onPlace: (locationId: string) => void }) {
  const choices = locations.filter((location) => location.active && location.code !== lot.locationCode);
  const [locationId, setLocationId] = useState("");
  return (
    <span className="inline-flex items-center gap-2">
      <label className="sr-only" htmlFor={`place-${lot.id}`}>
        Location for {lot.code}
      </label>
      <Select id={`place-${lot.id}`} value={locationId} onChange={(event) => setLocationId(event.target.value)} className="h-10 min-w-[140px] text-small">
        <option value="">Choose…</option>
        {choices.map((location) => (
          <option key={location.id} value={location.id}>
            {location.code}
          </option>
        ))}
      </Select>
      <Button variant={lot.locationCode ? "ghost" : "yellow"} disabled={!locationId || busy} onClick={() => onPlace(locationId)}>
        {lot.locationCode ? "Move" : "Put away"}
      </Button>
    </span>
  );
}
