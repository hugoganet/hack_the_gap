import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { getRequiredUser } from "@/lib/auth/auth-user";
import { extractPDFTextFromBuffer } from "@/features/content-extraction/pdf-extractor";

/**
 * Upload PDF file endpoint
 * Accepts PDF file upload and extracts text
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getRequiredUser();

    // Get the form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.includes("pdf")) {
      return NextResponse.json(
        { success: false, error: "Only PDF files are supported" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    console.log("Processing uploaded PDF:", {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text from PDF
    const result = await extractPDFTextFromBuffer(buffer, file.name);

    if (!result.success || !result.data) {
      return NextResponse.json(
        {
          success: false,
          error: result.error ?? "Failed to extract text from PDF",
        },
        { status: 400 }
      );
    }

    // Return the extracted data
    // The client will then call processContent with this data
    return NextResponse.json({
      success: true,
      data: {
        fileName: file.name,
        fileSize: file.size,
        extractedText: result.data.extractedText,
        metadata: result.data.metadata,
      },
    });
  } catch (error) {
    console.error("PDF upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process PDF file",
      },
      { status: 500 }
    );
  }
}
