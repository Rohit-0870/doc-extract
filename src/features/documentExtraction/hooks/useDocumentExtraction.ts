import { useState } from "react";
import { DocumentExtractionResponse } from "@/features/documentExtraction/documentTypes";

const API_BASE_URL = import.meta.env.VITE_GATEWAY_BASE_URL;

interface UseDocumentExtractionReturn {
  extractDocument: (file: File) => Promise<void>;
  result: DocumentExtractionResponse | null;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

export function useDocumentExtraction(): UseDocumentExtractionReturn {
  const [result, setResult] = useState<DocumentExtractionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractDocument = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error: ${response.status}`);
      }

      const data: DocumentExtractionResponse = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || "Extraction failed");
      }

      setResult(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to extract document";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setIsLoading(false);
  };

  return {
    extractDocument,
    result,
    isLoading,
    error,
    reset,
  };
}
