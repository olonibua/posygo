import type { OutreachContactInput, OutreachKind } from "@/shared";

type Field = keyof OutreachContactInput;

const HEADER_FIELDS: ReadonlyArray<readonly [Field, readonly string[]]> = [
  ["business", ["business", "business name", "company", "name"]],
  ["contactName", ["contact name", "contact", "person"]],
  ["email", ["email", "email address"]],
  ["phone", ["phone", "phone number", "telephone"]],
  ["website", ["website", "site", "url"]],
  ["country", ["country"]],
  ["city", ["city", "town"]],
  ["kind", ["type", "kind"]],
  ["notes", ["notes", "why they fit", "note"]],
  ["source", ["source"]],
];

function fieldFor(header: string): Field | null {
  const name = header.trim().toLowerCase();
  return HEADER_FIELDS.find(([, names]) => names.includes(name))?.[0] ?? null;
}

export function kindFrom(text: string): OutreachKind {
  const value = text.toLowerCase();
  if (value.includes("prep") || value.includes("3pl")) {
    return "PREP_CENTRE";
  }
  if (value.includes("cargo") || value.includes("freight")) {
    return "CARGO_AGENT";
  }
  if (value.includes("courier")) {
    return "COURIER";
  }
  if (value.includes("individual") || value.includes("home")) {
    return "INDIVIDUAL";
  }
  return "OTHER";
}

function splitLine(line: string, separator: string): string[] {
  if (separator === "\t") {
    return line.split("\t");
  }
  const cells: string[] = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]!;
    if (char === '"' && quoted && line[index + 1] === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === separator && !quoted) {
      cells.push(cell);
      cell = "";
    } else {
      cell += char;
    }
  }
  cells.push(cell);
  return cells;
}

export interface ParsedImport {
  contacts: OutreachContactInput[];
  problems: string[];
}

export function parseContacts(text: string): ParsedImport {
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
  if (lines.length < 2) {
    return { contacts: [], problems: ["Paste a header row and at least one contact."] };
  }
  const separator = lines[0]!.includes("\t") ? "\t" : ",";
  const fields = splitLine(lines[0]!, separator).map(fieldFor);
  if (!fields.includes("business") || !fields.includes("country")) {
    return { contacts: [], problems: ["The header row needs at least a Business and a Country column."] };
  }
  const contacts: OutreachContactInput[] = [];
  const problems: string[] = [];
  lines.slice(1).forEach((line, index) => {
    const cells = splitLine(line, separator);
    const row: Partial<Record<Field, string>> = {};
    fields.forEach((field, column) => {
      const value = cells[column]?.trim();
      if (field && value) {
        row[field] = value;
      }
    });
    if (!row.business || !row.country) {
      problems.push(`Row ${index + 2} is missing a business or country, so it was left out.`);
      return;
    }
    contacts.push({ ...row, business: row.business, country: row.country, kind: kindFrom(row.kind ?? "") } as OutreachContactInput);
  });
  return { contacts, problems };
}
