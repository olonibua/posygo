import type { Metadata } from "next";
import { Suspense } from "react";

import { SignupFlow } from "@/features/auth/signup-flow";
import { publicPage } from "@/lib/site";

export const metadata: Metadata = {
  ...publicPage({
    title: "Start selling with local fulfilment",
    description: "Create a free Posygo account, send your stock to a vetted local hub, and ship orders to customers in days.",
    path: "/signup",
  }),
  robots: { index: true, follow: true },
};

export default function SignupPage() {
  return (
    <Suspense>
      <SignupFlow />
    </Suspense>
  );
}
