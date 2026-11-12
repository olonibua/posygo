"use client";

import { useEffect, useState } from "react";

import { AuthHeading, AuthShell, SIGNUP_STEPS } from "@/components/layout/auth-shell";
import { trackPixel } from "@/lib/analytics/meta-pixel";

import { WhatsAppTextLink } from "@/features/marketing/whatsapp-button";

import { SignupForm } from "./signup-form";
import { VerifyEmailForm } from "./verify-email-form";

export function SignupFlow() {
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);

  useEffect(() => trackPixel("ViewContent", { content_name: "seller_signup" }), []);

  function accountCreated(created: { email: string; password: string }) {
    trackPixel("Lead", { content_name: "seller_signup" });
    setCredentials(created);
  }
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
      <AuthHeading
        title="Create your account"
        lead={
          <>
            Tell us who you are and where you want to store stock. You can add more countries later. Questions first? <WhatsAppTextLink>Chat with us on WhatsApp</WhatsAppTextLink>.
          </>
        }
      />
      <SignupForm onSubmitted={accountCreated} />
    </AuthShell>
  );
}
