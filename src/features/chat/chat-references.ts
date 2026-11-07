import type { ChatSide, SessionUser } from "@/shared";

export function referenceHref(reference: string, audience: ChatSide, user: SessionUser): string | null {
  if (!reference.startsWith("CASE-")) {
    return null;
  }
  if (audience === "TEAM") {
    return "/admin/support";
  }
  return user.vendorId ? "/settings/requests" : "/admin/requests";
}
