# US-0001b: Add Learning Goal via Document Upload

**Status:** 📋 TODO  
**Priority:** P0 (Critical Path - Alternative Input Method)  
**Estimate:** 10h  
**Created:** 2025-01-17  
**Updated:** 2025-01-17

---

## Story

**ID:** US-0001b  
**Persona:** Self-Directed Learner (Primary ICP)  
**Title:** As a self-directed learner, I want to upload my syllabus document (PDF, Word, text, or image) so that the system can extract my learning goals and create a personalized knowledge structure.

---

## Context

This is an **alternative input method** to US-0001a (AI Conversation). Many students have digital syllabi from their institutions and prefer to upload documents rather than copy-paste text. This story supports the product's global flexibility - works for any educational system worldwide.

**User Journey:**
1. User clicks "Add Learning Goal" → sees dialog
2. Chooses "Upload Document" tab (alternative to "AI Conversation")
3. Uploads PDF/Word/text/image file (drag-drop or file picker)
4. Optionally provides subject and course name (or AI extracts from document)
5. Submits → AI processes document → creates hierarchical knowledge structure
6. User sees progress dashboard with "0/X concepts mastered"

**Critical Dependencies:**
- `src/master-prompts/hierarchical-knowledge-extraction-prompt.md` (AI processing)
- Document parsing libraries (PDF.js, Mammoth.js for Word, OCR for images)
- File upload infrastructure (storage, validation, virus scanning)
- Database models: Subject, Course, KnowledgeNode, SyllabusConcept, UserCourse

---

## Acceptance Criteria

### AC1: Document Upload UI
**Given** a user on the "Add Learning Goal" dialog  
**When** they select the "Upload Document" tab  
**Then** they see:
- Drag-and-drop zone with clear instructions: "Drag your syllabus here or click to browse"
- Supported formats listed: "PDF, Word (.docx), Text (.txt), or Image (.jpg, .png)"
- File size limit: "Maximum 10MB"
- Optional fields: Subject (text input), Course Name (text input)
- Submit button (disabled until file is uploaded)

**And** the UI supports:
- Drag-and-drop file upload
- Click to open file picker
- File preview (filename, size, type)
- Remove file button (to upload different file)

### AC2: File Validation
**Given** a user uploads a file  
**When** the file is selected  
**Then** the system validates:
- **File type**: PDF (.pdf), Word (.docx), Text (.txt), JPEG (.jpg, .jpeg), PNG (.png)
- **File size**: ≤ 10MB
- **File integrity**: Not corrupted, readable

**And** if validation fails:
- Show error message:
  - Unsupported type: "Please upload a PDF, Word, Text, or Image file"
  - Too large: "File size must be under 10MB. Your file is {size}MB"
  - Corrupted: "This file appears to be corrupted. Please try another file"
- Keep upload zone active (user can try again)
- Do NOT proceed to processing

**And** if validation succeeds:
- Show file preview with checkmark icon
- Enable submit button
- Show estimated processing time: "Processing usually takes 30-60 seconds"

### AC3: Document Text Extraction
**Given** a valid uploaded file  
**When** the user submits the form  
**Then** the system extracts text based on file type:

**PDF Files:**
- Use PDF.js or similar library
- Extract all text content (preserve structure if possible)
- Handle multi-page documents
- Handle scanned PDFs (OCR if text layer missing)
- Preserve headings, lists, and formatting cues

**Word Files (.docx):**
- Use Mammoth.js or similar library
- Extract all text content
- Preserve document structure (headings, lists)
- Handle tables (extract as structured text)
- Ignore images (unless they contain text via OCR)

**Text Files (.txt):**
- Read file content directly (UTF-8 encoding)
- Preserve line breaks and structure

**Image Files (.jpg, .png):**
- Use OCR (Tesseract.js or cloud OCR API)
- Extract all visible text
- Handle handwritten syllabi (best effort)
- Preserve text layout if possible

**And** if extraction fails:
- Show error: "We couldn't read your document. Please try a different file or copy-paste the text instead."
- Log error for debugging (file type, size, error message)
- Keep form open with file preview

