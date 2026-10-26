import type { Metadata } from "next";

import { AuthHeading, AuthShell } from "@/components/layout/auth-shell";
import { AcceptStaffInvitationForm } from "@/features/staff/accept-staff-invitation-form";

export const metadata: Metadata = { title: "Join the platform team" };

export default function StaffInvitePage() {
  return (
    <AuthShell
      railStamp="You’re invited"
      railTitle={
        <>
          Join the team
          <br />
          running the network.
        </>
      }
      railNote={
        <>
          A password, then
          <br />
          your authenticator app.
        </>
      }
    >
      <AuthHeading title="Join the platform team" />
      <AcceptStaffInvitationForm />
    </AuthShell>
  );
}
