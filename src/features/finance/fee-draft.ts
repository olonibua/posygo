import { type FeeSchedule, feeScheduleSchema, partnerRates, referralRates, shoppingRates, STORAGE_TIERS, type StorageTier, storefrontRates } from "@/shared";

import { STORAGE_TIER_LABELS } from "@/features/stock/display";

import { toMajorText, toMinor } from "./money-input";

export interface TierDraft {
  negotiated: boolean;
  stocking: string;
  firstMonth: string;
  monthly: string;
}

export interface FeeDraft {
  tiers: Record<StorageTier, TierDraft>;
  base: string;
  perUnit: string;
  max: string;
  returns: string;
  markupPercent: string;
  waiveFirstStocking: boolean;
  dualApprovalAbove: string;
  dailyCap: string;
  partnerReceivingPercent: string;
  partnerStoragePercent: string;
  partnerFulfilmentPercent: string;
  partnerFoundingPercent: string;
  partnerFoundingPlaces: string;
  partnerHoldbackPercent: string;
  partnerHoldbackDays: string;
  storeSetupFee: string;
  storeCommissionPercent: string;
  storeHoldHours: string;
  referrerCredit: string;
  refereeCredit: string;
  referralMonthlyCap: string;
  shoppingCommissionPercent: string;
  shoppingMinimumFee: string;
}

export function draftFrom(schedule: FeeSchedule, currency: string): FeeDraft {
  const major = (minor: number) => toMajorText(minor, currency);
  const partner = partnerRates(schedule);
  const store = storefrontRates(schedule);
  const referral = referralRates(schedule);
  const shopping = shoppingRates(schedule);
  const tiers = Object.fromEntries(
    STORAGE_TIERS.map((tier) => {
      const rate = schedule.onboarding[tier];
      const monthly = schedule.monthlyStorage[tier];
      return [
        tier,
        {
          negotiated: rate.negotiated,
          stocking: rate.negotiated ? "" : major(rate.stockingMinor),
          firstMonth: rate.negotiated ? "" : major(rate.firstMonthStorageMinor),
          monthly: monthly === null ? "" : major(monthly),
        },
      ];
    }),
  ) as Record<StorageTier, TierDraft>;
  return {
    tiers,
    base: major(schedule.fulfilment.baseMinor),
    perUnit: major(schedule.fulfilment.perAdditionalUnitMinor),
    max: major(schedule.fulfilment.maxMinor),
    returns: major(schedule.returnsHandlingMinor),
    markupPercent: String(schedule.shippingMarkupBps / 100),
    waiveFirstStocking: schedule.firstShipmentWaivesStocking,
    dualApprovalAbove: major(schedule.adjustments.dualApprovalAboveMinor),
    dailyCap: major(schedule.adjustments.dailyCapPerPersonMinor),
    partnerReceivingPercent: String(partner.receivingShareBps / 100),
    partnerStoragePercent: String(partner.storageShareBps / 100),
    partnerFulfilmentPercent: String(partner.fulfilmentShareBps / 100),
    partnerFoundingPercent: String(partner.foundingBonusBps / 100),
    partnerFoundingPlaces: String(partner.foundingPlaces),
    partnerHoldbackPercent: String(partner.holdbackBps / 100),
    partnerHoldbackDays: String(partner.holdbackDays),
    storeSetupFee: major(store.setupFeeMinor),
    storeCommissionPercent: String(store.commissionBps / 100),
    storeHoldHours: String(store.minimumHoldHours),
    referrerCredit: major(referral.referrerCreditMinor),
    refereeCredit: major(referral.refereeCreditMinor),
    referralMonthlyCap: String(referral.monthlyRewardsPerReferrer),
    shoppingCommissionPercent: String(shopping.commissionBps / 100),
    shoppingMinimumFee: major(shopping.minimumFeeMinor),
  };
}

