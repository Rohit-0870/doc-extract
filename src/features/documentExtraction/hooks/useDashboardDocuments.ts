
// import { useQuery } from "@tanstack/react-query";
// import type { Document } from "@/features/documentExtraction/documentTypes";
// import { METRICS_BASE_URL } from "@/config/env";

// type BackendDocument = {
//   document_id: string;
//   filename: string;
//   document_type?: string;
//   source?: string;
//   status:
//     | "pending"
//     | "processing"
//     | "completed"
//     | "failed"
//     | "validation_completed"
//     | "under_review";
//   created_at: string;
//   file_size_bytes?: number;
//   total_pages?: number;
//   page_dimensions?: any[];
//   requires_hitl_review?: boolean;
//   review_completed_at?: string | null;
// };

// type DashboardDocumentsResponse = {
//   documents: BackendDocument[];
//   total_count: number;
// };

// const statusMap: Record<string, Document["status"]> = {
//   processing: "processing",
//   completed: "completed",
//   failed: "failed",
//   validation_completed: "completed",
//   extraction_completed: "completed",
//   approved: "completed",
//   // under_review: "completed",
//   review_completed: "completed",
// };

// const ocrMap: Record<string, Document["ocrType"]> = {
//   analyze: "easy_ocr",
//   "analyze-azure": "azure_di",
// };

// interface DashboardQueryParams {
//   page?: number;
//   page_size?: number;
//   sort_by?: string;
//   sort_order?: "ASC" | "DESC";
//   start_date?: string;
//   end_date?: string;
//   document_types?: string;
//   statuses?: string;
//   requires_hitl_review?: boolean;
//   reviewer_id?: string;
//   source?: string;
//   filename_contains?: string;
//   min_cost?: number;
//   max_cost?: number;
// }

// export function useDashboardDocuments(
//   optimisticDocs: Document[] = [],
//   queryParams: DashboardQueryParams = {}
// ) {
//   return useQuery({
//     queryKey: ["dashboard-documents", queryParams],
//     queryFn: async (): Promise<{
//       documents: Document[];
//       totalCount: number;
//     }> => {
//       const base = METRICS_BASE_URL.replace(/\/+$/, "");

//       const params = new URLSearchParams({
//         page: (queryParams.page ?? 1).toString(),
//         page_size: (queryParams.page_size ?? 50).toString(),
//         sort_by: queryParams.sort_by ?? "created_at",
//         sort_order: queryParams.sort_order ?? "DESC",
//       });

//       if (queryParams.start_date)
//         params.append("start_date", formatDate(queryParams.start_date));
//       if (queryParams.end_date)
//         params.append("end_date", addOneDay(formatDate(queryParams.end_date)));
//       if (queryParams.document_types)
//         params.append("document_types", queryParams.document_types);
//       if (queryParams.statuses)
//         params.append("statuses", queryParams.statuses);
//       if (queryParams.requires_hitl_review !== undefined)
//         params.append(
//           "requires_hitl_review",
//           String(queryParams.requires_hitl_review)
//         );
//       if (queryParams.reviewer_id)
//         params.append("reviewer_id", queryParams.reviewer_id);
//       if (queryParams.source)
//         params.append("source", queryParams.source);
//       if (queryParams.filename_contains)
//         params.append("filename_contains", queryParams.filename_contains);
//       if (queryParams.min_cost !== undefined)
//         params.append("min_cost", String(queryParams.min_cost));
//       if (queryParams.max_cost !== undefined)
//         params.append("max_cost", String(queryParams.max_cost));

//       const res = await fetch(
//         `${base}/dashboard/documents?${params.toString()}`
//       );
//       if (!res.ok) throw new Error(`HTTP ${res.status}`);

//       const data: DashboardDocumentsResponse = await res.json();

//       const mapped = data.documents.map((doc) => {
//         const date = new Date(doc.created_at);
//         const finalDate = isNaN(date.getTime()) ? new Date() : date;

