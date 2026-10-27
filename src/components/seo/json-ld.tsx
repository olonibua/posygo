export type JsonLdThing = Record<string, unknown>;

export function JsonLd({ data }: { data: JsonLdThing | JsonLdThing[] }) {
  const json = JSON.stringify(Array.isArray(data) ? { "@context": "https://schema.org", "@graph": data } : { "@context": "https://schema.org", ...data }).replace(/</g, "\\u003c");
  // eslint-disable-next-line react/no-danger -- structured data must be raw JSON; "<" is escaped above
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
