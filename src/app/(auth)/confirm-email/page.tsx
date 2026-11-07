import type { Metadata } from "next";

import { AuthHeading, AuthShell } from "@/components/layout/auth-shell";
import { ConfirmEmail } from "@/features/auth/confirm-email";

export const metadata: Metadata = { title: "Confirm your new email" };

export default function ConfirmEmailPage() {
  return (
    <AuthShell
      railStamp="Nearly done"
      railTitle={
        <>
          One quick
          <br />
          check.
        </>
      }
      railNote={
        <>
          We&apos;ll sign you out
          <br />
          everywhere afterwards.
        </>
      }
    >
      <AuthHeading title="Confirm your new email" />
      <ConfirmEmail />
    </AuthShell>
  );
}
