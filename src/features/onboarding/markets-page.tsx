"use client";

import { type DestinationPreferenceView, hasPermission } from "@/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import { FormAlert } from "@/components/ui/form-controls";
import { PageHeader } from "@/components/ui/page-header";
import { Paper } from "@/components/ui/surfaces";
import { ApiError, apiRequest } from "@/lib/api/client";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { cn } from "@/lib/cn";
import { toast } from "@/lib/toast/toast-store";

const KEY = ["vendor", "markets"];

export function MarketsPage() {
  const user = useCurrentUser();
  const canManage = hasPermission(user.role, "vendor.markets.manage");
  const queryClient = useQueryClient();
  const markets = useQuery({ queryKey: KEY, queryFn: () => apiRequest<DestinationPreferenceView[]>("/v1/vendor/markets") });
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSelected(new Set(markets.data?.filter((market) => market.preferred).map((market) => market.code)));
  }, [markets.data]);

  const save = useMutation({
    mutationFn: () => apiRequest<DestinationPreferenceView[]>("/v1/vendor/markets", { method: "PUT", body: { countryCodes: [...selected] } }),
    onSuccess: (next) => {
      queryClient.setQueryData(KEY, next);
      toast.success("Preferences saved");
    },
  });

  function toggle(code: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        stamp="Markets"
        title="Where you usually ship"
        lead="Pick the destinations you send to most. They're suggested first when you create an order — you can still ship anywhere your market has opened."
        action={
          canManage ? (
            <Button variant="yellow" size="lg" loading={save.isPending} onClick={() => save.mutate()}>
              Save preferences →
            </Button>
          ) : null
        }
      />
      <FormAlert message={save.error instanceof ApiError ? save.error.message : null} />
      <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
        {markets.data?.map((market) => {
          const on = selected.has(market.code);
          return (
            <Paper key={market.code} className={cn("flex items-center justify-between gap-4 px-5 py-4", on && "border-cocoa")}>
              <div>
                <p className="text-[17px] font-medium">{market.name}</p>
                <div className="mt-1.5">{market.customsRequired ? <StatusPill tone="sky">Customs declaration</StatusPill> : <StatusPill tone="lime">Domestic</StatusPill>}</div>
              </div>
              <Button variant={on ? "primary" : "ghost"} aria-pressed={on} disabled={!canManage} onClick={() => toggle(market.code)}>
                {on ? "✓ Preferred" : "Add"}
              </Button>
            </Paper>
          );
        })}
      </div>
    </div>
  );
}
