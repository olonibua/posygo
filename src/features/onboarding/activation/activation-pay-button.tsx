"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-controls";
import { errorMessage } from "@/features/receiving/api-errors";
import { cn } from "@/lib/cn";

import { useStartActivation } from "./use-activation";

export function ActivationPayButton({ fee, block = false, autoFocus = false }: { fee: string; block?: boolean; autoFocus?: boolean }) {
  const [problem, setProblem] = useState<string | null>(null);
  const start = useStartActivation(setProblem);
  return (
    <div className={cn("flex flex-col gap-2", block ? "items-stretch" : "items-start")}>
      <Button
        variant="yellow"
        size={block ? "lg" : undefined}
        className={block ? "w-full justify-center" : undefined}
        autoFocus={autoFocus}
        loading={start.isPending}
        onClick={() => {
          setProblem(null);
          start.mutate();
        }}
      >
        Pay {fee} →
      </Button>
      <FormAlert message={problem ?? errorMessage(start.error)} />
    </div>
  );
}
