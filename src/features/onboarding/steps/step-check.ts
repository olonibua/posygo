import { buildVerificationSchemas, type VerificationMarket } from "@/shared";
import type { z } from "zod";

import type { DraftPatch, FieldErrors } from "../use-verification";

const plainMessage: z.core.$ZodErrorMap = (issue) => {
  if (issue.input === undefined) {
    return "Fill this in";
  }
  if (issue.code === "too_small" && issue.origin === "string") {
    return `Use at least ${String(issue.minimum)} characters`;
  }
  if (issue.code === "too_big" && issue.origin === "string") {
    return `Use ${String(issue.maximum)} characters or fewer`;
  }
  return undefined;
};

export function stepErrors(market: VerificationMarket, step: number, patch: DraftPatch): FieldErrors {
  const result = buildVerificationSchemas(market).step(step).safeParse(patch, { error: plainMessage });
  if (result.success) {
    return {};
  }
  const errors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join(".");
    errors[path] = [...(errors[path] ?? []), issue.message];
  }
  return errors;
}
