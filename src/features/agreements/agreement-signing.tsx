"use client";

import type { LegalDocumentView, SignatureCertificateView, SignatureInput } from "@/shared";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { OfficialSeal } from "@/components/legal/official-seal";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ApiError } from "@/lib/api/client";
import { formatDate, formatDateTime } from "@/lib/format";

import { AgreementBody } from "./agreement-body";
import { SignatureDialog } from "./signature-dialog";

export interface SigningParty {
  name: string;
  role: string;
  country: string;
}

interface AgreementSigningProps {
  document: LegalDocumentView;
  party: SigningParty;
  signerName: string;
  lockedName?: boolean;
  certificate: SignatureCertificateView | null;
  canSign: boolean;
  locale: string;
  onSign: (signature: SignatureInput) => Promise<unknown>;
  onClose: () => void;
}

function shortReference(id: string): string {
  return `PSG-AGR-${id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

function errorText(error: unknown): string {
  if (error instanceof ApiError) {
    return Object.values(error.fieldErrors).flat()[0] ?? error.message;
  }
  return "We couldn't record your signature. Try again.";
}

export function AgreementSigning({ document, party, signerName, lockedName = false, certificate, canSign, locale, onSign, onClose }: AgreementSigningProps) {
  const [adopting, setAdopting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const signHere = useRef<HTMLButtonElement>(null);
  const signed = certificate !== null;

  useEffect(() => {
    setMounted(true);
    const previous = window.document.body.style.overflow;
    window.document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && !busy && onClose();
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.document.body.style.overflow = previous;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [busy, onClose]);

  async function adopt(signature: SignatureInput) {
    setBusy(true);
    setError(null);
    try {
      await onSign(signature);
      setAdopting(false);
    } catch (failure) {
      setError(errorText(failure));
    } finally {
      setBusy(false);
    }
  }

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div id="agreement-signing" className="fixed inset-0 z-50 flex flex-col bg-[#e7e9ee] print:static print:bg-white" role="dialog" aria-modal="true" aria-label={document.title}>
      <header className="flex h-[64px] shrink-0 items-center justify-between gap-3 bg-[#0f1f3d] px-4 text-white sm:px-6 print:hidden">
        <div className="flex min-w-0 items-center gap-3">
          <img src="/brand/flower-mark.svg" alt="" className="h-7 w-7 invert" />
          <div className="min-w-0">
            <b className="block truncate text-[15px] font-semibold">{document.title}</b>
            <span className="block text-[12px] uppercase tracking-[1.4px] text-white/60">{signed ? "Completed" : canSign ? "Review and sign" : "Review"}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {signed ? (
            <button type="button" onClick={() => window.print()} className="hidden items-center gap-2 rounded-control px-3 py-2 text-small font-medium text-white/90 hover:bg-white/10 sm:flex">
              Download PDF
            </button>
          ) : null}
          {!signed && canSign ? (
            <button
              type="button"
              onClick={() => signHere.current?.scrollIntoView({ behavior: "smooth", block: "center" })}
              className="rounded-control bg-yellow px-4 py-2 text-small font-semibold text-cocoa transition-transform duration-200 hover:-translate-y-px"
            >
              Go to signature
            </button>
          ) : null}
          <button type="button" onClick={onClose} aria-label="Close" className="grid h-10 w-10 place-items-center rounded-control text-white/90 hover:bg-white/10">
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-6 sm:px-6 sm:py-10 print:overflow-visible print:p-0">
        <article className="mx-auto max-w-[860px] bg-vellum px-6 py-10 font-legal shadow-[0_2px_4px_#0f1f3d14,0_24px_60px_-24px_#0f1f3d55] sm:px-16 sm:py-16 print:max-w-none print:shadow-none">
          <Letterhead document={document} locale={locale} />
          <p className="mb-6 text-justify text-[15px] leading-[1.7]">
            This {document.title} is made between <b>Posygo</b> and <b>{party.name}</b> ({party.role.toLowerCase()}, {party.country}). It takes effect on the date it is signed by {party.name}.
          </p>
          <AgreementBody body={document.body} />

          <section aria-labelledby="execution-heading" className="mt-12 break-inside-avoid">
            <h3 id="execution-heading" className="border-y-2 border-double border-seal py-2 text-center text-[13px] font-bold uppercase tracking-[3px] text-seal">
              Execution
            </h3>
            <p className="mt-4 text-[15px] leading-[1.7]">Signed electronically by the parties on the dates shown below.</p>
            <div className="mt-8 grid gap-10 sm:grid-cols-2">
              <SignatureBlock label="For and on behalf of Posygo" name="Posygo" title="Authorised signatory" date={formatDate(document.publishedAt, locale)}>
                <span className="font-signature text-[44px] leading-none text-seal">Posygo</span>
                <OfficialSeal caption="Company seal" className="absolute -right-2 -top-10 w-[118px] rotate-[-14deg]" />
              </SignatureBlock>
              <SignatureBlock label={`For and on behalf of ${party.name}`} name={certificate?.signerName ?? signerName} title={party.role} date={certificate ? formatDate(certificate.signedAt, locale) : "On signing"}>
                {certificate ? (
                  <img src={certificate.image} alt={`Signature of ${certificate.signerName}`} className="max-h-[64px] max-w-full object-contain" />
                ) : canSign ? (
                  <button
                    ref={signHere}
                    type="button"
                    onClick={() => setAdopting(true)}
                    className="group relative flex items-center gap-2 rounded-[6px] border-2 border-[#d9a400] bg-[#ffe680] py-2 pl-3 pr-5 font-sans text-small font-bold uppercase tracking-[1px] text-[#5c4300] shadow-[0_6px_16px_-8px_#d9a400] transition-transform duration-200 hover:-translate-y-0.5 print:hidden"
                  >
                    <span className="motion-safe:animate-pulse">▶</span> Sign here
                  </button>
                ) : (
                  <span className="text-small text-ink-faint">Awaiting signature</span>
                )}
              </SignatureBlock>
            </div>
          </section>

          {certificate ? <Certificate certificate={certificate} locale={locale} /> : null}
        </article>
        {signed ? (
          <div className="mx-auto mt-6 flex max-w-[860px] justify-end print:hidden">
            <Button variant="yellow" onClick={onClose}>
              Done
            </Button>
          </div>
        ) : null}
      </div>

      {adopting ? <SignatureDialog defaultName={signerName} lockedName={lockedName} busy={busy} error={error} onCancel={() => setAdopting(false)} onAdopt={(signature) => void adopt(signature)} /> : null}
    </div>,
    window.document.body,
  );
}

function Letterhead({ document, locale }: { document: LegalDocumentView; locale: string }) {
  return (
    <header className="mb-10">
      <div className="flex items-start justify-between gap-6 border-b-[3px] border-double border-seal pb-5">
        <div className="flex items-center gap-3">
          <img src="/brand/flower-mark.svg" alt="" className="h-11 w-11" />
          <div>
            <b className="block font-sans text-[26px] font-semibold leading-none tracking-[-0.6px]">Posygo</b>
            <span className="mt-1 block font-sans text-[10px] font-semibold uppercase tracking-[2.4px] text-ink-faint">Storage and fulfilment</span>
          </div>
        </div>
        <dl className="text-right font-sans text-[11px] leading-[1.6] text-ink-soft">
          <div>
            <dt className="inline">Reference </dt>
            <dd className="inline font-semibold text-ink">{shortReference(document.id)}</dd>
          </div>
          <div>
            <dt className="inline">Version </dt>
            <dd className="inline font-semibold text-ink">{document.version}</dd>
          </div>
          <div>
            <dt className="inline">Published </dt>
            <dd className="inline font-semibold text-ink">{formatDate(document.publishedAt, locale)}</dd>
          </div>
        </dl>
      </div>
      <h2 className="mt-10 text-center text-[26px] font-semibold uppercase tracking-[4px] text-[#111] sm:text-[30px]">{document.title}</h2>
      <div aria-hidden className="mx-auto mt-4 flex w-48 items-center gap-3 text-seal">
        <span className="h-px flex-1 bg-current" />
        <span className="text-[10px]">◆</span>
        <span className="h-px flex-1 bg-current" />
      </div>
    </header>
  );
}

function SignatureBlock({ label, name, title, date, children }: { label: string; name: string; title: string; date: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[12px] font-semibold uppercase tracking-[1.6px] text-ink-soft">{label}</p>
      <div className="relative mt-3 flex h-[86px] items-end border-b border-[#1b1b1b] pb-2">{children}</div>
      <dl className="mt-2 grid grid-cols-[64px_1fr] gap-y-0.5 text-[13px]">
        <dt className="text-ink-faint">Name</dt>
        <dd>{name}</dd>
        <dt className="text-ink-faint">Title</dt>
        <dd>{title}</dd>
        <dt className="text-ink-faint">Date</dt>
        <dd>{date}</dd>
      </dl>
    </div>
  );
}

function Certificate({ certificate, locale }: { certificate: SignatureCertificateView; locale: string }) {
  const rows: Array<[string, string]> = [
    ["Reference", certificate.reference],
    ["Document", `${certificate.documentTitle}, version ${certificate.documentVersion}`],
    ["Signed by", `${certificate.signerName} · ${certificate.signerEmail}`],
    ["Method", certificate.method === "DRAWN" ? "Drawn signature" : "Typed signature"],
    ["Signed at", formatDateTime(certificate.signedAt, locale)],
    ["IP address", certificate.ip ?? "Not recorded"],
    ["Fingerprint", `SHA-256 ${certificate.documentSha256}`],
  ];
  return (
    <section aria-labelledby="certificate-heading" className="relative mt-14 break-before-page rounded-[4px] border-2 border-seal p-6 font-sans sm:p-8">
      <OfficialSeal caption="Signature verified" date={formatDate(certificate.signedAt, locale).toUpperCase()} className="absolute right-4 top-4 w-[110px] rotate-[8deg] sm:right-8 sm:w-[132px]" />
      <p className="text-[11px] font-semibold uppercase tracking-[2.4px] text-seal">Posygo Sign</p>
      <h3 id="certificate-heading" className="mt-1 pr-28 font-legal text-[22px] font-semibold sm:pr-36">
        Certificate of completion
      </h3>
      <p className="mt-2 max-w-[480px] pr-24 text-[13px] text-ink-soft sm:pr-0">This record is kept with the agreement. The fingerprint changes if a single character of the signed text changes.</p>
      <dl className="mt-6 divide-y divide-line text-[13px]">
        {rows.map(([label, value]) => (
          <div key={label} className="grid gap-1 py-2.5 sm:grid-cols-[120px_1fr]">
            <dt className="text-ink-faint">{label}</dt>
            <dd className="break-all font-medium">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
