"use client";

import { hasPermission, type ProductInput, type ProductView } from "@/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import { FormAlert } from "@/components/ui/form-controls";
import { PageHeader } from "@/components/ui/page-header";
import { NotebookNote } from "@/components/ui/surfaces";
import { PageSkeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/api/client";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { toast } from "@/lib/toast/toast-store";

import { errorMessage } from "./form-errors";
import { ProductForm } from "./product-form";
import { useMarket } from "./use-market";

export const PRODUCTS_KEY = ["vendor", "products"] as const;

export function NewProductPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const market = useMarket();
  const user = useCurrentUser();
  const canManage = hasPermission(user.role, "vendor.stock.manage");

  async function create(input: ProductInput) {
    const created = await apiRequest<ProductView>("/v1/vendor/products", { method: "POST", body: input });
    await queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
    router.push(`/products/${created.id}`);
  }

  return (
    <div className="flex flex-col gap-7">
      <PageHeader stamp="Products" title="Add a product" lead="Tell us what you're sending so the hub can recognise, store and ship it." />
      {canManage ? (
        <ProductForm market={market} readOnly={false} submitLabel="Save product" onSave={create} />
      ) : (
        <NotebookNote tone="yellow" tilt="none" className="max-w-[560px]">
          Only the account owner can add products.
        </NotebookNote>
      )}
    </div>
  );
}

export function EditProductPage({ productId }: { productId: string }) {
  const queryClient = useQueryClient();
  const market = useMarket();
  const user = useCurrentUser();
  const canManage = hasPermission(user.role, "vendor.stock.manage");
  const key = [...PRODUCTS_KEY, productId];
  const product = useQuery({ queryKey: key, queryFn: () => apiRequest<ProductView>(`/v1/vendor/products/${productId}`) });
  const status = useMutation({
    mutationFn: (next: ProductView["status"]) => apiRequest<ProductView>(`/v1/vendor/products/${productId}/status`, { method: "POST", body: { status: next } }),
    onSuccess: (updated) => {
      queryClient.setQueryData(key, updated);
      void queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
    },
  });

  async function save(input: ProductInput) {
    const updated = await apiRequest<ProductView>(`/v1/vendor/products/${productId}`, { method: "PUT", body: input });
    queryClient.setQueryData(key, updated);
    await queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
    toast.success("Product saved");
  }

  const data = product.data;
  if (!data) {
    return product.isError ? <p className="text-ink-soft">{"This product isn't available."}</p> : <PageSkeleton />;
  }
  const archived = data.status === "ARCHIVED";
  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        stamp={`Products · ${data.code}`}
        title={data.name}
        lead={`${data.stock.available} ready to sell · ${data.stock.reserved} held for orders · ${data.stock.damaged} damaged`}
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            {archived ? <StatusPill tone="cocoa">Archived</StatusPill> : <StatusPill tone="lime">Active</StatusPill>}
            <Link href={`/products/labels?ids=${data.id}`} className="text-small font-medium">
              Print labels
            </Link>
            {canManage ? (
              <Button variant="ghost" loading={status.isPending} onClick={() => status.mutate(archived ? "ACTIVE" : "ARCHIVED")}>
                {archived ? "Restore" : "Archive"}
              </Button>
            ) : null}
          </div>
        }
      />
      <FormAlert message={errorMessage(status.error)} />
      <ProductForm key={data.updatedAt} market={market} product={data} readOnly={!canManage || archived} submitLabel="Save changes" onSave={save} />
    </div>
  );
}
