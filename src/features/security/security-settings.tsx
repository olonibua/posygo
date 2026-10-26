"use client";

import { ButtonLink } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import { PageHeader } from "@/components/ui/page-header";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { useCurrentUser } from "@/lib/auth/use-current-user";

export function SecuritySettings() {
  const user = useCurrentUser();
  return (
    <div className="flex flex-col gap-7">
      <PageHeader stamp="Security" title="Sign-in & security" lead="Protect the account that controls your stock and money." />
      <Paper className="flex flex-col gap-5 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Stamp>Two-factor authentication</Stamp>
          <h3 className="mb-1 mt-1.5 flex items-center gap-3 text-[22px] font-medium tracking-[-0.5px]">
            Authenticator app
            {user.mfaEnrolled ? <StatusPill tone="lime">On</StatusPill> : <StatusPill tone="pink">Off</StatusPill>}
          </h3>
          <p className="max-w-[620px] text-small leading-[21px] text-ink-soft">
            {user.mfaEnrolled
              ? "Each sign-in needs a code from your phone. Keep your recovery codes somewhere safe."
              : "Add a code from your phone to every sign-in. You'll need it before you can approve payouts."}
          </p>
        </div>
        {user.mfaEnrolled ? null : (
          <ButtonLink href="/mfa/setup" variant="yellow">
            Turn on →
          </ButtonLink>
        )}
      </Paper>
      <Paper className="px-6 py-5">
        <Stamp>Sessions</Stamp>
        <p className="mt-2 text-small leading-[21px] text-ink-soft">You stay signed in on this device for up to 30 days. Changing your password signs out every other device straight away.</p>
      </Paper>
    </div>
  );
}
