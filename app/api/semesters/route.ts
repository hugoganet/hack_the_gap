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

    const semesters = await prisma.semester.findMany({
      orderBy: {
        number: "asc",
      },
    });

    return NextResponse.json({ semesters });
  } catch (error) {
    console.error("Error fetching semesters:", error);
    return NextResponse.json(
      { error: "Failed to fetch semesters" },
      { status: 500 }
    );
  }
}
