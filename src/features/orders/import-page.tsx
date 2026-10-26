"use client";

import { type ImportResultView, ORDER_CSV_COLUMNS, ORDER_CSV_LIMITS } from "@/shared";
import { type ChangeEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { type Column, DataTable } from "@/components/ui/data-table";
import { FormAlert } from "@/components/ui/form-controls";
import { EmptyState } from "@/components/ui/navigation-controls";
import { PageHeader } from "@/components/ui/page-header";
import { NotebookNote, Paper, Stamp } from "@/components/ui/surfaces";
import { formError, fieldError } from "@/features/receiving/api-errors";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { formatDateTime, localeFor } from "@/lib/format";

import { useOrderImports } from "./use-vendor-orders";

const EXAMPLE_ROWS = [
  ["SHOP-1001", "Ada Obi", "", "+44 7700 900123", "ada@example.com", "1 High Street", "", "Manchester", "", "M1 1AA", "GB", "WIG-BW-16", "1"],
  ["SHOP-1001", "", "", "", "", "", "", "", "", "", "", "WIG-CAP", "2"],
];

function templateHref(): string {
  const csv = [ORDER_CSV_COLUMNS.join(","), ...EXAMPLE_ROWS.map((row) => row.join(","))].join("\r\n");
  return `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
}

type ResultRow = ImportResultView["results"][number];

export function ImportPage() {
  const user = useCurrentUser();
  const locale = localeFor(user.countryCode);
  const { history, run } = useOrderImports();
  const [file, setFile] = useState<{ name: string; text: string } | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const latest = run.data ?? null;

  async function choose(event: ChangeEvent<HTMLInputElement>) {
    setProblem(null);
    const picked = event.target.files?.[0];
    if (!picked) {
      return;
    }
    if (picked.size > ORDER_CSV_LIMITS.maxBytes) {
      setProblem(`Keep the file under ${ORDER_CSV_LIMITS.maxBytes / 1000} KB.`);
      return;
    }
    setFile({ name: picked.name, text: await picked.text() });
  }

  const columns: Column<ResultRow>[] = [
    { key: "reference", header: "Your reference", render: (row) => <span className="font-mono">{row.reference}</span> },
    { key: "rows", header: "Rows", render: (row) => row.rows.join(", ") },
    {
      key: "result",
      header: "Result",
      render: (row) => (row.orderReference ? <span className="font-medium text-success">Created {row.orderReference}</span> : <span className="text-danger">{row.message}</span>),
    },
  ];

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        stamp="Orders"
        title="Import a spreadsheet"
        lead="Upload a CSV with one row per product. Rows that share an order reference become one order; the address only needs to be on the first row."
      />
      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <Paper className="flex flex-col gap-4 px-6 py-6">
          <Stamp>Upload</Stamp>
          <FormAlert message={problem ?? formError(run.error) ?? fieldError(run.error, "csv") ?? null} />
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-card border-[1.5px] border-dashed border-line-strong px-6 py-10 text-center hover:bg-paper-sunk">
            <span className="text-small font-medium">{file ? file.name : "Choose a CSV file"}</span>
            <span className="text-meta text-ink-faint">
              Up to {ORDER_CSV_LIMITS.maxRows} rows and {ORDER_CSV_LIMITS.maxOrders} orders per file, {ORDER_CSV_LIMITS.dailyOrdersPerVendor} orders a day
            </span>
            <input type="file" accept=".csv,text/csv" className="sr-only" onChange={(event) => void choose(event)} />
          </label>
          <div className="flex flex-wrap justify-between gap-3">
            <a href={templateHref()} download="orders-template.csv" className="self-center text-small font-medium text-ink underline">
              Download the template
            </a>
            <Button variant="yellow" disabled={!file} loading={run.isPending} onClick={() => file && run.mutate({ filename: file.name, csv: file.text }, { onSuccess: () => setFile(null) })}>
              Import orders
            </Button>
          </div>
        </Paper>
        <NotebookNote tone="sky" tilt="none">
          <Stamp className="text-cocoa">Before you upload</Stamp>
          <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-5 text-small">
            <li>Each order takes its fulfilment fee from your wallet as it&rsquo;s created, so top up first.</li>
            <li>Use your product codes exactly as they appear in your catalogue.</li>
            <li>Country is the two-letter code, for example GB or US.</li>
            <li>Orders that can&rsquo;t be created are listed with the reason; the rest go through.</li>
          </ul>
        </NotebookNote>
      </div>
      {latest ? (
        <section aria-labelledby="result-heading" className="flex flex-col gap-3">
          <h2 id="result-heading" className="text-h3">
            {latest.ordersCreated} created, {latest.ordersFailed} not created
          </h2>
          <DataTable caption="Import results" columns={columns} rows={latest.results} rowKey={(row) => row.reference} />
          {latest.rowErrors.length > 0 ? (
            <Paper className="px-6 py-4">
              <Stamp>Rows skipped</Stamp>
              <ul className="mt-2 text-small">
                {latest.rowErrors.map((error) => (
                  <li key={error.row} className="border-t border-line py-2 first:border-t-0">
                    Row {error.row}: {error.message}
                  </li>
                ))}
              </ul>
            </Paper>
          ) : null}
        </section>
      ) : null}
      <section aria-labelledby="history-heading" className="flex flex-col gap-3">
        <h2 id="history-heading" className="text-h3">
          Earlier imports
        </h2>
        <DataTable
          caption="Earlier imports"
          columns={[
            { key: "file", header: "File", render: (row: ImportResultView) => row.filename },
            { key: "when", header: "When", render: (row: ImportResultView) => formatDateTime(row.createdAt, locale) },
            { key: "created", header: "Created", align: "right", render: (row: ImportResultView) => row.ordersCreated },
            { key: "failed", header: "Not created", align: "right", render: (row: ImportResultView) => row.ordersFailed },
          ]}
          rows={history.data ?? []}
          rowKey={(row) => row.id}
          loading={history.isLoading}
          empty={<EmptyState title="No imports yet" body="Your uploads and their results are kept here." />}
        />
      </section>
    </div>
  );
}
