"use client";

import type { LocationView, WarehouseView } from "@/shared";
import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/client";

export const WAREHOUSES_KEY = ["warehouse", "warehouses"];

export function useWarehouses() {
  return useQuery({ queryKey: WAREHOUSES_KEY, queryFn: () => apiRequest<WarehouseView[]>("/v1/warehouse/warehouses") });
}

export function locationsKey(warehouseId: string) {
  return ["warehouse", warehouseId, "locations"];
}

export function useLocations(warehouseId: string | null) {
  return useQuery({ queryKey: locationsKey(warehouseId ?? "none"), queryFn: () => apiRequest<LocationView[]>(`/v1/warehouse/warehouses/${warehouseId}/locations`), enabled: Boolean(warehouseId) });
}
