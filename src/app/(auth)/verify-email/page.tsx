import type { Metadata } from "next";

import { AuthHeading, AuthShell, SIGNUP_STEPS } from "@/components/layout/auth-shell";
import { VerifyEmailForm } from "@/features/auth/verify-email-form";

export const metadata: Metadata = { title: "Confirm your email" };

export default function VerifyEmailPage() {
  return (
    <AuthShell
      railStamp="Make yourself at home"
      railTitle={
        <>
          Your stock.
          <br />
          Every market.
        </>
      }
      railNote={
        <>
          Nearly there.
          <br />
          Check your inbox.
        </>
      }
      steps={SIGNUP_STEPS}
      currentStep={1}
    >
      <AuthHeading title="Confirm your email" lead="We sent an 8-digit code to your inbox. Enter it below to activate your account." />
      <VerifyEmailForm />
    </AuthShell>
  );
}
