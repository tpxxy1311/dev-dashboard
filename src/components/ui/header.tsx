// src/components/ui/header.tsx
import styles from "@/styles/components/ui/Header.module.scss";
import DarkmodeButton from "./darkmodeButton";
import PageHeadline from "./pageHeadline";

const Header = () => {
  return (
    <header className={styles.header}>
      <PageHeadline />
      <DarkmodeButton />
    </header>
  );
};

export default Header;
