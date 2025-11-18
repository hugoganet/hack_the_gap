import {
  notionClient,
  FEEDBACK_DATABASE_ID,
  isNotionConfigured,
} from "./notion-client";

export interface FeedbackData {
  id: string;
  name: string | null;
  email: string | null;
  message: string;
  review: number;
  userId: string | null;
  createdAt: Date;
}

/**
 * Sends feedback data to Notion database
 * @param feedback - The feedback data to send
 * @returns The created Notion page ID
 */
export async function sendFeedbackToNotion(
  feedback: FeedbackData,
): Promise<string> {
  // Skip if Notion is not configured
  if (!isNotionConfigured || !notionClient) {
    console.warn("Notion integration not configured, skipping sync");
    return "";
  }

  try {
    // Build properties object conditionally
    const properties: Record<string, any> = {
      // Title property - use user name or "Anonymous"
      Name: {
        title: [
          {
            text: {
              content: feedback.name || "Anonymous",
            },
          },
        ],
      },
      // Text property for the message
      Message: {
        rich_text: [
          {
            text: {
              content: feedback.message,
            },
          },
        ],
      },
      // Number property for review rating
      Review: {
        number: feedback.review,
      },
      // Text property for User ID
      "User ID": {
        rich_text: feedback.userId
          ? [
              {
                text: {
                  content: feedback.userId,
                },
              },
            ]
          : [],
      },
      // Date property for creation time
      "Created At": {
        date: {
          start: feedback.createdAt.toISOString(),
        },
      },
      // Select property for status (default to "New")
      Status: {
        select: {
          name: "New",
        },
      },
    };

    // Add email property only if email exists
    if (feedback.email) {
      properties.Email = {
        email: feedback.email,
      };
    }

    const response = await notionClient.pages.create({
      parent: {
        database_id: FEEDBACK_DATABASE_ID,
      },
      properties,
    });

    return response.id;
  } catch (error) {
    console.error("Failed to send feedback to Notion:", error);
    throw new Error(
      `Notion API error: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
