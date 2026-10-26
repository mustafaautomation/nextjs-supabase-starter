-- Notes: the one CRUD feature. Every row belongs to the user who created it,
-- and row-level security is the thing that enforces that, not the app code.

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 120),
  body text not null default '' check (char_length(body) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index notes_user_id_created_at_idx on public.notes (user_id, created_at desc);

-- Keep updated_at honest, and stop a row from being moved to another user.
create function public.notes_before_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.user_id is distinct from old.user_id then
    raise exception 'user_id cannot be changed' using errcode = '42501';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger notes_before_update
before update on public.notes
for each row execute function public.notes_before_update();

alter table public.notes enable row level security;

-- Signed-out visitors get nothing, not even an empty result.
revoke all on table public.notes from anon;
grant select, insert, update, delete on table public.notes to authenticated;

create policy "notes: owners can read"
on public.notes for select to authenticated
using ((select auth.uid()) = user_id);

create policy "notes: owners can create"
on public.notes for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "notes: owners can update"
on public.notes for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "notes: owners can delete"
on public.notes for delete to authenticated
using ((select auth.uid()) = user_id);
