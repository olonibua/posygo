import { apiRequest } from "./client";

export async function downloadCsv(path: string, filename: string): Promise<void> {
  const text = await apiRequest<string>(path);
  const url = URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
