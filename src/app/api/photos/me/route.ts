import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { DecodedToken } from "@/types/decodedtoken";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const decoded: DecodedToken | null = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(Number(searchParams.get("page") || 1), 1);
    const limit = Math.max(Number(searchParams.get("limit") || 5), 1);

    const photos = await prisma.photo.findMany({
      where: { ownerId: decoded.id },
      include: {
        comments: { include: { author: true } },
        likes: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json(photos);
  } catch (err) {
    console.error("Ошибка при получении фотографий:", err);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}