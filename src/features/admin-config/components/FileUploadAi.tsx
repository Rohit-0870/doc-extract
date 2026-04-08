
import { useState, useCallback, useRef } from "react";
import { Upload, FileText, X, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useGenerateAiTemplate } from "../hooks/useGenerateAiTemplate";

interface FileUploadProps {
  onFileProcessed: (fileName: string, suggestedFields: any[]) => void;
  onCancel: () => void;
  onFilesSelected?: (hasFiles: boolean) => void;
  acceptedFormats?: string;
  maxSizeMB?: number;
}

export function FileUpload({
  onFileProcessed,
  onCancel,
  onFilesSelected,
  acceptedFormats = ".pdf,.png,.jpg,.jpeg,.gif,.webp",
  maxSizeMB = 10,
}: FileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // Ref for the input to manage clicks programmatically
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: generateTemplate } = useGenerateAiTemplate();

  const validateFile = (file: File): string | null => {
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) return `File "${file.name}" exceeds ${maxSizeMB}MB`;

    const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;
    if (!acceptedFormats.split(",").some((fmt) => fmt.toLowerCase() === extension))
      return `"${file.name}" is an unsupported format`;

    return null;
  };

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const newFiles = Array.from(files);
      let error: string | null = null;

      for (const file of newFiles) {
        error = validateFile(file);
        if (error) break;
      }

      if (error) {
        setValidationError(error);
        return;
      }

      setValidationError(null);
      setSelectedFiles((prev) => {
        const updated = [...prev, ...newFiles];
        onFilesSelected?.(updated.length > 0);
        return updated;
      });
    },
    [acceptedFormats, maxSizeMB]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => {
      const updatedFiles = prev.filter((_, i) => i !== index);
      onFilesSelected?.(updatedFiles.length > 0);
      return updatedFiles;
    });

    // Reset the input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (selectedFiles.length <= 1) {
      setValidationError(null);
      setProgress(0);
      setProcessing(false);
    }
  };
  
  const handleProcess = () => {
  if (selectedFiles.length === 0) return;

  setProcessing(true);
  setProgress(0);

  let fakeProgress = 0;
  const interval = setInterval(() => {
    fakeProgress += Math.random() * 5; // increment randomly 1-5%
    if (fakeProgress >= 90) fakeProgress = 90; // cap at 90% until backend finishes
    setProgress(fakeProgress);
  }, 300);

  generateTemplate(selectedFiles, {
    onSuccess: (response) => {
      console.log("AI RAW RESPONSE:", response.data?.field_lists); // 👈 ADD THIS
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => {
        const suggestedFields = response.data?.field_lists || [];
        onFileProcessed(selectedFiles[0].name, suggestedFields);
      }, 300);
    },
    onError: (err: any) => {
      clearInterval(interval);
      setProcessing(false);
      setProgress(0);
      setValidationError(err?.message || "AI Analysis failed. Please try again.");
    }
  });
  };

  const formatFileSize = (bytes: number) =>
    bytes < 1024 ? `${bytes} B` : bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

  if (processing) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-center gap-3">
          <div className="relative">
            <Sparkles className="w-8 h-8 text-warning animate-pulse-subtle" />
            <div className="absolute inset-0 w-8 h-8 bg-warning/20 rounded-full animate-ping" />
          </div>
          <div className="text-center">
            <p className="text-lg font-medium text-foreground">
              AI is analyzing document structure...
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Processing {selectedFiles.length} file(s)
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Progress value={Math.min(progress, 100)} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">
            {Math.min(Math.round(progress), 100)}% completed
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "relative border-2 border-dashed rounded-lg p-8 transition-all duration-200 text-center cursor-pointer",
              isDragging
                ? "border-primary bg-primary/10"
                : "border-border/50 hover:border-primary/50 hover:bg-muted/30",
              validationError && "border-destructive/50 bg-destructive/5",
              selectedFiles.length > 0 && "border-primary bg-primary/5"
            )}
          >
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept={acceptedFormats}
              onChange={handleInputChange}
              className="hidden"
            />
            {selectedFiles.length === 0 ? (
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <p className="text-lg font-medium text-foreground">
                  {isDragging ? "Drop your files here" : "Drop files or click to browse"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Supports multiple PDFs and images
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-center gap-3 bg-background/50 p-2 rounded-md border border-border/50 relative z-10">
                    <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(idx);
                      }}
                      className="h-8 w-8"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <p className="text-xs text-primary font-medium">+ Add more files</p>
              </div>
            )}
          </div>

          {validationError && (
            <p className="mt-4 text-destructive text-sm flex items-center gap-2">
              <X className="w-4 h-4" />
              {validationError}
            </p>
          )}
        </CardContent>
      </Card>
      
      {!validationError && (
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button
            onClick={handleProcess}
            disabled={selectedFiles.length === 0}
            className=""
          >
            <Sparkles className="w-4 h-4" /> Analyze with AI
          </Button>
        </div>
      )}
    </>
  );
}