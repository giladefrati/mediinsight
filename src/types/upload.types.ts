export interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
  downloadURL?: string;
  storagePath?: string;
}

export interface UploadValidation {
  maxSize: number; // in bytes
  allowedTypes: string[];
  maxFiles: number;
}

export interface UploadError {
  code: string;
  message: string;
  file?: string;
}

export const UPLOAD_CONFIG: UploadValidation = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ["application/pdf", "image/jpeg", "image/png", "image/jpg"],
  maxFiles: 1,
};

export const UPLOAD_ERRORS = {
  FILE_TOO_LARGE: "File size exceeds 10MB limit",
  INVALID_TYPE: "Only PDF, JPG, and PNG files are allowed",
  TOO_MANY_FILES: "Please upload one file at a time",
  UPLOAD_FAILED: "Upload failed. Please try again.",
  NETWORK_ERROR: "Network error. Please check your connection.",
} as const;
