import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { DecodedToken } from "@/types/decodedtoken";
import { RejectFriendRequestBody } from "@/types/rejectfriendrequestbody";

export async function POST(req: NextRequest) {
  try {
    const body: RejectFriendRequestBody = await req.json();
    const { friendshipId, token } = body;

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
