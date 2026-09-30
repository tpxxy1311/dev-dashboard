// src/app/(dashboard)/layout.tsx
import Header from "@/components/ui/header";

export default function DashboardLayout({ children }: LayoutProps<"/">) {
  return (
      <>
      <Header />
      {children}
      </>
  )
}
