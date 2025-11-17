import { createOpenAI } from "@ai-sdk/openai";

/**
 * Predefined Blackbox AI models
 * All models use OpenAI-compatible format through Blackbox API
 * Docs: https://docs.blackbox.ai/api-reference/models/chat-models
 */
export const models = {
  openai: {
    gpt41nano: "blackboxai/openai/gpt-4.1-nano",
    gpt4o: "blackboxai/openai/gpt-4o",
  },
  anthropic: {
    sonnet4: "blackboxai/anthropic/claude-sonnet-4",
    sonnet45: "blackboxai/anthropic/claude-sonnet-4.5",
  },
  free: {
    llama70b: "blackboxai/meta-llama/llama-3.3-70b-instruct:free",
    gemini2Flash: "blackboxai/google/gemini-2.0-flash-exp:free",
  },
} as const;

/** Default model to use for text generation */
export const DEFAULT_MODEL: string = models.anthropic.sonnet45;

/** Blackbox AI provider (lazy-initialized) */
let _provider: ReturnType<typeof createOpenAI> | null = null;

/**
 * Get the Blackbox provider
 * Returns a configured OpenAI-compatible provider instance for Blackbox models
 */
export function getBlackboxProvider() {
  if (!_provider) {
    const apiKey = process.env.BLACKBOX_API_KEY;
    if (!apiKey) {
      throw new Error("BLACKBOX_API_KEY not found in environment");
    }
    _provider = createOpenAI({
      baseURL: "https://api.blackbox.ai",
      apiKey,
    });
  }
  return _provider;
}

/**
 * Convenience: get a Blackbox model for use with `generateText`
 * Example:
 *   const model = getBlackboxModel();
 *   const { text } = await generateText({ model, prompt: "Hello" });
 */
export function getBlackboxModel(modelId: string = DEFAULT_MODEL) {
  return getBlackboxProvider()(modelId);
}
