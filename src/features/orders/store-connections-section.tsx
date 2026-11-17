"use client";

import { type StoreConnectionView, type StorePlatform, STORE_CONNECTION_LIMITS } from "@/shared";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FormAlert, Input } from "@/components/ui/form-controls";
import { NotebookNote, Paper, Stamp } from "@/components/ui/surfaces";
import { errorMessage, fieldError } from "@/features/receiving/api-errors";

import { CopyButton } from "./copy-button";
import { StoreConnectionCard } from "./store-connection-card";
import { StoreSetupGuide } from "./store-setup-guide";
import { useStoreConnections } from "./use-vendor-orders";

export function StoreConnectionsSection({ platform, locale }: { platform: StorePlatform; locale: string }) {
  const { connections, create, saveSecret, disconnect } = useStoreConnections();
  const [name, setName] = useState("");
  const active = (connections.data ?? []).filter((connection) => !connection.revokedAt);
  const shown = active.filter((connection) => connection.platform === platform);
  const created = create.data?.platform === platform ? create.data : null;

  function submit(event: FormEvent) {
    event.preventDefault();
    create.mutate({ platform, name: name.trim() }, { onSuccess: () => setName("") });
  }

  function confirmDisconnect(connection: StoreConnectionView) {
    if (window.confirm(`Disconnect "${connection.name}"? New orders from this shop will stop arriving.`)) {
      disconnect.mutate(connection.id);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
      <div className="flex flex-col gap-5">
        {created?.secret ? (
          <NotebookNote tone="lime" tilt="none">
            <Stamp className="text-cocoa">Copy this secret now — it won&rsquo;t be shown again</Stamp>
            <p className="mt-3 break-all rounded-card bg-paper px-4 py-3 font-mono text-small">{created.secret}</p>
            <div className="mt-3">
              <CopyButton value={created.secret} label="Copy secret" variant="yellow" />
            </div>
          </NotebookNote>
        ) : null}
        <FormAlert message={errorMessage(disconnect.error) ?? errorMessage(saveSecret.error && !fieldError(saveSecret.error, "secret") ? saveSecret.error : null)} />
        {shown.map((connection) => (
          <StoreConnectionCard
            key={connection.id}
            connection={connection}
            locale={locale}
            saving={saveSecret.isPending && saveSecret.variables.id === connection.id}
            saveError={saveSecret.variables?.id === connection.id ? saveSecret.error : null}
            disconnecting={disconnect.isPending && disconnect.variables === connection.id}
            onSaveSecret={(secret) => saveSecret.mutate({ id: connection.id, secret })}
            onDisconnect={() => confirmDisconnect(connection)}
          />
        ))}
        <StoreSetupGuide platform={platform} />
      </div>
      <Paper className="h-fit px-6 py-6">
        <Stamp>Connect a shop</Stamp>
        <form noValidate onSubmit={submit} className="mt-4 flex flex-col gap-4">
          <FormAlert message={create.error && !fieldError(create.error, "name") ? errorMessage(create.error) : null} />
          <Field label="Shop name" hint="So you can tell your shops apart, for example 'Ada Hair'." error={fieldError(create.error, "name")}>
            {({ id, describedBy, invalid }) => <Input id={id} aria-describedby={describedBy} aria-invalid={invalid} value={name} maxLength={60} onChange={(event) => setName(event.target.value)} />}
          </Field>
          <Button type="submit" variant="yellow" loading={create.isPending} disabled={name.trim().length < 2 || active.length >= STORE_CONNECTION_LIMITS.maxActivePerVendor}>
            Connect
          </Button>
          <p className="text-meta text-ink-faint">
            {active.length} of {STORE_CONNECTION_LIMITS.maxActivePerVendor} shops connected
          </p>
        </form>
      </Paper>
    </div>
  );
}
