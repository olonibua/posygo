import type { Metadata } from "next";

import { AuthHeading, AuthShell } from "@/components/layout/auth-shell";
import { ResetPasswordForm } from "@/features/auth/password-reset-forms";

export const metadata: Metadata = { title: "Choose a new password" };

export default function ResetPasswordPage() {
  return (
    <AuthShell
      railStamp="It happens"
      railTitle={
        <>
          Let’s get you
          <br />
          back in.
        </>
      }
      railNote={
        <>
          We’ll sign out every
          <br />
          other session for you.
        </>
      }
    >
      <AuthHeading title="Choose a new password" />
      <ResetPasswordForm />
    </AuthShell>
  );
}
