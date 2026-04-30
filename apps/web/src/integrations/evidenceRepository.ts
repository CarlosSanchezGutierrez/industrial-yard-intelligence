import { getAplomoSupabaseClient } from "./supabaseClient.js";

export const aplomoEvidenceBucket = "aplomo-evidence";

export type AplomoEvidenceFileRow = {
  id: string;
  company_id: string;
  gps_capture_id: string | null;
  stockpile_id: string | null;
  uploaded_by_profile_id: string | null;
  file_type: string;
  storage_path: string;
  file_name: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  description: string | null;
  created_at: string;
};

export type AplomoEvidenceUploadInput = {
  companyId: string;
  gpsCaptureId?: string;
  stockpileId?: string;
  uploadedByProfileId?: string;
  file: Blob;
  fileName: string;
  fileType?: string;
  contentType?: string;
  description?: string;
  bucket?: string;
};

export type AplomoEvidenceUploadResult =
  | {
      ok: true;
      mode: "supabase";
      data: AplomoEvidenceFileRow;
      storagePath: string;
    }
  | {
      ok: false;
      mode: "local-demo" | "supabase";
      error: string;
    };

export type AplomoEvidenceListResult =
  | {
      ok: true;
      mode: "supabase";
      data: AplomoEvidenceFileRow[];
    }
  | {
      ok: false;
      mode: "local-demo" | "supabase";
      error: string;
    };

export type AplomoEvidenceSignedUrlResult =
  | {
      ok: true;
      mode: "supabase";
      signedUrl: string;
    }
  | {
      ok: false;
      mode: "local-demo" | "supabase";
      error: string;
    };

const cleanText = (value: string | undefined): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : undefined;
};

const sanitizeFileName = (fileName: string): string => {
  const cleaned = fileName
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return cleaned.length > 0 ? cleaned : "evidence-file";
};

