import { afterEach, describe, expect, it, vi } from "vitest";

import { apiRequest, type ApiFailure, onApiFailure } from "./client";

describe("telling listeners about failed requests", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("hands a failure from the last few seconds to a listener that starts late", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue({
          ok: false,
          status: 500,
          headers: new Headers(),
          json: () => Promise.resolve({ code: "internal_error", message: "Something went wrong.", correlationId: "c0ffee00-0000-4000-8000-000000000000" }),
        }),
    );
    await expect(apiRequest("/v1/vendor/products", { method: "POST", body: {}, authenticated: false })).rejects.toThrow("Something went wrong.");
    const heard: ApiFailure[] = [];
    const stop = onApiFailure((failure) => heard.push(failure));
    stop();
    expect(heard).toHaveLength(1);
    expect(heard[0]).toMatchObject({ method: "POST", endpoint: "/v1/vendor/products", error: { status: 500, correlationId: "c0ffee00-0000-4000-8000-000000000000" } });
  });
});
