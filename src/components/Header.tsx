"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
                <button className="auth-btn" onClick={handleLogout}>
                  Выйти
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link className="nav-link" href="/login">
                  Войти
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" href="/register">
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
