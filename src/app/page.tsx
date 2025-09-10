import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.hero__content}>
          <h1 className={styles.hero__title}>ФотоСеть</h1>
          <p className={styles.hero__subtitle}>
            Делись моментами, вдохновляй друзей и оставайся на связи.
          </p>
        </div>
        <div className={styles.hero__image}>
          <Image
            className={styles.hero__img}
            src="/hero.png"
            alt="Люди общаются с телефонами в руках"
            width={1920}
            height={1200}
            priority
          />
        </div>
      </section>

      <section className={styles.features}>
        <h2 className={styles.features__title}>Что внутри?</h2>
        <ul className={styles.features__list}>
          <li className={styles.features__item}>
            <strong className={styles["features__item-title"]}>Профиль</strong> -
            храни свои фотографии и делись моментами.
          </li>
          <li className={styles.features__item}>
            <strong className={styles["features__item-title"]}>Друзья</strong> -
            находи друзей и общайся с ними.
          </li>
          <li className={styles.features__item}>
            <strong className={styles["features__item-title"]}>Лента</strong> -
            вдохновляйся фото других пользователей.
          </li>
        </ul>
      </section>
    </>
  );
}
