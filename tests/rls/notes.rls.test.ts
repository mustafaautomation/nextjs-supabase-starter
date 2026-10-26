import { randomUUID } from 'node:crypto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { beforeAll, describe, expect, it } from 'vitest';

// These tests talk to the local Supabase stack through the public API with the
// publishable key, exactly like the browser would. No service-role key is used,
// so nothing here can bypass row-level security.

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key)
  throw new Error('Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (see README).');

function client(): SupabaseClient {
  return createClient(url!, key!, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function newUser(): Promise<{ db: SupabaseClient; id: string }> {
  const db = client();
  const { data, error } = await db.auth.signUp({
    email: `rls-${randomUUID()}@example.test`,
    password: `pw-${randomUUID()}`,
  });
  if (error) throw error;
  if (!data.session || !data.user) throw new Error('expected a session: is email confirmation disabled locally?');
  return { db, id: data.user.id };
}

let alice: Awaited<ReturnType<typeof newUser>>;
let bob: Awaited<ReturnType<typeof newUser>>;
let aliceNoteId: string;

beforeAll(async () => {
  alice = await newUser();
  bob = await newUser();
  const { data, error } = await alice.db
    .from('notes')
    .insert({ title: 'Alice private note', body: 'only for alice' })
    .select('id, user_id')
    .single();
  if (error) throw error;
  expect(data.user_id).toBe(alice.id);
  aliceNoteId = data.id;
});

describe('notes RLS', () => {
  it('the owner can read their note', async () => {
    const { data, error } = await alice.db.from('notes').select('id, title').eq('id', aliceNoteId);
    expect(error).toBeNull();
    expect(data).toEqual([{ id: aliceNoteId, title: 'Alice private note' }]);
  });

  it("another user can't see it, even by id", async () => {
    const all = await bob.db.from('notes').select('id');
    expect(all.error).toBeNull();
    expect(all.data).toEqual([]);
    const byId = await bob.db.from('notes').select('id').eq('id', aliceNoteId);
    expect(byId.data).toEqual([]);
  });

  it("another user's update touches zero rows", async () => {
    const { data, error } = await bob.db.from('notes').update({ title: 'hacked' }).eq('id', aliceNoteId).select('id');
    expect(error).toBeNull();
    expect(data).toEqual([]);
    const check = await alice.db.from('notes').select('title').eq('id', aliceNoteId).single();
    expect(check.data?.title).toBe('Alice private note');
  });

  it("another user's delete touches zero rows", async () => {
    const { data, error } = await bob.db.from('notes').delete().eq('id', aliceNoteId).select('id');
    expect(error).toBeNull();
    expect(data).toEqual([]);
    const check = await alice.db.from('notes').select('id').eq('id', aliceNoteId);
    expect(check.data).toHaveLength(1);
  });

  it("a user can't create a note owned by someone else", async () => {
    const { error } = await bob.db.from('notes').insert({ title: 'planted', user_id: alice.id });
    expect(error?.code).toBe('42501');
  });

  it("the owner can't hand a note to another user", async () => {
    const { error } = await alice.db.from('notes').update({ user_id: bob.id }).eq('id', aliceNoteId);
    expect(error?.code).toBe('42501');
  });

  it('signed-out (anon) requests are refused outright', async () => {
    const { data, error } = await client().from('notes').select('id');
    expect(data).toBeNull();
    expect(error?.code).toBe('42501');
    const insert = await client().from('notes').insert({ title: 'anon' });
    expect(insert.error?.code).toBe('42501');
  });

  it('the database enforces the same limits as the form (blank / too long title)', async () => {
    const blank = await alice.db.from('notes').insert({ title: '   ' });
    expect(blank.error?.code).toBe('23514');
    const long = await alice.db.from('notes').insert({ title: 'x'.repeat(121) });
    expect(long.error?.code).toBe('23514');
  });

  it('updated_at moves forward on update', async () => {
    const before = await alice.db.from('notes').select('updated_at').eq('id', aliceNoteId).single();
    await new Promise((r) => setTimeout(r, 20));
    const after = await alice.db
      .from('notes')
      .update({ body: 'edited' })
      .eq('id', aliceNoteId)
      .select('updated_at')
      .single();
    expect(after.error).toBeNull();
    expect(new Date(after.data!.updated_at).getTime()).toBeGreaterThan(new Date(before.data!.updated_at).getTime());
  });

  it('the owner can delete their note', async () => {
    const { data, error } = await alice.db.from('notes').delete().eq('id', aliceNoteId).select('id');
    expect(error).toBeNull();
    expect(data).toEqual([{ id: aliceNoteId }]);
  });
});
