import { z } from "zod";

export const commentSchema = z.object({
  photoId: z
    .number()
    .int("ID фото должно быть целым числом")
    .min(1, "Неверный ID фото"),
  text: z
    .string()
    .min(1, "Комментарий не может быть пустым")
    .max(500, "Комментарий не может быть длиннее 500 символов"),
  parentId: z
    .number()
    .int("ID родительского комментария должно быть целым числом")
    .optional(),
});

export type CommentInput = z.infer<typeof commentSchema>;
