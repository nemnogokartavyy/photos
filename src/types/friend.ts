export interface Friend {
  id: number;
  requester: { id: number; username: string };
  addressee: { id: number; username: string };
  status: "pending" | "accepted";
}
