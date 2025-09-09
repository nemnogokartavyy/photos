import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { signToken } from "@/lib/auth";
import { registerSchema } from "@/schemas/register";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { User } from "@/types/user";
import { sendTokenResponse } from "@/lib/sendTokenResponse";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Неверный ввод";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { name, username, password } = parsed.data;

    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Имя пользователя уже существует" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, username, password: hashedPassword },
    });

    const publicUser: User = { id: user.id, username: user.username };

    return sendTokenResponse(publicUser);
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json(
        { error: "Имя пользователя уже существует" },
        { status: 400 }
      );
    }

    console.error("Ошибка регистрации:", err);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
