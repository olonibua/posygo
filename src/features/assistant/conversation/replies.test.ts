import { describe, expect, it } from "vitest";

import { knowledgeFor } from "../knowledge/registry";
import { errorNudge, errorReply, fieldReply, type NoticedError, pageReply, understand } from "./replies";

const product = knowledgeFor("/products/new")!;
const failure = (overrides: Partial<NoticedError> = {}): NoticedError => ({
  code: "internal_error",
  status: 500,
  message: "Something went wrong.",
  endpoint: "/v1/vendor/products",
  correlationId: "8d9c7a1e-2f3b-4c5d-8e9f-0a1b2c3d4e5f",
  rejectedFields: [],
  ...overrides,
});

describe("what the helper says", () => {
  it("tells people a system failure isn't their fault, with the case number", () => {
    expect(errorNudge(failure(), "CASE-AB12CD34")).toContain("not yours");
    const reply = errorReply(failure(), "CASE-AB12CD34");
    expect(reply.text).toContain("This isn't something you did");
    expect(reply.text).toContain("CASE-AB12CD34");
    expect(reply.actions).toBeUndefined();
    expect(errorReply(failure(), null).actions?.[0]?.kind).toBe("report-error");
  });

  it("explains an input problem and offers help with the fields that were rejected", () => {
    const reply = errorReply(failure({ code: "validation_failed", status: 400, message: "Some fields need attention.", rejectedFields: ["Tariff code"] }), null);
    expect(reply.text).toContain("Fix the fields marked in red");
    expect(reply.actions).toEqual([{ kind: "explain-field", field: "Tariff code", label: 'Explain "Tariff code"' }]);
    const funds = errorReply(failure({ code: "insufficient_funds", status: 409, message: "Your wallet is £4.00 short." }), null);
    expect(funds.text).toBe("Your wallet is £4.00 short. Top up your wallet, then try again.");
    expect(funds.actions).toEqual([{ kind: "link", href: "/wallet", label: "Go to wallet" }]);
  });

  it("tells an unverified seller to finish verification, with a way there, instead of guessing at permissions", () => {
    const reply = errorReply(failure({ code: "verification_required", status: 403, message: "Finish verifying your business before sending stock." }), null);
    expect(reply.text).toMatch(/^Finish verifying your business before sending stock\. /);
    expect(reply.text).not.toMatch(/permission|role/i);
    expect(reply.actions).toEqual([{ kind: "link", href: "/verification", label: "Go to verification" }]);
  });

  it("trusts the page's own reason over a general guess", () => {
    const reply = errorReply(failure({ code: "forbidden", status: 403, message: "Only partner managers can make this decision." }), null);
    expect(reply.text).toBe("Only partner managers can make this decision.");
    expect(reply.actions).toEqual([{ kind: "ask-team", label: "Ask our team" }]);
    expect(errorReply(failure({ code: "forbidden", status: 403, message: "Your account can't do this." }), null).text).toContain("whoever manages your account");
  });

  it("offers our team when the account needs a person", () => {
    expect(errorReply(failure({ code: "wallet_unavailable", status: 409, message: "This wallet is frozen." }), null).actions?.at(-1)?.kind).toBe("report-error");
  });

  it("is honest about a lost connection instead of blaming either side", () => {
    expect(errorReply(failure({ code: "network_error", status: 0 }), null).text).toContain("internet connection");
  });

  it("explains fields and pages from the written knowledge only", () => {
    expect(fieldReply("Tariff code", product).text).toContain("6 to 10 digit");
    expect(fieldReply("Something new", product).actions?.[0]?.kind).toBe("ask-team");
    expect(pageReply(product).text).toContain("1. Give it a name");
  });

  it("works out what a typed question is about", () => {
    expect(understand("what is the tariff code?", product, false)).toEqual({ kind: "field", label: "Tariff code" });
    expect(understand("what does value per unit mean", product, false)).toEqual({ kind: "field", label: "Value per unit" });
    expect(understand("can I talk to a person", product, false)).toEqual({ kind: "team" });
    expect(understand("why did it fail", product, true)).toEqual({ kind: "error" });
    expect(understand("what do I do here", product, false)).toEqual({ kind: "page" });
    expect(understand("do you ship to Mars", product, false)).toEqual({ kind: "unknown" });
  });
});

describe("matching questions to fields", () => {
  it("ignores punctuation in labels and questions", () => {
    const signup = knowledgeFor("/signup")!;
    expect(understand("what does where will your stock live mean?", signup, false)).toEqual({ kind: "field", label: "Where will your stock live?" });
    expect(understand("Referral code??", signup, false)).toEqual({ kind: "field", label: "Referral code (optional)" });
  });
});

describe("offering more help", () => {
  it("offers a walkthrough on pages with fields, and to point at a field it explained", () => {
    expect(pageReply(product).actions?.[0]).toEqual({ kind: "tour-start", label: "Walk me through it" });
    expect(fieldReply("Tariff code", product).actions?.[0]).toEqual({ kind: "show-field", field: "Tariff code", label: "Show me where" });
  });
});
