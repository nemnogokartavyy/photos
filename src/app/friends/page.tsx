import Friends from "./Friends";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata(
  "Друзья - ФотоСеть",
  "Управляйте своими друзьями, входящими и исходящими запросами и многим другим"
);

export default function Page() {
  return <Friends />;
}
