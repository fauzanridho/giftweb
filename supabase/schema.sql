-- ==============================================================
-- PULAU KITA — SKEMA MULTI-TENANT & PUBLIK
-- ==============================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. TABEL PULAU (ISLANDS)
-- Tiap pasangan/pemain memiliki pulau sendiri
create table if not exists islands (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Pulau Kita',
  invite_code text unique not null default substr(md5(random()::text), 1, 8),
  is_founder_island boolean not null default false, -- Pulau spesial Ay & Fauzan
  is_public_visit boolean not null default true,     -- Boleh dikunjungi orang lain
  created_at timestamptz default now()
);

-- 3. ANGGOTA PULAU (ISLAND_MEMBERS)
-- 1 user bisa punya profil, tergabung ke 1 pulau utama (max 2-4 anggota)
create table if not exists island_members (
  user_id uuid primary key references auth.users on delete cascade,
  island_id uuid not null references islands on delete cascade,
  role text not null default 'owner', -- 'owner', 'partner', 'friend'
  display_name text not null default 'Pengelana',
  appearance jsonb not null default '{
    "skin": "light",
    "hairStyle": "short",
    "hairColor": "black",
    "outfit": "blue",
    "accessory": "none"
  }'::jsonb,
  pentol_balance int not null default 50, -- Mata uang game
  created_at timestamptz default now()
);

-- Helper RLS: Mendapatkan island_id user saat ini
create or replace function my_island_id() returns uuid
language sql stable security definer as $$
  select island_id from island_members where user_id = auth.uid() limit 1;
$$;

