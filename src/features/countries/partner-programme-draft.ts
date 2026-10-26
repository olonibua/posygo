import { type PartnerProgramme, partnerProgramme, partnerProgrammeSchema } from "@/shared";

import { toMajorText, toMinor } from "@/features/finance/money-input";

export interface TierDraft {
  name: string;
  maxStock: string;
  maxItem: string;
  minCleanOrders: string;
  minPassedCounts: string;
  minDaysActive: string;
}

export interface ProgrammeDraft {
  acceptingApplications: boolean;
  taxIdLabel: string;
  taxIdPattern: string;
  taxIdRequired: boolean;
  workDeclaration: string;
  deposit: string;
  insurance: string;
  platformCover: string;
  retentionDays: string;
  mysteryVendorId: string;
  tiers: TierDraft[];
  custody: CustodyDraft;
}

export interface CustodyDraft {
  cycleCountDays: string;
  lossAlertPct: string;
  trustFloor: string;
  trustForPromotion: string;
  highValue: string;
  noScanHours: string;
}

export function programmeDraft(config: { partners?: unknown }, currency: string): ProgrammeDraft {
  const programme = partnerProgramme(config);
  const major = (minor: number) => toMajorText(minor, currency);
  return {
    acceptingApplications: programme.acceptingApplications,
    taxIdLabel: programme.taxId.label,
    taxIdPattern: programme.taxId.pattern ?? "",
    taxIdRequired: programme.taxId.required,
    workDeclaration: programme.workDeclaration,
    deposit: major(programme.depositMinor),
    insurance: major(programme.insuranceCoverMinor),
    platformCover: major(programme.platformInsuranceCoverMinor),
    retentionDays: String(programme.proofOfAddressRetentionDays),
    mysteryVendorId: programme.mysteryVendorId ?? "",
    custody: {
      cycleCountDays: String(programme.cycleCountDays),
      lossAlertPct: String(programme.shrinkageAlertBps / 100),
      trustFloor: String(programme.trustFloor),
      trustForPromotion: String(programme.trustForPromotion),
      highValue: major(programme.highValueOrderMinor),
      noScanHours: String(programme.noScanAlertHours),
    },
    tiers: programme.tiers.map((tier) => ({
      name: tier.name,
      maxStock: major(tier.maxStockValueMinor),
      maxItem: major(tier.maxItemValueMinor),
      minCleanOrders: String(tier.minCleanOrders),
      minPassedCounts: String(tier.minPassedCounts),
      minDaysActive: String(tier.minDaysActive),
    })),
  };
}

export function programmeFrom(draft: ProgrammeDraft, currency: string): { ok: true; programme: PartnerProgramme } | { ok: false; message: string } {
  const problems: string[] = [];
  const minor = (text: string, label: string) => {
    const value = toMinor(text, currency);
    if (value === null) {
      problems.push(label);
    }
    return value ?? 0;
  };
  const whole = (text: string, label: string) => {
    if (!/^\d{1,6}$/.test(text.trim())) {
      problems.push(label);
      return 0;
    }
    return Number(text);
  };
  const percentBps = (text: string) => {
    const value = Number(text.trim());
    if (!/^\d{1,2}(\.\d{1,2})?$/.test(text.trim()) || !Number.isFinite(value)) {
      problems.push("loss alert");
      return 0;
    }
    return Math.round(value * 100);
  };
  const candidate = {
    acceptingApplications: draft.acceptingApplications,
    taxId: { label: draft.taxIdLabel.trim(), required: draft.taxIdRequired, ...(draft.taxIdPattern.trim() ? { pattern: draft.taxIdPattern.trim() } : {}) },
    workDeclaration: draft.workDeclaration,
    depositMinor: minor(draft.deposit, "deposit"),
    insuranceCoverMinor: minor(draft.insurance, "partner insurance"),
    platformInsuranceCoverMinor: minor(draft.platformCover, "platform cover"),
    proofOfAddressRetentionDays: whole(draft.retentionDays, "retention days"),
    ...(draft.mysteryVendorId.trim() ? { mysteryVendorId: draft.mysteryVendorId.trim() } : {}),
    cycleCountDays: whole(draft.custody.cycleCountDays, "days between routine counts"),
    shrinkageAlertBps: percentBps(draft.custody.lossAlertPct),
    trustFloor: whole(draft.custody.trustFloor, "pause below"),
    trustForPromotion: whole(draft.custody.trustForPromotion, "score for a tier raise"),
    highValueOrderMinor: minor(draft.custody.highValue, "seal needed from"),
    noScanAlertHours: whole(draft.custody.noScanHours, "hours without a carrier scan"),
    tiers: draft.tiers.map((tier, index) => ({
      level: index + 1,
      name: tier.name,
      maxStockValueMinor: minor(tier.maxStock, `tier ${index + 1} stock limit`),
      maxItemValueMinor: minor(tier.maxItem, `tier ${index + 1} item limit`),
      minCleanOrders: whole(tier.minCleanOrders, `tier ${index + 1} orders`),
      minPassedCounts: whole(tier.minPassedCounts, `tier ${index + 1} counts`),
      minDaysActive: whole(tier.minDaysActive, `tier ${index + 1} days`),
    })),
  };
  if (problems.length > 0) {
    return { ok: false, message: `Check these: ${problems.join(", ")}.` };
  }
  const parsed = partnerProgrammeSchema.safeParse(candidate);
  return parsed.success ? { ok: true, programme: parsed.data } : { ok: false, message: parsed.error.issues[0]?.message ?? "Some settings aren't valid." };
}
