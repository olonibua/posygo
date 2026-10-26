import type { Metadata } from "next";

import { AuthHeading, AuthShell } from "@/components/layout/auth-shell";
import { AcceptInvitationForm } from "@/features/auth/accept-invitation-form";

export const metadata: Metadata = { title: "Join your team" };

export default function InvitePage() {
  return (
    <AuthShell
      railStamp="You’re invited"
      railTitle={
        <>
          Join the team
          <br />
          behind the stock.
        </>
      }
      railNote={
        <>
          One password
          <br />
          and you’re in.
        </>
      }
    >
      <AuthHeading title="Join your team" />
      <AcceptInvitationForm />
    </AuthShell>
  );
}
