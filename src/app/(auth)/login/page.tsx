import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthHeading, AuthShell } from "@/components/layout/auth-shell";
import { LoginForm } from "@/features/auth/login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <AuthShell
      railStamp="Welcome back"
      railTitle={
        <>
          Everything is
          <br />
          where you left it.
        </>
      }
      railNote={
        <>
          Every unit counted.
          <br />
          Every order tracked.
        </>
      }
    >
      <AuthHeading title="Sign in" lead="Use the email and password for your account." />
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