**And** if extraction succeeds:
- Show extracted text preview (first 500 chars) with "Show more" option
- Allow user to edit extracted text before processing
- Proceed to AI processing

### AC4: Subject & Course Name Extraction
**Given** extracted document text  
**When** the user has NOT provided subject/course name manually  
**Then** the system attempts to extract from document:
- Look for course codes (e.g., "PHIL201", "BIOL2001")
- Look for course titles (e.g., "Introduction to Philosophy", "Cell Biology")
- Look for subject indicators (e.g., "Department of Philosophy", "Biology 101")
- Use AI to infer subject and course name from content

**And** if extraction succeeds:
- Pre-fill subject and course name fields
- Show confidence indicator: "We detected: Philosophy - Ethics (Edit if incorrect)"
- Allow user to edit before submitting

**And** if extraction fails or confidence is low:
- Require user to manually enter subject and course name
- Show helper text: "We couldn't detect the course name. Please enter it manually."

### AC5: AI Processing with Document Context
**Given** extracted text and subject/course name  
**When** the system calls the hierarchical extraction prompt  
**Then** it formats the input as:

```
Please analyze the following educational material and create a hierarchical knowledge structure.

Subject: {subject}
Course: {courseName}

---MATERIAL START---
{extractedText}
---MATERIAL END---

Return a complete JSON object following the schema in your instructions.
```

**And** the AI processing follows the same flow as US-0001a:
- Temperature: 0.2-0.3
- Max tokens: 8000
- Timeout: 60s
- Validates extraction quality (confidence ≥ 0.7, allConceptsAtomic === true)
- Creates database records (Subject, Course, KnowledgeNodes, SyllabusConcepts, UserCourse)

### AC6: File Storage & Metadata
**Given** successful document upload  
**When** the file is processed  
**Then** the system:
- Stores original file in secure storage (S3, Cloudflare R2, or similar)
- Generates unique file ID (UUID)
- Stores file metadata in database:
  - originalFilename: "syllabus.pdf"
  - fileType: "application/pdf"
  - fileSize: 2457600 (bytes)
  - storageUrl: "s3://bucket/files/{uuid}.pdf"
  - uploadedAt: timestamp
  - extractedText: full extracted text (for future reference)

**And** links file to Course:
- Course.syllabusUrl = storageUrl
- Course.metadata.uploadedFile = { filename, type, size, uploadedAt }

**And** implements security:
- Virus scanning before storage (ClamAV or cloud service)
- Access control (only course owner can download)
- Signed URLs for downloads (expire after 1 hour)

### AC7: Multi-Page Document Handling
**Given** a multi-page syllabus (e.g., 20-page PDF)  
**When** the system extracts text  
**Then** it:
- Extracts all pages sequentially
- Preserves page structure (headings, sections)
- Handles large documents (up to 10MB / ~50 pages)
- Shows progress indicator: "Processing page 5 of 20..."

**And** if document is too long (>50 pages):
- Show warning: "This document is very long. Processing may take up to 2 minutes."
- Proceed with extraction (no rejection)
- Increase timeout to 120s

### AC8: Scanned Document Handling (OCR)
**Given** a scanned PDF or image file  
**When** the system detects no text layer  
**Then** it:
- Automatically triggers OCR processing
- Shows message: "This appears to be a scanned document. Running text recognition..."
- Uses OCR service (Tesseract.js, Google Cloud Vision, or AWS Textract)
- Handles multiple languages (English, French for MVP)

**And** if OCR confidence is low (<70%):
- Show warning: "Text recognition quality is low. Please review the extracted text."
- Allow user to edit extracted text before processing
- Suggest alternative: "For best results, try uploading a text-based PDF or copy-paste the text."

**And** if OCR fails completely:
- Show error: "We couldn't read text from this image. Please try a clearer image or copy-paste the text instead."
- Keep form open, allow user to try different file

### AC9: Error Handling - Unsupported Content
**Given** a document with minimal text (e.g., mostly images, tables)  
**When** the AI processes the extracted text  
**Then** it may return error: `INSUFFICIENT_DATA`

