import { Comment } from "./comment";

export interface Photo {
  id: number;
  url: string;
  comments: Comment[];
  likes: { id: number; userId: number }[];
}
