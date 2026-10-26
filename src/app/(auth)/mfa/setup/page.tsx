import type { Metadata } from "next";

import { AuthHeading, AuthShell } from "@/components/layout/auth-shell";
import { MfaSetup } from "@/features/auth/mfa-setup";

export const metadata: Metadata = { title: "Set up two-factor authentication" };

export default function MfaSetupPage() {
  return (
    <AuthShell
      railStamp="One more lock"
      railTitle={
        <>
          A second key
          <br />
          for your account.
        </>
      }
      railNote={
        <>
          Your password,
          <br />
          plus your phone.
        </>
      }
    >
      <AuthHeading title="Set up two-factor" lead="Accounts that can see other people's stock or money must use a second factor. It takes a minute." />
      <MfaSetup />
    </AuthShell>
  );
}
