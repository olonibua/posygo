"use client";

import type { StoreConnectionView, StoreDeliveryOutcome } from "@/shared";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import { Field, Input } from "@/components/ui/form-controls";
import { Paper, Stamp } from "@/components/ui/surfaces";
import type { Tone } from "@/components/ui/tone";
import { fieldError } from "@/features/receiving/api-errors";
import { formatDateTime } from "@/lib/format";

import { CopyButton } from "./copy-button";

const OUTCOME_TONE: Record<StoreDeliveryOutcome, Tone> = { CREATED: "lime", DUPLICATE: "sky", SKIPPED: "yellow", FAILED: "pink" };
const OUTCOME_LABEL: Record<StoreDeliveryOutcome, string> = { CREATED: "Order placed", DUPLICATE: "Already placed", SKIPPED: "Skipped", FAILED: "Needs attention" };
const PLATFORM_LABEL = { SHOPIFY: "Shopify", WOOCOMMERCE: "WooCommerce" } as const;

interface StoreConnectionCardProps {
  connection: StoreConnectionView;
  locale: string;
  saving: boolean;
  saveError: unknown;
  disconnecting: boolean;
  onSaveSecret: (secret: string) => void;
  onDisconnect: () => void;
}

export function StoreConnectionCard({ connection, locale, saving, saveError, disconnecting, onSaveSecret, onDisconnect }: StoreConnectionCardProps) {
  const [secret, setSecret] = useState("");
  const needsSecret = connection.platform === "SHOPIFY" && !connection.ready;

  function submit(event: FormEvent) {
    event.preventDefault();
    onSaveSecret(secret.trim());
  }

  return (
    <Paper className="flex flex-col gap-4 px-6 py-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Stamp>{PLATFORM_LABEL[connection.platform]}</Stamp>
          <h3 className="mt-1 text-[19px] font-medium tracking-[-0.4px]">{connection.name}</h3>
          <p className="text-meta text-ink-faint">{connection.lastReceivedAt ? `Last order received ${formatDateTime(connection.lastReceivedAt, locale)}` : "Waiting for the first order"}</p>
        </div>
        <div className="flex items-center gap-2">
          {connection.ready ? <StatusPill tone="lime">Connected</StatusPill> : <StatusPill tone="yellow">Finish setup</StatusPill>}
          <Button variant="ghost" loading={disconnecting} onClick={onDisconnect}>
            Disconnect
          </Button>
        </div>
      </div>
      <div>
        <Stamp>Your link</Stamp>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
          <p className="min-w-0 flex-1 break-all rounded-card bg-paper-sunk px-4 py-3 font-mono text-meta">{connection.webhookUrl}</p>
          <CopyButton value={connection.webhookUrl} label="Copy link" />
        </div>
      </div>
      {needsSecret ? (
        <form noValidate onSubmit={submit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Field label="Shopify signing key" hint="In Shopify under Settings → Notifications → Webhooks, next to “Your webhooks will be signed with”." error={fieldError(saveError, "secret")}>
              {({ id, describedBy, invalid }) => (
                <Input id={id} aria-describedby={describedBy} aria-invalid={invalid} value={secret} autoComplete="off" onChange={(event) => setSecret(event.target.value)} />
              )}
            </Field>
          </div>
          <Button type="submit" variant="yellow" loading={saving} disabled={secret.trim().length < 16}>
            Save key
          </Button>
        </form>
      ) : null}
      {connection.deliveries.length > 0 ? (
        <div>
          <Stamp>Recent orders from your shop</Stamp>
          <ul className="mt-2 flex flex-col divide-y divide-line">
            {connection.deliveries.map((delivery) => (
              <li key={`${delivery.createdAt}-${delivery.externalReference ?? ""}`} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5 text-small">
                <StatusPill tone={OUTCOME_TONE[delivery.outcome]}>{OUTCOME_LABEL[delivery.outcome]}</StatusPill>
                <span className="font-medium">{delivery.externalReference ?? "Unreadable order"}</span>
                <span className="flex-1 text-ink-soft">{delivery.message}</span>
                <span className="text-meta text-ink-faint">{formatDateTime(delivery.createdAt, locale)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Paper>
  );
}