**And** the system:
- Shows user-friendly message: "This document doesn't contain enough text to create a learning structure. Please try:"
  - "Upload a text-based syllabus"
  - "Copy-paste the course content instead"
  - "Provide more details about your learning goals"
- Keeps form open with file preview
- Allows user to switch to "AI Conversation" tab

### AC10: Success Confirmation & File Reference
**Given** successful processing and database creation  
**When** the user navigates to the course detail page  
**Then** they see:
- Course name and subject
- Progress: "0/{totalAtomicConcepts} concepts mastered"
- Knowledge tree visualization
- **Syllabus reference**: "Uploaded: syllabus.pdf (2.4 MB)" with download link

**And** the user can:
- Download original syllabus file (signed URL)
- View extracted text (modal or expandable section)
- Re-upload updated syllabus (replaces old file, re-processes)

---

## Technical Implementation

### API Endpoint: POST `/api/courses/upload`

**Request:** Multipart form data
```typescript
{
  file: File;              // PDF, Word, Text, or Image
  subject?: string;        // Optional (AI extracts if missing)
  name?: string;           // Optional (AI extracts if missing)
}
```

**Response (Success):**
```typescript
{
  id: string;              // Course UUID
  code: string;
  name: string;
  subjectId: string;
  subject: { id: string; name: string };
  syllabusUrl: string;     // Storage URL
  metadata: {
    totalConcepts: number;
    treeDepth: number;
    extractionConfidence: number;
    inputType: "broad" | "moderate" | "specific" | "very_specific";
    uploadedFile: {
      filename: string;
      type: string;
      size: number;
      uploadedAt: string;
    };
  };
}
```

**Response (Error):**
```typescript
{
  error: {
    code: "INVALID_FILE_TYPE" | "FILE_TOO_LARGE" | "EXTRACTION_FAILED" | "INSUFFICIENT_DATA" | "VIRUS_DETECTED";
    message: string;
    details?: string;
    suggestions?: string[];
  };
}
```

### Processing Flow

```typescript
// 1. Validate file upload
const file = await request.formData().get("file");
validateFile(file); // Type, size, integrity

// 2. Virus scan (security)
await scanForVirus(file);

// 3. Extract text based on file type
let extractedText: string;
const fileType = file.type;

if (fileType === "application/pdf") {
  extractedText = await extractPdfText(file);
} else if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
  extractedText = await extractWordText(file);
} else if (fileType === "text/plain") {
  extractedText = await file.text();
} else if (fileType.startsWith("image/")) {
  extractedText = await extractImageText(file); // OCR
}

// 4. Extract subject/course name (if not provided)
let subject = request.formData().get("subject");
let courseName = request.formData().get("name");

if (!subject || !courseName) {
  const extracted = await extractCourseInfo(extractedText);
  subject = subject || extracted.subject;
  courseName = courseName || extracted.courseName;
}

// 5. Store file in secure storage
const fileId = generateUUID();
const storageUrl = await uploadToStorage(file, fileId);

// 6. Format for AI prompt
const aiInput = formatForHierarchicalExtraction({
  subject,
  courseName,
  learningGoalText: extractedText,
  userId: currentUser.id,
});

// 7. Call AI (same as US-0001a)
const aiResponse = await callHierarchicalExtractionPrompt(aiInput, {
  temperature: 0.2,
  maxTokens: 8000,
  timeout: 60000,
});

// 8. Validate AI response
validateExtractionQuality(aiResponse);

// 9. Create database records (transaction)
const course = await prisma.$transaction(async (tx) => {
  // Same as US-0001a, but also store file metadata
  const course = await tx.course.create({
    data: {
      // ... same as US-0001a
      syllabusUrl: storageUrl,
      metadata: {
        ...aiMetadata,
        uploadedFile: {
          filename: file.name,
          type: file.type,
          size: file.size,
          uploadedAt: new Date().toISOString(),
        },
      },
    },
  });

  // ... rest of transaction (same as US-0001a)

  return course;
});

// 10. Return success response
return {
  id: course.id,
  // ... same as US-0001a
  syllabusUrl: storageUrl,
};
```

