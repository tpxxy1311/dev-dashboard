// src/components/ui/sidebar.tsx
import Link from "next/link";
import {
  Cog6ToothIcon,
  DocumentTextIcon,
  UserCircleIcon,
  HomeIcon,
  CalendarDateRangeIcon
} from "@heroicons/react/24/outline";
import BackButton from "./backButton";
import SignOutButton from "./signoutButton";
import styles from "@/styles/components/ui/Sidebar.module.scss";

const Sidebar = () => {
  return (
    <div className={styles.sidebarWrapper}>
      <nav className={styles.sidebar}>
        <BackButton
          className={styles.back}
          disabledClassName={styles.disabled}
        />
        <ul className={styles.list}>
          <li>
            <Link href="/" className={styles.link} aria-label="Home">
              <HomeIcon width={24} height={24} aria-hidden="true" />
            </Link>
          </li>
          <li>
            <Link href="/account" className={styles.link} aria-label="Account">
              <UserCircleIcon width={24} height={24} aria-hidden="true" />
            </Link>
          </li>
          <li>
            <Link
              href="/settings"
              className={styles.link}
              aria-label="Settings"
            >
              <Cog6ToothIcon width={24} height={24} aria-hidden="true" />
            </Link>
          </li>
          <li>
            <Link href="/notes" className={styles.link} aria-label="Notes">
              <DocumentTextIcon width={24} height={24} aria-hidden="true" />
            </Link>
          </li>
           <li>
            <Link href="/calendar" className={styles.link} aria-label="Account">
              <CalendarDateRangeIcon width={24} height={24} aria-hidden="true" />
            </Link>
          </li>
        </ul>
        <SignOutButton className={styles.logout} />
      </nav>
    </div>
  );
};

export default Sidebar;
