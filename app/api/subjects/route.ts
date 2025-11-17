import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth/auth-user";

export async function GET(req: Request) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") ?? "").trim();
    const takeParam = Number(searchParams.get("take"));
    const take = Number.isFinite(takeParam)
      ? Math.min(Math.max(takeParam, 1), 50)
      : 10;

    const where = q
      ? {
          name: {
            contains: q,
            mode: "insensitive" as const,
          },
        }
      : undefined;

    const subjects = await prisma.subject.findMany({
      where,
      orderBy: {
        name: "asc",
      },
      take: where ? take : undefined,
      select: {
        id: true,
        name: true,
      },
    });

    return NextResponse.json(subjects);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json({ error: "Failed to fetch subjects" }, { status: 500 });
  }
}
