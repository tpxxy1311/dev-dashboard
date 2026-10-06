// src/app/(dashboard)/layout.tsx
import Header from "@/components/ui/header";
import Sidebar from "@/components/ui/sidebar";
import styles from "@/styles/layout/DashboardLayout.module.scss";

export default function DashboardLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Sidebar />
      <div className={styles.shell}>
        <Header />
        <main className={styles.main}>{children}</main>
      </div>
    </>
  );
}
