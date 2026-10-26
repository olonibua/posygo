import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

import { LoadingRows } from "./skeleton";

export interface Column<Row> {
  key: string;
  header: string;
  align?: "left" | "right";
  className?: string;
  render: (row: Row) => ReactNode;
}

interface DataTableProps<Row> {
  columns: readonly Column<Row>[];
  rows: readonly Row[];
  rowKey: (row: Row) => string;
  caption: string;
  empty?: ReactNode;
  loading?: boolean;
}

export function DataTable<Row>({ columns, rows, rowKey, caption, empty, loading = false }: DataTableProps<Row>) {
  return (
    <div className="motion-rise overflow-x-auto rounded-tile border border-line bg-paper" aria-busy={loading || undefined}>
      <table className="w-full border-separate border-spacing-0 tabular-nums">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col" className={cn("whitespace-nowrap bg-cocoa px-5 py-[15px] text-label uppercase text-on-ink", column.align === "right" ? "text-right" : "text-left")}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="stagger">
          {loading && rows.length === 0 ? (
            <LoadingRows columns={columns.length} />
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-5 py-12 text-center text-ink-soft">
                {empty ?? "Nothing here yet."}
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr key={rowKey(row)} className="motion-fade transition-colors duration-200 hover:bg-cream/60">
                {columns.map((column) => (
                  <td key={column.key} className={cn("px-5 py-[17px] text-body", index > 0 && "border-t border-line", column.align === "right" && "text-right", column.className)}>
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
