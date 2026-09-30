// src/components/ui/darkmodeButton.tsx
"use client";

import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { getActiveTheme, setTheme } from "@/lib/helpers/theme";
import styles from "@/styles/components/ui/DarkmodeButton.module.scss";

// Both icons are rendered; CSS shows the right one, so the server and client
// markup always match and there is no React state.
const DarkmodeButton = () => {
  const toggleTheme = () => {
    setTheme(getActiveTheme() === "dark" ? "light" : "dark");
  };

  return (
    <button
      type="button"
      className={styles.button}
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
    >
      <MoonIcon
        className={styles.moon}
        width={24}
        height={24}
        aria-hidden="true"
      />
      <SunIcon
        className={styles.sun}
        width={24}
        height={24}
        aria-hidden="true"
      />
    </button>
  );
};

export default DarkmodeButton;