const createClientId = (): string => {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const inferFileType = (
  contentType: string | undefined,
  fileName: string,
): string => {
  const type = contentType?.toLowerCase() ?? "";
  const name = fileName.toLowerCase();

  if (type.startsWith("image/")) {
    return "image";
  }

  if (type.startsWith("video/")) {
    return "video";
  }

  if (type === "application/pdf" || name.endsWith(".pdf")) {
    return "document";
  }

  return "file";
};

const buildStoragePath = (
  companyId: string,
  gpsCaptureId: string | undefined,
  fileName: string,
): string => {
  const safeName = sanitizeFileName(fileName);
  const captureFolder = gpsCaptureId ?? "unassigned";
  const uniquePart = createClientId();

  return [
    companyId,
    "gps-captures",
    captureFolder,
    `${Date.now()}-${uniquePart}-${safeName}`,
  ].join("/");
};

export const uploadAplomoEvidenceFile = async (
  input: AplomoEvidenceUploadInput,
): Promise<AplomoEvidenceUploadResult> => {
  const state = getAplomoSupabaseClient();

  if (!state.isConfigured) {
    return {
      ok: false,
      mode: "local-demo",
      error: state.reason,
    };
  }

  const companyId = cleanText(input.companyId);
  const fileName = cleanText(input.fileName);

  if (!companyId) {
    return {
      ok: false,
      mode: "supabase",
      error: "Missing companyId.",
    };
  }

  if (!fileName) {
    return {
      ok: false,
      mode: "supabase",
      error: "Missing fileName.",
    };
  }

  const bucketName = cleanText(input.bucket) ?? aplomoEvidenceBucket;
  const gpsCaptureId = cleanText(input.gpsCaptureId);
  const stockpileId = cleanText(input.stockpileId);
  const uploadedByProfileId = cleanText(input.uploadedByProfileId);
  const contentType = cleanText(input.contentType);
  const description = cleanText(input.description);
  const fileType =
    cleanText(input.fileType) ?? inferFileType(contentType, fileName);
  const storagePath = buildStoragePath(companyId, gpsCaptureId, fileName);

  const uploadOptions = contentType
    ? {
        contentType,
        upsert: false,
      }
    : {
        upsert: false,
      };

  const uploadResult = await state.client.storage
    .from(bucketName)
    .upload(storagePath, input.file, uploadOptions);

  if (uploadResult.error) {
    return {
      ok: false,
      mode: "supabase",
      error: uploadResult.error.message,
    };
  }

  const payload: Record<string, unknown> = {
    company_id: companyId,
    file_type: fileType,
    storage_path: storagePath,
    file_name: fileName,
    size_bytes: input.file.size,
  };

  if (gpsCaptureId) {
    payload.gps_capture_id = gpsCaptureId;
  }

  if (stockpileId) {
    payload.stockpile_id = stockpileId;
  }

  if (uploadedByProfileId) {
    payload.uploaded_by_profile_id = uploadedByProfileId;
  }

  if (contentType) {
    payload.mime_type = contentType;
  }

  if (description) {
    payload.description = description;
  }

  const metadataResult = await state.client
    .from("evidence_files")
    .insert(payload)
    .select("*")
    .single();

  if (metadataResult.error) {
    return {
      ok: false,
      mode: "supabase",
      error: metadataResult.error.message,
    };
  }

  return {
    ok: true,
    mode: "supabase",
    data: metadataResult.data as AplomoEvidenceFileRow,
    storagePath,
  };
};

export const listAplomoEvidenceFilesForCapture = async (
  gpsCaptureId: string,
  limit = 25,
): Promise<AplomoEvidenceListResult> => {
  const state = getAplomoSupabaseClient();

  if (!state.isConfigured) {
    return {
      ok: false,
      mode: "local-demo",
      error: state.reason,
    };
  }

  const cleanCaptureId = cleanText(gpsCaptureId);

  if (!cleanCaptureId) {
    return {
      ok: false,
      mode: "supabase",
      error: "Missing gpsCaptureId.",
    };
  }

  const safeLimit = Math.max(1, Math.min(limit, 100));

  const { data, error } = await state.client
    .from("evidence_files")
    .select("*")
    .eq("gps_capture_id", cleanCaptureId)
    .order("created_at", { ascending: false })
    .limit(safeLimit);

  if (error) {
    return {
      ok: false,
      mode: "supabase",
      error: error.message,
    };
  }

  return {
    ok: true,
    mode: "supabase",
    data: (data ?? []) as AplomoEvidenceFileRow[],
  };
};

export const listRecentAplomoEvidenceFilesForCompany = async (
  companyId: string,
  limit = 25,
): Promise<AplomoEvidenceListResult> => {
  const state = getAplomoSupabaseClient();

  if (!state.isConfigured) {
    return {
      ok: false,
      mode: "local-demo",
      error: state.reason,
    };
  }

  const cleanCompanyId = cleanText(companyId);

  if (!cleanCompanyId) {
    return {
      ok: false,
      mode: "supabase",
      error: "Missing companyId.",
    };
  }

  const safeLimit = Math.max(1, Math.min(limit, 100));

  const { data, error } = await state.client
    .from("evidence_files")
    .select("*")
    .eq("company_id", cleanCompanyId)
    .order("created_at", { ascending: false })
    .limit(safeLimit);

  if (error) {
    return {
      ok: false,
      mode: "supabase",
      error: error.message,
    };
  }

  return {
    ok: true,
    mode: "supabase",
    data: (data ?? []) as AplomoEvidenceFileRow[],
  };
};

export const createAplomoEvidenceSignedUrl = async (
  storagePath: string,
  expiresInSeconds = 300,
  bucket = aplomoEvidenceBucket,
): Promise<AplomoEvidenceSignedUrlResult> => {
  const state = getAplomoSupabaseClient();

  if (!state.isConfigured) {
    return {
      ok: false,
      mode: "local-demo",
      error: state.reason,
    };
  }

  const cleanStoragePath = cleanText(storagePath);

  if (!cleanStoragePath) {
    return {
      ok: false,
      mode: "supabase",
      error: "Missing storagePath.",
    };
  }

  const safeExpiresIn = Math.max(60, Math.min(expiresInSeconds, 3600));

  const { data, error } = await state.client.storage
    .from(bucket)
    .createSignedUrl(cleanStoragePath, safeExpiresIn);

  if (error) {
    return {
      ok: false,
      mode: "supabase",
      error: error.message,
    };
  }

  return {
    ok: true,
    mode: "supabase",
    signedUrl: data.signedUrl,
  };
};
