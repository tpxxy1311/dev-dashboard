// src/components/ui/sidebar.tsx
import Link from "next/link";
import {
  Cog6ToothIcon,
  DocumentTextIcon,
  UserCircleIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import styles from "@/styles/components/ui/Sidebar.module.scss";

const Sidebar = () => {
  return (
    <nav className={styles.sidebar} aria-label="Main">
      <ul className={styles.list}>
        <li>
          <Link href="/account" className={styles.link} aria-label="Home">
            <HomeIcon width={24} height={24} aria-hidden="true" />
          </Link>
        </li>
        <li>
          <Link href="/account" className={styles.link} aria-label="Account">
            <UserCircleIcon width={24} height={24} aria-hidden="true" />
          </Link>
        </li>
        <li>
          <Link href="/settings" className={styles.link} aria-label="Settings">
            <Cog6ToothIcon width={24} height={24} aria-hidden="true" />
          </Link>
        </li>
        <li>
          <Link href="/notes" className={styles.link} aria-label="Notes">
            <DocumentTextIcon width={24} height={24} aria-hidden="true" />
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar;
