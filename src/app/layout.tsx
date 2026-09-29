import { Doto, Be_Vietnam_Pro } from "next/font/google";
import "@/styles/main.scss";
import styles from "@/styles/layout/AppLayout.module.scss";

const doto = Doto({
  subsets: ["latin"],
  axes: ["ROND"],
  variable: "--font-doto",
  display: "swap",
});

const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  style: ["normal"],
  variable: "--font-be-vietnam",
  display: "swap",
});

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${doto.variable} ${beVietnam.variable}`}>
      <body className={styles.app}>{children}</body>
    </html>
  );
}
