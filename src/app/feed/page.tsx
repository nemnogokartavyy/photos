import Feed from "./Feed";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata(
  "Лента друзей - ФотоСеть",
  "Смотрите новые фото ваших друзей, комментируйте и ставьте лайки"
);

export default function FeedPage() {
  return <Feed />;
}
