import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  UploadTaskSnapshot,
} from "firebase/storage";
import { storage } from "@/lib/firebase";

import { createStoragePath } from "@/lib/upload.utils";

export interface UploadProgress {
  progress: number;
  bytesTransferred: number;
  totalBytes: number;
}

export interface UploadResult {
  downloadURL: string;
  storagePath: string;
  metadata: {
    size: number;
    contentType: string;
    name: string;
  };
}

export class UploadService {
  /**
   * Upload file to Firebase Storage with progress tracking
   */
  static async uploadFile(
    file: File,
    userId: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    if (!storage) {
      throw new Error("Firebase Storage not initialized");
    }

    const storagePath = createStoragePath(userId, file.name);
    const storageRef = ref(storage, storagePath);

    return new Promise((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot: UploadTaskSnapshot) => {
          // Progress tracking
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

          if (onProgress) {
            onProgress({
              progress,
              bytesTransferred: snapshot.bytesTransferred,
              totalBytes: snapshot.totalBytes,
            });
          }
        },
        (error) => {
          // Handle upload errors
          console.error("Upload error:", error);
          reject(new Error(this.mapFirebaseError(error.code)));
        },
        async () => {
          // Upload completed successfully
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

            resolve({
              downloadURL,
              storagePath,
              metadata: {
                size: file.size,
                contentType: file.type,
                name: file.name,
              },
            });
          } catch {
            reject(new Error("Failed to get download URL"));
          }
        }
      );
    });
  }

  /**
   * Delete file from Firebase Storage
   */
  static async deleteFile(storagePath: string): Promise<void> {
    if (!storage) {
      throw new Error("Firebase Storage not initialized");
    }

    const storageRef = ref(storage, storagePath);

    try {
      await deleteObject(storageRef);
    } catch (error: unknown) {
      // File might not exist, which is okay
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code !== "storage/object-not-found"
      ) {
        throw new Error("Failed to delete file");
      }
    }
  }

  /**
   * Map Firebase error codes to user-friendly messages
   */
  private static mapFirebaseError(errorCode: string): string {
    switch (errorCode) {
      case "storage/unauthorized":
        return "You do not have permission to upload files";
      case "storage/canceled":
        return "Upload was canceled";
      case "storage/quota-exceeded":
        return "Storage quota exceeded";
      case "storage/invalid-format":
        return "Invalid file format";
      case "storage/retry-limit-exceeded":
        return "Upload failed after multiple retries";
      default:
        return "Upload failed. Please try again.";
    }
  }
}
