import type { Metadata } from "next";
import { Suspense } from "react";

import { SignupFlow } from "@/features/auth/signup-flow";
import { publicPage } from "@/lib/site";

export const metadata: Metadata = {
  ...publicPage({
    title: "Start selling with fast delivery to your customers",
    description: "Create a free Posygo account, send us your stock, and get your orders to customers in days.",
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
