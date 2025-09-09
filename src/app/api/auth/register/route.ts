import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { signToken } from "@/lib/auth";
import { registerSchema } from "@/schemas/register";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { User } from "@/types/user";

export function sendTokenResponse(user: User) {
  const token = signToken({ id: user.id, username: user.username });
  const response = NextResponse.json(user);
  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
    sameSite: "lax",
  });
  return response;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      return NextResponse.json({ error: errors }, { status: 400 });
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

    return sendTokenResponse({ id: user.id, username: user.username });
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
