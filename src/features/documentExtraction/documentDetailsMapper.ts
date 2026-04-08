import { DocumentDetails } from "@/features/documentExtraction/hooks/useDocumentDetails";
import { DocumentExtractionResponse } from "@/features/documentExtraction/documentTypes";

/* ---------------------------------------------
 * Internal mapper-only types
 * --------------------------------------------- */
interface ApiExtractedValue {
  field_name: string;
  normalized_name?: string;
  field_value: string;
  confidence?: number;
  extraction_method?: string;
  page_number?: number;
  bounding_box?: any;
  was_corrected?: boolean;
}

interface ApiBoundingBox {
  field_name: string;
  page_number: number;
  bounding_box: any;
}

export const mapApiDataToFrontend = (
  data: DocumentDetails
): DocumentExtractionResponse | null => {
  if (!data || !data.document) return null;

  const doc = data.document;
  const metrics = data.cost_breakdown || {};
  const extraction = data.extraction_results || {};

  const bboxResults =
    (data.bounding_box_results?.extracted_data as ApiBoundingBox[]) || [];

  const ocr_lines = data.bounding_box_results?.lines ?? [];
  const ocr_words = data.bounding_box_results?.words ?? [];


  const mergeBoxes = (boxes: any[]) => {
  if (boxes.length === 0) return null;
  const x = Math.min(...boxes.map(b => b.x));
  const y = Math.min(...boxes.map(b => b.y));
  const maxWidth = Math.max(...boxes.map(b => b.x + b.width));
  const maxHeight = Math.max(...boxes.map(b => b.y + b.height));
  return {
      x,
      y,
      width: maxWidth - x,
      height: maxHeight - y
  };
  };

  /* ---------------------------------------------
   * Build lookup from ORIGINAL values
   * --------------------------------------------- */
  const originalValues =
    (extraction.original_values as ApiExtractedValue[]) || [];

  const originalMap = new Map<string, ApiExtractedValue>(
    originalValues.map((v) => [v.field_name, v])
  );

  /* ---------------------------------------------
   * Decide source of truth
   * --------------------------------------------- */
  const sourceValues: ApiExtractedValue[] =
    extraction.final_values?.length > 0
      ? (extraction.final_values as ApiExtractedValue[])
      : originalValues;

  const extracted_values = sourceValues.map((val) => {
    const original = originalMap.get(val.field_name);
    const spatialMatch = bboxResults.find((b) => b.field_name === val.field_name);
    
    // Default fallback box
    let finalBox = spatialMatch?.bounding_box ?? val.bounding_box ?? original?.bounding_box ?? null;

    // Multi-line Snap Logic
    if (val.field_value) {
  const stringValue = String(val.field_value)
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

  const pageNumber = Number(val.page_number || 1);

  // ----------------------------
// STEP 1: OCR WORD MATCH (most precise)
// ----------------------------
if (Array.isArray(ocr_words) && ocr_words.length > 0) {
  const pageWords = ocr_words.filter(
    (w) => Number(w.page_number) === pageNumber
  );

  let wordMatches = pageWords.filter((w) => {
    const wordText = String(w.text || "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
    return wordText === stringValue;
  });

  if (wordMatches.length > 0) {
    // Sort matches visually: top → bottom, left → right
    wordMatches.sort((a, b) => {
      if (a.bounding_box.y !== b.bounding_box.y) return a.bounding_box.y - b.bounding_box.y;
      return a.bounding_box.x - b.bounding_box.x;
    });

    // Sort all fields with same value by page → y → x
    const sameValueFields = sourceValues
      .filter(v => String(v.field_value).trim().toLowerCase() === stringValue)
      .sort((a, b) => {
        const pageA = Number(a.page_number ?? 1);
        const pageB = Number(b.page_number ?? 1);
        if (pageA !== pageB) return pageA - pageB;

        const yA = a.bounding_box?.y ?? 0;
        const yB = b.bounding_box?.y ?? 0;
        if (yA !== yB) return yA - yB;

        const xA = a.bounding_box?.x ?? 0;
        const xB = b.bounding_box?.x ?? 0;
        return xA - xB;
      });

    const currentIndex = sameValueFields.findIndex(
      v => v.field_name === val.field_name
    );

    finalBox = wordMatches[currentIndex]?.bounding_box ?? wordMatches[0].bounding_box;

    // ✅ Return early with finalBox assigned
    return {
      field_name: val.field_name,
      normalized_name: val.normalized_name ?? original?.normalized_name,
      field_value: normalizeComplexField(val.field_value),
      confidence: val.confidence ?? original?.confidence ?? 0,
      extraction_method: val.extraction_method ?? original?.extraction_method ?? "llm",
      page_number: pageNumber,
      bounding_box: finalBox,
      was_corrected: val.was_corrected ?? false,
    };
  }
}

// ----------------------------
// STEP 2: OCR LINE MATCH (fallback)
// ----------------------------
if (Array.isArray(ocr_words) && ocr_words.length > 0) {
  const words = stringValue.split(" ");
  const pageWords = ocr_words.filter(w => Number(w.page_number) === pageNumber);

  // Find sequences of words
  const sequences: any[] = [];
  for (let i = 0; i < pageWords.length; i++) {
    let match = true;
    for (let j = 0; j < words.length; j++) {
      const word = pageWords[i + j];
      if (!word) {
        match = false;
        break;
      }
      const wordText = String(word.text || "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
      if (wordText !== words[j]) {
        match = false;
        break;
      }
    }
    if (match) sequences.push(pageWords.slice(i, i + words.length));
  }

  if (sequences.length > 0) {
    // Sort sequences top → bottom
    sequences.sort((a, b) => a[0].bounding_box.y - b[0].bounding_box.y);

    // Sort same-value fields visually
    const sameValueFields = sourceValues
      .filter(v => String(v.field_value).trim().toLowerCase() === stringValue)
      .sort((a, b) => {
        const pageA = Number(a.page_number ?? 1);
        const pageB = Number(b.page_number ?? 1);
        if (pageA !== pageB) return pageA - pageB;
        const yA = a.bounding_box?.y ?? 0;
        const yB = b.bounding_box?.y ?? 0;
        if (yA !== yB) return yA - yB;
        const xA = a.bounding_box?.x ?? 0;
        const xB = b.bounding_box?.x ?? 0;
        return xA - xB;
      });

    const currentIndex = sameValueFields.findIndex(
      v => v.field_name === val.field_name
    );

    const selectedSequence = sequences[currentIndex] || sequences[0];
    finalBox = mergeBoxes(selectedSequence.map(w => w.bounding_box));
  }
}
}


    // ENSURE PROPERTIES ARE UNIQUE HERE
    return {
      field_name: val.field_name,
      normalized_name: val.normalized_name ?? original?.normalized_name,
      field_value: normalizeComplexField(val.field_value),
      confidence: val.confidence ?? original?.confidence ?? 0,
      extraction_method: val.extraction_method ?? original?.extraction_method ?? "llm",
      page_number: Number(spatialMatch?.page_number ?? val.page_number ?? original?.page_number ?? 1),
      bounding_box: finalBox, // ONLY ONE bounding_box property allowed
      was_corrected: val.was_corrected ?? false,
    };
  });

  /* ---------------------------------------------
   * Return final mapped object
   * --------------------------------------------- */
  return {
    success: data.success,
    document_id: doc.document_id,
    filename: doc.filename,
    status: doc.status,
    review_completed_at: doc.review_completed_at,
    file_size_bytes: doc.file_size_bytes ?? 0,
    document_type: doc.document_type ?? "unknown",

    extraction_results: {
      original_values: extraction.original_values ?? [],
      corrected_values: extraction.corrected_values ?? [],
      final_values: extraction.final_values ?? [],
    },

    extracted_values,

    mandatory_fields: (extraction.discovered_fields || []).map((f: any) => ({
      field_name: f.field_name,
      normalized_name: f.normalized_name,
      confidence: f.confidence,
      is_mandatory: f.is_mandatory,
      reason: f.reason,
      field_type: f.field_type,
      location: f.location ?? "",
      indicators: f.indicators ?? [],
    })),

    classification: {
      document_type: doc.document_type ?? "unknown",
      confidence: 1,
      reason: `Classified via ${doc.source || "system"}`,
      key_indicators: [],
    },

    statistics: {
      total_fields: extracted_values.length,
      mandatory_count: (extraction.discovered_fields || []).filter(
        (f: any) => f.is_mandatory
      ).length,
      average_confidence:
        extracted_values.length > 0
          ? extracted_values.reduce(
              (acc, curr) => acc + (curr.confidence || 0),
              0
            ) / extracted_values.length
          : 0,
      high_confidence_count: extracted_values.filter(
        (v) => (v.confidence || 0) > 0.8
      ).length,
      field_type_distribution: {},
      mandatory_percentage: 0,
    },

    validation_results: data.validation_results || [],
    is_valid: (data.validation_results || []).length === 0,
    requires_human_review: doc.requires_hitl_review || false,
    hitl_fields: [],

    token_usage: {
      input_tokens: metrics.input_tokens || 0,
      output_tokens: metrics.output_tokens || 0,
      total_tokens: metrics.total_tokens || 0,
    },

    cost_info: {
      input_cost_usd: metrics.input_cost_usd || 0,
      output_cost_usd: metrics.output_cost_usd || 0,
      total_cost_usd: metrics.total_cost_usd || 0,
    },

    time_taken_seconds: metrics.processing_time_seconds || 0,
    metrics_record_id: data.metrics_record_id ?? 0,
    raw_text_preview: data.raw_text_preview || "",
    error: data.error ?? null,
    blob_url: data.blob_url ?? undefined,

    ocr_lines,
    ocr_words: ocr_words.length > 0 ? ocr_words : ocr_lines,

    page_dimensions: data.page_dimensions ?? [],

  };
};


function normalizeComplexField(value: any) {
  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    const trimmed = value.trim();

    // ✅ Case 1: Proper JSON string
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed;
    } catch {}

    // ✅ Case 2: Python-like string (your bounding_box_results case)
    try {
      const safe = trimmed.replace(/'/g, '"');
      const parsed = JSON.parse(safe);
      if (Array.isArray(parsed)) return parsed;
    } catch {}

    // ✅ Case 3: Raw OCR table string
    // if (trimmed.includes("\n") && trimmed.toLowerCase().includes("qty")) {
    //   const lines = trimmed.split("\n").map(l => l.trim()).filter(Boolean);

    //   const headers = lines.slice(0, 4); // assumes fixed header
    //   const rows = lines.slice(4);

    //   const result = [];

    //   for (let i = 0; i < rows.length; i += headers.length) {
    //     const row: any = {};
    //     headers.forEach((h, idx) => {
    //       row[h] = rows[i + idx] ?? "";
    //     });
    //     result.push(row);
    //   }

    //   return result;
    // }
  }

  return value;
}