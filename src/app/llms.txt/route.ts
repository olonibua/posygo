import { llmsIndex } from "@/features/marketing/llms";
import { sitePages } from "@/features/marketing/site-pages";

export const dynamic = "force-dynamic";

export async function GET() {
  return new Response(llmsIndex(await sitePages()), { headers: { "Content-Type": "text/markdown; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
