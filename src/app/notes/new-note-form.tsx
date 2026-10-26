'use client';

import { useActionState } from 'react';
import { Field, FormStatus, TextAreaField } from '@/components/field';
import { initialFormState } from '@/lib/form-state';
import { createNote } from './actions';

export function NewNoteForm() {
  const [state, action, pending] = useActionState(createNote, initialFormState);
  return (
    <form action={action} className="card stack" aria-label="New note" noValidate>
      <Field name="title" label="Title" idPrefix="new-" maxLength={120} required error={state.fieldErrors?.title} />
      <TextAreaField
        name="body"
        label="Note"
        idPrefix="new-"
        rows={3}
        maxLength={2000}
        error={state.fieldErrors?.body}
      />
      <FormStatus error={state.error} message={state.message} />
      <button type="submit" disabled={pending}>
        {pending ? 'Adding…' : 'Add note'}
      </button>
    </form>
  );
}
