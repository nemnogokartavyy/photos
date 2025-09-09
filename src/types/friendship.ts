import { User } from "@/types/user";

export interface Friendship {
  id: number;
  requesterId: number;
  addresseeId: number;
  status: string;
  createdAt: Date;
  requester?: User;
  addressee?: User;
}
