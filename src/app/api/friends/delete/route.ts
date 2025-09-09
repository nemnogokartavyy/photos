import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { DecodedToken } from "@/types/decodedtoken";
import { DeleteFriendRequestBody } from "@/types/deletefriendrequestbody";

export async function DELETE(req: NextRequest) {
  try {
    const body: DeleteFriendRequestBody = await req.json();
    const { friendshipId } = body;

    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const decoded: DecodedToken | null = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) {
      return NextResponse.json({ error: "Заявка не найдена" }, { status: 404 });
    }

    if (
      friendship.requesterId !== decoded.id &&
      friendship.addresseeId !== decoded.id
    ) {
      return NextResponse.json(
        { error: "Вы не можете удалить эту дружбу" },
        { status: 403 }
      );
    }

    await prisma.friendship.delete({ where: { id: friendshipId } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Ошибка при удалении дружбы:", err);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
