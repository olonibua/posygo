import { Fragment, type ReactNode } from "react";

type Block = { kind: "heading"; text: string } | { kind: "clause"; number: string; text: string } | { kind: "bullets"; items: string[] } | { kind: "paragraph"; text: string };

const CLAUSE = /^(\d+(?:\.\d+)+)\s+(.*)$/;

export function parseAgreement(body: string): Block[] {
  const blocks: Block[] = [];
  for (const raw of body.split("\n")) {
    const line = raw.trim();
    if (!line) {
      continue;
    }
    if (line.startsWith("## ")) {
      blocks.push({ kind: "heading", text: line.slice(3) });
      continue;
    }
    if (line.startsWith("- ")) {
      const previous = blocks.at(-1);
      if (previous?.kind === "bullets") {
        previous.items.push(line.slice(2));
      } else {
        blocks.push({ kind: "bullets", items: [line.slice(2)] });
      }
      continue;
    }
    const clause = CLAUSE.exec(line);
    blocks.push(clause ? { kind: "clause", number: clause[1]!, text: clause[2]! } : { kind: "paragraph", text: line });
  }
  return blocks;
}

function withTerms(text: string): ReactNode {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={index} className="font-semibold">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    ),
  );
}

export function AgreementBody({ body }: { body: string }) {
  return (
    <div className="flex flex-col gap-3 text-[15px] leading-[1.7] text-[#1b1b1b]">
      {parseAgreement(body).map((block, index) => {
        if (block.kind === "heading") {
          return (
            <h3 key={index} className="mt-6 break-after-avoid border-b border-[#d9d4c4] pb-1.5 text-[13px] font-bold uppercase tracking-[2px] text-seal">
              {block.text}
            </h3>
          );
        }
        if (block.kind === "clause") {
          return (
            <p key={index} className="grid grid-cols-[44px_1fr] gap-1 text-justify">
              <span className="font-semibold tabular-nums text-ink-soft">{block.number}</span>
              <span>{withTerms(block.text)}</span>
            </p>
          );
        }
        if (block.kind === "bullets") {
          return (
            <ul key={index} className="ml-[44px] flex list-[lower-alpha] flex-col gap-1 pl-6">
              {block.items.map((item) => (
                <li key={item}>{withTerms(item)}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={index} className="text-justify">
            {withTerms(block.text)}
          </p>
        );
      })}
    </div>
  );
}