export type DraftResult = { ok: true; schedule: FeeSchedule } | { ok: false; message: string };

export function scheduleFrom(draft: FeeDraft, currency: string): DraftResult {
  const problems: string[] = [];
  const minor = (text: string, label: string): number => {
    const value = toMinor(text, currency);
    if (value === null) {
      problems.push(label);
      return 0;
    }
    return value;
  };
  const onboarding = Object.fromEntries(
    STORAGE_TIERS.map((tier) => {
      const row = draft.tiers[tier];
      const name = STORAGE_TIER_LABELS[tier].label;
      return [
        tier,
        row.negotiated
          ? { negotiated: true as const }
          : { negotiated: false as const, stockingMinor: minor(row.stocking, `${name} stocking`), firstMonthStorageMinor: minor(row.firstMonth, `${name} first month`) },
      ];
    }),
  );
  const monthlyStorage = Object.fromEntries(
    STORAGE_TIERS.map((tier) => [tier, draft.tiers[tier].monthly.trim() === "" ? null : minor(draft.tiers[tier].monthly, `${STORAGE_TIER_LABELS[tier].label} each month`)]),
  );
  const number = (text: string, label: string, scale: number): number => {
    const value = Number(text);
    if (text.trim() === "" || !Number.isFinite(value)) {
      problems.push(label);
      return 0;
    }
    return Math.round(value * scale);
  };
  const markup = number(draft.markupPercent, "shipping markup", 100);
  const candidate = {
    onboarding,
    monthlyStorage,
    fulfilment: { baseMinor: minor(draft.base, "fulfilment base"), perAdditionalUnitMinor: minor(draft.perUnit, "extra unit"), maxMinor: minor(draft.max, "fulfilment cap") },
    returnsHandlingMinor: minor(draft.returns, "returns"),
    shippingMarkupBps: markup,
    firstShipmentWaivesStocking: draft.waiveFirstStocking,
    adjustments: { dualApprovalAboveMinor: minor(draft.dualApprovalAbove, "second approval limit"), dailyCapPerPersonMinor: minor(draft.dailyCap, "daily limit") },
    partner: {
      receivingShareBps: number(draft.partnerReceivingPercent, "partner receiving share", 100),
      storageShareBps: number(draft.partnerStoragePercent, "partner storage share", 100),
      fulfilmentShareBps: number(draft.partnerFulfilmentPercent, "partner pick and pack share", 100),
      foundingBonusBps: number(draft.partnerFoundingPercent, "founding bonus", 100),
      foundingPlaces: number(draft.partnerFoundingPlaces, "founding places", 1),
      holdbackBps: number(draft.partnerHoldbackPercent, "holdback", 100),
      holdbackDays: number(draft.partnerHoldbackDays, "holdback days", 1),
    },
    storefront: {
      setupFeeMinor: minor(draft.storeSetupFee, "store set-up fee"),
      commissionBps: number(draft.storeCommissionPercent, "store commission", 100),
      minimumHoldHours: number(draft.storeHoldHours, "store payout hold", 1),
    },
    referral: {
      referrerCreditMinor: minor(draft.referrerCredit, "referrer credit"),
      refereeCreditMinor: minor(draft.refereeCredit, "new vendor credit"),
      monthlyRewardsPerReferrer: number(draft.referralMonthlyCap, "referrals per month", 1),
    },
    shopping: { commissionBps: number(draft.shoppingCommissionPercent, "shopping fee", 100), minimumFeeMinor: minor(draft.shoppingMinimumFee, "shopping minimum fee") },
  };
  if (problems.length > 0) {
    return { ok: false, message: `Check these amounts: ${problems.join(", ").toLowerCase()}.` };
  }
  const parsed = feeScheduleSchema.safeParse(candidate);
  return parsed.success ? { ok: true, schedule: parsed.data } : { ok: false, message: parsed.error.issues[0]?.message ?? "Some prices aren't valid." };
}
