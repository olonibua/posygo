"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Paper } from "@/components/ui/surfaces";

export function RecoveryCodes({ codes }: { codes: readonly string[] }) {
  const [copy, setCopy] = useState<"idle" | "copied" | "failed">("idle");

  function copyCodes() {
    navigator.clipboard.writeText(codes.join("\n")).then(
      () => setCopy("copied"),
      () => setCopy("failed"),
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Paper className="grid grid-cols-2 gap-2 p-5 font-mono text-[15px]">
        {codes.map((code) => (
          <span key={code}>{code}</span>
        ))}
      </Paper>
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={copyCodes}>
          {copy === "copied" ? "Copied" : "Copy codes"}
        </Button>
        <span role="status" className="text-meta text-ink-faint">
          {copy === "failed" ? "Couldn't copy. Select them instead." : null}
        </span>
      </div>
    </div>
  );
}
