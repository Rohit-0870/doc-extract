export interface Classification {
  document_type: string;
  confidence: number;
  reason: string;
  key_indicators: string[];
}

export interface MandatoryField {
  field_name: string;
  normalized_name: string;
  confidence: number;
  is_mandatory: boolean;
  reason: string;
  field_type: string;
  location: string;
  indicators: string[];
}

export type FieldValue = unknown;

// ✅ NEW (for OCR overlay)
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PageDimension {
  page_number: number;
  width: number;
  height: number;
  unit: string; // "pixel"
}

export interface OcrLine {
  text: string;
  confidence: number;
  page_number: number;
  bounding_box: BoundingBox;
}

export interface OcrWord {
  text: string;
  confidence: number;
  page_number: number;
  bounding_box: BoundingBox;
}

export interface ExtractedValue {
  field_name: string;
  normalized_name?: string;
  field_value: FieldValue;
  confidence?: number;
  page_number?: number;
  extraction_method?: string;
  was_corrected?: boolean;

  // ✅ NEW (your response includes this sometimes)
  bounding_box?: BoundingBox | null;
}

export interface ValidationResult {
  field_name: string;
  field_value: FieldValue;
  status: "valid" | "invalid" | "warning";
  errors: string[];
  suggestions: string[];
  corrected_value: string | null;
  requires_human_review: boolean;
}

export interface Statistics {
  total_fields: number;
  mandatory_count: number;
  average_confidence: number;
  high_confidence_count: number;
  field_type_distribution: Record<string, number>;
  mandatory_percentage: number;
}

export interface TokenUsage {
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
}

export interface CostInfo {
  input_cost_usd: number;
  output_cost_usd: number;
  total_cost_usd: number;
}

export interface DocumentExtractionResponse {
  success: boolean;

  // ✅ backend returns this
  document_id?: string;
  filename: string;
  file_size_bytes: number;
  document_type: string;
  classification: Classification;
  mandatory_fields: MandatoryField[];
  extracted_values: ExtractedValue[];
  validation_results: ValidationResult[];
  is_valid: boolean;
  requires_human_review: boolean;
  hitl_fields: string[];
  statistics: Statistics;
  token_usage: TokenUsage;
  cost_info: CostInfo;
  time_taken_seconds: number;
  metrics_record_id: number;
  raw_text_preview: string;
  error: string | null;
  status?: string;
  review_completed_at?: string | null;

  // ✅ NEW (needed for selectable viewer)
  page_dimensions?: PageDimension[];
  ocr_lines?: OcrLine[];
  ocr_words?: OcrWord[];

  /** ✅ ADD THIS */
  blob_url?: string;

  extraction_results?: {
    original_values: ExtractedValue[];
    corrected_values: any[];
    final_values: ExtractedValue[];
  };
}

// ✅ NEW (needed for Dashboard)
export type OcrType = "easy_ocr" | "azure_di";

export type DocumentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "review_completed"; 

export interface Document {
  id: string;
  fileName: string;
  documentType?: string;
  ocrType: OcrType;
  status: DocumentStatus;
  createdAt: string;
  createdAtFormatted: string;
  isTemp?: boolean;

  // ✅ New optional fields
  fileSizeBytes?: number;
  pageDimensions?: PageDimension[];
  requiresHumanReview?: boolean;
  reviewCompletedAt?: string | null;
  totalPages?: number | string;
  processing_time_seconds?: number | null;
  total_cost_usd?: number | null;
}


