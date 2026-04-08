
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { OcrType, Document } from "@/features/documentExtraction/documentTypes";
import DocumentUploadStep from "./DocumentUploadStep";

interface Props {
  open: boolean;
  ocrType: OcrType;
  onClose: () => void;
  onSuccess?: () => void; // optional now
  onDocumentAdd: (file: File, ocrType: OcrType) => string;
}


const DocumentAnalyzeFlow = ({ open, ocrType, onClose, onSuccess, onDocumentAdd, }: Props) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Analyze Document</DialogTitle>
        </DialogHeader>

        <DocumentUploadStep
          ocrType={ocrType}
          onBack={onClose}
          onSuccess={onSuccess}
          onDocumentAdd={onDocumentAdd}
        />
      </DialogContent>
    </Dialog>
  );
};

export default DocumentAnalyzeFlow;

