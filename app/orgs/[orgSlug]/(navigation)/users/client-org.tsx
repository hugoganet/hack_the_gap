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
  Loader2 
} from "lucide-react";
import { useCurrentOrg } from "../../use-current-org";
import { cn } from "@/lib/utils";
import { processContent } from "@app/actions/process-content.action";
import { toast } from "sonner";

export const ClientOrg = () => {
  const org = useCurrentOrg();
  const [dragActive, setDragActive] = useState(false);
  const [url, setUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!org) {
    return (
      <Card>
        <CardHeader>No orgy</CardHeader>
      </Card>
    );
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      // Handle file drop
      const file = files[0];
      console.log("File dropped:", file.name);
      // TODO: Handle file upload
    } else if (e.dataTransfer.getData("text")) {
      // Handle URL drop
      const droppedUrl = e.dataTransfer.getData("text");
      setUrl(droppedUrl);
    }
  };

  const handleProcess = async () => {
    if (!url.trim()) return;
    
    setIsProcessing(true);
    
    try {
      const result = await processContent(url);
      
      if (result.success) {
        const message = "message" in result ? result.message : "Content processed successfully!";
        toast.success(message);
        setUrl("");
      } else {
        const error = "error" in result ? result.error : "Failed to process content";
        toast.error(error);
      }
    } catch (error) {
      console.error("Error processing content:", error);
      toast.error("An unexpected error occurred. Please try again.");
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="size-5" />
          Content Inbox
        </CardTitle>
        <CardDescription>
          Drop a URL or file to process content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drag and Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={cn(
            "relative flex min-h-[160px] flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all",
            dragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50",
          )}
        >
          <div className="flex flex-col items-center gap-2 text-center p-6">
            <div
              className={cn(
                "rounded-full p-3 transition-colors",
                dragActive ? "bg-primary/10" : "bg-muted",
              )}
            >
              <Upload
                className={cn(
                  "size-6 transition-colors",
                  dragActive ? "text-primary" : "text-muted-foreground",
                )}
              />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {dragActive ? "Drop here" : "Drag & drop content"}
              </p>
              <p className="text-xs text-muted-foreground">
                YouTube, TikTok, articles, or PDF files
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
                placeholder="Or paste a URL here..."
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
                  Processing
                </>
              ) : (
                "Process"
              )}
            </Button>
          </div>
          
          {/* Supported Content Types */}
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Video className="size-3 text-red-500" />
              <span>YouTube</span>
            </div>
            <div className="flex items-center gap-1">
              <Video className="size-3 text-cyan-500" />
              <span>TikTok</span>
            </div>
            <div className="flex items-center gap-1">
              <Link2 className="size-3 text-primary" />
              <span>Articles</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="size-3 text-orange-500" />
              <span>PDFs</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
