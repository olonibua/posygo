import type { ReactNode } from "react";

import { GatedConsole } from "@/components/layout/gated-console";

export default function ConsoleLayout({ children }: { children: ReactNode }) {
  return <GatedConsole requirement={{ kind: "staff" }}>{children}</GatedConsole>;
}
