"use client";

import { hasPermission, type InboundDetailView } from "@/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button, ButtonLink } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-controls";
import { PageHeader } from "@/components/ui/page-header";
import { NotebookNote, Stamp } from "@/components/ui/surfaces";
import { PageSkeleton } from "@/components/ui/skeleton";
import { errorMessage } from "@/features/catalogue/form-errors";
import { INBOUND_ACTION_LABELS } from "@/features/stock/display";
import { InboundFacts, InboundLinesTable, InboundStatusPill, MessageThread, PhotoList } from "@/features/stock/inbound-parts";
import { VENDOR_WALLET_KEY } from "@/features/finance/use-vendor-wallet";
import { apiRequest } from "@/lib/api/client";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { localeFor } from "@/lib/format";
import { toast } from "@/lib/toast/toast-store";

import { InboundChargesCard } from "./inbound-charges";
import { INBOUND_KEY } from "./inbound-editor-page";

type VendorAction = "SUBMIT" | "CANCEL" | "PAY_HOLD";

const ACTION_DONE: Record<VendorAction, string> = { SUBMIT: "Shipment submitted", CANCEL: "Shipment cancelled", PAY_HOLD: "Hold charge paid" };
const VENDOR_ACTIONS: readonly string[] = ["SUBMIT", "PAY_HOLD", "CANCEL"];

const CONFIRMATIONS: Partial<Record<VendorAction, string>> = {
  CANCEL: "Cancel this shipment? The hub won't expect it any more. Any onboarding charge is returned to your wallet.",
  PAY_HOLD: "Pay the hold charge from your wallet? The hub will carry on with the shipment.",
};

export function InboundDetailPage({ inboundId }: { inboundId: string }) {
  const user = useCurrentUser();
  const canManage = hasPermission(user.role, "vendor.stock.manage");
  const queryClient = useQueryClient();
  const key = [...INBOUND_KEY, inboundId];
  const inbound = useQuery({ queryKey: key, queryFn: () => apiRequest<InboundDetailView>(`/v1/vendor/inbound/${inboundId}`) });
  const store = (next: InboundDetailView) => {
    queryClient.setQueryData(key, next);
    void queryClient.invalidateQueries({ queryKey: [...INBOUND_KEY, "list"] });
  };

  const act = useMutation({
    mutationFn: (action: VendorAction) => apiRequest<InboundDetailView>(`/v1/vendor/inbound/${inboundId}/actions`, { method: "POST", body: { action } }),
    onSuccess: (next, action) => {
      store(next);
      void queryClient.invalidateQueries({ queryKey: VENDOR_WALLET_KEY });
      toast.success(ACTION_DONE[action], next.reference);
    },
  });
  const message = useMutation({ mutationFn: (body: string) => apiRequest<InboundDetailView>(`/v1/vendor/inbound/${inboundId}/messages`, { method: "POST", body: { body } }), onSuccess: store });
  const openPhoto = useMutation({
    mutationFn: (fileId: string) => apiRequest<{ url: string }>(`/v1/vendor/inbound/${inboundId}/photos/${fileId}/url`, { method: "POST" }),
    onSuccess: (result) => window.open(result.url, "_blank", "noopener,noreferrer"),
  });

  function run(action: VendorAction) {
    const confirmation = CONFIRMATIONS[action];
    if (confirmation && !window.confirm(confirmation)) {
      return;
    }
    act.mutate(action);
  }

  const data = inbound.data;
  if (!data) {
    return inbound.isError ? <p className="text-ink-soft">{"This shipment isn't available."}</p> : <PageSkeleton />;
  }
  const actions = data.actions.filter((action): action is VendorAction => VENDOR_ACTIONS.includes(action));
  const locale = localeFor(user.countryCode);
  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        stamp={`Inbound · ${data.reference}`}
        title={data.status === "DRAFT" ? "Draft shipment" : "Shipment"}
        lead={`${data.totalUnits} units in ${data.totalBoxes} boxes, going to ${data.warehouseName}.`}
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            <InboundStatusPill status={data.status} />
            {data.status === "DRAFT" && canManage ? (
              <ButtonLink href={`/inbound/${data.id}/edit`} variant="ghost">
                Edit
              </ButtonLink>
            ) : null}
            {actions.map((action) => (
              <Button key={action} variant={action === "CANCEL" ? "ghost" : "yellow"} loading={act.isPending && act.variables === action} disabled={act.isPending} onClick={() => run(action)}>
                {INBOUND_ACTION_LABELS[action]}
              </Button>
            ))}
          </div>
        }
      />
      <FormAlert message={errorMessage(act.error) ?? errorMessage(openPhoto.error)} />
      {data.status === "DRAFT" && canManage ? (
        <NotebookNote tone="sky" tilt="none" className="max-w-[640px]">
          Check the products and box counts, then submit. Once submitted, the onboarding charge is taken from your wallet, the hub starts expecting it and the declaration is locked.
        </NotebookNote>
      ) : null}
      {data.statusReason ? (
        <NotebookNote tone="pink" tilt="none" className="max-w-[640px]">
          <Stamp className="text-cocoa">Note from the hub</Stamp>
          <p className="mt-2 text-small">{data.statusReason}</p>
        </NotebookNote>
      ) : null}
      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-5">
          <InboundLinesTable inbound={data} />
          {data.receivingNote ? (
            <NotebookNote tone="yellow" tilt="none">
              <Stamp className="text-cocoa">Receiving note</Stamp>
              <p className="mt-2 text-small">{data.receivingNote}</p>
            </NotebookNote>
          ) : null}
          {data.status === "DRAFT" ? null : (
            <MessageThread
              messages={data.messages}
              viewer="vendor"
              onSend={canManage ? (body) => message.mutateAsync(body) : undefined}
              sending={message.isPending}
              error={errorMessage(message.error)}
            />
          )}
        </div>
        <div className="flex flex-col gap-5">
          <InboundChargesCard inbound={data} locale={locale} />
          <InboundFacts inbound={data} />
          <PhotoList photos={data.photos} lines={data.lines} onOpen={(fileId) => openPhoto.mutate(fileId)} />
        </div>
      </div>
    </div>
  );
}
