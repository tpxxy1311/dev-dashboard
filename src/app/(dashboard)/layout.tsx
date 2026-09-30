// src/app/(dashboard)/layout.tsx
import Header from "@/components/ui/header";
import Sidebar from "@/components/ui/sidebar";

export default function DashboardLayout({ children }: LayoutProps<"/">) {
  return (
      <>
      <Header />
      <Sidebar />
      {children}
      </>
  )
}
