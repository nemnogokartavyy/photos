"use client";

import { useState, useRef, useEffect } from "react";
import useSWRInfinite from "swr/infinite";
import { useAuth } from "@/context/AuthContext";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import "@/app/style.css";
import styles from "./Feed.module.css";
import { Photo as BasePhoto } from "@/types/photo";
import { LIMIT } from "@/constants/limitPages";
import { fetcher } from "@/lib/fetcher";
import { renderComments } from "@/hooks/renderComments";
import { usePhotoActions } from "@/hooks/usePhotoActions";
import cn from "classnames";

export interface Photo extends BasePhoto {
  owner: { username: string };
}

export default function Feed() {
  useProtectedRoute();

  const { user } = useAuth();

  const [commentTextMap, setCommentTextMap] = useState<{
    [photoId: number]: string;
  }>({});

  const [replyText, setReplyText] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);

  const replyInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (replyTo !== null && replyInputRef.current)
      replyInputRef.current.focus();
  }, [replyTo, selectedPhoto]);

  const { data, size, setSize, mutate } = useSWRInfinite<Photo[]>(
    (index, prev) =>
      !user ? null : `/api/feed?page=${index + 1}&limit=${LIMIT}`,
    fetcher
  );

  const photos: Photo[] = data ? ([] as Photo[]).concat(...data) : [];
  const lastPage = data?.[data.length - 1] || [];
  const hasMore = lastPage.length === LIMIT;

  const {
    toggleLike,
    addComment,
    uploadPhoto,
    deletePhoto,
    loadingActions,
    feedback,
    file,
    setFile,
    fileInputRef,
  } = usePhotoActions({
    data,
    mutate,
    user,
    setCommentTextMap,
    setReplyText,
    setReplyTo,
    setSelectedPhoto,
  });

  if (!user) return null;

  return (
    <div className={styles.feed}>
      <h1 className={styles.feed__title}>Лента фото</h1>
      {feedback && (
        <p
          className={cn(
            feedback.type === "error"
              ? styles.feed__error
              : styles.feed__success
          )}
        >
          {feedback.text}
        </p>
      )}
      {photos.length === 0 ? (
        <p className={styles.feed__empty}>У ваших друзей пока нет фото.</p>
      ) : (
        <section className={styles.feed__photos}>
          {photos.map((photo) => {
            const liked = photo.likes.some((l) => l.userId === user.id);
            const loading = loadingActions[photo.id] || false;

            return (
              <article key={photo.id} className={styles["photo-card"]}>
                <header className={styles["photo-card__header"]}>
                  <p className={styles["photo-card__owner"]}>
                    {photo.owner.username}
                  </p>
                </header>
                <figure className={styles["photo-card__figure"]}>
                  <img
                    src={photo.url}
                    alt={`Фото пользователя ${photo.owner.username}`}
                    className={styles["photo-card__image"]}
                  />
                  <figcaption className={styles["photo-card__actions"]}>
                    <button
                      className={cn(
                        styles["photo-card__like-button"],
                        "link-style"
                      )}
                      onClick={() => toggleLike(photo.id)}
                      disabled={loading}
                    >
                      {liked ? "Не нравится" : "Нравится"} ({photo.likes.length}
                      )
                    </button>
                  </figcaption>
                </figure>

                <section className={styles["photo-card__comments"]}>
                  <ul className={styles["photo-card__comments-list"]}>
                    {renderComments({
                      comments: photo.comments,
                      photoId: photo.id,
                      replyTo,
                      selectedPhoto,
                      replyText,
                      setReplyTo,
                      setSelectedPhoto,
                      setReplyText,
                      styles,
                      addComment,
                      replyInputRef,
                    })}
                  </ul>
                  <footer className={styles["photo-card__comment-form"]}>
                    <input
                      className={cn(
                        styles["photo-card__comment-input"],
                        "input-style"
                      )}
                      value={
                        selectedPhoto === photo.id && replyTo === null
                          ? commentTextMap[photo.id] || ""
                          : ""
                      }
                      onChange={(e) => {
                        setSelectedPhoto(photo.id);
                        setReplyTo(null);
                        setCommentTextMap((prev) => ({
                          ...prev,
                          [photo.id]: e.target.value,
                        }));
                      }}
                      placeholder="Оставьте комментарий..."
                    />
                    <button
                      className={cn(
                        styles["photo-card__comment-button"],
                        "btn-style"
                      )}
                      onClick={() =>
                        addComment(photo.id, commentTextMap[photo.id] || "")
                      }
                      disabled={!commentTextMap[photo.id]?.trim()}
                    >
                      Комментировать
                    </button>
                  </footer>
                </section>
              </article>
            );
          })}
        </section>
      )}

      {photos.length > 0 && hasMore && (
        <button
          className={cn(styles["feed__load-more"], "btn-style")}
          onClick={() => setSize(size + 1)}
        >
          Загрузить ещё
        </button>
      )}
    </div>
  );
}
