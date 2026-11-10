import readXlsxFile from "read-excel-file/browser";

import { type ParsedImport, parseContacts, parseRows } from "./outreach-import";

const SPREADSHEET = /\.xlsx$/i;

function asText(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return value === null || value === undefined ? "" : String(value);
}

async function readSpreadsheet(file: File): Promise<ParsedImport> {
  const sheets = await readXlsxFile(file);
  const parsed = sheets.map((sheet) => parseRows(sheet.data.map((row) => row.map(asText))));
  return parsed.find((result) => result.contacts.length > 0) ?? parsed[0] ?? { contacts: [], problems: ["That file has no sheets."] };
}

export async function readContactsFile(file: File): Promise<ParsedImport> {
  try {
    return SPREADSHEET.test(file.name) ? await readSpreadsheet(file) : parseContacts(await file.text());
  } catch {
    return { contacts: [], problems: ["We couldn't read that file. Save it as Excel (.xlsx) or CSV and try again."] };
  }
}
