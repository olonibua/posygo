import type { AccountView } from "@/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/client";

const ACCOUNT_KEY = ["account"] as const;

export function useAccount() {
  return useQuery({ queryKey: ACCOUNT_KEY, queryFn: () => apiRequest<AccountView>("/v1/account") });
}

export function useCancelEmailChange() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiRequest<AccountView>("/v1/account/email", { method: "DELETE" }),
    onSuccess: (account) => queryClient.setQueryData(ACCOUNT_KEY, account),
  });
}

export function useAccountCache() {
  const queryClient = useQueryClient();
  return (account: AccountView) => queryClient.setQueryData(ACCOUNT_KEY, account);
}
