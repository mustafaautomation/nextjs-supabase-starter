'use client';

import { useActionState, useState } from 'react';
import { Field, FormStatus, TextAreaField } from '@/components/field';
import { initialFormState, type FormState } from '@/lib/form-state';
import type { Note } from '@/lib/types';
import { deleteNote, updateNote } from './actions';

export function NoteItem({ note }: { note: Note }) {
  const [editing, setEditing] = useState(false);

  const [updateState, update, saving] = useActionState(async (prev: FormState, form: FormData) => {
    const result = await updateNote(prev, form);
    if (!result.error && !result.fieldErrors) setEditing(false);
    return result;
  }, initialFormState);
  const [deleteState, remove, deleting] = useActionState(deleteNote, initialFormState);

  const headingId = `note-${note.id}-title`;

  return (
    <li className="card note" aria-labelledby={headingId}>
      {editing ? (
        <form action={update} className="stack" aria-label={`Edit ${note.title}`} noValidate>
          <input type="hidden" name="id" value={note.id} />
          <h3 id={headingId} className="visually-hidden">
            Editing {note.title}
          </h3>
          <Field
            name="title"
            label="Title"
            idPrefix={`edit-${note.id}-`}
            defaultValue={note.title}
            maxLength={120}
            required
            error={updateState.fieldErrors?.title}
          />
          <TextAreaField
            name="body"
            label="Note"
            idPrefix={`edit-${note.id}-`}
            defaultValue={note.body}
            rows={3}
            maxLength={2000}
            error={updateState.fieldErrors?.body}
          />
          <FormStatus error={updateState.error} />
          <div className="row">
            <button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button type="button" className="secondary" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <h3 id={headingId}>{note.title}</h3>
          {note.body ? <p className="note-body">{note.body}</p> : null}
          <div className="row">
            <button
              type="button"
              className="secondary"
              onClick={() => setEditing(true)}
              aria-label={`Edit ${note.title}`}
            >
              Edit
            </button>
            <form action={remove}>
              <input type="hidden" name="id" value={note.id} />
              <button type="submit" className="danger" disabled={deleting} aria-label={`Delete ${note.title}`}>
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </form>
          </div>
          <FormStatus error={deleteState.error} />
        </>
      )}
    </li>
  );
}
