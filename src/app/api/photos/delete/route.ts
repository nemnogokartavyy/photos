import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { DecodedToken } from "@/types/decodedtoken";

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { photoId } = body;

    if (!photoId) {
      return NextResponse.json(
        { error: "ID фотографии обязателен" },
        { status: 400 }
      );
    }

    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const decoded: DecodedToken | null = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const photo = await prisma.photo.findUnique({ where: { id: photoId } });
    if (!photo) {
      return NextResponse.json(
        { error: "Фотография не найдена" },
        { status: 404 }
      );
    }

    if (photo.ownerId !== decoded.id) {
      return NextResponse.json(
        { error: "Нет доступа для удаления" },
        { status: 403 }
      );
    }

    await prisma.comment.deleteMany({ where: { photoId } });
    await prisma.like.deleteMany({ where: { photoId } });

    const fs = require("fs");
    const path = require("path");
    const filePath = path.join(process.cwd(), "public", photo.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await prisma.photo.delete({ where: { id: photoId } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Ошибка при удалении фотографии:", err);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
