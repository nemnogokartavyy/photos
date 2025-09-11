"use client";

import { useState, useRef, useEffect } from "react";
import useSWRInfinite from "swr/infinite";
import { useAuth } from "@/context/AuthContext";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import styles from "./Profile.module.css";
import { COMMENT_BG_COLORS } from "@/constants/commentColors";
import { Comment } from "@/types/comment";
import { Photo } from "@/types/photo";
import { LIMIT } from "@/constants/limitPages";
import { fetcher } from "@/lib/fetcher";
import { usePhotoActions } from "@/hooks/usePhotoActions";

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

  function renderComments(
    comments: Comment[],
    photoId: number,
    parentId: number | null = null,
    level: number = 0
  ): React.ReactNode[] {
    return comments
      .filter((c) => c.parentId === parentId)
      .map((c) => {
        const bgColor = COMMENT_BG_COLORS[level % COMMENT_BG_COLORS.length];
        return (
          <li
            key={c.id}
            style={{ paddingLeft: `${level * 20}px` }}
            className={styles["comment-list__item"]}
          >
            <article
              style={{ backgroundColor: bgColor }}
              className={styles["comment-list__comment"]}
            >
              <header className={styles["comment-list__header"]}>
                <strong className={styles["comment-list__author"]}>
                  {c.author.username}
                </strong>
              </header>
              <p className={styles["comment-list__text"]}>{c.text}</p>
              <footer className={styles["comment-list__actions"]}>
                <button
                  className={styles["comment-list__reply-button"]}
                  onClick={() => {
                    setReplyTo(c.id);
                    setSelectedPhoto(photoId);
                  }}
                >
                  Ответить
                </button>
              </footer>
              {replyTo === c.id && selectedPhoto === photoId && (
                <form
                  className={styles["comment-list__reply-form"]}
                  onSubmit={(e) => {
                    e.preventDefault();
                    addComment(photoId, replyText, c.id);
                  }}
                >
                  <input
                    ref={replyInputRef}
                    className={styles["comment-list__reply-input"]}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Напишите ответ..."
                  />
                  <button
                    type="submit"
                    className={styles["comment-list__reply-submit"]}
                  >
                    ➤
                  </button>
                </form>
              )}
              <ul className={styles["comment-list__children"]}>
                {renderComments(comments, photoId, c.id, level + 1)}
              </ul>
            </article>
          </li>
        );
      });
  }

  if (!user) return null;

  return (
    <div className={styles.feed}>
      <h1 className={styles.feed__title}>Профиль</h1>
      {feedback && (
        <p
          className={
            feedback.type === "error"
              ? styles.feed__error
              : styles.feed__success
          }
        >
          {feedback.text}
        </p>
      )}
      <section className={styles["photo-upload"]}>
        <label className={styles["photo-upload__label"]}>
          {file ? "Фото готово к загрузке" : "Выбрать фото для загрузки"}
          <input
            ref={fileInputRef}
            type="file"
            onChange={(e) => e.target.files && setFile(e.target.files[0])}
            className={styles["photo-upload__input"]}
          />
        </label>
        <button
          className={styles["photo-upload__button"]}
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
                      className={styles["photo-card__like-button"]}
                      onClick={() => toggleLike(photo.id)}
                      disabled={loadingActions[photo.id]}
                    >
                      {liked ? "Не нравится" : "Нравится"} ({photo.likes.length}
                      )
                    </button>
                    <button
                      className={styles["photo-card__delete-button"]}
                      onClick={() => deletePhoto(photo.id)}
                      disabled={loadingActions[photo.id]}
                    >
                      Удалить
                    </button>
                  </figcaption>
                </figure>
                <section className={styles["photo-card__comments"]}>
                  <ul className={styles["photo-card__comments-list"]}>
                    {renderComments(photo.comments, photo.id)}
                  </ul>
                  <footer className={styles["photo-card__comment-form"]}>
                    <input
                      className={styles["photo-card__comment-input"]}
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
                      className={styles["photo-card__comment-button"]}
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
          className={styles["feed__load-more"]}
          onClick={() => setSize(size + 1)}
        >
          Показать ещё
        </button>
      )}
    </div>
  );
}
