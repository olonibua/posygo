"use client";

import { SHOPPING_RULES } from "@/shared";

import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form-controls";

export interface ItemDraft {
  key: string;
  url: string;
  description: string;
  quantity: string;
}

export function blankItem(): ItemDraft {
  return { key: crypto.randomUUID(), url: "", description: "", quantity: "1" };
}

interface ItemLinksProps {
  items: ItemDraft[];
  errorFor: (field: string) => string | undefined;
  onChange: (items: ItemDraft[]) => void;
}

export function ItemLinks({ items, errorFor, onChange }: ItemLinksProps) {
  const update = (key: string, patch: Partial<ItemDraft>) => onChange(items.map((item) => (item.key === key ? { ...item, ...patch } : item)));
  return (
    <div className="flex flex-col gap-4">
      <ol className="flex flex-col gap-4">
        {items.map((item, index) => (
          <li key={item.key} className="motion-rise grid gap-3 rounded-[12px] border border-line p-4 md:grid-cols-[minmax(0,2fr)_minmax(0,2fr)_90px_auto] md:items-end">
            <Field label={`Item ${index + 1} link`} error={errorFor(`lines.${index}.url`)}>
              {({ id, describedBy, invalid }) => (
                <Input
                  id={id}
                  type="url"
                  inputMode="url"
                  placeholder="https://"
                  maxLength={2000}
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                  value={item.url}
                  onChange={(event) => update(item.key, { url: event.target.value })}
                />
              )}
            </Field>
            <Field label="Size, colour, model" error={errorFor(`lines.${index}.description`)}>
              {({ id, describedBy, invalid }) => (
                <Input
                  id={id}
                  maxLength={300}
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                  value={item.description}
                  onChange={(event) => update(item.key, { description: event.target.value })}
                />
              )}
            </Field>
            <Field label="How many" error={errorFor(`lines.${index}.quantity`)}>
              {({ id, describedBy, invalid }) => (
                <Input
                  id={id}
                  inputMode="numeric"
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                  value={item.quantity}
                  onChange={(event) => update(item.key, { quantity: event.target.value.replace(/\D/g, "").slice(0, 2) })}
                />
              )}
            </Field>
            <Button variant="ghost" disabled={items.length === 1} onClick={() => onChange(items.filter((entry) => entry.key !== item.key))} aria-label={`Remove item ${index + 1}`}>
              Remove
            </Button>
          </li>
        ))}
      </ol>
      <div>
        <Button variant="ghost" disabled={items.length >= SHOPPING_RULES.maxLines} onClick={() => onChange([...items, blankItem()])}>
          Add another item
        </Button>
      </div>
    </div>
  );
}
