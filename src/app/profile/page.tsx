import Profile from "./Profile";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata(
  "Профиль - ФотоСеть",
  "Ваша личная страница профиля с фотографиями, комментариями и лайками."
);

export default function Page() {
  return <Profile />;
}
