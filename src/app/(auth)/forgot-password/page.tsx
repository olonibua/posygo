import type { Metadata } from "next";

import { AuthHeading, AuthShell } from "@/components/layout/auth-shell";
import { ForgotPasswordForm } from "@/features/auth/password-reset-forms";

export const metadata: Metadata = { title: "Reset your password" };

export default function ForgotPasswordPage() {
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
          A fresh password
          <br />
          in two minutes.
        </>
      }
    >
      <AuthHeading title="Reset your password" lead="Enter your email and we'll send a link to choose a new password." />
      <ForgotPasswordForm />
    </AuthShell>
  );
}
