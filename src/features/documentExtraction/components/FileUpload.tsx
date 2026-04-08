import { useState, useCallback } from "react";
import { Upload, File, X, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onUpload: (file: File) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  acceptedFormats?: string;
  maxSizeMB?: number;
}

const ACCEPTED_FORMATS = ".pdf,.png,.jpg,.jpeg,.gif,.bmp,.tiff,.webp,.eml,.msg";
const MAX_SIZE_MB = 10;

export function FileUpload({
  onFileSelect,
  onUpload,
  isLoading = false,
  error = null,
  acceptedFormats = ACCEPTED_FORMATS,
  maxSizeMB = MAX_SIZE_MB,
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      return `File size exceeds ${maxSizeMB}MB limit`;
    }

    const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;
    const acceptedList = acceptedFormats.split(",");
    if (!acceptedList.some((fmt) => extension === fmt.toLowerCase())) {
      return "Unsupported file format";
    }

    return null;
  };

  const handleFile = useCallback(
    (file: File) => {
      const error = validateFile(file);
      if (error) {
        setValidationError(error);
        setSelectedFile(null);
        return;
      }

      setValidationError(null);
      setSelectedFile(file);
      onFileSelect(file);
    },
    [onFileSelect, maxSizeMB, acceptedFormats]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
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
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setValidationError(null);
  };

  const handleUpload = async () => {
    if (selectedFile) {
      await onUpload(selectedFile);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const displayError = validationError || error;

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-6">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "relative border-2 border-dashed rounded-lg p-8 transition-all duration-200 text-center",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border/50 hover:border-primary/50 hover:bg-muted/30",
            displayError && "border-destructive/50 bg-destructive/5"
          )}
        >
          <input
            type="file"
            accept={acceptedFormats}
            onChange={handleInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isLoading}
          />

          {!selectedFile ? (
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-lg font-medium text-foreground">
                  Drop your document here
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  or click to browse
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-2 py-1 text-xs rounded-md bg-muted text-muted-foreground">
                  PDF
                </span>
                <span className="px-2 py-1 text-xs rounded-md bg-muted text-muted-foreground">
                  PNG
                </span>
                <span className="px-2 py-1 text-xs rounded-md bg-muted text-muted-foreground">
                  JPG
                </span>
                <span className="px-2 py-1 text-xs rounded-md bg-muted text-muted-foreground">
                  TIFF
                </span>
                <span className="px-2 py-1 text-xs rounded-md bg-muted text-muted-foreground">
                  WebP
                </span>
                <span className="px-2 py-1 text-xs rounded-md bg-muted text-muted-foreground">
                  EML
                </span>
                <span className="px-2 py-1 text-xs rounded-md bg-muted text-muted-foreground">
                  MSG
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Max {maxSizeMB}MB • Single page documents only
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <File className="w-6 h-6 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground truncate max-w-[200px]">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile();
                  }}
                  disabled={isLoading}
                  className="ml-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {displayError && (
          <div className="mt-4 flex items-center gap-2 text-destructive text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{displayError}</span>
          </div>
        )}

        {selectedFile && !validationError && (
          <Button
            onClick={handleUpload}
            disabled={isLoading}
            className="w-full mt-4"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing Document...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Extract Document Data
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
