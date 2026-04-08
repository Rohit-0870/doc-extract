import { useQuery } from "@tanstack/react-query";
import { ADMIN_BASE_URL } from "@/config/env";
import type { GetDocTypesResponse, DocumentTemplateSummary } from "../types";
import { mapBackendToDocumentTemplateSummary } from "@/features/admin-config/mappers";

type DocumentTypesQueryResponse = {
  documentTypes: DocumentTemplateSummary[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export function useDocumentTypes(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  createdBy?: string;
  isApproved?: boolean;
}) {
  return useQuery<DocumentTypesQueryResponse>({
    queryKey: [
      "admin",
      "document-types",
      params.page,
      params.pageSize,
      params.search,
      params.status,
      params.createdBy,
      params.isApproved,
    ],
    queryFn: async () => {
      const query = new URLSearchParams();

      if (params.page !== undefined)
        query.append("page", String(params.page));

      if (params.pageSize !== undefined)
        query.append("page_size", String(params.pageSize));

      if (params.search)
        query.append("search", params.search);

      if (params.status)
        query.append("status", params.status);

      if (params.createdBy)
        query.append("created_by", params.createdBy);

      if (params.isApproved !== undefined)
        query.append("is_approved", String(params.isApproved));

      const res = await fetch(
        `${ADMIN_BASE_URL}/admin/templates?${query.toString()}`
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data: GetDocTypesResponse = await res.json();
      
      return {
        documentTypes: data.data.map(
          mapBackendToDocumentTemplateSummary
        ),
        totalCount: data.total_count,
        page: data.page,
        pageSize: data.page_size,
      };
    },
    staleTime: 30000,
  });
}
