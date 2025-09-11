"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { useAuth } from "@/context/AuthContext";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import styles from "./Friends.module.css";
import { Friend } from "@/types/friend";
import { fetcher } from "@/lib/fetcher";
import { Feedback } from "@/types/actionFeedback";

export default function Friends() {
  useProtectedRoute();

  const { user } = useAuth();

  const [friendUsername, setFriendUsername] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loadingIds, setLoadingIds] = useState<{ [key: number]: boolean }>({});

  const setLoadingForId = (id: number, value: boolean) => {
    setLoadingIds((prev) => ({ ...prev, [id]: value }));
  };

  const { data: friends, mutate } = useSWR<Friend[]>(
    user ? `/api/friends/list` : null,
    fetcher,
    {
      refreshInterval: 0,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  const sendRequest = async () => {
    if (!friendUsername) return;
    try {
      const res = await fetch("/api/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: friendUsername }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "Ошибка запроса дружбы");
      }
      setFeedback({ type: "success", text: "Заявка отправлена!" });
      setFriendUsername("");
      mutate();
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err.message || "Ошибка сети или сервера",
      });
    }
  };

  const handleAction = async (
    friendshipId: number,
    action: "accept" | "reject" | "delete"
  ) => {
    setLoadingForId(friendshipId, true);
    try {
      const url = `/api/friends/${action}`;
      const options: RequestInit = {
        method: action === "delete" ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ friendshipId }),
      };
      const res = await fetch(url, options);
      const resData = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(resData?.error || `Ошибка при ${action}`);
      }
      setFeedback({
        type: "success",
        text: `Действие '${action}' выполнено`,
      });

      mutate();
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err.message || "Ошибка сети или сервера",
      });
    } finally {
      setLoadingForId(friendshipId, false);
      setFriendUsername("");
    }
  };

  if (!user) return null;

  const incoming =
    friends?.filter(
      (f) => f.status === "pending" && f.addressee.id === user.id
    ) || [];
  const outgoing =
    friends?.filter(
      (f) => f.status === "pending" && f.requester.id === user.id
    ) || [];
  const accepted = friends?.filter((f) => f.status === "accepted") || [];

  return (
    <div className={styles.friends}>
      <h1 className={styles["friends__title"]}>Друзья</h1>

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

      <form
        className={styles["friends__form"]}
        onSubmit={(e) => {
          e.preventDefault();
          sendRequest();
        }}
      >
        <input
          value={friendUsername}
          onChange={(e) => setFriendUsername(e.target.value)}
          placeholder="Введите никнейм"
          className={styles["friends__input"]}
        />
        <button
          type="submit"
          className={styles["friends__button"]}
          disabled={!friendUsername.trim()}
        >
          Отправить заявку
        </button>
      </form>

      <section className={styles["friends__section"]}>
        <h2 className={styles["friends__subtitle"]}>Входящие заявки</h2>
        {incoming.length ? (
          <ul className={styles["friends__list"]}>
            {incoming.map((f) => (
              <li key={f.id} className={styles["friends__item"]}>
                <span className={styles["friends__username"]}>
                  {f.requester.username}
                </span>
                <div className={styles["friends__actions"]}>
                  <button
                    className={`${styles["friends__button"]} ${styles["friends__button--accept"]}`}
                    onClick={() => handleAction(f.id, "accept")}
                    disabled={!!loadingIds[f.id]}
                  >
                    {loadingIds[f.id] ? "Загрузка..." : "Принять"}
                  </button>
                  <button
                    className={`${styles["friends__button"]} ${styles["friends__button--reject"]}`}
                    onClick={() => handleAction(f.id, "reject")}
                    disabled={!!loadingIds[f.id]}
                  >
                    {loadingIds[f.id] ? "Загрузка..." : "Отклонить"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles["friends__empty"]}>У вас нет входящих заявок</p>
        )}
      </section>

      <section className={styles["friends__section"]}>
        <h2 className={styles["friends__subtitle"]}>Исходящие заявки</h2>
        {outgoing.length ? (
          <ul className={styles["friends__list"]}>
            {outgoing.map((f) => (
              <li key={f.id} className={styles["friends__item"]}>
                <span className={styles["friends__username"]}>
                  {f.addressee.username} (в ожидании)
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles["friends__empty"]}>У вас нет исходящих заявок</p>
        )}
      </section>

      <section className={styles["friends__section"]}>
        <h2 className={styles["friends__subtitle"]}>Список друзей</h2>
        {accepted.length ? (
          <ul className={styles["friends__list"]}>
            {accepted.map((f) => {
              const friendUser =
                f.requester.id === user.id ? f.addressee : f.requester;
              return (
                <li key={f.id} className={styles["friends__item"]}>
                  <span className={styles["friends__username"]}>
                    {friendUser.username}
                  </span>
                  <button
                    className={`${styles["friends__button"]} ${styles["friends__button--delete"]}`}
                    onClick={() => handleAction(f.id, "delete")}
                    disabled={!!loadingIds[f.id]}
                  >
                    {loadingIds[f.id] ? "Загрузка..." : "Удалить"}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className={styles["friends__empty"]}>У вас пока нет друзей</p>
        )}
      </section>
    </div>
  );
}
