import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { loginSchema } from "@/schemas/login";
import { sendTokenResponse } from "../register/route";
import { User } from "@/types/user";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      return NextResponse.json({ error: errors }, { status: 400 });
    }

    const { username, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return NextResponse.json(
        { error: "Недействительные учетные данные - логин" },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Недействительные учетные данные - пароль" },
        { status: 401 }
      );
    }

    const publicUser: User = { id: user.id, username: user.username };
    return sendTokenResponse(publicUser);
  } catch (err) {
    console.error("Ошибка входа:", err);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
