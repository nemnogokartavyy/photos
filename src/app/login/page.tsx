import Login from "./Login";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata(
  "Вход - ФотоСеть",
  "Войдите в свой аккаунт, чтобы получить доступ к профилю и управлять друзьями."
);

export default function Page() {
  return <Login />;
}
