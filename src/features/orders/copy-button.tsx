"use client";

import { useState } from "react";

import { Button, type ButtonVariant } from "@/components/ui/button";

export function CopyButton({ value, label, variant = "ghost" }: { value: string; label: string; variant?: ButtonVariant }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button variant={variant} onClick={() => void navigator.clipboard.writeText(value).then(() => setCopied(true))}>
      {copied ? "Copied" : label}
    </Button>
  );
}
