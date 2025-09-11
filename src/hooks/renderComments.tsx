import React from "react";
import { Comment } from "@/types/comment";
import { COMMENT_BG_COLORS } from "@/constants/commentColors";

interface RenderCommentsProps {
  comments: Comment[];
  photoId: number;
  replyTo: number | null;
  selectedPhoto: number | null;
  replyText: string;
  setReplyTo: (id: number | null) => void;
  setSelectedPhoto: (id: number | null) => void;
  setReplyText: (text: string) => void;
  addComment: (photoId: number, text: string, parentId?: number | null) => void;
  replyInputRef: React.RefObject<HTMLInputElement | null>;
  styles: { [key: string]: string };
  parentId?: number | null;
  level?: number;
}

export function renderComments({
  comments,
  photoId,
  replyTo,
  selectedPhoto,
  replyText,
  setReplyTo,
  setSelectedPhoto,
  setReplyText,
  addComment,
  replyInputRef,
  styles,
  parentId = null,
  level = 0,
}: RenderCommentsProps): React.ReactNode {
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
              {renderComments({
                comments,
                photoId,
                replyTo,
                selectedPhoto,
                replyText,
                setReplyTo,
                setSelectedPhoto,
                setReplyText,
                addComment,
                replyInputRef,
                styles,
                parentId: c.id,
                level: level + 1,
              })}
            </ul>
          </article>
        </li>
      );
    });
}