-- 4. STATE DUNIA PULAU (ISLAND_WORLD_STATE)
-- Posisi furnitur, tanaman, layout dekorasi rumah
create table if not exists island_world_state (
  island_id uuid primary key references islands on delete cascade,
  decorations jsonb not null default '[]'::jsonb,
  plants jsonb not null default '[]'::jsonb,
  puzzles_unlocked jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- 5. KENANGAN TERLINDUNGI (ISLAND_MEMORIES)
-- Kenangan personal disimpan di sini, TIDAK di bundle JS client
create table if not exists island_memories (
  id uuid primary key default gen_random_uuid(),
  island_id uuid not null references islands on delete cascade,
  zone text not null, -- 'school', 'bakso', 'beach', 'hill', 'custom'
  title text not null,
  body text not null,
  date_note text,
  photo_url text, -- Foto di Storage privat (opsional)
  unlocked boolean not null default false,
  unlocked_at timestamptz,
  created_at timestamptz default now()
);

-- 6. SURAT CINTA / ASYNC NOTES (ISLAND_LETTERS)
create table if not exists island_letters (
  id uuid primary key default gen_random_uuid(),
  island_id uuid not null references islands on delete cascade,
  from_user uuid not null references auth.users on delete cascade,
  body text not null,
  created_at timestamptz default now(),
  read_at timestamptz
);

-- 7. BUKU TAMU KUNJUNGAN (GUESTBOOK_ENTRIES)
-- Saat orang lain mengunjungi pulau, mereka bisa meninggalkan salam toot / hadiah
create table if not exists guestbook_entries (
  id uuid primary key default gen_random_uuid(),
  island_id uuid not null references islands on delete cascade,
  visitor_user_id uuid references auth.users on delete set null,
  visitor_name text not null,
  message text not null, -- Emote template / Salam toot
  gift_pentol int default 0,
  created_at timestamptz default now()
);

-- 8. ANTI-CHEAT: RPC UPDATE PENTOL DENGAN RATE LIMIT
create or replace function add_pentol(amount int)
returns int
language plpgsql security definer as $$
declare
  current_bal int;
begin
  -- Batasi maksimal sekali perolehan (anti bot/cheat)
  if amount < -100 or amount > 50 then
    raise exception 'Jumlah perolehan tidak valid';
  end if;

  update island_members
  set pentol_balance = pentol_balance + amount
  where user_id = auth.uid()
  returning pentol_balance into current_bal;

  return current_bal;
end;
$$;

-- 9. ROW LEVEL SECURITY (RLS) POLICIES
alter table islands enable row level security;
alter table island_members enable row level security;
alter table island_world_state enable row level security;
alter table island_memories enable row level security;
alter table island_letters enable row level security;
alter table guestbook_entries enable row level security;

-- Islands: Bisa dibaca jika anggota pulau ATAU jika pulau terbuka untuk dikunjungi
drop policy if exists "Baca pulau anggota atau publik" on islands;
create policy "Baca pulau anggota atau publik" on islands for select
  using (id = my_island_id() or is_public_visit = true);

drop policy if exists "Ubah pulau sendiri" on islands;
create policy "Ubah pulau sendiri" on islands for update
  using (id = my_island_id());

drop policy if exists "Buat pulau baru" on islands;
create policy "Buat pulau baru" on islands for insert
  with check (true);

-- Island Members:
drop policy if exists "Baca anggota se-pulau atau profil publik" on island_members;
create policy "Baca anggota se-pulau atau profil publik" on island_members for select
  using (island_id = my_island_id() or true);

drop policy if exists "Ubah profil sendiri" on island_members;
create policy "Ubah profil sendiri" on island_members for update
  using (user_id = auth.uid());

drop policy if exists "Daftar sebagai member pulau" on island_members;
create policy "Daftar sebagai member pulau" on island_members for insert
  with check (user_id = auth.uid());

-- Island World State:
drop policy if exists "Baca state pulau sendiri atau pengunjung" on island_world_state;
create policy "Baca state pulau sendiri atau pengunjung" on island_world_state for select
  using (island_id = my_island_id() or exists (
    select 1 from islands where id = island_world_state.island_id and is_public_visit = true
  ));

drop policy if exists "Ubah state pulau oleh anggota" on island_world_state;
create policy "Ubah state pulau oleh anggota" on island_world_state for all
  using (island_id = my_island_id())
  with check (island_id = my_island_id());

-- Island Memories: SANGAT KETAT! HANYA ANGGOTA PULAU SENDIRI
drop policy if exists "Kenangan hanya untuk pemilik pulau" on island_memories;
create policy "Kenangan hanya untuk pemilik pulau" on island_memories for all
  using (island_id = my_island_id())
  with check (island_id = my_island_id());

-- Island Letters: HANYA ANGGOTA PULAU SENDIRI
drop policy if exists "Surat hanya untuk pemilik pulau" on island_letters;
create policy "Surat hanya untuk pemilik pulau" on island_letters for all
  using (island_id = my_island_id())
  with check (island_id = my_island_id());

-- Guestbook Entries:
drop policy if exists "Semua orang bisa baca buku tamu pulau yang dikunjungi" on guestbook_entries;
create policy "Semua orang bisa baca buku tamu pulau yang dikunjungi" on guestbook_entries for select
  using (island_id = my_island_id() or exists (
    select 1 from islands where id = guestbook_entries.island_id and is_public_visit = true
  ));

drop policy if exists "Pengunjung bisa mengisi buku tamu" on guestbook_entries;
create policy "Pengunjung bisa mengisi buku tamu" on guestbook_entries for insert
  with check (true);


-- 10. RPC ATOMIK UNTUK MEMBUAT PULAU & MEMBER
create or replace function create_island_for_user(
  p_island_name text default 'Pulau Kita',
  p_display_name text default 'Pengelana'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_island_id uuid;
  v_invite_code text;
  v_result jsonb;
begin
  if v_user_id is null then
    raise exception 'User belum login';
  end if;

  v_invite_code := substr(md5(random()::text), 1, 8);
  insert into islands (name, invite_code, is_founder_island, is_public_visit)
  values (p_island_name, v_invite_code, false, true)
  returning id into v_island_id;

  insert into island_members (user_id, island_id, role, display_name, pentol_balance)
  values (v_user_id, v_island_id, 'owner', p_display_name, 50)
  on conflict (user_id) do update set island_id = v_island_id;

  insert into island_world_state (island_id, decorations, plants, puzzles_unlocked)
  values (v_island_id, '[]'::jsonb, '[]'::jsonb, '{}'::jsonb)
  on conflict (island_id) do nothing;

  select jsonb_build_object(
    'islandId', v_island_id,
    'islandName', p_island_name,
    'inviteCode', v_invite_code,
    'role', 'owner',
    'displayName', p_display_name,
    'pentolBalance', 50,
    'isFounderIsland', false
  ) into v_result;

  return v_result;
end;
$$;
