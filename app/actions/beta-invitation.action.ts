"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";

const BetaInvitationSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function submitBetaInvitation(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    
    // Validate email
    const validation = BetaInvitationSchema.safeParse({ email });
    
    if (!validation.success) {
      return {
        success: false,
        error: "Please enter a valid email address",
      };
    }

    // Check if email already exists
    const existing = await prisma.betaInvitation.findUnique({
      where: { email: validation.data.email },
    });

    if (existing) {
      return {
        success: false,
        error: "This email is already registered for beta access",
      };
    }

    // Save to database
    await prisma.betaInvitation.create({
      data: {
        email: validation.data.email,
        status: "pending",
      },
    });

    return {
      success: true,
      message: "Thank you! We'll send you an invitation soon.",
    };
  } catch (error) {
    console.error("Beta invitation error:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}
