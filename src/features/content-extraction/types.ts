import type { ContentType } from "@/generated/prisma";

/**
 * Base result type for all content extractors
 */
export type ExtractionResult = {
  success: boolean;
  error?: string;
  data?: {
    extractedText: string;
    metadata: Record<string, unknown>;
  };
};

/**
 * Video extraction result with video-specific metadata
 */
export type VideoExtractionResult = {
  success: boolean;
  error?: string;
  data?: {
    extractedText: string;
    metadata: {
      videoId: string;
      url: string;
      wordCount: number;
      segments: number;
      transcriptSegments?: {
        text: string;
        start: number;
        duration: number;
        timestamp: string;
      }[];
    };
  };
};

/**
 * PDF extraction result with PDF-specific metadata
 */
export type PDFExtractionResult = {
  success: boolean;
  error?: string;
  data?: {
    extractedText: string;
    metadata: {
      fileName: string;
      fileSize: number;
      pageCount: number;
      url: string;
    };
  };
};

/**
 * URL/Article extraction result
 */
export type URLExtractionResult = {
  success: boolean;
  error?: string;
  data?: {
    extractedText: string;
    metadata: {
      url: string;
      title?: string;
      author?: string;
      publishDate?: string;
      wordCount: number;
    };
  };
};

/**
 * Podcast extraction result
 */
export type PodcastExtractionResult = {
  success: boolean;
  error?: string;
  data?: {
    extractedText: string;
    metadata: {
      url: string;
      title?: string;
      duration?: number;
      episodeNumber?: string;
      showName?: string;
    };
  };
};

/**
 * Content type detector
 */
export type ContentTypeDetection = {
  contentType: ContentType;
  confidence: number;
};
