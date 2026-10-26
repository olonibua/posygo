import type { DocumentSlot, VerificationDraft } from "@/shared";

import type { DraftPatch } from "../use-verification";

export interface WizardValues {
  businessType: string;
  legalBusinessName: string;
  registrationCountryCode: string;
  companyNumber: string;
  taxNumber: string;
  registeredAddress: { line1: string; line2: string; city: string; region: string; postalCode: string };
  contactFullName: string;
  contactRole: string;
  contactPhone: string;
  idType: string;
  idNumber: string;
  idExpiry: string;
  documents: Partial<Record<DocumentSlot, string>>;
  productsDescription: string;
  monthlyUnits: string;
  monthlyOrders: string;
  hazards: string[];
}

export function valuesFrom(draft: VerificationDraft): WizardValues {
  return {
    businessType: draft.businessType ?? "",
    legalBusinessName: draft.legalBusinessName ?? "",
    registrationCountryCode: draft.registrationCountryCode ?? "",
    companyNumber: draft.companyNumber ?? "",
    taxNumber: draft.taxNumber ?? "",
    registeredAddress: {
      line1: draft.registeredAddress?.line1 ?? "",
      line2: draft.registeredAddress?.line2 ?? "",
      city: draft.registeredAddress?.city ?? "",
      region: draft.registeredAddress?.region ?? "",
      postalCode: draft.registeredAddress?.postalCode ?? "",
    },
    contactFullName: draft.contactFullName ?? "",
    contactRole: draft.contactRole ?? "",
    contactPhone: draft.contactPhone ?? "",
    idType: draft.idType ?? "",
    idNumber: "",
    idExpiry: draft.idExpiry ?? "",
    documents: { ...draft.documents },
    productsDescription: draft.productsDescription ?? "",
    monthlyUnits: draft.monthlyUnits ?? "",
    monthlyOrders: draft.monthlyOrders ?? "",
    hazards: draft.hazards ?? [],
  };
}

const blankToUndefined = (value: string) => (value.trim() === "" ? undefined : value);

export function patchForStep(step: number, values: WizardValues): DraftPatch {
  const address = values.registeredAddress;
  const patches: DraftPatch[] = [
    {
      businessType: blankToUndefined(values.businessType),
      legalBusinessName: blankToUndefined(values.legalBusinessName),
      registrationCountryCode: blankToUndefined(values.registrationCountryCode),
      companyNumber: blankToUndefined(values.companyNumber),
      taxNumber: blankToUndefined(values.taxNumber),
      registeredAddress: {
        line1: blankToUndefined(address.line1),
        line2: blankToUndefined(address.line2),
        city: blankToUndefined(address.city),
        region: blankToUndefined(address.region),
        postalCode: blankToUndefined(address.postalCode),
      },
    },
    { contactFullName: blankToUndefined(values.contactFullName), contactRole: blankToUndefined(values.contactRole), contactPhone: blankToUndefined(values.contactPhone) },
    { idType: blankToUndefined(values.idType), idNumber: blankToUndefined(values.idNumber), idExpiry: blankToUndefined(values.idExpiry) },
    { documents: values.documents },
    {
      productsDescription: blankToUndefined(values.productsDescription),
      monthlyUnits: blankToUndefined(values.monthlyUnits),
      monthlyOrders: blankToUndefined(values.monthlyOrders),
      hazards: values.hazards.length ? values.hazards : undefined,
    },
  ] as DraftPatch[];
  return patches[step] ?? {};
}
