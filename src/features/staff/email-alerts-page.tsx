"use client";

import type { EmailAlertSettingView } from "@/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { FormAlert } from "@/components/ui/form-controls";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingRows } from "@/components/ui/skeleton";
import { Paper } from "@/components/ui/surfaces";
import { ApiError, apiRequest } from "@/lib/api/client";
import { cn } from "@/lib/cn";

const KEY = ["admin", "email-alerts"] as const;

function Switch({ setting, busy, onChange }: { setting: EmailAlertSettingView; busy: boolean; onChange: (enabled: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={setting.enabled}
      aria-label={setting.label}
      disabled={busy}
      onClick={() => onChange(!setting.enabled)}
      className={cn(
        "relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ease-[var(--ease-out)] disabled:opacity-60",
        setting.enabled ? "bg-ink" : "bg-line-strong",
      )}
    >
      <span className={cn("absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-[left] duration-200 ease-[var(--ease-out)]", setting.enabled ? "left-6" : "left-1")} />
    </button>
  );
}

export function EmailAlertsPage() {
  const queryClient = useQueryClient();
  const settings = useQuery({ queryKey: KEY, queryFn: () => apiRequest<EmailAlertSettingView[]>("/v1/admin/email-alerts") });
  const change = useMutation({
    mutationFn: ({ topic, enabled }: { topic: string; enabled: boolean }) => apiRequest<EmailAlertSettingView[]>(`/v1/admin/email-alerts/${topic}`, { method: "PUT", body: { enabled } }),
    onSuccess: (next) => queryClient.setQueryData(KEY, next),
  });

  return (
    <div className="flex max-w-[760px] flex-col gap-6">
      <PageHeader
        stamp="People"
        title="Email alerts"
        lead="Every alert always shows in the bell. Switch one on to also email the staff who handle it. Each email uses your email allowance."
      />
      <FormAlert message={change.error instanceof ApiError ? change.error.message : null} />
      {settings.isLoading ? (
        <LoadingRows columns={2} />
      ) : (
        <Paper className="divide-y divide-line px-6 py-1">
          {(settings.data ?? []).map((setting) => (
            <div key={setting.topic} className="flex items-center justify-between gap-6 py-4">
              <span className="text-small font-medium">{setting.label}</span>
              <Switch setting={setting} busy={change.isPending && change.variables?.topic === setting.topic} onChange={(enabled) => change.mutate({ topic: setting.topic, enabled })} />
            </div>
          ))}
        </Paper>
      )}
    </div>
  );
}
