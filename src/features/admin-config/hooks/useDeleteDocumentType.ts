import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ADMIN_BASE_URL } from "@/config/env";

export function useDeleteDocumentType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templateId: string) => {
      const base = ADMIN_BASE_URL.replace(/\/+$/, "");
      const res = await fetch(`${base}/admin/templates/${templateId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
      return res.json();
    },
    onSuccess: () => {
      // FIX: Matches the table key exactly
      queryClient.invalidateQueries({
        queryKey: ["admin", "document-types"],
      });
    },
  });
}