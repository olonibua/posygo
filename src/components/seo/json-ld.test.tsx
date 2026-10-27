import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { JsonLd } from "./json-ld";

describe("structured data", () => {
  it("can't be broken out of by text a vendor writes", () => {
    const html = renderToStaticMarkup(<JsonLd data={{ "@type": "OnlineStore", name: "</script><script>alert(1)</script>" }} />);
    expect(html).not.toContain("</script><script>");
    const json = JSON.parse(html.replace(/^<script[^>]*>/, "").replace(/<\/script>$/, "")) as { name: string; "@context": string };
    expect(json).toMatchObject({ "@context": "https://schema.org", name: "</script><script>alert(1)</script>" });
  });

  it("puts several things in one graph", () => {
    const html = renderToStaticMarkup(<JsonLd data={[{ "@type": "Organization" }, { "@type": "WebSite" }]} />);
    expect(JSON.parse(html.replace(/^<script[^>]*>/, "").replace(/<\/script>$/, ""))["@graph"]).toHaveLength(2);
  });
});
