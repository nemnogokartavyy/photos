export interface Comment {
  id: number;
  text: string;
  author: { username: string };
  parentId?: number | null;
}
