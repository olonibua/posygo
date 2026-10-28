import { ApiError, apiRequest } from "./client";

interface UploadIntent {
  fileId: string;
  upload: { url: string; headers: Record<string, string> };
}

const MB = 1024 * 1024;

export type UploadPurpose = "KYC_DOCUMENT" | "EVIDENCE_PHOTO" | "PRODUCT_IMAGE" | "GENERAL_ATTACHMENT" | "PARTNER_EVIDENCE" | "PROOF_OF_ADDRESS" | "STOCK_COUNT";

const MAX_MB: Record<UploadPurpose, number> = { KYC_DOCUMENT: 10, EVIDENCE_PHOTO: 15, PRODUCT_IMAGE: 5, GENERAL_ATTACHMENT: 10, PARTNER_EVIDENCE: 100, PROOF_OF_ADDRESS: 10, STOCK_COUNT: 200 };

export async function uploadPrivateFile(file: File, purpose: UploadPurpose): Promise<string> {
  if (file.size > MAX_MB[purpose] * MB) {
    throw new Error(`Files must be under ${MAX_MB[purpose]} MB.`);
  }
  const intent = await apiRequest<UploadIntent>("/v1/files/uploads", { method: "POST", body: { purpose, contentType: file.type, sizeBytes: file.size } }).catch((error: unknown) => {
    throw new Error(error instanceof ApiError ? "That file type isn't accepted here." : "Upload failed. Try again.");
  });
  const response = await fetch(intent.upload.url, { method: "PUT", headers: intent.upload.headers, body: file }).catch(() => {
    throw new Error("We couldn't upload the file. Check your connection and try again.");
  });
  if (!response.ok) {
    throw new Error("Upload failed. Try again.");
  }
  await apiRequest(`/v1/files/${intent.fileId}/confirm`, { method: "POST" }).catch((error: unknown) => {
    throw new Error(error instanceof ApiError ? error.message : "We couldn't check that file. Try again.");
  });
  return intent.fileId;
}
