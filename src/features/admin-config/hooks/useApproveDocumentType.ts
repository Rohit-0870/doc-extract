import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ADMIN_BASE_URL } from "@/config/env";

export function useApproveDocumentType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const base = ADMIN_BASE_URL.replace(/\/+$/, "");
      
      // Targeting the dedicated POST endpoint from the image
      const res = await fetch(`${base}/admin/templates/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to approve template`);

      return res.json();
    },
    onSuccess: (data, id) => {
      // Refresh the list to show the new approval status and timestamp
      queryClient.invalidateQueries({ queryKey: ["admin", "document-types"] });
      
      // Refresh the detail view if it's currently open
      queryClient.invalidateQueries({ queryKey: ["document-type", id] });
    },
  });
}

