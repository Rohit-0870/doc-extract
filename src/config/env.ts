function mustGetEnv(key: string): string {
  const val = (import.meta.env as any)[key] as string | undefined;
  if (!val || val.trim() === "") {
    throw new Error(`❌ Missing environment variable: ${key}`);
  }
  return val.trim();
}

export const GATEWAY_BASE_URL = mustGetEnv("VITE_GATEWAY_BASE_URL");
export const VALIDATION_BASE_URL = mustGetEnv("VITE_VALIDATION_BASE_URL");
export const METRICS_BASE_URL = mustGetEnv("VITE_METRICS_BASE_URL"); // ✅ New (need this for Dashboard History List)
export const AZURE_BLOB_SAS = mustGetEnv("VITE_AZURE_BLOB_SAS"); // ✅ New (need this for blob access in Document Details)
export const ADMIN_BASE_URL = mustGetEnv("VITE_ADMIN_BASE_URL"); // ✅ New (need this for Admin Config)
export const REVIEWER_ID = (import.meta.env.VITE_REVIEWER_ID || "sakshi").trim();
