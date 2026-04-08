
import React, { useState, useMemo } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useDocumentDetails } from "@/features/documentExtraction/hooks/useDocumentDetails";
import { DocumentPreview } from "@/features/documentExtraction/components/DocumentPreview";
import { DocumentExtractionViewer } from "@/features/documentExtraction/components/DocumentExtractionViewer";
import { mapApiDataToFrontend } from "@/features/documentExtraction/documentDetailsMapper";
import { Button } from "@/components/ui/button";

interface Props {
  documentId: string;
  onBack: () => void;
}

const DocumentDetailsView: React.FC<Props> = ({ documentId, onBack }) => {
  const { data, isLoading, error } = useDocumentDetails(documentId);
  const [hoveredField, setHoveredField] = useState<string | null>(null);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [scrollToken, setScrollToken] = useState(0);

  // Clean implementation using our utility
  const mappedData = useMemo(() => (data ? mapApiDataToFrontend(data) : null), [data]);

  const handleFieldClick = (fieldName: string) => {
    setActiveField(fieldName);
    setScrollToken((prev) => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !mappedData) {
    return <div className="p-10 text-destructive text-center font-medium">Document not found or error loading details.</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4">
        <div className="flex items-center gap-3 mb-4">
          <Button onClick={onBack} variant="ghost" className="flex items-center gap-2 text-sm">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold truncate">{mappedData.filename}</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-0">
          <div className="space-y-6">
            <DocumentExtractionViewer data={mappedData} onHoverFieldChange={setHoveredField} onFieldClick={handleFieldClick} />
          </div>
          <div className="lg:sticky lg:top-8 h-fit">
            <DocumentPreview
              file={data?.blob_url ?? undefined}
              extraction={mappedData}
              hoveredFieldName={hoveredField}
              activeFieldName={activeField}
              scrollToken={scrollToken}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentDetailsView;
