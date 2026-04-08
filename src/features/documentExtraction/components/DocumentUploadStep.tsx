
import { useState } from "react";
import { FileUpload } from "@/features/documentExtraction/components/FileUpload";
import { DocumentPreview } from "@/features/documentExtraction/components/DocumentPreview";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { OcrType, Document } from "@/features/documentExtraction/documentTypes";

interface DocumentUploadStepProps {
  ocrType: OcrType;
  onSuccess: () => void;
  onBack: () => void;
  onDocumentAdd?: (file: File, ocrType: OcrType) => string; 
}

const DocumentUploadStep = ({
  ocrType,
  onSuccess,
  onBack,
  onDocumentAdd,
}: DocumentUploadStepProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // ✅ async for TS FileUpload type
  const handleUpload = async (file: File): Promise<void> => {
    setSelectedFile(file);

    // Optimistic add (temp row)
    onDocumentAdd?.(file, ocrType);

    // Close modal immediately
    onBack();

    // Optional: you can await backend extraction here if needed
    // await someBackendCall(file);
  };

  const handleReset = () => {
    setSelectedFile(null);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg text-gray-500 pt-6">
        Upload Document ({ocrType === "easy_ocr" ? "Easy OCR" : "Azure DI"})
      </h2>

      <FileUpload
        onFileSelect={setSelectedFile}
        onUpload={handleUpload} 
        isLoading={false}
        error={null}
      />

    </div>
  );
};

export default DocumentUploadStep;
