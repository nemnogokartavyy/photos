import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { DecodedToken } from "@/types/decodedtoken";
import { AddFriendRequestBody } from "@/types/addfriendrequestbody";

export async function POST(req: NextRequest) {
  try {
    const body: AddFriendRequestBody = await req.json();
    const { username, token } = body;

    const decoded: DecodedToken | null = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const addressee = await prisma.user.findUnique({ where: { username } });
    if (!addressee) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      );
    }

    if (decoded.id === addressee.id) {
      return NextResponse.json(
        { error: "Нельзя добавить себя в друзья" },
        { status: 400 }
      );
    }

    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: decoded.id, addresseeId: addressee.id },
          { requesterId: addressee.id, addresseeId: decoded.id },
        ],
      },
    });

    if (existing) {
      if (existing.status === "pending") {
        return NextResponse.json(
          { error: "Заявка уже отправлена" },
          { status: 400 }
        );
      }
      if (existing.status === "accepted") {
        return NextResponse.json({ error: "Вы уже друзья" }, { status: 400 });
      }
    }

    const friendship = await prisma.friendship.create({
      data: { requesterId: decoded.id, addresseeId: addressee.id },
      include: { requester: true, addressee: true },
    });

    return NextResponse.json(friendship);
  } catch (err) {
    console.error("Ошибка при отправке заявки в друзья:", err);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
