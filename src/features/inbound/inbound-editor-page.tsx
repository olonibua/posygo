"use client";

import { hasPermission, type InboundDetailView, type InboundInput } from "@/shared";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { PageHeader } from "@/components/ui/page-header";
import { NotebookNote } from "@/components/ui/surfaces";
import { PageSkeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/api/client";
import { useCurrentUser } from "@/lib/auth/use-current-user";

import { useCountryScope, useSelectedCountry } from "@/features/seller-countries/selected-country";

import { InboundForm } from "./inbound-form";

export const INBOUND_KEY = ["vendor", "inbound"] as const;

function OwnerOnly() {
  return (
    <NotebookNote tone="yellow" tilt="none" className="max-w-[560px]">
      Only the account owner can declare shipments.
    </NotebookNote>
  );
}

export function NewInboundPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useCurrentUser();
  const { country } = useSelectedCountry();
  const { path } = useCountryScope();

  async function create(input: InboundInput) {
    const created = await apiRequest<InboundDetailView>(path("/v1/vendor/inbound"), { method: "POST", body: input });
    queryClient.setQueryData([...INBOUND_KEY, created.id], created);
    await queryClient.invalidateQueries({ queryKey: [...INBOUND_KEY, "list"] });
    router.push(`/inbound/${created.id}`);
  }

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        stamp="Inbound"
        title={country ? `Send stock in to ${country.name}` : "Send stock in"}
        lead="Tell us what's coming. It stays a draft until you submit it, so you can change anything first."
      />
      {hasPermission(user.role, "vendor.stock.manage") ? <InboundForm draftKey={country ? `inbound:new:${country.code.toLowerCase()}` : undefined} onSave={create} /> : <OwnerOnly />}
    </div>
  );
}

export function EditInboundPage({ inboundId }: { inboundId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useCurrentUser();
  const key = [...INBOUND_KEY, inboundId];
  const inbound = useQuery({ queryKey: key, queryFn: () => apiRequest<InboundDetailView>(`/v1/vendor/inbound/${inboundId}`) });

  async function save(input: InboundInput) {
    const updated = await apiRequest<InboundDetailView>(`/v1/vendor/inbound/${inboundId}`, { method: "PUT", body: input });
    queryClient.setQueryData(key, updated);
    await queryClient.invalidateQueries({ queryKey: [...INBOUND_KEY, "list"] });
    router.push(`/inbound/${inboundId}`);
  }

  const data = inbound.data;
  if (!data) {
    return inbound.isError ? <p className="text-ink-soft">{"This shipment isn't available."}</p> : <PageSkeleton />;
  }
  return (
    <div className="flex flex-col gap-7">
      <PageHeader stamp={`Inbound · ${data.reference}`} title="Edit shipment" />
      {!hasPermission(user.role, "vendor.stock.manage") ? (
        <OwnerOnly />
      ) : data.status === "DRAFT" ? (
        <InboundForm inbound={data} onSave={save} />
      ) : (
        <NotebookNote tone="yellow" tilt="none" className="max-w-[560px]">
          This shipment has been submitted, so it can&rsquo;t be changed. Message the hub if something&rsquo;s wrong.
        </NotebookNote>
      )}
    </div>
  );
}
