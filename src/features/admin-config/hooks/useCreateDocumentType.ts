import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ADMIN_BASE_URL } from "@/config/env";
import type { DocumentConfig } from "@/features/admin-config/components/ManualDocumentConfig";

/* ---------- Backend Mapper ---------- */
export function mapDocumentConfigToBackend(config: DocumentConfig) {
  return {
    document_type_name: config.name,
    field_lists: config.fields.map((f) => ({
      id: f.id,
      field_name: f.name,
      field_type: f.type === 'number' ? 'numeric' : f.type, // backend expects 'numeric' instead of 'number'
      is_mandatory: f.required, // maps required -> is_mandatory
      is_deleted: false,        // always false on creation
    })),
    status: "active",
    is_approved: config.is_approved,
    created_by: "Admin",
  };
}

/* ---------- Hook ---------- */
export function useCreateDocumentType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: DocumentConfig) => {
      const base = ADMIN_BASE_URL.replace(/\/+$/, "");
      const payload = mapDocumentConfigToBackend(config);

      const res = await fetch(`${base}/admin/templates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // FIX: If the response is not OK, parse the JSON body and throw it
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({})); 
        throw errorData; 
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "document-types"] });
    },
  });
}
