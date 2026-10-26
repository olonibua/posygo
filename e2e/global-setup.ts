import { API_URL } from "./support/cast";
import { resetCast } from "./support/session";

export default async function globalSetup(): Promise<void> {
  const health = await fetch(`${API_URL}/v1/health/ready`).catch(() => null);
  if (!health?.ok) {
    throw new Error(`The API isn't answering at ${API_URL}. Start it before running the browser tests.`);
  }
  resetCast();
}
