import { Photo } from "@/types/photo";
import { User } from "@/types/user";
import { useState, useRef } from "react";

interface UsePhotoActionsParams {
  data: Photo[][] | undefined;
  mutate: any;
  user: User | null;
  setCommentTextMap: React.Dispatch<
    React.SetStateAction<{ [photoId: number]: string }>
  >;
  setReplyText: React.Dispatch<React.SetStateAction<string>>;
  setReplyTo: React.Dispatch<React.SetStateAction<number | null>>;
  setSelectedPhoto: React.Dispatch<React.SetStateAction<number | null>>;
}

export function usePhotoActions({
  data,
  mutate,
  user,
  setCommentTextMap,
  setReplyText,
  setReplyTo,
  setSelectedPhoto,
}: UsePhotoActionsParams) {
  const [loadingActions, setLoadingActions] = useState<{
    [photoId: number]: boolean;
  }>({});
  const [feedback, setFeedback] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const setLoading = (photoId: number, value: boolean) => {
    setLoadingActions((prev) => ({ ...prev, [photoId]: value }));
  };

  const toggleLike = async (photoId: number) => {
    if (!user) return;
    setLoading(photoId, true);
    const previousData = data;
    mutate(
      (pages: Photo[][] | undefined) =>
        pages?.map((page) =>
          page.map((p) => {
            if (p.id !== photoId) return p;
            const alreadyLiked = p.likes.some(
              (like) => like.userId === user.id
            );
            return {
              ...p,
              likes: alreadyLiked
                ? p.likes.filter((like) => like.userId !== user.id)
                : [...p.likes, { id: Date.now(), userId: user.id }],
            };
          })
        ),
      false
    );
    try {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ photoId }),
      });
      const resData = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(resData?.error || "Ошибка изменения лайка");
      mutate(undefined, true);
    } catch (err: any) {
      mutate(previousData, false);
      setFeedback({ type: "error", text: err.message || "Сетевая ошибка" });
    } finally {
      setLoading(photoId, false);
    }
  };

  const addComment = async (
    photoId: number,
    text: string,
    parentId: number | null = null
  ) => {
    if (!text.trim() || !user) return;
    setLoading(photoId, true);
    const previousData = data;
    mutate(
      (pages: Photo[][] | undefined) =>
        pages?.map((page) =>
          page.map((p) =>
            p.id === photoId
              ? {
                  ...p,
                  comments: [
                    ...p.comments,
                    {
                      id: Date.now() + Math.random(),
                      text,
                      author: { username: user.username },
                      parentId,
                    },
                  ],
                }
              : p
          )
        ),
      false
    );
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          photoId,
          text,
          parentId: parentId ?? undefined,
        }),
      });
      const resData = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(resData.error || "Ошибка добавления комментария");
      mutate(undefined, true);
      setCommentTextMap((prev) => ({ ...prev, [photoId]: "" }));
      setReplyText("");
      setReplyTo(null);
      setSelectedPhoto(null);
      setFeedback({ type: "success", text: "Комментарий добавлен!" });
    } catch (err: any) {
      mutate(previousData, false);
      setFeedback({ type: "error", text: err.message || "Сетевая ошибка" });
    } finally {
      setLoading(photoId, false);
    }
  };

  const uploadPhoto = async () => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFeedback({
        type: "error",
        text: "Можно загружать только изображения!",
      });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setFeedback({ type: "error", text: "Файл слишком большой (макс 10MB)" });
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/photos/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const resData = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(resData.error || "Ошибка при загрузке");
      setFeedback({ type: "success", text: "Фото успешно загружено!" });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      mutate(undefined, true);
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Сеть недоступна" });
    }
  };

  const deletePhoto = async (photoId: number) => {
    if (!window.confirm("Вы уверены, что хотите удалить это фото?")) return;
    setLoading(photoId, true);
    const previousData = data;
    mutate(
      (pages: Photo[][] | undefined) =>
        pages?.map((page) => page.filter((p) => p.id !== photoId)),
      false
    );
    try {
      const res = await fetch("/api/photos/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ photoId }),
      });
      const resData = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(resData.error || "Ошибка при удалении фото");
      setFeedback({ type: "success", text: "Фото успешно удалено!" });
    } catch (err: any) {
      mutate(previousData, false);
      setFeedback({ type: "error", text: err.message || "Сетевая ошибка" });
    } finally {
      setLoading(photoId, false);
    }
  };

  return {
    toggleLike,
    addComment,
    uploadPhoto,
    deletePhoto,
    loadingActions,
    feedback,
    file,
    setFile,
    fileInputRef,
  };
}
