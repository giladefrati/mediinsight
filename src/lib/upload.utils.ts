import {
  UPLOAD_CONFIG,
  UPLOAD_ERRORS,
  UploadError,
  UploadFile,
} from "@/types/upload.types";

/**
 * Validates a file against upload requirements
 */
export function validateFile(file: File): UploadError | null {
  // Check file size
  if (file.size > UPLOAD_CONFIG.maxSize) {
    return {
      code: "FILE_TOO_LARGE",
      message: UPLOAD_ERRORS.FILE_TOO_LARGE,
      file: file.name,
    };
  }

  // Check file type
  if (!UPLOAD_CONFIG.allowedTypes.includes(file.type)) {
    return {
      code: "INVALID_TYPE",
      message: UPLOAD_ERRORS.INVALID_TYPE,
      file: file.name,
    };
  }

  return null;
}

/**
 * Validates multiple files
 */
export function validateFiles(files: File[]): UploadError | null {
  if (files.length > UPLOAD_CONFIG.maxFiles) {
    return {
      code: "TOO_MANY_FILES",
      message: UPLOAD_ERRORS.TOO_MANY_FILES,
    };
  }

  for (const file of files) {
    const error = validateFile(file);
    if (error) return error;
  }

  return null;
}

/**
 * Formats file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Generates a unique file path for Firebase Storage
 */
export function createStoragePath(userId: string, fileName: string): string {
  const timestamp = Date.now();
  const cleanName = fileName.replace(/[^a-zA-Z0-9._-]/g, "");
  return `documents/${userId}/${timestamp}_${cleanName}`;
}

/**
 * Creates UploadFile object from File
 */
export function createUploadFile(file: File): UploadFile {
  return {
    id: crypto.randomUUID(),
    file,
    progress: 0,
    status: "pending",
  };
}
