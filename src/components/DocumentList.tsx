"use client";

import { useState, useEffect } from "react";
import { Document } from "@/entities/Document";
import { useAuth } from "@/components/providers/auth-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  IconFile,
  IconFileText,
  IconCalendar,
  IconFileInfo,
  IconAlertCircle,
  IconCircleCheck,
  IconLoader2,
  IconUpload,
} from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";

interface DocumentListProps {
  onDocumentSelect?: (document: Document) => void;
}

interface DocumentsResponse {
  documents: Document[];
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export function DocumentList({ onDocumentSelect }: DocumentListProps) {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState({
    limit: 20,
    offset: 0,
    hasMore: false,
  });

  const fetchDocuments = async (offset = 0, append = false) => {
    if (!user) return;

    try {
      if (!append) setLoading(true);
      else setLoadingMore(true);

      const token = await user.getIdToken();
      const response = await fetch(
        `/api/documents?limit=${pagination.limit}&offset=${offset}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch documents");
      }

      const data: DocumentsResponse = await response.json();

      if (append) {
        setDocuments((prev) => [...prev, ...data.documents]);
      } else {
        setDocuments(data.documents);
      }

      setPagination(data.pagination);
      setError(null);
    } catch (err) {
      console.error("Error fetching documents:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch documents"
      );
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <IconCircleCheck className="h-4 w-4 text-green-500" />;
      case "processing":
        return <IconLoader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case "failed":
        return <IconAlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <IconFile className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Completed
          </Badge>
        );
      case "processing":
        return (
          <Badge variant="default" className="bg-blue-100 text-blue-800">
            Processing
          </Badge>
        );
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      case "uploaded":
        return <Badge variant="secondary">Uploaded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleLoadMore = () => {
    fetchDocuments(pagination.offset + pagination.limit, true);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-6 w-20" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-3 w-1/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <IconAlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <div>
              <h3 className="font-semibold text-red-900">
                Error Loading Documents
              </h3>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
            <Button onClick={() => fetchDocuments()} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <IconUpload className="h-12 w-12 text-gray-400 mx-auto" />
            <div>
              <h3 className="font-semibold text-gray-900">No Documents Yet</h3>
              <p className="text-sm text-gray-500 mt-1">
                Upload your first medical document to get started with AI
                analysis.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {documents.map((document) => (
        <Card
          key={document.id}
          className="cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => onDocumentSelect?.(document)}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <IconFileText className="h-5 w-5 text-blue-500" />
                {document.originalFileName}
              </CardTitle>
              {getStatusBadge(document.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <IconCalendar className="h-4 w-4" />
                <span>
                  {formatDistanceToNow(new Date(document.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <IconFileInfo className="h-4 w-4" />
                <span>{formatFileSize(Number(document.fileSizeBytes))}</span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(document.status)}
                <span className="capitalize">{document.status}</span>
              </div>
            </div>
            {document.status === "failed" && document.errorMessage && (
              <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">{document.errorMessage}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {pagination.hasMore && (
        <div className="text-center mt-6">
          <Button
            onClick={handleLoadMore}
            disabled={loadingMore}
            variant="outline"
          >
            {loadingMore ? (
              <>
                <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading More...
              </>
            ) : (
              "Load More Documents"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
