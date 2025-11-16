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

    const years = await prisma.academicYear.findMany({
      orderBy: {
        level: "asc",
      },
    });

    return NextResponse.json({ years });
  } catch (error) {
    console.error("Error fetching years:", error);
    return NextResponse.json(
      { error: "Failed to fetch years" },
      { status: 500 }
    );
  }
}
