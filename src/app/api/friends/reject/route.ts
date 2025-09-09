import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { DecodedToken } from "@/types/decodedtoken";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const decoded: DecodedToken | null = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const body = await req.json();
    const { friendshipId } = body;

    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
    });
    if (!friendship) {
      return NextResponse.json({ error: "Заявка не найдена" }, { status: 404 });
    }

    if (friendship.addresseeId !== decoded.id) {
      return NextResponse.json(
        { error: "Вы не можете отклонить эту заявку" },
        { status: 403 }
      );
    }

    await prisma.friendship.delete({ where: { id: friendshipId } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Ошибка при отклонении заявки:", err);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
