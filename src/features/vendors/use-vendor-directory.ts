"use client";

import type { DirectoryPage, ProductDirectoryQuery, ProductRowView, VendorDetailView, VendorDirectoryQuery, VendorRowView } from "@/shared";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/client";

import { directoryPath } from "./vendor-display";

const KEY = ["admin", "vendors"] as const;

export function useVendorDirectory(query: VendorDirectoryQuery) {
  return useQuery({
    queryKey: [...KEY, "list", query],
    queryFn: () => apiRequest<DirectoryPage<VendorRowView>>(directoryPath("/v1/admin/vendors", query)),
    placeholderData: keepPreviousData,
  });
}

export function useVendorDetail(vendorId: string) {
  return useQuery({ queryKey: [...KEY, vendorId], queryFn: () => apiRequest<VendorDetailView>(`/v1/admin/vendors/${vendorId}`) });
}

export function useProductDirectory(query: ProductDirectoryQuery) {
  return useQuery({
    queryKey: [...KEY, "products", query],
    queryFn: () => apiRequest<DirectoryPage<ProductRowView>>(directoryPath("/v1/admin/products", query)),
    placeholderData: keepPreviousData,
  });
}
