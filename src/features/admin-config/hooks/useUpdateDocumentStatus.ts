import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ADMIN_BASE_URL } from "@/config/env";

export function useUpdateDocumentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "active" | "inactive" }) => {
      const res = await fetch(`${ADMIN_BASE_URL}/admin/templates/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        // NOTE: Ensure your backend only needs { status } and won't 
        // overwrite other fields with null!
        body: JSON.stringify({ status }), 
      });
      if (!res.ok) throw new Error("Update failed");
      return res.json();
    },

    onMutate: async (newStatusObj) => {
    // Use the prefix to catch all paginated versions of this list
    await queryClient.cancelQueries({ queryKey: ["admin", "document-types"] });
    
    const previousData = queryClient.getQueryData(["admin", "document-types"]);

    queryClient.setQueryData(["admin", "document-types"], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        documentTypes: old.documentTypes.map((doc: any) =>
          doc.id === newStatusObj.id ? { ...doc, status: newStatusObj.status } : doc
        ),
      };
    });
    return { previousData };
  },


    onError: (err, newStatusObj, context) => {
      // 4. FIX KEY: ["admin", "document-types"]
      if (context?.previousData) {
        queryClient.setQueryData(["admin", "document-types"], context.previousData);
      }
    },

    onSettled: () => {
      // 5. FIX KEY: ["admin", "document-types"]
      queryClient.invalidateQueries({ queryKey: ["admin", "document-types"] });
    },
  });
}