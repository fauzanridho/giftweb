-- Pasangan (hanya 1 baris)
create table couples (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now()
);

create table members (
  user_id uuid primary key references auth.users on delete cascade,
  couple_id uuid not null references couples on delete cascade,
  display_name text not null,
  appearance jsonb not null default '{}'   -- {skin, hairStyle, hairColor, outfit, accessory}
);

-- Helper RLS
create function my_couple() returns uuid
language sql stable security definer as $$
  select couple_id from members where user_id = auth.uid()
$$;

-- State dunia (rumah, dekor, tanaman, mata uang, flag puzzle)
create table world_state (
  couple_id uuid primary key references couples on delete cascade,
  data jsonb not null default '{}',
  updated_at timestamptz default now()
);

-- Kenangan yang sudah terbuka
create table memories_unlocked (
  couple_id uuid references couples on delete cascade,
  memory_id text,
  unlocked_by uuid references auth.users,
  unlocked_at timestamptz default now(),
  primary key (couple_id, memory_id)
);

-- Surat async
create table letters (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples on delete cascade,
  from_user uuid not null references auth.users,
  body text not null,
  created_at timestamptz default now(),
  read_at timestamptz
);

-- Jurnal: kenangan baru yang ditambahkan sendiri
create table journal_entries (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples on delete cascade,
  author uuid not null references auth.users,
  title text not null,
  body text,
  photo_path text,           -- path di Storage (bucket privat)
  created_at timestamptz default now()
);

-- RLS
alter table world_state enable row level security;
create policy "couple only" on world_state for all
  using (couple_id = my_couple()) with check (couple_id = my_couple());

alter table memories_unlocked enable row level security;
create policy "couple only" on memories_unlocked for all
  using (couple_id = my_couple()) with check (couple_id = my_couple());

alter table letters enable row level security;
create policy "couple only" on letters for all
  using (couple_id = my_couple()) with check (couple_id = my_couple());

alter table journal_entries enable row level security;
create policy "couple only" on journal_entries for all
  using (couple_id = my_couple()) with check (couple_id = my_couple());

-- members: boleh baca anggota se-couple, ubah baris sendiri
alter table members enable row level security;
create policy "read couple" on members for select using (couple_id = my_couple());
create policy "update self" on members for update using (user_id = auth.uid());

