"use client";

import { useSearchParams } from "next/navigation";

import { ButtonLink } from "@/components/ui/button";
import { NotebookNote } from "@/components/ui/surfaces";

import { useActivation } from "./use-activation";

export function ActivationPanel() {
  const returning = useSearchParams().get("activation");
  const activation = useActivation({ enabled: Boolean(returning) });
  if (!returning || activation.data?.state !== "LIVE") {
    return null;
  }
  return (
    <NotebookNote tone="lime" tilt="none" className="max-w-[720px]">
      <p className="text-small">Thanks, your activation fee is paid and your account is live. We&apos;ve emailed you your account details.</p>
      <ButtonLink href="/overview" variant="ghost" className="mt-3">
        Open your dashboard →
      </ButtonLink>
    </NotebookNote>
  );
}
