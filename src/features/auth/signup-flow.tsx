"use client";

import { useState } from "react";

import { AuthHeading, AuthShell, SIGNUP_STEPS } from "@/components/layout/auth-shell";

import { SignupForm } from "./signup-form";
import { VerifyEmailForm } from "./verify-email-form";

export function SignupFlow() {
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);
  const railTitle = (
    <>
      Your stock.
      <br />
      Every market.
    </>
  );

  if (credentials) {
    return (
      <AuthShell
        railStamp="Make yourself at home"
        railTitle={railTitle}
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
        <AuthHeading title="Confirm your email" lead={`We sent an 8-digit code to ${credentials.email}. Enter it below to activate your account.`} />
        <VerifyEmailForm email={credentials.email} password={credentials.password} />
      </AuthShell>
    );
  }
  return (
    <AuthShell
      railStamp="Make yourself at home"
      railTitle={railTitle}
      railNote={
        <>
          One account.
          <br />
          Stock in every country you sell in.
        </>
      }
      steps={SIGNUP_STEPS}
      currentStep={0}
    >
      <AuthHeading title="Create your account" lead="Tell us who you are and where you want to store stock. You can add more countries later." />
      <SignupForm onSubmitted={setCredentials} />
    </AuthShell>
  );
}
