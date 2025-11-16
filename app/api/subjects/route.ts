import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth/auth-user";

export async function GET() {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const subjects = await prisma.subject.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({ subjects });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
      { status: 500 }
    );
  }
}