### Text Extraction Functions

```typescript
// PDF text extraction
async function extractPdfText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument(arrayBuffer).promise;
  
  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(" ");
    fullText += pageText + "\n\n";
  }
  
  // If no text found, try OCR
  if (fullText.trim().length < 100) {
    fullText = await ocrPdf(file);
  }
  
  return fullText;
}

// Word document extraction
async function extractWordText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

// Image OCR
async function extractImageText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await Tesseract.recognize(arrayBuffer, "eng+fra", {
    logger: (m) => console.log(m), // Progress logging
  });
  return result.data.text;
}

// Extract course info from text
async function extractCourseInfo(text: string): Promise<{
  subject: string;
  courseName: string;
  confidence: number;
}> {
  // Use simple AI call to extract metadata
  const prompt = `Extract the subject and course name from this syllabus text. Return JSON: { "subject": "...", "courseName": "...", "confidence": 0.0-1.0 }

Text:
${text.substring(0, 2000)}`;

  const response = await callAI(prompt, { temperature: 0.1 });
  return JSON.parse(response);
}
```

---

## UI/UX Requirements

### Upload Dialog Design (NEW)
- **Tab Navigation**: "AI Conversation" (US-0001a) | "Upload Document" (US-0001b)
- **Drag-Drop Zone**:
  - Dashed border, centered icon (upload cloud)
  - Text: "Drag your syllabus here or click to browse"
  - Subtext: "PDF, Word, Text, or Image • Max 10MB"
- **File Preview** (after upload):
  - Filename with icon (PDF/Word/Text/Image)
  - File size (e.g., "2.4 MB")
  - Remove button (X icon)
- **Optional Fields**:
  - Subject (text input, placeholder: "e.g., Philosophy")
  - Course Name (text input, placeholder: "e.g., Ethics")
  - Helper text: "Leave blank to auto-detect from document"
- **Submit Button**: "Create Course" (disabled until file uploaded)

### Processing States
- **Uploading**: Progress bar (0-100%)
- **Extracting Text**: Spinner + "Reading your document..."
- **OCR Processing**: Spinner + "Recognizing text from image..."
- **AI Processing**: Spinner + "Creating knowledge structure..."
- **Estimated Time**: "This usually takes 30-60 seconds"

### Success State
- Same as US-0001a
- Additional: Show "Uploaded: {filename}" on course detail page

### Error States
- **Invalid File Type**: Toast "Please upload a PDF, Word, Text, or Image file"
- **File Too Large**: Toast "File must be under 10MB. Your file is {size}MB"
- **Extraction Failed**: Toast "Couldn't read document. Try copy-pasting text instead."
- **Virus Detected**: Toast "Security check failed. Please contact support."
- **Insufficient Data**: Toast with suggestions (same as US-0001a)

---

## Testing Requirements

### Unit Tests
- [ ] File validation (type, size, integrity)
- [ ] PDF text extraction (text-based and scanned)
- [ ] Word text extraction
- [ ] Image OCR
- [ ] Course info extraction from text
- [ ] File storage and URL generation
- [ ] Virus scanning integration

### Integration Tests
- [ ] POST `/api/courses/upload` with PDF → 201 Created
- [ ] POST `/api/courses/upload` with Word → 201 Created
- [ ] POST `/api/courses/upload` with Text → 201 Created
- [ ] POST `/api/courses/upload` with Image → 201 Created
- [ ] POST `/api/courses/upload` with invalid type → 400 Bad Request
- [ ] POST `/api/courses/upload` with file >10MB → 400 Bad Request
- [ ] POST `/api/courses/upload` with corrupted file → 400 Bad Request
- [ ] POST `/api/courses/upload` with virus → 400 Bad Request
- [ ] File stored in storage with correct permissions
- [ ] Database records created correctly (same as US-0001a + syllabusUrl)

