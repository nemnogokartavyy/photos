import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { DecodedToken } from "@/types/decodedtoken";
import { commentSchema } from "@/schemas/comment";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = commentSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Неверный ввод";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { photoId, text, parentId } = parsed.data;

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

    const comment = await prisma.comment.create({
      data: {
        text,
        photoId,
        authorId: decoded.id,
        parentId: parentId || null,
      },
      include: { author: true },
    });

    return NextResponse.json(comment);
  } catch (err) {
    console.error("Ошибка создания комментария:", err);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
