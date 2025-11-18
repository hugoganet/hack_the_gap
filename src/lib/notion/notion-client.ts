import { Client } from "@notionhq/client";
import { env } from "@/lib/env";

/**
 * Check if Notion integration is configured
 */
export const isNotionConfigured = !!(env.NOTION_API_KEY && env.NOTION_DB_ID);

/**
 * Notion client instance configured with API key
 * Only initialized if credentials are provided
 */
export const notionClient = env.NOTION_API_KEY
  ? new Client({
      auth: env.NOTION_API_KEY,
    })
  : null;

/**
 * Feedback database ID from environment
 */
export const FEEDBACK_DATABASE_ID = env.NOTION_DB_ID || "";
