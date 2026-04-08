import { useQuery } from "@tanstack/react-query";
import { METRICS_BASE_URL, AZURE_BLOB_SAS } from "@/config/env";

export interface DocumentDetails {
  success: boolean;
  document: {
    document_id: string;
    filename: string;
    file_size_bytes?: number;
    document_type?: string;
    requires_hitl_review?: boolean;
    source?: string;
    status?: string;
    review_completed_at?: string | null;
  };
  extraction_results?: any;
  cost_breakdown?: any;
  validation_results?: any[];
  page_dimensions?: any[];
  bounding_box_results?: {
    extracted_data: any[];
    lines: any[];
    words: any[];
    total_lines_count?: number;
    total_words_count?: number;
  };
  ocr_lines?: any[];
  ocr_words?: any[];
  error?: string;
  raw_text_preview: string;
  metrics_record_id: number;
  blob_url: string | null;
}

const fetchDocumentDetails = async (documentId: string): Promise<DocumentDetails> => {
  const base = METRICS_BASE_URL.replace(/\/+$/, "");
  
  // ✅ 1. Build URL with the mandatory query parameters
  const url = new URL(`${base}/dashboard/documents/${documentId}`);
  url.searchParams.append("include_all_lines", "true");
  url.searchParams.append("include_all_words", "true");
  url.searchParams.append("include_bounding_boxes", "true");

  const res = await fetch(url.toString());

  if (!res.ok) {
    throw new Error(`Failed to fetch document details, HTTP ${res.status}`);
  }

  const data: DocumentDetails = await res.json();

  // ✅ 2. Handle SAS token assignment
  if (data.blob_url) {
    if (!data.blob_url.includes("sig=")) {
      const separator = data.blob_url.includes('?') ? '&' : '?';
      data.blob_url = `${data.blob_url}${separator}${AZURE_BLOB_SAS}`;
    }
  }

  return data;
};

export const useDocumentDetails = (documentId?: string) => {
  return useQuery({
    queryKey: ["document-details", documentId],
    queryFn: () => fetchDocumentDetails(documentId!),
    enabled: !!documentId,
    // Optional: Add staleTime so it doesn't refetch every time you click back/forth
    staleTime: 1000 * 60 * 5, 
  });
};