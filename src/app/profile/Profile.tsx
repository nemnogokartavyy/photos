"use client";

import { useState, useRef, useEffect } from "react";
import useSWRInfinite from "swr/infinite";
import { useAuth } from "@/context/AuthContext";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import "@/app/style.css";
import styles from "./Profile.module.css";
import { Photo } from "@/types/photo";
import { LIMIT } from "@/constants/limitPages";
import { fetcher } from "@/lib/fetcher";
import { usePhotoActions } from "@/hooks/usePhotoActions";
import { renderComments } from "@/hooks/renderComments";
import cn from "classnames";

export default function Profile() {
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
    (index, previousPageData) => {
      if (!user) return null;
      if (previousPageData && previousPageData.length === 0) return null;
      return `/api/photos/me?page=${index + 1}&limit=${LIMIT}`;
    },
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
      <h1 className={styles.feed__title}>Профиль</h1>
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
      <section className={styles["photo-upload"]}>
        {/* <label tabIndex={0} className={`${styles["photo-upload__label"]}`}> */}
        <label
          tabIndex={0}
          className={cn(styles["photo-upload__label"], "btn-style")}
        >
          {file ? "Фото готово к загрузке" : "Выбрать фото для загрузки"}
          <input
            ref={fileInputRef}
            type="file"
            onChange={(e) => e.target.files && setFile(e.target.files[0])}
            className={styles["photo-upload__input"]}
          />
        </label>
        <button
          // className={styles["photo-upload__button"]}
          className={cn(styles["photo-upload__button"], "btn-style")}
          onClick={uploadPhoto}
          disabled={!file}
        >
          Загрузить
        </button>
      </section>
      {photos.length === 0 ? (
        <p className={styles.feed__empty}>У вас пока нет загруженных фото.</p>
      ) : (
        <section className={styles.feed__photos}>
          {photos.map((photo) => {
            const liked = photo.likes.some((l) => l.userId === user.id);
            const loading = loadingActions[photo.id] || false;
            return (
              <article key={photo.id} className={styles["photo-card"]}>
                <figure className={styles["photo-card__figure"]}>
                  <img
                    src={photo.url}
                    alt="Фото"
                    className={styles["photo-card__image"]}
                  />
                  <figcaption className={styles["photo-card__actions"]}>
                    <button
                      // className={styles["photo-card__like-button"]}
                      className={cn(
                        styles["photo-card__like-button"],
                        "link-style"
                      )}
                      onClick={() => toggleLike(photo.id)}
                      disabled={loadingActions[photo.id]}
                    >
                      {liked ? "Не нравится" : "Нравится"} ({photo.likes.length}
                      )
                    </button>
                    <button
                      // className={styles["photo-card__delete-button"]}
                      className={cn(
                        styles["photo-card__delete-button"],
                        "link-style"
                      )}
                      onClick={() => deletePhoto(photo.id)}
                      disabled={loadingActions[photo.id]}
                    >
                      Удалить
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
                      addComment,
                      replyInputRef,
                      styles,
                    })}
                  </ul>
                  <footer className={styles["photo-card__comment-form"]}>
                    <input
                      // className={styles["photo-card__comment-input"]}
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
                      placeholder="Добавьте комментарий..."
                    />
                    <button
                      // className={styles["photo-card__comment-button"]}
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
          // className={styles["feed__load-more"]}
          className={cn(styles["feed__load-more"], "btn-style")}
          onClick={() => setSize(size + 1)}
        >
          Показать ещё
        </button>
      )}
    </div>
  );
}