//         return {
//           id: doc.document_id,
//           fileName: doc.filename,
//           documentType: doc.document_type || "—",
//           ocrType: ocrMap[doc.source || ""] || "easy_ocr",
//           status: statusMap[doc.status] || "processing",
//           createdAt: doc.created_at,
//           createdAtFormatted: finalDate.toLocaleString(undefined, {
//             month: "short",
//             day: "numeric",
//             year: "numeric",
//             hour: "2-digit",
//             minute: "2-digit",
//           }),
//           fileSizeBytes: doc.file_size_bytes,
//           totalPages: doc.total_pages || "—",
//           pageDimensions: doc.page_dimensions || [],
//           requiresHumanReview: doc.requires_hitl_review || false,
//           reviewCompletedAt: doc.review_completed_at ? new Date(doc.review_completed_at).toISOString() : null,
//         };
//       });

//       return {
//         documents: mapped,
//         totalCount: data.total_count,
//       };
//     },

//     refetchInterval: (query) => {
//       const serverDocs = query.state.data?.documents;
//       const hasProcessing = serverDocs?.some(d => d.status === "processing" || d.status === "pending");
//       return (hasProcessing || optimisticDocs.length > 0) ? 3000 : false;
//     },
//     select: (serverData) => {
//       // ✅ Avoid duplicates: Only show optimistic docs if they aren't in the server response yet
//       const filteredOptimistic = optimisticDocs.filter(
//         (opt) => !serverData.documents.some((serv) => serv.fileName === opt.fileName)
//       );
//       return {
//         documents: [...filteredOptimistic, ...serverData.documents],
//         totalCount: serverData.totalCount,
//       };
//     },
//     placeholderData: (previousData) => previousData,
//     staleTime: 10000,
//   });
// }

// function formatDate(dateString: string) {
//   const date = new Date(dateString);
//   const yyyy = date.getFullYear();
//   const mm = String(date.getMonth() + 1).padStart(2, "0");
//   const dd = String(date.getDate()).padStart(2, "0");
//   return `${yyyy}-${mm}-${dd}`;
// }

// function addOneDay(dateString: string) {
//   const [y, m, d] = dateString.split("-").map(Number);
//   const date = new Date(y, m - 1, d + 1);

//   const yyyy = date.getFullYear();
//   const mm = String(date.getMonth() + 1).padStart(2, "0");
//   const dd = String(date.getDate()).padStart(2, "0");

//   return `${yyyy}-${mm}-${dd}`;
// }



import { useQuery } from "@tanstack/react-query";
import type { Document } from "@/features/documentExtraction/documentTypes";
import { METRICS_BASE_URL } from "@/config/env";

type BackendDocument = {
  document_id: string;
  filename: string;
  document_type?: string;
  source?: string;
  status:
    | "pending"
    | "processing"
    | "completed"
    | "failed"
    | "validation_completed"
    | "under_review";
  created_at: string;
  file_size_bytes?: number;
  total_pages?: number;
  page_dimensions?: any[];
  requires_hitl_review?: boolean;
  review_completed_at?: string | null;
  processing_time_seconds?: number;
  total_cost_usd?: number;
};

type DashboardDocumentsResponse = {
  documents: BackendDocument[];
  total_count: number;
};

const statusMap: Record<string, Document["status"]> = {
  processing: "processing",
  completed: "completed",
  failed: "failed",
  validation_completed: "completed",
  extraction_completed: "completed",
  approved: "completed",
  // under_review: "completed",
  review_completed: "completed",
};

const ocrMap: Record<string, Document["ocrType"]> = {
  analyze: "easy_ocr",
  "analyze-azure": "azure_di",
};

interface DashboardQueryParams {
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: "ASC" | "DESC";
  start_date?: string;
  end_date?: string;
  document_types?: string;
  statuses?: string;
  requires_hitl_review?: boolean;
  reviewer_id?: string;
  source?: string;
  filename_contains?: string;
  min_cost?: number;
  max_cost?: number;
}

