import { useCallback, useState } from "react";
import { Upload, File, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Box, Typography } from "@mui/material";

interface CertificateFileUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  disabled?: boolean;
}

const ALLOWED_FILE_TYPE = "application/pdf";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function CertificateFileUpload({
  onFileSelect,
  selectedFile,
  disabled = false,
}: CertificateFileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (file.type !== ALLOWED_FILE_TYPE) {
      return "Apenas arquivos PDF são permitidos";
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return "Arquivo muito grande. Máximo permitido: 10MB";
    }
    
    return null;
  }, []);

  const handleFileSelection = useCallback((file: File) => {
    const validationError = validateFile(file);
    
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setError(null);
    onFileSelect(file);
  }, [validateFile, onFileSelect]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  }, [disabled, handleFileSelection]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  }, [handleFileSelection]);

  const removeFile = useCallback(() => {
    setError(null);
    onFileSelect(null);
  }, [onFileSelect]);

  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }, []);

  return (
    <Box className="w-full space-y-4">
      {!selectedFile ? (
        <Box
          className={cn(
            "border-2 border-dashed rounded-xl p-8 text-center transition-colors",
            dragActive ? "border-sky-500 bg-sky-50" : "border-gray-300",
            disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-sky-400 hover:bg-sky-50",
            error && "border-red-300 bg-red-50"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !disabled && document.getElementById("file-input")?.click()}
        >
          <input
            id="file-input"
            type="file"
            accept=".pdf"
            onChange={handleFileInput}
            className="hidden"
            disabled={disabled}
          />
          
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <Typography variant="h6" className="text-lg font-medium text-gray-900 mb-2">
            Upload do Certificado
          </Typography>
          <Typography variant="body2" className="text-sm text-gray-600 mb-4">
            Arraste e solte seu arquivo PDF aqui ou clique para selecionar
          </Typography>
          <Typography variant="caption" className="text-xs text-gray-500">
            Apenas arquivos PDF • Máximo 10MB
          </Typography>
        </Box>
      ) : (
        <Box className="border rounded-xl p-4 bg-green-50 border-green-200">
          <Box className="flex items-center justify-between">
            <Box className="flex items-center space-x-3">
              <File className="h-8 w-8 text-green-600" />
              <Box>
                <Typography variant="body1" className="font-medium text-green-900">
                  {selectedFile.name}
                </Typography>
                <Typography variant="body2" className="text-sm text-green-700">
                  {formatFileSize(selectedFile.size)}
                </Typography>
              </Box>
            </Box>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeFile}
              disabled={disabled}
              className="text-red-600 hover:text-red-800 hover:bg-red-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </Box>
        </Box>
      )}
      
      {error && (
        <Box className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        </Box>
      )}
    </Box>
  );
} 
 
 