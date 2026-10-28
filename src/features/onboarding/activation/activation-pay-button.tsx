"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-controls";
import { errorMessage } from "@/features/receiving/api-errors";

import { useStartActivation } from "./use-activation";

export function ActivationPayButton({ fee }: { fee: string }) {
  const [problem, setProblem] = useState<string | null>(null);
  const start = useStartActivation(setProblem);
  return (
    <div className="flex flex-col items-start gap-2">
      <Button
        variant="yellow"
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
