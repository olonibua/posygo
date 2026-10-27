export interface FieldHelp {
  labels: readonly (string | RegExp)[];
  meaning: string;
  example?: string;
  mistakes?: readonly string[];
  fix?: (value: string) => string | null;
}

export interface PageKnowledge {
  route: string;
  title: string;
  purpose: string;
  steps: readonly string[];
  fields: Readonly<Record<string, FieldHelp>>;
  related: ReadonlyArray<{ href: string; label: string }>;
}

type FieldKey<Input> = Extract<keyof Input, string>;

export interface PageKnowledgeOf<Input> extends Omit<PageKnowledge, "fields"> {
  fields: Record<FieldKey<Input>, FieldHelp>;
}

export function describePage<Input = Record<never, never>>(knowledge: PageKnowledgeOf<Input>): PageKnowledge {
  return knowledge;
}

export function fieldFor(page: PageKnowledge, label: string): FieldHelp | undefined {
  const clean = label.trim();
  return Object.values(page.fields).find((field) => field.labels.some((match) => (typeof match === "string" ? match === clean : match.test(clean))));
}

export function routeMatches(pattern: string, pathname: string): boolean {
  const patternParts = pattern.split("/").filter(Boolean);
  const pathParts = pathname.split("/").filter(Boolean);
  return patternParts.length === pathParts.length && patternParts.every((part, index) => part.startsWith("[") || part === pathParts[index]);
}
