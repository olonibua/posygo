import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "yellow" | "lime" | "ghost";
export type ButtonSize = "md" | "lg";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-ink text-on-ink",
  yellow: "bg-yellow text-cocoa",
  lime: "bg-lime text-cocoa",
  ghost: "bg-transparent text-ink shadow-[inset_0_0_0_1.5px_var(--ink)] hover:bg-paper",
};

const SIZES: Record<ButtonSize, string> = { md: "px-[18px] py-3 text-small font-medium", lg: "px-6 py-4 text-body font-semibold" };

export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn(
    "motion-press inline-flex items-center justify-center gap-2.5 rounded-chip leading-[18px] no-underline hover:[translate:0_-1px] disabled:pointer-events-none disabled:opacity-60",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
}

export function Button({ variant, size, icon, loading = false, className, children, disabled, type = "button", ...props }: CommonProps & ComponentProps<"button"> & { loading?: boolean }) {
  return (
    <button type={type} className={buttonClasses(variant, size, className)} disabled={disabled ?? loading} aria-busy={loading || undefined} {...props}>
      {loading ? <Spinner /> : icon}
      {children}
    </button>
  );
}

export function ButtonLink({ variant, size, icon, className, children, ...props }: CommonProps & ComponentProps<typeof Link>) {
  return (
    <Link className={buttonClasses(variant, size, className)} {...props}>
      {icon}
      {children}
    </Link>
  );
}

function Spinner() {
  return <span aria-hidden className="motion-pop h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />;
}
