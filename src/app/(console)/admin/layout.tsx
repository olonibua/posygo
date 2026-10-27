import type { ReactNode } from "react";

import { PRIVATE_PAGE } from "@/lib/site";

import { GatedConsole } from "@/components/layout/gated-console";

export const metadata = PRIVATE_PAGE;

export default function ConsoleLayout({ children }: { children: ReactNode }) {
  return <GatedConsole requirement={{ kind: "staff" }}>{children}</GatedConsole>;
}
