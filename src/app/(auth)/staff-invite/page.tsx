import type { Metadata } from "next";

import { AuthShell } from "@/components/layout/auth-shell";
import { AcceptStaffInvitationForm } from "@/features/staff/accept-staff-invitation-form";

export const metadata: Metadata = { title: "Set up your account" };

export default function StaffInvitePage() {
  return (
    <AuthShell
      railStamp="Welcome"
      railTitle={
        <>
          Set up your
          <br />
          account.
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
      <AcceptStaffInvitationForm />
    </AuthShell>
  );
}
