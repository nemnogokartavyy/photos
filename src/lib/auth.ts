import jwt from "jsonwebtoken";
import { DecodedToken } from "@/types/decodedtoken";

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET must be defined");
  return secret;
}

export function signToken(payload: object) {
  return jwt.sign(payload, getSecret(), { expiresIn: "7d" });
}

export function verifyToken(token: string): DecodedToken | null {
  try {
    const decoded = jwt.verify(token, getSecret()) as DecodedToken;

    if (decoded && decoded.id && decoded.username) {
      return decoded;
    }

    return null;
  } catch {
    return null;
  }
}
