// src/components/widgets/notes/NoteEditor.tsx
"use client";

import { useId } from "react";
import styles from "@/styles/components/widgets/notes/NoteEditor.module.scss";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  defaultTitle?: string;
  defaultContent?: string;
  pending?: boolean;
  fieldErrors?: Record<string, string[] | undefined>;
  error?: string | null;
  onCancel?: () => void;
};

/**
 * Title + content form, shared by "create" (NoteList) and inline "edit" (NoteItem).
 * Presentational: the parent decides what happens on submit.
 */
const NoteEditor = ({
  action,
  submitLabel,
  defaultTitle = "",
  defaultContent = "",
  pending = false,
  fieldErrors,
  error,
  onCancel,
}: Props) => {
  // Several editors can be on the page at once, so ids must be unique.
  const id = useId();
  const titleError = fieldErrors?.title?.[0];
  const contentError = fieldErrors?.content?.[0];
  const formError = !titleError && !contentError ? error : null;

  return (
    <form
      action={action}
      className={styles.form}
      onKeyDown={(e) => {
        if (e.key === "Escape" && onCancel) onCancel();
      }}
    >
      <input
        name="title"
        type="text"
        placeholder="Title (optional)"
        aria-label="Title"
        aria-invalid={titleError ? true : undefined}
        aria-describedby={titleError ? `${id}-title-error` : undefined}
        defaultValue={defaultTitle}
        maxLength={200}
        className={styles.input}
      />
      {titleError && (
        <p id={`${id}-title-error`} role="alert" className={styles.error}>
          {titleError}
        </p>
      )}

      <textarea
        name="content"
        placeholder="Write a note…"
        aria-label="Content"
        aria-invalid={contentError ? true : undefined}
        aria-describedby={contentError ? `${id}-content-error` : undefined}
        defaultValue={defaultContent}
        maxLength={10_000}
        required
        rows={4}
        className={styles.textarea}
      />
      {contentError && (
        <p id={`${id}-content-error`} role="alert" className={styles.error}>
          {contentError}
        </p>
      )}

      {formError && (
        <p role="alert" className={styles.error}>
          {formError}
        </p>
      )}

      <div className={styles.actions}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className={styles.secondaryButton}
          >
            Cancel
          </button>
        )}
        <button type="submit" disabled={pending} className={styles.button}>
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

export default NoteEditor;
