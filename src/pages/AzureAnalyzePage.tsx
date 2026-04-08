import { useState } from "react";
import { FileUpload } from "@/features/documentExtraction/components/FileUpload";
import { DocumentExtractionViewer } from "@/features/documentExtraction/components/DocumentExtractionViewer";
import { DocumentPreview } from "@/features/documentExtraction/components/DocumentPreview";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useAzureDocumentExtraction } from "@/features/documentExtraction/hooks/useAzureDocumentExtraction";

const AzureAnalyzePage = () => {
  const { extractDocumentAzure, result, isLoading, error, reset } =
    useAzureDocumentExtraction();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // ✅ hover highlight
  const [hoveredFieldName, setHoveredFieldName] = useState<string | null>(null);

  // ✅ click focus + scroll
  const [activeFieldName, setActiveFieldName] = useState<string | null>(null);
  const [scrollToken, setScrollToken] = useState(0);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleUpload = async (file: File) => {
    await extractDocumentAzure(file);
  };

  const handleReset = () => {
    reset();
    setSelectedFile(null);
    setHoveredFieldName(null);
    setActiveFieldName(null);
    setScrollToken(0);
  };

  const handleFieldClick = (fieldName: string) => {
    setActiveFieldName(fieldName);
    setScrollToken((t) => t + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl py-8 px-4">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Azure Document Extraction
          </h1>
          <p className="text-muted-foreground">
            Upload a document to extract and validate its data using Azure
          </p>
        </header>

        {!result ? (
          <div className="max-w-xl mx-auto">
            <FileUpload
              onFileSelect={handleFileSelect}
              onUpload={handleUpload}
              isLoading={isLoading}
              error={error}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={handleReset} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Upload Another Document
              </Button>
              <span className="text-sm text-muted-foreground">
                {result.filename} • {(result.file_size_bytes / 1024).toFixed(1)} KB
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <DocumentExtractionViewer
                  data={result}
                  onHoverFieldChange={setHoveredFieldName}
                  onFieldClick={handleFieldClick}
                />
              </div>

              <div className="lg:sticky lg:top-8 h-fit">
                <DocumentPreview
                  file={selectedFile}
                  extraction={result}
                  hoveredFieldName={hoveredFieldName}
                  activeFieldName={activeFieldName}
                  scrollToken={scrollToken}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AzureAnalyzePage;
