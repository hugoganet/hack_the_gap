import type { PDFExtractionResult } from "./types";

// Dynamic import for pdf-parse (CommonJS module)
const pdfParsePromise = import("pdf-parse").then(mod => mod.default || mod);

/**
 * Extract text from PDF URL
 */
export async function extractPDFText(url: string): Promise<PDFExtractionResult> {
  try {
    console.log("Fetching PDF from URL:", url);

    // Fetch the PDF file
    const response = await fetch(url);

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to fetch PDF: ${response.status} ${response.statusText}`,
      };
    }

    // Get content type to verify it's a PDF
    const contentType = response.headers.get("content-type");
    if (contentType && !contentType.includes("pdf")) {
      return {
        success: false,
        error: `URL does not point to a PDF file (Content-Type: ${contentType})`,
      };
    }

    // Get file size from headers if available
    const contentLength = response.headers.get("content-length");
    const fileSize = contentLength ? Number.parseInt(contentLength, 10) : 0;

    // Get the PDF buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log("Parsing PDF...", {
      size: buffer.length,
      sizeFromHeader: fileSize,
    });

    // Load pdf-parse dynamically
    const pdfParse = await pdfParsePromise;

    // Parse the PDF
    const data = await pdfParse(buffer);

    // Extract filename from URL
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/");
    const fileName = pathParts[pathParts.length - 1] || "document.pdf";

    const extractedText = data.text.trim();

    if (!extractedText) {
      return {
        success: false,
        error: "PDF appears to be empty or contains no extractable text (might be scanned images)",
      };
    }

    console.log("PDF parsed successfully:", {
      fileName,
      pages: data.numpages,
      textLength: extractedText.length,
      preview: `${extractedText.substring(0, 100)}...`,
    });

    return {
      success: true,
      data: {
        extractedText,
        metadata: {
          fileName,
          fileSize: buffer.length,
          pageCount: data.numpages,
          url,
        },
      },
    };
  } catch (error) {
    console.error("PDF extraction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to extract text from PDF",
    };
  }
}

/**
 * Extract text from PDF file buffer (for file uploads)
 */
export async function extractPDFTextFromBuffer(
  buffer: Buffer,
  fileName: string
): Promise<PDFExtractionResult> {
  try {
    console.log("Parsing PDF from buffer...", {
      fileName,
      size: buffer.length,
    });

    // Load pdf-parse dynamically
    const pdfParse = await pdfParsePromise;

    // Parse the PDF
    const data = await pdfParse(buffer);

    const extractedText = data.text.trim();

    if (!extractedText) {
      return {
        success: false,
        error: "PDF appears to be empty or contains no extractable text (might be scanned images)",
      };
    }

    console.log("PDF parsed successfully:", {
      fileName,
      pages: data.numpages,
      textLength: extractedText.length,
      preview: `${extractedText.substring(0, 100)}...`,
    });

    return {
      success: true,
      data: {
        extractedText,
        metadata: {
          fileName,
          fileSize: buffer.length,
          pageCount: data.numpages,
          url: "", // No URL for uploaded files
        },
      },
    };
  } catch (error) {
    console.error("PDF extraction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to extract text from PDF",
    };
  }
}

/**
 * Detect if URL is a PDF
 */
export function isPDFURL(url: string): boolean {
  const lowerUrl = url.toLowerCase();
  return lowerUrl.endsWith(".pdf") || lowerUrl.includes(".pdf?");
}
