import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { User } from "@/types/user";
import { DecodedToken } from "@/types/decodedtoken";

export async function GET(req: NextRequest) {
  try {
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

    const user: User = { id: decoded.id, username: decoded.username };

    return NextResponse.json(user);
  } catch (err) {
    console.error("Ошибка получения информации о пользователе:", err);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
