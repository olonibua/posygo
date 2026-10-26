import { type BarcodeSymbology, fromGrams, fromMillimetres, type ProductInput, type ProductView, type StorageTier, toGrams, toMillimetres } from "@/shared";

import type { Market } from "./use-market";

export interface BarcodeRow {
  value: string;
  symbology: BarcodeSymbology;
}

export interface ProductValues {
  code: string;
  name: string;
  variantLabel: string;
  hsCode: string;
  countryOfOrigin: string;
  declaredValue: string;
  weight: string;
  length: string;
  width: string;
  height: string;
  storageTier: StorageTier;
  imageFileId: string | null;
  barcodes: BarcodeRow[];
}

export function unitsFor(market: Market) {
  return market.measurementSystem === "IMPERIAL" ? { weight: "oz" as const, length: "in" as const } : { weight: "g" as const, length: "cm" as const };
}

export function emptyProduct(market: Market): ProductValues {
  return {
    code: "",
    name: "",
    variantLabel: "",
    hsCode: "",
    countryOfOrigin: market.countryCode,
    declaredValue: "",
    weight: "",
    length: "",
    width: "",
    height: "",
    storageTier: "SMALL",
    imageFileId: null,
    barcodes: [],
  };
}

export function productToValues(product: ProductView, market: Market): ProductValues {
  const units = unitsFor(market);
  const length = (value: number | null) => (value === null ? "" : String(fromMillimetres(value, units.length)));
  return {
    code: product.code,
    name: product.name,
    variantLabel: product.variantLabel ?? "",
    hsCode: product.hsCode ?? "",
    countryOfOrigin: product.countryOfOrigin,
    declaredValue: String(product.declaredValue.amountMinor / 10 ** market.minorUnits),
    weight: String(fromGrams(product.weightGrams, units.weight)),
    length: length(product.lengthMm),
    width: length(product.widthMm),
    height: length(product.heightMm),
    storageTier: product.storageTier,
    imageFileId: product.imageFileId,
    barcodes: product.barcodes.map((barcode) => ({ ...barcode })),
  };
}

function optional(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

function number(value: string): number {
  return Number(value.trim().replace(",", "."));
}

export function valuesToInput(values: ProductValues, market: Market): ProductInput {
  const units = unitsFor(market);
  const dimension = (value: string) => (optional(value) === undefined ? undefined : toMillimetres(number(value), units.length));
  return {
    code: values.code.trim(),
    name: values.name.trim(),
    variantLabel: optional(values.variantLabel),
    hsCode: optional(values.hsCode),
    countryOfOrigin: values.countryOfOrigin,
    declaredValueMinor: Math.round(number(values.declaredValue) * 10 ** market.minorUnits),
    weightGrams: toGrams(number(values.weight), units.weight),
    lengthMm: dimension(values.length),
    widthMm: dimension(values.width),
    heightMm: dimension(values.height),
    storageTier: values.storageTier,
    imageFileId: values.imageFileId ?? undefined,
    barcodes: values.barcodes.filter((barcode) => barcode.value.trim() !== "").map((barcode) => ({ value: barcode.value.trim(), symbology: barcode.symbology })),
  };
}
