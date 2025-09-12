"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerSchema } from "@/schemas/register";
import Link from "next/link";
import styles from "./Register.module.css";

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    const result = registerSchema.safeParse({ name, username, password });
    if (!result.success) {
      setFeedback({ type: "error", text: result.error.issues[0].message });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setFeedback({
          type: "error",
          text:
            data?.error?.[0]?.message || data?.error || "Ошибка регистрации",
        });
      } else {
        setFeedback({ type: "success", text: "Регистрация прошла успешно!" });
        router.push("/login");
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Сетевая ошибка" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.register}>
      <form className={styles.register__form} onSubmit={handleSubmit}>
        <h1 className={styles.register__title}>Регистрация</h1>

        {feedback && (
          <p
            className={`
              ${styles.register__message}
              ${
                feedback.type === "error"
                  ? styles.register__error
                  : styles.register__success
              }
              `}
          >
            {feedback.text}
          </p>
        )}

        <label className={styles.register__label}>
          <input
            className={`${styles.register__input} ${styles.register__input_name}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Имя"
            type="text"
            autoComplete="given-name"
          />
        </label>

        <label className={styles.register__label}>
          <input
            className={`${styles.register__input} ${styles.register__input_username}`}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Никнейм"
            type="text"
            autoComplete="username"
          />
        </label>

        <label className={styles.register__label}>
          <input
            className={`${styles.register__input} ${styles.register__input_password}`}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            autoComplete="new-password"
          />
        </label>

        <button
          className={styles.register__button}
          type="submit"
          disabled={loading}
        >
          {loading ? "Загрузка..." : "Зарегистрироваться"}
        </button>
        <div className={styles["register__login-text-block"]}>
          <p className={styles["register__login-text"]}>Уже есть аккаунт? </p>
          <Link className={styles["register__login-link"]} href="/login">
            Войти
          </Link>
        </div>
      </form>
    </div>
  );
}
