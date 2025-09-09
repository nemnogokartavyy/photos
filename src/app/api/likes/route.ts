import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { DecodedToken } from "@/types/decodedtoken";
import { LikePhotoBody } from "@/types/likephotobody";
import { Like } from "@/types/like";

export async function POST(req: NextRequest) {
  try {
    const body: LikePhotoBody = await req.json();
    const { photoId } = body;

    const token = req.cookies.get("token")?.value;
    const decoded: DecodedToken | null = verifyToken(token || "");
    if (!decoded) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const existingLike = await prisma.like.findFirst({
      where: { userId: decoded.id, photoId },
    });

    if (existingLike) {
      await prisma.like.delete({ where: { id: existingLike.id } });
    } else {
      await prisma.like.create({
        data: { userId: decoded.id, photoId },
      });
    }

    const likes: Like[] = await prisma.like.findMany({
      where: { photoId },
      select: { id: true, userId: true },
    });

    return NextResponse.json({ likes });
  } catch (err) {
    console.error("Ошибка при обработке лайка:", err);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