### E2E Tests
- [ ] User uploads PDF → sees success → navigates to course page → can download syllabus
- [ ] User uploads scanned PDF → OCR runs → sees success
- [ ] User uploads image → OCR runs → sees success
- [ ] User uploads Word doc → sees success
- [ ] User uploads invalid file → sees error → tries again with valid file → success
- [ ] User uploads file without subject/name → AI extracts → pre-fills fields → success

---

## Performance Requirements

- **File Upload**: < 5s (p95) for 10MB file
- **Text Extraction**: < 10s (p95) for 50-page PDF
- **OCR Processing**: < 30s (p95) for image
- **AI Processing**: < 30s (p95) (same as US-0001a)
- **Total Request Time**: < 60s (p95), < 120s (p99) for OCR

---

## Security Requirements

- **Virus Scanning**: All uploaded files scanned before storage
- **File Type Validation**: Strict whitelist (PDF, DOCX, TXT, JPG, PNG)
- **File Size Limit**: 10MB hard limit (prevent DoS)
- **Access Control**: Only course owner can download syllabus
- **Signed URLs**: Download links expire after 1 hour
- **Storage Isolation**: Files stored in user-specific directories
- **No Executable Files**: Reject .exe, .sh, .bat, etc.

---

## Dependencies

### New Libraries
- [ ] `pdf.js` or `pdf-parse` (PDF text extraction)
- [ ] `mammoth` (Word document extraction)
- [ ] `tesseract.js` or cloud OCR API (image text recognition)
- [ ] File storage SDK (AWS S3, Cloudflare R2, or similar)
- [ ] Virus scanning service (ClamAV, VirusTotal API, or similar)

### New Components (To Build)
- [ ] `app/dashboard/courses/_components/upload-document-tab.tsx` (UI)
- [ ] `app/api/courses/upload/route.ts` (POST endpoint)
- [ ] `src/lib/files/extract-text.ts` (Text extraction logic)
- [ ] `src/lib/files/storage.ts` (File storage wrapper)
- [ ] `src/lib/files/virus-scan.ts` (Virus scanning wrapper)
- [ ] `src/lib/ai/extract-course-info.ts` (Metadata extraction)

---

## Success Criteria

### Definition of Done
- [ ] User can upload PDF, Word, Text, or Image files
- [ ] System extracts text from all supported file types
- [ ] OCR works for scanned PDFs and images
- [ ] AI extracts subject/course name from document (or user provides manually)
- [ ] AI creates hierarchical knowledge structure (same as US-0001a)
- [ ] File stored securely with access control
- [ ] User can download original syllabus from course page
- [ ] All acceptance criteria pass
- [ ] Unit, integration, and E2E tests pass
- [ ] Security requirements met (virus scanning, access control)
- [ ] Performance requirements met (< 60s p95)

### User Validation
- [ ] 3 test users successfully upload syllabi (PDF, Word, Image)
- [ ] 100% of extractions have `allConceptsAtomic === true`
- [ ] 90%+ of extractions have confidence ≥ 0.7
- [ ] OCR accuracy ≥ 90% for clear images
- [ ] Users can download their uploaded syllabi
- [ ] No security vulnerabilities (virus scanning works)

---

## Notes

- **File Storage**: Use cloud storage (S3, R2) for scalability. Local storage OK for MVP.
- **OCR Quality**: Tesseract.js is free but slower. Cloud OCR (Google, AWS) is faster but costs money.
- **Virus Scanning**: ClamAV is free but requires setup. VirusTotal API is easier but has rate limits.
- **Multi-Language**: OCR supports English and French for MVP. Expand later.
- **File Retention**: Keep original files for 90 days, then archive or delete (GDPR compliance).

---

## Related Stories

- **US-0001a**: Add Learning Goal via AI Conversation (Prerequisite)
- **US-0008**: Progress Dashboard (Depends on this)
- **US-0009**: Gap Analysis (Depends on this)
- **US-0002**: Video URL Submission (Depends on this)

---

## Changelog

- **2025-01-17**: Initial creation (alternative to US-0001a)
