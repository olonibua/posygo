import { knowledgePack } from "@/features/assistant/knowledge/pack";

export const dynamic = "force-static";

export function GET() {
  return Response.json(knowledgePack(), { headers: { "Cache-Control": "public, max-age=600" } });
}
