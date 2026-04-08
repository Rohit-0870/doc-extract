import { useState } from "react";
import { FileUpload } from "@/features/documentExtraction/components/FileUpload";
import { DocumentExtractionViewer } from "@/features/documentExtraction/components/DocumentExtractionViewer";
import { DocumentPreview } from "@/features/documentExtraction/components/DocumentPreview";
import { useDocumentExtraction } from "@/features/documentExtraction/hooks/useDocumentExtraction";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { NavLink } from "@/components/NavLink";

const Index = () => {
  const { extractDocument, result, isLoading, error, reset } = useDocumentExtraction();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleUpload = async (file: File) => {
    await extractDocument(file);
  };

  const handleReset = () => {
    reset();
    setSelectedFile(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl py-8 px-4">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Document Extraction
          </h1>
          <p className="text-muted-foreground">
            Upload a document to extract and validate its data
          </p>

        <div className="mb-6 flex justify-center gap-4">
          <NavLink
            to="/analyze-azure"
            className="px-4 py-2 rounded bg-blue-100 text-blue-800 hover:bg-blue-200"
            activeClassName="font-bold underline"
          >
            Try Azure Analyze
          </NavLink>
        </div>
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
            
            {/* Two-column layout: Extracted values left, Document preview right */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <DocumentExtractionViewer data={result} />
              </div>
              <div className="lg:sticky lg:top-8 h-fit">
                <DocumentPreview file={selectedFile} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
