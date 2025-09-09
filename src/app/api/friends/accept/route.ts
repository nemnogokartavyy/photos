import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { DecodedToken } from "@/types/decodedtoken";
import { Friendship } from "@/types/friendship";
import { AcceptFriendRequestBody } from "@/types/acceptfriendrequestbody";

export async function POST(req: NextRequest) {
  try {
    const body: AcceptFriendRequestBody = await req.json();

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
        { error: "Вы не можете принять эту заявку" },
        { status: 403 }
      );
    }

    const updatedFriendship: Friendship = await prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: "accepted" },
      include: {
        requester: true,
        addressee: true,
      },
    });

    return NextResponse.json(updatedFriendship);
  } catch (err) {
    console.error("Ошибка при принятии заявки в друзья:", err);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
