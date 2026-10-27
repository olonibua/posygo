import { llmsFull } from "@/features/marketing/llms";
import { loadMarkets, MarketsUnavailableError } from "@/features/marketing/market-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return new Response(llmsFull(await loadMarkets()), { headers: { "Content-Type": "text/markdown; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
  } catch (error) {
    if (error instanceof MarketsUnavailableError) {
      return new Response("Temporarily unavailable", { status: 503, headers: { "Retry-After": "300" } });
    }
    throw error;
  }
}
