import { useMutation } from "@tanstack/react-query";
import { ADMIN_BASE_URL } from "@/config/env";

export function useGenerateAiTemplate() {
  return useMutation({
    mutationFn: async (files: File[]) => {
      const base = ADMIN_BASE_URL.replace(/\/+$/, "");
      const formData = new FormData();
      
      // Append all selected files to the "files" key
      files.forEach((file) => formData.append("files", file));
        for (let pair of formData.entries()) {
        console.log('Sending to API:', pair[0], pair[1]);
      }
      const res = await fetch(`${base}/admin/templates/ai-generate`, {
        method: "POST",
        // Note: browser sets Content-Type automatically for FormData
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw errorData;
      }

      return res.json();
    },
  });
}