export function useDashboardDocuments(
  optimisticDocs: Document[] = [],
  queryParams: DashboardQueryParams = {}
) {
  return useQuery({
    queryKey: [
      "dashboard-documents",
      queryParams.page,
      queryParams.page_size,
      queryParams.sort_by,
      queryParams.sort_order,
      queryParams.start_date,
      queryParams.end_date,
      queryParams.document_types,
      queryParams.statuses,
      queryParams.requires_hitl_review,
      queryParams.reviewer_id,
      queryParams.source,
      queryParams.filename_contains,
      queryParams.min_cost,
      queryParams.max_cost,
    ],
    queryFn: async (): Promise<{
      documents: Document[];
      totalCount: number;
    }> => {
      const base = METRICS_BASE_URL.replace(/\/+$/, "");

      const params = new URLSearchParams({
        page: (queryParams.page ?? 1).toString(),
        page_size: (queryParams.page_size ?? 50).toString(),
        sort_by: queryParams.sort_by ?? "created_at",
        sort_order: queryParams.sort_order ?? "DESC",
      });

      if (queryParams.start_date)
        params.append("start_date", formatDate(queryParams.start_date));
      if (queryParams.end_date)
        params.append("end_date", addOneDay(formatDate(queryParams.end_date)));
      if (queryParams.document_types)
        params.append("document_types", queryParams.document_types);
      if (queryParams.statuses)
        params.append("statuses", queryParams.statuses);
      if (queryParams.requires_hitl_review !== undefined)
        params.append(
          "requires_hitl_review",
          String(queryParams.requires_hitl_review)
        );
      if (queryParams.reviewer_id)
        params.append("reviewer_id", queryParams.reviewer_id);
      if (queryParams.source)
        params.append("source", queryParams.source);
      if (queryParams.filename_contains)
        params.append("filename_contains", queryParams.filename_contains);
      if (queryParams.min_cost !== undefined)
        params.append("min_cost", String(queryParams.min_cost));
      if (queryParams.max_cost !== undefined)
        params.append("max_cost", String(queryParams.max_cost));

      const res = await fetch(
        `${base}/dashboard/documents?${params.toString()}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data: DashboardDocumentsResponse = await res.json();

      const mapped = data.documents.map((doc) => {
        const date = new Date(doc.created_at);
        const finalDate = isNaN(date.getTime()) ? new Date() : date;

        return {
          id: doc.document_id,
          fileName: doc.filename,
          documentType: doc.document_type || "—",
          ocrType: ocrMap[doc.source || ""] || "easy_ocr",
          status: statusMap[doc.status] || "processing",
          createdAt: doc.created_at,
          createdAtFormatted: finalDate.toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          fileSizeBytes: doc.file_size_bytes,
          totalPages: doc.total_pages || "—",
          pageDimensions: doc.page_dimensions || [],
          requiresHumanReview: doc.requires_hitl_review || false,
          reviewCompletedAt: doc.review_completed_at ? new Date(doc.review_completed_at).toISOString() : null,
          processing_time_seconds: doc.processing_time_seconds || null,
          total_cost_usd: doc.total_cost_usd || null,
        };
      });

      return {
        documents: mapped,
        totalCount: data.total_count,
      };
    },

    refetchInterval: (query) => {
      if ((queryParams.page ?? 1) !== 1) return false;

      const docs = query.state.data?.documents;

      const hasProcessing = docs?.some(
        (d) => d.status === "processing" || d.status === "pending"
      );

      const hasOptimisticProcessing = optimisticDocs.some(
        (d) => d.status === "processing" || d.status === "pending"
      );

      return (hasProcessing || hasOptimisticProcessing) ? 7000 : false;
    },
    refetchIntervalInBackground: false,
    select: (serverData) => {
      const filteredOptimistic = optimisticDocs.filter((opt) => {
        return !serverData.documents.some(
          (serv) =>
            serv.fileName === opt.fileName &&
            serv.status === "processing"
        );
      });

      return {
        documents: [...filteredOptimistic, ...serverData.documents],
        totalCount: serverData.totalCount,
      };
    },
    placeholderData: (previousData) => previousData,
    staleTime: 10000,
  });
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function addOneDay(dateString: string) {
  const [y, m, d] = dateString.split("-").map(Number);
  const date = new Date(y, m - 1, d + 1);

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
}