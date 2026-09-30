// src/components/widgets/notes/NoteWidget.tsx
import Link from "next/link";
import styles from "@/styles/components/widgets/notes/NoteWidget.module.scss";
import { getFeaturedNote } from "@/server/queries/notes";

const NoteWidget = async () => {
  // Most recently pinned note, or the newest one if none is pinned
  const note = await getFeaturedNote();

  return (
    <section className={styles.widget} aria-labelledby="note-widget-title">
      <header className={styles.header}>
        <h2 id="note-widget-title" className={styles.title}>
          Notes
        </h2>
        <Link href="/notes" className={styles.link}>
          All notes
        </Link>
      </header>

      {note ? (
        <article className={styles.note}>
          {note.pinnedAt && <p className={styles.badge}>Pinned</p>}
          {note.title && <h3 className={styles.noteTitle}>{note.title}</h3>}
          <p className={styles.content}>{note.content}</p>
        </article>
      ) : (
        <p className={styles.empty}>
          No notes yet. <Link href="/notes">Create your first note</Link>
        </p>
      )}
    </section>
  );
};

export default NoteWidget;
