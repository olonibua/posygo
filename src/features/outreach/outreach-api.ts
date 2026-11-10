"use client";

import type {
  ImportOutreachInput,
  OutreachContactDetailView,
  OutreachContactInput,
  OutreachContactView,
  OutreachImportResultView,
  OutreachSendResultView,
  OutreachStatus,
  OutreachTemplate,
  SendOutreachInput,
  UpdateOutreachContactInput,
} from "@/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/client";

const KEY = ["admin", "outreach"];

export interface OutreachFilters {
  status: OutreachStatus | "";
  country: string;
  q: string;
}

function contactsPath(filters: OutreachFilters): string {
  const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => value !== ""));
  const query = params.toString();
  return `/v1/admin/outreach/contacts${query ? `?${query}` : ""}`;
}

export function useOutreachContacts(filters: OutreachFilters) {
  return useQuery({ queryKey: [...KEY, "contacts", filters], queryFn: () => apiRequest<OutreachContactView[]>(contactsPath(filters)) });
}

export function useOutreachContact(id: string | null) {
  return useQuery({ queryKey: [...KEY, "contact", id], queryFn: () => apiRequest<OutreachContactDetailView>(`/v1/admin/outreach/contacts/${id}`), enabled: id !== null });
}

export function useOutreachTemplates() {
  return useQuery({ queryKey: [...KEY, "templates"], queryFn: () => apiRequest<OutreachTemplate[]>("/v1/admin/outreach/templates"), staleTime: Infinity });
}

function useRefresh() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: KEY });
}

export function useAddContact() {
  const refresh = useRefresh();
  return useMutation({ mutationFn: (input: OutreachContactInput) => apiRequest<OutreachContactView>("/v1/admin/outreach/contacts", { method: "POST", body: input }), onSuccess: refresh });
}

export function useImportContacts() {
  const refresh = useRefresh();
  return useMutation({ mutationFn: (input: ImportOutreachInput) => apiRequest<OutreachImportResultView>("/v1/admin/outreach/contacts/import", { method: "POST", body: input }), onSuccess: refresh });
}

export function useUpdateContact(id: string) {
  const refresh = useRefresh();
  return useMutation({ mutationFn: (input: UpdateOutreachContactInput) => apiRequest<OutreachContactView>(`/v1/admin/outreach/contacts/${id}`, { method: "PATCH", body: input }), onSuccess: refresh });
}

export function useRemoveContact(id: string) {
  const refresh = useRefresh();
  return useMutation({ mutationFn: () => apiRequest<void>(`/v1/admin/outreach/contacts/${id}`, { method: "DELETE" }), onSuccess: refresh });
}

export function useSendOutreach() {
  const refresh = useRefresh();
  return useMutation({ mutationFn: (input: SendOutreachInput) => apiRequest<OutreachSendResultView>("/v1/admin/outreach/send", { method: "POST", body: input }), onSuccess: refresh });
}
