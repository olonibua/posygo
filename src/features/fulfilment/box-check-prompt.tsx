"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { BoxCheckForm } from "@/features/warehouses/box-check-form";

interface BoxCheckPromptProps {
  orderId: string;
  vendorId: string;
  warehouseId: string;
  businessName: string;
}

export function BoxCheckPrompt({ orderId, vendorId, warehouseId, businessName }: BoxCheckPromptProps) {
  const [saved, setSaved] = useState(false);

  return (
    <Paper className="flex flex-col gap-4 px-6 py-5">
      <Stamp>Photo of the seller&apos;s boxes</Stamp>
      {saved ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-small text-ink-soft">Saved. {businessName} can see what&apos;s left in their boxes.</p>
          <Button variant="ghost" onClick={() => setSaved(false)}>
            Add another
          </Button>
        </div>
      ) : (
        <>
          <p className="text-small text-ink-soft">Now that this order is out, take a photo of what&apos;s left in {businessName}&apos;s boxes so they can see their stock and space.</p>
          <BoxCheckForm warehouseId={warehouseId} vendorId={vendorId} businessName={businessName} orderId={orderId} onDone={() => setSaved(true)} />
        </>
      )}
    </Paper>
  );
}
