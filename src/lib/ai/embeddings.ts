import { embedMany } from "ai";
import { openai } from "@ai-sdk/openai";
import type { SyllabusConcept, Concept } from "@/generated/prisma";

// Use multilingual embedding model for cross-lingual semantic matching
// text-embedding-3-large supports 100+ languages and maps semantically equivalent
// concepts to nearby points in vector space regardless of language.
// Example: "Photosynthèse" (FR) and "Photosynthesis" (EN) have ~0.95 cosine similarity
const embeddingModel = openai.embedding("text-embedding-3-large");

export function buildExtractedText(c: Pick<Concept, "conceptText" | "definition">) {
  const parts = [c.conceptText];
  if (c.definition) parts.push(`: ${c.definition}`);
  return parts.join("");
}

export function buildSyllabusText(s: Pick<SyllabusConcept, "conceptText" | "category">) {
  const parts = [s.conceptText];
  if (s.category) parts.push(` — ${s.category}`);
  return parts.join("");
}

export async function embedTextsOrNull(values: string[]): Promise<Float32Array[] | null> {
  // If no key configured, the provider will throw; catch and return null (degrade later)
  try {
    const { embeddings } = await embedMany({ model: embeddingModel, values });
    // Convert number[] to Float32Array[]
    return embeddings.map(embedding => new Float32Array(embedding));
  } catch (e) {
    console.warn("Embeddings unavailable; falling back (reason):", e);
    return null;
  }
}

export function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}
