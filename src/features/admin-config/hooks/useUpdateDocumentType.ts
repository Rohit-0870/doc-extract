import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ADMIN_BASE_URL } from "@/config/env";
import type { DocumentConfig } from "@/features/admin-config/components/ManualDocumentConfig";
import { mapDocumentConfigToBackend } from "@/features/admin-config/mappers";

export function useUpdateDocumentType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: DocumentConfig) => {
      if (!config.id) throw new Error("Missing document type ID");

      const base = ADMIN_BASE_URL.replace(/\/+$/, "");

      const payload = mapDocumentConfigToBackend(config);

      const res = await fetch(`${base}/admin/templates/${config.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload), // Now matches backend schema
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      return res.json();
    },

    onSuccess: (data, variables) => {
    // Update the list (Table)
    queryClient.invalidateQueries({
      queryKey: ["admin", "document-types"],
    });

    // Update the specific document (Detail View)
    // This triggers the refetch for useDocumentTypeById(editingId)
    queryClient.invalidateQueries({
      queryKey: ["document-type", variables.id], 
    });
  },
  });
}
