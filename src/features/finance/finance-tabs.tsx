"use client";

import { hasPermission, type Permission } from "@/shared";
import Link from "next/link";

import { useCurrentUser } from "@/lib/auth/use-current-user";
import { cn } from "@/lib/cn";

const TABS = [
  { key: "wallets", label: "Wallets", href: "/admin/finance", permission: "finance.read" },
  { key: "adjustments", label: "Adjustments", href: "/admin/finance/adjustments", permission: "finance.read" },
  { key: "fees", label: "Prices", href: "/admin/fees", permission: "fees.read" },
  { key: "reconciliation", label: "Reconciliation", href: "/admin/finance/reconciliation", permission: "finance.read" },
] as const satisfies ReadonlyArray<{ key: string; label: string; href: string; permission: Permission }>;

export type FinanceTab = (typeof TABS)[number]["key"];

export function FinanceTabs({ current }: { current: FinanceTab }) {
  const user = useCurrentUser();
  const visible = TABS.filter((tab) => hasPermission(user.role, tab.permission));
  if (visible.length < 2) {
    return null;
  }
  return (
    <nav aria-label="Finance sections" className="flex flex-wrap gap-2">
      {visible.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          aria-current={tab.key === current ? "page" : undefined}
          className={cn(
            "rounded-control border-[1.5px] px-3.5 py-2 text-small font-medium no-underline",
            tab.key === current ? "border-cocoa bg-cocoa text-on-ink" : "border-line-strong bg-paper text-ink",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
