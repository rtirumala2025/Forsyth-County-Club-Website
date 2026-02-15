-- ============================================================
-- Club "Common App" Schema — profiles + signatures
-- Run this in the Supabase SQL Editor (or via psql)
-- ============================================================

-- 1. profiles: stores student "common data"
create table if not exists profiles (
  id            uuid primary key default gen_random_uuid(),
  firebase_uid  text unique not null,
  full_name     text not null,
  grade         text not null,
  student_id    text not null,
  parent_email  text not null,
  emergency_contact text not null,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- 2. signatures: one row per club-join request
create table if not exists signatures (
  id              uuid primary key default gen_random_uuid(),
  profile_id      uuid references profiles(id) on delete cascade,
  club_id         text not null,
  club_name       text not null,
  school_name     text not null,
  student_name    text not null,
  status          text not null default 'PENDING_PARENT',
  parent_ip       text,
  parent_signed_at timestamptz,
  created_at      timestamptz default now()
);

-- 3. Row-Level Security (permissive for MVP)
alter table profiles enable row level security;
alter table signatures enable row level security;

create policy "profiles_all" on profiles
  for all using (true) with check (true);

create policy "signatures_all" on signatures
  for all using (true) with check (true);
