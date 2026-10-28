"use client";

import { type ApiKeyView, API_KEY_LIMITS } from "@/shared";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import { type Column, DataTable } from "@/components/ui/data-table";
import { Field, FormAlert, Input } from "@/components/ui/form-controls";
import { EmptyState } from "@/components/ui/navigation-controls";
import { PageHeader } from "@/components/ui/page-header";
import { NotebookNote, Paper, Stamp } from "@/components/ui/surfaces";
import { errorMessage, fieldError } from "@/features/receiving/api-errors";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { formatDateTime, localeFor } from "@/lib/format";

import { useApiKeys } from "./use-vendor-orders";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

const EXAMPLE = `POST ${API_URL}/v1/integration/orders
X-Api-Key: <your key>
Content-Type: application/json

{
  "country": "GB",
  "externalReference": "SHOP-1001",
  "recipient": {
    "name": "Ada Obi", "line1": "1 High Street", "city": "Manchester",
    "postalCode": "M1 1AA", "phone": "+44 7700 900123"
  },
  "lines": [{ "productCode": "WIG-BW-16", "quantity": 1 }]
}`;

export function IntegrationsPage() {
  const user = useCurrentUser();
  const locale = localeFor(user.countryCode);
  const { keys, create, revoke } = useApiKeys();
  const [name, setName] = useState("");
  const [copied, setCopied] = useState(false);
  const active = (keys.data ?? []).filter((key) => !key.revokedAt).length;

  function submit(event: FormEvent) {
    event.preventDefault();
    setCopied(false);
    create.mutate(name.trim(), { onSuccess: () => setName("") });
  }

  function confirmRevoke(key: ApiKeyView) {
    if (window.confirm(`Revoke "${key.name}"? Anything using it stops working immediately.`)) {
      revoke.mutate(key.id);
    }
  }

  const columns: Column<ApiKeyView>[] = [
    {
      key: "name",
      header: "Key",
      render: (key) => (
        <span>
          <span className="block font-medium">{key.name}</span>
          <span className="font-mono text-meta text-ink-faint">{key.prefix}…</span>
        </span>
      ),
    },
    { key: "status", header: "Status", render: (key) => (key.revokedAt ? <StatusPill tone="cocoa">Revoked</StatusPill> : <StatusPill tone="lime">Active</StatusPill>) },
    { key: "used", header: "Last used", render: (key) => <span className="text-ink-soft">{key.lastUsedAt ? formatDateTime(key.lastUsedAt, locale) : "Never"}</span> },
    {
      key: "action",
      header: "",
      align: "right",
      render: (key) =>
        key.revokedAt ? null : (
          <Button variant="ghost" loading={revoke.isPending && revoke.variables === key.id} onClick={() => confirmRevoke(key)}>
            Revoke
          </Button>
        ),
    },
  ];

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        stamp="Settings"
        title="Integrations"
        lead="Connect your shop so orders arrive here on their own. Each key places and reads orders for your business only; keep it on your server, never in a browser or app."
      />
      {create.data ? (
        <NotebookNote tone="lime" tilt="none" className="max-w-[860px]">
          <Stamp className="text-cocoa">Copy this key now — it won&rsquo;t be shown again</Stamp>
          <p className="mt-3 break-all rounded-card bg-paper px-4 py-3 font-mono text-small">{create.data.key}</p>
          <Button
            variant="yellow"
            className="mt-3"
            onClick={() => {
              void navigator.clipboard.writeText(create.data.key).then(() => setCopied(true));
            }}
          >
            {copied ? "Copied" : "Copy key"}
          </Button>
        </NotebookNote>
      ) : null}
      <FormAlert message={errorMessage(revoke.error)} />
      <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <div className="flex flex-col gap-5">
          <DataTable
            caption="API keys"
            columns={columns}
            rows={keys.data ?? []}
            rowKey={(key) => key.id}
            loading={keys.isLoading}
            empty={<EmptyState title="No keys yet" body="Create a key for each shop or system you connect." />}
          />
          <Paper className="px-6 py-5">
            <Stamp>Placing an order</Stamp>
            <pre className="mt-3 overflow-x-auto rounded-card bg-paper-sunk px-4 py-3 font-mono text-meta leading-5">{EXAMPLE}</pre>
            <p className="mt-3 text-meta text-ink-faint">
              Sending the same externalReference again returns the order you already placed instead of creating a second one. Read it back with GET
              /v1/integration/orders/&#123;externalReference&#125;. Limits: 120 orders and 240 reads a minute per key.
            </p>
          </Paper>
        </div>
        <Paper className="px-6 py-6">
          <Stamp>New key</Stamp>
          <form noValidate onSubmit={submit} className="mt-4 flex flex-col gap-4">
            <FormAlert message={create.error && !fieldError(create.error, "name") ? errorMessage(create.error) : null} />
            <Field label="Name" hint="Where it's used, for example 'Shopify store'." error={fieldError(create.error, "name")}>
              {({ id, describedBy, invalid }) => <Input id={id} aria-describedby={describedBy} aria-invalid={invalid} value={name} maxLength={60} onChange={(event) => setName(event.target.value)} />}
            </Field>
            <Button type="submit" variant="yellow" loading={create.isPending} disabled={name.trim().length < 2 || active >= API_KEY_LIMITS.maxActivePerVendor}>
              Create key
            </Button>
            <p className="text-meta text-ink-faint">
              {active} of {API_KEY_LIMITS.maxActivePerVendor} active keys
            </p>
          </form>
        </Paper>
      </div>
    </div>
  );
}
