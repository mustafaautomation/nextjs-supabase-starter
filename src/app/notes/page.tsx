import type { Metadata } from 'next';
import { Suspense } from 'react';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import type { Note } from '@/lib/types';
import { NewNoteForm } from './new-note-form';
import { NoteItem } from './note-item';

export const metadata: Metadata = { title: 'Your notes' };

export default function NotesPage() {
  return (
    <section className="stack">
      <h1>Your notes</h1>
      <NewNoteForm />
      <h2>Saved notes</h2>
      <Suspense fallback={<p>Loading notes…</p>}>
        <NotesList />
      </Suspense>
    </section>
  );
}

async function NotesList() {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('notes')
    .select('id, title, body, created_at, updated_at')
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <p role="alert" className="form-error">
        Could not load your notes.
      </p>
    );
  }
  const notes = (data ?? []) as Note[];
  if (!notes.length) return <p className="muted">No notes yet. Add your first one above.</p>;

  return (
    <ul className="notes" aria-label="Notes">
      {notes.map((note) => (
        <NoteItem key={note.id} note={note} />
      ))}
    </ul>
  );
}
