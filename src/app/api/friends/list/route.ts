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

    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [{ requesterId: decoded.id }, { addresseeId: decoded.id }],
      },
      include: {
        requester: true,
        addressee: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(friendships);
  } catch (err) {
    console.error("Ошибка при получении друзей:", err);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
