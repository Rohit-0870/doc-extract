import type { BackendDocType } from "./types";
import type { DocumentConfig } from "@/features/admin-config/components/ManualDocumentConfig";
import type { DocumentTemplateSummary } from "./types";

// Converts backend document type object to frontend DocumentConfig
export function mapBackendToDocumentConfig(backend: BackendDocType): DocumentConfig {
  return {
    id: backend.id,
    name: backend.document_type_name,
    fields: backend.field_lists.map((f) => ({
      // Remove ID generation here
      id: "", 
      name: f.field_name ?? "",
      type: mapBackendFieldType(f.field_type),
      required: f.is_mandatory ?? false,
      is_deleted: false
    })),
  };
}

// Maps backend field type strings to frontend FieldType
function mapBackendFieldType(
  type: string | undefined
): "text" | "number" | "date" | "currency" {
  switch (type) {
    case "string":
    case "text":
      return "text";
    case "int":
    case "float":
    case "number":
      case "numeric":
      return "number";
    case "date":
      return "date";
    case "currency":
      return "currency";
    default:
      return "text";
  }
}

// Converts backend document type object to a lightweight summary for UI
export function mapBackendToDocumentTemplateSummary(
  backend: BackendDocType
): DocumentTemplateSummary {
  return {
    id: backend.id,
    name: backend.document_type_name,
    fieldCount: backend.field_lists.length,
    status: backend.status,
    createdBy: backend.created_by,
    createdAt: backend.created_at,
    isApproved: backend.is_approved,
    approvedAt: backend.approved_at,
  };
}

// Converts frontend DocumentConfig to backend payload for create/update API
export const mapDocumentConfigToBackend = (config: DocumentConfig) => {
  return {
    document_type_name: config.name,
    detection_keywords: [],
    status: config.status ?? "active",
    // Use the value from the config, fallback to true if not provided
    is_approved: config.is_approved ?? true, 
    field_lists: config.fields.map((f) => ({
      field_name: f.name,
      field_type: f.type === 'number' ? 'numeric' : f.type, // backend expects 'numeric' instead of 'number'
      is_mandatory: f.required,
      is_deleted: f.is_deleted ?? false,
    })),
  };
};
