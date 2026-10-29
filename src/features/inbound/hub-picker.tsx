"use client";

import type { ReceivingHubView } from "@/shared";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { CheckMark } from "@/components/ui/check-mark";
import { FormAlert } from "@/components/ui/form-controls";
import { Skeleton } from "@/components/ui/skeleton";
import { useCountryScope } from "@/features/seller-countries/selected-country";
import { apiRequest } from "@/lib/api/client";
import { cn } from "@/lib/cn";

interface HubPickerProps {
  value: string;
  error?: string;
  onChange: (warehouseId: string) => void;
}

export function useReceivingHubs() {
  const { path, ready, code } = useCountryScope();
  return useQuery({ queryKey: ["vendor", "inbound", "hubs", code], queryFn: () => apiRequest<ReceivingHubView[]>(path("/v1/vendor/inbound/hubs")), enabled: ready });
}

export function HubPicker({ value, error, onChange }: HubPickerProps) {
  const hubs = useReceivingHubs();
  const only = hubs.data?.length === 1 ? hubs.data[0] : undefined;

  useEffect(() => {
    if (only && value === "") {
      onChange(only.warehouseId);
    }
  }, [only, value, onChange]);

  if (hubs.isLoading) {
    return <Skeleton className="h-[84px] w-full" />;
  }
  if (!hubs.data?.length) {
    return <p className="text-small text-ink-soft">No hub is open in this country yet. We&apos;ll email you when one opens.</p>;
  }
  return (
    <div className="flex flex-col gap-3">
      <div role="radiogroup" aria-label="Hub" className="grid gap-3 sm:grid-cols-2">
        {hubs.data.map((hub) => {
          const selected = hub.warehouseId === value;
          return (
            <button
              key={hub.warehouseId}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(hub.warehouseId)}
              className={cn(
                "motion-press flex items-start justify-between gap-3 rounded-card border-[1.5px] px-4 py-3.5 text-left transition-colors duration-200",
                selected ? "border-ink bg-paper-sunk" : "border-line-strong bg-paper hover:border-ink",
              )}
            >
              <span>
                <b className="block text-[16px] font-semibold">{hub.label}</b>
                <span className="mt-0.5 block text-[13px] text-ink-soft">
                  {hub.city} · {hub.area}
                  {hub.unitsHeld > 0 ? ` · ${hub.unitsHeld} of your units here` : ""}
                </span>
              </span>
              <span className={cn("mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-[1.5px]", selected ? "border-ink bg-ink text-on-ink" : "border-line-strong")}>
                {selected ? <CheckMark className="h-3 w-3" /> : null}
              </span>
            </button>
          );
        })}
      </div>
      <FormAlert message={error ?? null} />
    </div>
  );
}
