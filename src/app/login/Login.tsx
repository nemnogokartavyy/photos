"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { loginSchema } from "@/schemas/login";
import Link from "next/link";
import styles from "./Login.module.css";

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setFeedback(null);

    const result = loginSchema.safeParse({ username, password });
    if (!result.success) {
      setFeedback({ type: "error", text: result.error.issues[0].message });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setFeedback({
          type: "error",
          text:
            data?.error?.[0]?.message || data?.error || "Ошибка авторизации",
        });
      } else {
        await login(username, password);
        setFeedback({ type: "success", text: "Вход выполнен!" });
        router.push("/profile");
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Сетевая ошибка" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.login}>
      <form className={styles.login__form} onSubmit={handleSubmit}>
        <h1 className={styles.login__title}>Вход</h1>

        {feedback && (
          <p
            className={
              feedback.type === "error"
                ? styles.login__error
                : styles.login__success
            }
          >
            {feedback.text}
          </p>
        )}

        <label className={styles.login__label}>
          <input
            className={`${styles.login__input} ${styles.login__input_username}`}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Никнейм"
            type="text"
            autoComplete="username"
          />
        </label>

        <label className={styles.login__label}>
          <input
            className={`${styles.login__input} ${styles.login__input_password}`}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            autoComplete="current-password"
          />
        </label>

        <button
          className={styles.login__button}
          type="submit"
          disabled={loading}
        >
          {loading ? "Загрузка..." : "Войти"}
        </button>
        <div className={styles["login__register-text-block"]}>
          <p className={styles["login__register-text"]}>Нет аккаунта? </p>
          <Link className={styles["login__register-link"]} href="/register">
            Зарегистрироваться
          </Link>
        </div>
      </form>
    </div>
  );
}
