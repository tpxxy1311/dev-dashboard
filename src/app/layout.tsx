import { cookies } from "next/headers";
import { Doto, Be_Vietnam_Pro } from "next/font/google";
import { isTheme, THEME_COOKIE } from "@/lib/helpers/theme";
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

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Render the saved theme on the server so it doesn't flash on load.
  // Without a cookie, the system setting applies (see base/_root.scss).
  const savedTheme = (await cookies()).get(THEME_COOKIE)?.value;
  const theme = isTheme(savedTheme) ? savedTheme : undefined;

  return (
    <html
      lang="en"
      data-theme={theme}
      className={`${doto.variable} ${beVietnam.variable}`}
    >
      <body className={styles.app}>{children}</body>
    </html>
  );
}
