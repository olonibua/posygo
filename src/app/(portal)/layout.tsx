import type { ReactNode } from "react";

import { PRIVATE_PAGE } from "@/lib/site";

import { GatedConsole } from "@/components/layout/gated-console";
import { VENDOR_CONSOLE } from "@/components/layout/navigation";

export const metadata = PRIVATE_PAGE;

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <GatedConsole console={VENDOR_CONSOLE} requirement={{ kind: "vendor" }}>
      {children}
    </GatedConsole>
  );
}
