import { NextResponse } from "next/server";
import { signToken } from "./auth";
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
