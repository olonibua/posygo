import { NextResponse } from "next/server";

import { currencyForCountry, isBaseCurrency, readRate, type VisitorCurrency } from "@/features/marketing/visitor-currency";

const RATES_URL = "https://open.er-api.com/v6/latest";
const RATE_CACHE_SECONDS = 43_200;

async function rateFor(base: string, currency: string): Promise<number | null> {
  if (base === currency) {
    return 1;
  }
  try {
    const response = await fetch(`${RATES_URL}/${base}`, { next: { revalidate: RATE_CACHE_SECONDS }, signal: AbortSignal.timeout(3000) });
    return response.ok ? readRate(await response.json(), currency) : null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const base = new URL(request.url).searchParams.get("base");
  const countryCode = request.headers.get("x-vercel-ip-country");
  const currency = currencyForCountry(countryCode);
  const headers = { "Cache-Control": "private, max-age=3600" };
  if (!isBaseCurrency(base) || !countryCode || !currency) {
    return NextResponse.json(null, { headers });
  }
  const rate = await rateFor(base, currency);
  const body: VisitorCurrency | null = rate ? { countryCode: countryCode.toUpperCase(), currency, rate } : null;
  return NextResponse.json(body, { headers });
}
