import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ADMIN_BASE_URL } from "@/config/env";

export function useDeleteExtractionField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ templateId, fieldName }: { templateId: string; fieldName: string }) => {
      const base = ADMIN_BASE_URL.replace(/\/+$/, "");
      
      // Matches the API path: /admin/templates/{template_id}/fields/{field_name}
      const res = await fetch(`${base}/admin/templates/${templateId}/fields/${fieldName}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error(`Field deletion failed: ${res.status}`);
      return res.json();
    },
    onSuccess: (_, variables) => {
      // Refresh both the specific template and the general list to keep UI in sync
      queryClient.invalidateQueries({
        queryKey: ["admin", "document-types", variables.templateId],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "document-types"],
      });
    },
  });
}