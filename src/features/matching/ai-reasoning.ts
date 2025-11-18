import { generateText } from "ai";
import { getBlackboxModel } from "@/lib/blackbox";
import { env } from "@/lib/env";

type ReasoningOutput = {
  isMatch: boolean;
  confidence: number; // 0..1
  matchType: "exact" | "related" | "example-of";
  rationale: string;
};

function extractJson(text: string): string {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) return text.slice(start, end + 1);
  return text.trim();
}

export async function verifyWithLLM(params: {
  extractedName: string;
  extractedDefinition?: string | null;
  syllabusName: string;
  syllabusCategory?: string | null;
  embeddingSimilarity: number; // 0..1
  rationaleLanguage?: string; // ISO language code like "en", "fr"; dictates rationale language
}): Promise<ReasoningOutput | null> {
  // Prefer Blackbox if available; otherwise try OpenAI via our openaiModel
  let model: any | null = null;
  try {
    if (env.BLACKBOX_API_KEY) {
      model = getBlackboxModel();
    } else if (env.OPENAI_API_KEY) {
      const { openaiModel } = await import("@/lib/ai");
      model = openaiModel;
    }
  } catch (e) {
    console.warn("LLM provider unavailable:", e);
    return null;
  }

  if (!model) return null;

  const targetLang = (params.rationaleLanguage || "").trim() || "en";
  // Surface which language was selected in logs to detect unexpected fallbacks in production
  try {
    console.log(`[match] verifyWithLLM target rationale language: ${targetLang}`);
  } catch {}

  const prompt = `You are an expert educator. Determine if these two concepts match and explain why.\n\nLANGUAGE REQUIREMENT: The rationale must be written in ${targetLang}.\n\nEXTRACTED CONCEPT (from student's video):\nName: ${params.extractedName}\nDefinition: ${params.extractedDefinition ?? "(none)"}\n\nSYLLABUS CONCEPT (from course requirements):\nName: ${params.syllabusName}\nCategory: ${params.syllabusCategory ?? "(none)"}\n\nEMBEDDING SIMILARITY: ${(params.embeddingSimilarity * 100).toFixed(0)}%\n\nRespond in strict JSON only. Field names remain in English. The value of the \"rationale\" field must be in ${targetLang}.\n{\n  "isMatch": true|false,\n  "confidence": 0.0-1.0,\n  "matchType": "exact" | "related" | "example-of",\n  "rationale": "1-2 sentence explanation in ${targetLang}"\n}\n\nRules:\n- "exact": same underlying concept, different wording acceptable\n- "related": connected concepts in same topic\n- "example-of": extracted is a specific instance of the syllabus concept\n- Confidence 0.8+ only if you're very certain\n- Confidence 0.6-0.79 likely matches\n- Confidence <0.6 uncertain/no match`;

  try {
    const { text } = await generateText({ model, temperature: 0.2, prompt });
    const json = extractJson(text);
    const parsed = JSON.parse(json) as ReasoningOutput;
    // Basic guards
    if (
      typeof parsed.isMatch === "boolean" &&
      typeof parsed.confidence === "number" &&
      ["exact", "related", "example-of"].includes(parsed.matchType) &&
      typeof parsed.rationale === "string"
    ) {
      return parsed;
    }
  } catch (e) {
    console.warn("verifyWithLLM failed:", e);
  }
  return null;
}
