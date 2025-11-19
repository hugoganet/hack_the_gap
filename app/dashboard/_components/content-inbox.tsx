"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { processContent } from "@app/actions/process-content.action";
import { processUploadedPDF } from "@app/actions/process-uploaded-pdf.action";
import { toast } from "sonner";
import { MatchResultsDialog, type MatchResultsData } from "../users/match-results-dialog";
import { CreateCourseDialog } from "@app/dashboard/courses/_components/create-course-dialog";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { ProcessingProgress } from "./processing-progress";
import { ContentPreviewCard, type ContentMetadata } from "./content-preview-card";
import { fetchYouTubeMetadata } from "@/lib/youtube-utils";
import {
  loadProcessingState,
  clearProcessingState,
  saveProcessingState,
} from "@/lib/processing-storage";

type ContentInboxProps = {
  showNoConcepts?: boolean;
};

export function ContentInbox({ showNoConcepts }: ContentInboxProps) {
  const router = useRouter();
  const t = useTranslations("dashboard.learn.inbox");
  const [dragActive, setDragActive] = useState(false);
  const [url, setUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [matchResults, setMatchResults] = useState<MatchResultsData | null>(null);
  const [showMatchDialog, setShowMatchDialog] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [contentMetadata, setContentMetadata] = useState<ContentMetadata | null>(null);
  const [processingUrl, setProcessingUrl] = useState<string>("");
  const [isApiComplete, setIsApiComplete] = useState(false);

  // Restore processing state on mount
  useEffect(() => {
    const savedState = loadProcessingState();
    if (savedState) {
      setIsProcessing(true);
      setProcessingUrl(savedState.url);
      setContentMetadata({
        type: savedState.contentType,
        title: savedState.contentName,
        subtitle: savedState.metadata?.subtitle,
        thumbnail: savedState.metadata?.thumbnail,
      });
    }
  }, []);


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
      const file = files[0];
      await handleFileUpload(file);
    } else if (e.dataTransfer.getData("text")) {
      const droppedUrl = e.dataTransfer.getData("text");
      setUrl(droppedUrl);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.includes("pdf")) {
      toast.error(t("toast.onlyPdf"));
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(t("toast.fileTooLarge"));
      return;
    }

    setIsProcessing(true);
    setUploadProgress(t("toast.uploadingPdf"));

    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/upload-pdf", {
        method: "POST",
        body: formData,
      });

      const uploadResult = await uploadResponse.json();

      if (!uploadResult.success) {
        toast.error(uploadResult.error ?? t("toast.uploadFailed"));
        setIsProcessing(false);
        setUploadProgress(null);
        return;
      }

      // Set PDF metadata for preview
      const pdfMetadata: ContentMetadata = {
        type: "pdf",
        title: uploadResult.data.fileName,
        subtitle: `${uploadResult.data.metadata.pageCount} pages • ${(uploadResult.data.fileSize / 1024 / 1024).toFixed(1)} MB`,
      };
      
      setContentMetadata(pdfMetadata);
      setProcessingUrl(uploadResult.data.fileName);
      setUploadProgress(null);
      
      // Save initial state
      saveProcessingState({
        contentName: pdfMetadata.title,
        contentType: "pdf",
        currentPhaseIndex: 0,
        progress: 0,
        startedAt: Date.now(),
        url: uploadResult.data.fileName,
        metadata: {
          subtitle: pdfMetadata.subtitle,
        },
      });

      const result = await processUploadedPDF({
        fileName: uploadResult.data.fileName,
        fileSize: uploadResult.data.fileSize,
        pageCount: uploadResult.data.metadata.pageCount,
        extractedText: uploadResult.data.extractedText,
      });

      // Signal that API is complete
      setIsApiComplete(true);

      if (result.success) {
        const concepts = result.data?.processedConceptsCount ?? 0;

        toast.success(t("toast.successTitle"), {
          description: t("toast.pdfProcessedDesc", {
            pages: uploadResult.data.metadata.pageCount,
            count: concepts,
          }),
          duration: 3000,
        });

        if (result.data && concepts > 0) {
          const data = result.data;

          if (typeof data === "object" && "matchData" in data && data.matchData) {
            setTimeout(() => {
              setMatchResults(data.matchData as MatchResultsData);
              setShowMatchDialog(true);
            }, 500);
          }
        }
        
        // Clear processing state after successful completion
        setTimeout(() => {
          clearProcessingState();
        }, 1000);
      } else {
        toast.error(result.error ?? t("toast.processFailed"));
        clearProcessingState();
      }
    } catch (error) {
      console.error("Error uploading PDF:", error);
      toast.error(t("toast.unexpected"));
      clearProcessingState();
    } finally {
      setIsProcessing(false);
      setUploadProgress(null);
      setContentMetadata(null);
      setProcessingUrl("");
      setIsApiComplete(false);
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
    
    const trimmedUrl = url.trim();
    setProcessingUrl(trimmedUrl);
    setIsProcessing(true);
    
    // Detect content type and fetch metadata
    let metadata: ContentMetadata | null = null;
    const lowerUrl = trimmedUrl.toLowerCase();
    
    if (lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be")) {
      // Fetch YouTube metadata
      const ytMetadata = await fetchYouTubeMetadata(trimmedUrl);
      if (ytMetadata) {
        metadata = {
          type: "youtube",
          title: ytMetadata.title,
          subtitle: ytMetadata.author_name,
          thumbnail: ytMetadata.thumbnail_url,
        };
      } else {
        // Fallback if oEmbed fails
        metadata = {
          type: "youtube",
          title: "YouTube Video",
          subtitle: trimmedUrl,
        };
      }
    } else if (lowerUrl.includes("tiktok.com")) {
      metadata = {
        type: "tiktok",
        title: "TikTok Video",
        subtitle: trimmedUrl,
      };
    } else {
      metadata = {
        type: "youtube", // Default fallback
        title: "Content",
        subtitle: trimmedUrl,
      };
    }
    
    setContentMetadata(metadata);
    
    // Save initial state
    saveProcessingState({
      contentName: metadata.title,
      contentType: metadata.type,
      currentPhaseIndex: 0,
      progress: 0,
      startedAt: Date.now(),
      url: trimmedUrl,
      metadata: {
        subtitle: metadata.subtitle,
        thumbnail: metadata.thumbnail,
      },
    });
    
    try {
      const result = await processContent(trimmedUrl);
      
      // Signal that API is complete
      setIsApiComplete(true);
      
      if (result.success) {
        const concepts = result.data?.processedConceptsCount ?? 0;
        
        toast.success(t("toast.successTitle"), {
          description: t("toast.successDesc", { count: concepts }),
          duration: 3000,
        });
        
        if (result.data && concepts > 0) {
          const data = result.data;
          
          if (typeof data === "object" && "matchData" in data && data.matchData) {
            setTimeout(() => {
              setMatchResults(data.matchData as MatchResultsData);
              setShowMatchDialog(true);
            }, 500);
          }
        }
        
        setUrl("");
        
        // Clear processing state after successful completion
        setTimeout(() => {
          clearProcessingState();
        }, 1000);
      } else {
        const error = "error" in result ? result.error : undefined;
        toast.error(error ?? t("toast.processFailed"));
        clearProcessingState();
      }
    } catch (error) {
      console.error("Error processing content:", error);
      toast.error(t("toast.unexpected"));
      clearProcessingState();
    } finally {
      setIsProcessing(false);
      setContentMetadata(null);
      setProcessingUrl("");
      setIsApiComplete(false);
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
      {/* Show processing progress if active */}
      {isProcessing && contentMetadata ? (
        <div className="space-y-4">
          <ContentPreviewCard metadata={contentMetadata} />
          <ProcessingProgress
            contentName={contentMetadata.title}
            contentType={contentMetadata.type}
            url={processingUrl}
            isProcessingComplete={isApiComplete}
            onComplete={() => {
              // Processing complete - components will be hidden by state update
              clearProcessingState();
            }}
          />
        </div>
      ) : (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="size-5" />
              {t("title")}
            </CardTitle>
            <CardDescription>
              {t("description")}
            </CardDescription>
            {showNoConcepts && (
              <div className="mt-3 rounded-md border bg-muted/50 p-3 text-xs sm:text-sm flex flex-col gap-2">
                <p className="text-muted-foreground leading-relaxed">
                  {t("noConcepts.message")}
                </p>
                <div>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setCreateDialogOpen(true)}
                  >
                    {t("noConcepts.cta")}
                  </Button>
                </div>
              </div>
            )}
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
                {uploadProgress ?? (dragActive ? t("drag.dropHere") : t("drag.dragDrop"))}
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
      )}

    <MatchResultsDialog
      open={showMatchDialog}
      onOpenChange={(open) => {
        setShowMatchDialog(open);
        if (!open) {
          router.refresh();
        }
      }}
      data={matchResults}
      onFlashcardUnlocked={() => {
        router.refresh();
      }}
    />
    <CreateCourseDialog
      open={createDialogOpen}
      onOpenChange={setCreateDialogOpen}
    />
    </>
  );
}
