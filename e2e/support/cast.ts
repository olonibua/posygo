import type { Role } from "@/shared";

export interface Member {
  handle: string;
  role: Role;
  email: string;
  landing: string;
  mfa: boolean;
}

const member = (handle: string, role: Role, landing: string, mfa = true): Member => ({ handle, role, email: `${handle}@e2e.gfn.local`, landing, mfa });

export const CAST = {
  superAdmin: member("super-admin", "SUPER_ADMIN", "/admin"),
  admin: member("admin", "ADMIN", "/admin"),
  finance: member("finance", "FINANCE_ADMIN", "/admin"),
  compliance: member("compliance", "COMPLIANCE", "/admin"),
  countryOps: member("country-ops", "COUNTRY_OPS", "/admin"),
  operator: member("operator", "WAREHOUSE_OPERATOR", "/admin"),
  vendorOwner: member("vendor-owner", "VENDOR_OWNER", "/overview", false),
  vendorMember: member("vendor-member", "VENDOR_MEMBER", "/overview", false),
  partnerLead: member("partner-lead", "FULFILMENT_PARTNER", "/admin"),
  partnerStaff: member("partner-staff", "PARTNER_STAFF", "/admin"),
} as const;

export const PASSWORD = process.env.E2E_PASSWORD ?? "e2e local password 2026";
export const TOTP_SECRET = process.env.E2E_TOTP_SECRET ?? "JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP";
export const API_URL = process.env.E2E_API_URL ?? "http://localhost:4000";
export const API_DIR = process.env.E2E_API_DIR ?? "../global-fulfilment-api";
