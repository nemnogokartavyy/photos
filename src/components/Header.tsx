"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "@/app/style.css";
import styles from "./Header.module.css";

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="header container">
      <Link className="logo" href="/">
        ФотоСеть
      </Link>

      <nav className="nav">
        <ul className="nav-list">
          <li className="nav-item">
            <Link className="nav-link" href="/">
              Главная
            </Link>
          </li>

          {user ? (
            <>
              <li className="nav-item">
                <Link className="nav-link" href="/profile">
                  Профиль
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" href="/feed">
                  Лента
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" href="/friends">
                  Друзья
                </Link>
              </li>

              <li className="auth-block">
                <span className="auth-text">{user.username}</span>
                <button className="auth-btn, btn-style" onClick={handleLogout}>
                  Выйти
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="auth-block">
                <Link className="nav-link, btn-style" href="/login">
                  Войти
                </Link>
                <Link className="nav-link, btn-style" href="/register">
                  Регистрация
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}
