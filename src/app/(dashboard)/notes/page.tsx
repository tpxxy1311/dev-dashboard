// src/app/(dashboard)/notes/page.tsx
import styles from "@/styles/layout/pages/Notes.module.scss";
import { getNotes } from "@/server/queries/notes";
import NoteList from "@/components/widgets/notes/NoteList";

export const metadata = { title: "Notes" };

export default async function Notes() {
  const notes = await getNotes(); // Fetch notes for the signed-in user

  return (
    <div className={styles.page}>
      <h1>Notes</h1>
      <NoteList initialNotes={notes} />
    </div>
  );
}
