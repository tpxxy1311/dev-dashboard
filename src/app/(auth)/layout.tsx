// src/app/(auth)/layout.tsx
import styles from "@/styles/layout/AuthLayout.module.scss";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return <main className={styles.auth}>{children}</main>;
}
