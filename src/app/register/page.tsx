import Register from "./Register";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata(
  "Регистрация - ФотоСеть",
  "Создайте новый аккаунт, чтобы получить доступ ко всем функциям ФотоСеть."
);

export default function Page() {
  return <Register />;
}
