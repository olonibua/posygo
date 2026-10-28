import Link from "next/link";
import type { ComponentProps } from "react";

import { cn } from "@/lib/cn";

import { Icon } from "./icon";

export function BackLink({ className, children, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link className={cn("group inline-flex items-center gap-1.5 text-ink no-underline hover:underline", className)} {...props}>
      <Icon name="back" className="h-4 w-4 shrink-0 transition-[translate] duration-200 group-hover:-translate-x-0.5" />
      {children}
    </Link>
  );
}
