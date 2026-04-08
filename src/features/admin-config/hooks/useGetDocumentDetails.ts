import { useQuery } from "@tanstack/react-query";
import { ADMIN_BASE_URL } from "@/config/env";
import type { DocumentConfig } from "@/features/admin-config/components/ManualDocumentConfig";
import { mapBackendToDocumentConfig } from "@/features/admin-config/mappers"; // optional mapping

export function useDocumentTypeById(templateId?: string) {
  return useQuery<DocumentConfig, Error>({
    queryKey: ["document-type", templateId],
    queryFn: async () => {
      if (!templateId) throw new Error("Missing template ID");
      const base = ADMIN_BASE_URL.replace(/\/+$/, "");
      const res = await fetch(`${base}/admin/templates/${templateId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      console.log("Fetched backend data:", json);

      if (!json.success || !json.data) {
        throw new Error("Failed to fetch document type");
      }

      // map only the inner object
      return mapBackendToDocumentConfig(json.data);
    },
    enabled: !!templateId,
  });
}
