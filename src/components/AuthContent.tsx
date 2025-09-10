"use client";

import { useAuth } from "@/context/AuthContext";
import { ReactNode, useState, useEffect } from "react";
import styles from "./AuthContent.module.css";

export default function AuthContent({ children }: { children: ReactNode }) {
  const { loading } = useAuth();
  const [showChildren, setShowChildren] = useState(false);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setShowChildren(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  if (loading || !showChildren) {
    return (
      <div className={styles.spinnerContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  return <>{children}</>;
}
