import type { ReactNode } from "react";

import { PRIVATE_PAGE } from "@/lib/site";

export const metadata = PRIVATE_PAGE;

export default function AuthLayout({ children }: { children: ReactNode }) {
  return children;
}
