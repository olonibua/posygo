import { describe, expect, it } from "vitest";

import { BRAND } from "./brand";
import { whatsappLink } from "./whatsapp";

describe("whatsappLink", () => {
  it("opens a chat with the Posygo number and a ready message", () => {
    const link = new URL(whatsappLink("Hi & hello"));
    expect(link.origin).toBe("https://wa.me");
    expect(link.pathname).toBe(`/${BRAND.whatsapp.number}`);
    expect(link.searchParams.get("text")).toBe("Hi & hello");
  });
});
