"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Upload, 
  Link2, 
  Video, 
  FileText, 
  Loader2,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { processContent } from "@app/actions/process-content.action";
import { processUploadedPDF } from "@app/actions/process-uploaded-pdf.action";
import { matchConceptsAction } from "@app/actions/match-concepts.action";
import { toast } from "sonner";
import { MatchResultsDialog, type MatchResultsData } from "./match-results-dialog";
import { useLocale, useTranslations } from "next-intl";

export const ClientOrg = () => {
  const locale = useLocale();
  const t = useTranslations("dashboard.users.inbox");
  const [dragActive, setDragActive] = useState(false);
  const [url, setUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [matchResults, setMatchResults] = useState<MatchResultsData | null>(null);
  const [showMatchDialog, setShowMatchDialog] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);


  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      // Handle file drop
      const file = files[0];
      await handleFileUpload(file);
    } else if (e.dataTransfer.getData("text")) {
      // Handle URL drop
      const droppedUrl = e.dataTransfer.getData("text");
      setUrl(droppedUrl);
    }
  };

  const handleFileUpload = async (file: File) => {
    // Validate file type
    if (!file.type.includes("pdf")) {
      toast.error("Only PDF files are supported");
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setIsProcessing(true);
    setUploadProgress("Uploading PDF...");

    try {
      // Upload PDF to extract text
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/upload-pdf", {
        method: "POST",
        body: formData,
      });

      const uploadResult = await uploadResponse.json();

      if (!uploadResult.success) {
        toast.error(uploadResult.error ?? "Failed to upload PDF");
        return;
      }

      setUploadProgress("Extracting concepts...");

      // Process the extracted PDF data
      const result = await processUploadedPDF({
        fileName: uploadResult.data.fileName,
        fileSize: uploadResult.data.fileSize,
        pageCount: uploadResult.data.metadata.pageCount,
        extractedText: uploadResult.data.extractedText,
      });

      if (result.success) {
        const concepts = result.data?.processedConceptsCount ?? 0;

        toast.success(t("toast.successTitle"), {
          description: `Processed ${uploadResult.data.metadata.pageCount} pages • Extracted ${concepts} concepts`,
          duration: 3000,
        });

        // Show match results if available
        if (result.data && concepts > 0) {
          const data = result.data;

          if (typeof data === "object" && "matchData" in data && data.matchData) {
            setTimeout(() => {
              setMatchResults(data.matchData as MatchResultsData);
              setShowMatchDialog(true);
            }, 500);
          }
        }
      } else {
        toast.error(result.error ?? t("toast.processFailed"));
      }
    } catch (error) {
      console.error("Error uploading PDF:", error);
      toast.error(t("toast.unexpected"));
    } finally {
      setIsProcessing(false);
      setUploadProgress(null);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileUpload(file);
    }
  };

  const handleProcess = async () => {
    if (!url.trim()) return;
    
    setIsProcessing(true);
    
    try {
      // Step 1: Process content and extract concepts
      const result = await processContent(url);
      
      if (result.success) {
        const concepts = result.data?.processedConceptsCount ?? 0;
        
        // Show success toast
        toast.success(t("toast.successTitle"), {
          description: t("toast.successDesc", { count: concepts }),
          duration: 3000,
        });
        
        // Step 2: Get match results from the processing (matching happens in process-content.action)
        if (result.data && concepts > 0) {
          const data = result.data;
          
          // If we have match data, show the celebration dialog
          if (typeof data === "object" && "matchData" in data && data.matchData) {
            setTimeout(() => {
              setMatchResults(data.matchData as MatchResultsData);
              setShowMatchDialog(true);
            }, 500);
          }
        }
        
        setUrl("");
      } else {
        const error = "error" in result ? result.error : undefined;
        toast.error(error ?? t("toast.processFailed"));
      }
    } catch (error) {
      console.error("Error processing content:", error);
      toast.error(t("toast.unexpected"));
    } finally {
      setIsProcessing(false);
    }
  };

  const getContentTypeIcon = () => {
    if (!url) return null;
    
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be")) {
      return <Video className="size-4 text-red-500" />;
    }
    if (lowerUrl.includes("tiktok.com")) {
      return <Video className="size-4 text-cyan-500" />;
    }
    if (lowerUrl.endsWith(".pdf")) {
      return <FileText className="size-4 text-orange-500" />;
    }
    return <Link2 className="size-4 text-primary" />;
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="size-5" />
            {t("title")}
          </CardTitle>
          <CardDescription>
            {t("description")}
          </CardDescription>
        </CardHeader>
      <CardContent className="space-y-4">
        {/* Drag and Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById("file-upload")?.click()}
          className={cn(
            "relative flex min-h-[160px] flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all cursor-pointer",
            dragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50",
            isProcessing && "opacity-50 cursor-not-allowed"
          )}
        >
          <input
            id="file-upload"
            type="file"
            accept=".pdf"
            onChange={handleFileInputChange}
            disabled={isProcessing}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-2 text-center p-6">
            <div
              className={cn(
                "rounded-full p-3 transition-colors",
                dragActive ? "bg-primary/10" : "bg-muted",
              )}
            >
              {isProcessing ? (
                <Loader2 className="size-6 animate-spin text-primary" />
              ) : (
                <Upload
                  className={cn(
                    "size-6 transition-colors",
                    dragActive ? "text-primary" : "text-muted-foreground",
                  )}
                />
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {uploadProgress || (dragActive ? t("drag.dropHere") : t("drag.dragDrop"))}
              </p>
              <p className="text-xs text-muted-foreground">
                {!isProcessing && t("drag.supported")}
              </p>
            </div>
          </div>
        </div>

        {/* URL Input */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type="url"
                placeholder={t("input.placeholder")}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isProcessing) {
                    void handleProcess();
                  }
                }}
                className="pr-8"
                disabled={isProcessing}
              />
              {url && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  {getContentTypeIcon()}
                </div>
              )}
            </div>
            <Button
              onClick={handleProcess}
              disabled={!url.trim() || isProcessing}
              className="min-w-[100px]"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {t("button.processing")}
                </>
              ) : (
                t("button.process")
              )}
            </Button>
          </div>
          
          {/* Supported Content Types */}
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Video className="size-3 text-red-500" />
              <span>{t("types.youtube")}</span>
            </div>
            <div className="flex items-center gap-1">
              <Video className="size-3 text-cyan-500" />
              <span>{t("types.tiktok")}</span>
            </div>
            <div className="flex items-center gap-1">
              <Link2 className="size-3 text-primary" />
              <span>{t("types.articles")}</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="size-3 text-orange-500" />
              <span>{t("types.pdfs")}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <MatchResultsDialog
      open={showMatchDialog}
      onOpenChange={setShowMatchDialog}
      data={matchResults}
    />
    </>
  );
};
