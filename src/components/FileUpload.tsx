"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, AlertCircle, CheckCircle, X } from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Progress } from "./ui/progress";
import { UploadService } from "@/services/upload.service";
import {
  validateFiles,
  formatFileSize,
  createUploadFile,
} from "@/lib/upload.utils";
import { UploadFile, UPLOAD_CONFIG } from "@/types/upload.types";

interface FileUploadProps {
  onUploadComplete?: (result: {
    downloadURL: string;
    storagePath: string;
    fileName: string;
  }) => void;
  onUploadError?: (error: string) => void;
  disabled?: boolean;
}

export function FileUpload({
  onUploadComplete,
  onUploadError,
  disabled = false,
}: FileUploadProps) {
  const [user] = useAuthState(auth!);
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
    },
    [disabled]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;

      const files = e.target.files ? Array.from(e.target.files) : [];
      handleFiles(files);

      // Reset input
      e.target.value = "";
    },
    [disabled]
  );

  const handleFiles = useCallback(
    (files: File[]) => {
      if (!user) {
        onUploadError?.("Please sign in to upload files");
        return;
      }

      // Validate files
      const validationError = validateFiles(files);
      if (validationError) {
        onUploadError?.(validationError.message);
        return;
      }

      // Create upload files
      const newUploadFiles = files.map(createUploadFile);
      setUploadFiles(newUploadFiles);

      // Start uploads
      newUploadFiles.forEach((uploadFile) => {
        startUpload(uploadFile);
      });
    },
    [user, onUploadError]
  );

  const startUpload = async (uploadFile: UploadFile) => {
    if (!user) return;

    try {
      // Update status to uploading
      setUploadFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id ? { ...f, status: "uploading" } : f
        )
      );

      const result = await UploadService.uploadFile(
        uploadFile.file,
        user.uid,
        (progress) => {
          setUploadFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id ? { ...f, progress: progress.progress } : f
            )
          );
        }
      );

      // Update status to success
      setUploadFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id
            ? {
                ...f,
                status: "success",
                progress: 100,
                downloadURL: result.downloadURL,
                storagePath: result.storagePath,
              }
            : f
        )
      );

      onUploadComplete?.({
        downloadURL: result.downloadURL,
        storagePath: result.storagePath,
        fileName: result.metadata.name,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Upload failed";

      // Update status to error
      setUploadFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id
            ? { ...f, status: "error", error: errorMessage }
            : f
        )
      );

      onUploadError?.(errorMessage);
    }
  };

  const removeFile = (fileId: string) => {
    setUploadFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const getAcceptedFileTypes = () => {
    return UPLOAD_CONFIG.allowedTypes.join(",");
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Medical Document
          </CardTitle>
          <CardDescription>
            Upload your medical document (PDF, JPG, or PNG) for AI analysis.
            Maximum file size: {formatFileSize(UPLOAD_CONFIG.maxSize)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`
              relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${isDragOver ? "border-primary bg-primary/5" : "border-border"}
              ${
                disabled
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer hover:border-primary/50"
              }
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() =>
              !disabled && document.getElementById("file-input")?.click()
            }
          >
            <input
              id="file-input"
              type="file"
              accept={getAcceptedFileTypes()}
              onChange={handleFileSelect}
              className="hidden"
              disabled={disabled}
            />

            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">
                  {isDragOver
                    ? "Drop your file here"
                    : "Drag and drop your file here"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  or <span className="text-primary">click to browse</span>
                </p>
              </div>
              <div className="text-xs text-muted-foreground">
                Supports: PDF, JPG, PNG • Max size:{" "}
                {formatFileSize(UPLOAD_CONFIG.maxSize)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {uploadFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {uploadFiles.map((uploadFile) => (
              <div key={uploadFile.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm font-medium truncate">
                      {uploadFile.file.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(uploadFile.file.size)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {uploadFile.status === "uploading" && (
                      <span className="text-xs text-muted-foreground">
                        {Math.round(uploadFile.progress)}%
                      </span>
                    )}
                    {uploadFile.status === "success" && (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                    {uploadFile.status === "error" && (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(uploadFile.id)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {uploadFile.status === "uploading" && (
                  <Progress value={uploadFile.progress} className="h-1" />
                )}

                {uploadFile.status === "error" && uploadFile.error && (
                  <p className="text-xs text-red-600">{uploadFile.error}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
