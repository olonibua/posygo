"use client";

import type { ReferralCampaignInput, ReferralCampaignView, ReferralRowView, VendorReferralView } from "@/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/client";
import { toast } from "@/lib/toast/toast-store";

const ADMIN_KEY = ["admin", "referrals"] as const;

export function useMyReferrals() {
  return useQuery({ queryKey: ["vendor", "referrals"], queryFn: () => apiRequest<VendorReferralView>("/v1/vendor/referrals") });
}

export function useReferrals() {
  return useQuery({ queryKey: [...ADMIN_KEY, "list"], queryFn: () => apiRequest<ReferralRowView[]>("/v1/admin/referrals") });
}

export function useCampaigns() {
  return useQuery({ queryKey: [...ADMIN_KEY, "campaigns"], queryFn: () => apiRequest<ReferralCampaignView[]>("/v1/admin/referrals/campaigns") });
}

function useAdminMutation<Input, Output>(request: (input: Input) => { path: string; method?: "POST" | "PUT"; body?: unknown }, announce: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Input) => {
      const { path, method = "POST", body } = request(input);
      return apiRequest<Output>(path, { method, body });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_KEY });
      toast.success(announce);
    },
  });
}

export function useCreateCampaign() {
  return useAdminMutation<ReferralCampaignInput, ReferralCampaignView>((input) => ({ path: "/v1/admin/referrals/campaigns", body: input }), "Campaign code is live");
}

export function useCampaignActive() {
  return useAdminMutation<{ id: string; active: boolean }, ReferralCampaignView>(
    ({ id, active }) => ({ path: `/v1/admin/referrals/campaigns/${id}`, method: "PUT", body: { active } }),
    "Campaign updated",
  );
}

export function useVoidReferral() {
  return useAdminMutation<{ id: string; reason: string }, ReferralRowView[]>(({ id, reason }) => ({ path: `/v1/admin/referrals/${id}/void`, body: { reason } }), "Referral cancelled");
}
