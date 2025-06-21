"use client";

import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { FileUpload } from "@/components/FileUpload";
import { DocumentList } from "@/components/DocumentList";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Document } from "@/entities/Document";
import { IconUpload, IconHistory, IconFileText } from "@tabler/icons-react";

export default function Page() {
  const [activeTab, setActiveTab] = useState("upload");

  // Handle hash-based navigation
  useEffect(() => {
    const hash = window.location.hash.substring(1);
    if (hash === "history" || hash === "upload") {
      setActiveTab(hash);
    }
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    window.history.replaceState(null, "", `#${value}`);
  };

  const handleDocumentSelect = (document: Document) => {
    console.log("Document selected:", document);
    // TODO: Navigate to document analysis page when available
    // router.push(`/documents/${document.id}`);
  };

  const handleUploadComplete = (result: unknown) => {
    console.log("Upload complete:", result);
    // Switch to history tab to show the uploaded document
    setActiveTab("history");
    window.history.replaceState(null, "", "#history");
  };

  const handleUploadError = (error: unknown) => {
    console.error("Upload error:", error);
    // TODO: Show error toast
  };

  return (
    <ProtectedRoute>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <div className="px-4 lg:px-6">
                  <div className="space-y-6">
                    <BreadcrumbNav
                      items={[
                        { label: "Dashboard", href: "/dashboard" },
                        {
                          label:
                            activeTab === "upload"
                              ? "Upload Document"
                              : "Document History",
                        },
                      ]}
                    />

                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">
                        MediInsight Dashboard
                      </h1>
                      <p className="text-gray-600 mt-2">
                        Upload medical documents and get AI-powered insights to
                        better understand your health.
                      </p>
                    </div>

                    <Tabs
                      value={activeTab}
                      onValueChange={handleTabChange}
                      className="space-y-6"
                    >
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger
                          value="upload"
                          className="flex items-center gap-2"
                        >
                          <IconUpload className="h-4 w-4" />
                          Upload Document
                        </TabsTrigger>
                        <TabsTrigger
                          value="history"
                          className="flex items-center gap-2"
                        >
                          <IconHistory className="h-4 w-4" />
                          Document History
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="upload" className="space-y-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <IconFileText className="h-5 w-5" />
                              Upload Medical Document
                            </CardTitle>
                            <CardDescription>
                              Upload your medical documents (PDFs, images) to
                              receive AI-powered analysis and insights.
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <FileUpload
                              onUploadComplete={handleUploadComplete}
                              onUploadError={handleUploadError}
                            />
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="history" className="space-y-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <IconHistory className="h-5 w-5" />
                              Your Documents
                            </CardTitle>
                            <CardDescription>
                              View and manage your previously uploaded medical
                              documents.
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <DocumentList
                              onDocumentSelect={handleDocumentSelect}
                            />
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
