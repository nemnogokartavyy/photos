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
      return NextResponse.json(
        { error: "Недействительный токен" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(Number(searchParams.get("page") || 1), 1);
    const limit = Math.max(Number(searchParams.get("limit") || 5), 1);

    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { requesterId: decoded.id, status: "accepted" },
          { addresseeId: decoded.id, status: "accepted" },
        ],
      },
    });

    const friendIds = friendships.map((f) =>
      f.requesterId === decoded.id ? f.addresseeId : f.requesterId
    );

    const photos = await prisma.photo.findMany({
      where: { ownerId: { in: friendIds } },
      include: {
        owner: { select: { id: true, username: true } },
        comments: {
          include: { author: { select: { id: true, username: true } } },
        },
        likes: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json(photos);
  } catch (err) {
    console.error("Ошибка получения ленты:", err);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
