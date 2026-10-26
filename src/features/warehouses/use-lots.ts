"use client";

import type { CustodyEventView, LotView } from "@/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/client";

import { locationsKey } from "./use-warehouses";

export function useWarehouseLots(warehouseId: string | null, unplacedOnly: boolean) {
  const queryClient = useQueryClient();
  const key = ["warehouse", warehouseId ?? "none", "lots", unplacedOnly];
  const lots = useQuery({ queryKey: key, queryFn: () => apiRequest<LotView[]>(`/v1/warehouse/warehouses/${warehouseId}/lots${unplacedOnly ? "?unplaced=true" : ""}`), enabled: Boolean(warehouseId) });
  const place = useMutation({
    mutationFn: (input: { lotId: string; locationId: string }) => apiRequest<LotView>(`/v1/warehouse/lots/${input.lotId}/location`, { method: "POST", body: { locationId: input.locationId } }),
    onSuccess: (_lot, input) => {
      void queryClient.invalidateQueries({ queryKey: ["warehouse", warehouseId ?? "none", "lots"] });
      void queryClient.invalidateQueries({ queryKey: locationsKey(warehouseId ?? "none") });
      void queryClient.invalidateQueries({ queryKey: custodyKey(input.lotId) });
    },
  });
  return { lots, place };
}

function custodyKey(lotId: string) {
  return ["warehouse", "lot", lotId, "custody"];
}

export function useCustody(lotId: string) {
  return useQuery({ queryKey: custodyKey(lotId), queryFn: () => apiRequest<CustodyEventView[]>(`/v1/warehouse/lots/${lotId}/custody`) });
}
