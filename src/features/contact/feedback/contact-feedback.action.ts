"use server";

import { action } from "@/lib/actions/safe-actions";
import { getUser } from "@/lib/auth/auth-user";
import { env } from "@/lib/env";
import { sendEmail } from "@/lib/mail/send-email";
import { sendFeedbackToNotion } from "@/lib/notion/send-feedback-to-notion";
import { prisma } from "@/lib/prisma";
import { ContactFeedbackSchema } from "./contact-feedback.schema";

export const feedbackAction = action
  .inputSchema(ContactFeedbackSchema)
  .action(async ({ parsedInput: data }) => {
    const user = await getUser();

    const email = user?.email ?? data.email;

    const feedback = await prisma.feedback.create({
      data: {
        message: data.message,
        review: Number(data.review) || 0,
        userId: user?.id,
        email,
      },
    });

    // Send to Notion (non-blocking - don't fail if Notion is down)
    try {
      await sendFeedbackToNotion({
        id: feedback.id,
        name: user?.name || null,
        email: feedback.email,
        message: feedback.message,
        review: feedback.review,
        userId: feedback.userId,
        createdAt: feedback.createdAt,
      });
    } catch (error) {
      console.error("Failed to sync feedback to Notion:", error);
      // Continue execution - feedback is still saved in DB
    }

    await sendEmail({
      to: env.NEXT_PUBLIC_EMAIL_CONTACT,
      subject: `New feedback from ${email}`,
      text: `Review: ${feedback.review}\n\nMessage: ${feedback.message}`,
      replyTo: email,
    });

    return { message: "Your feedback has been sent to support." };
  });
