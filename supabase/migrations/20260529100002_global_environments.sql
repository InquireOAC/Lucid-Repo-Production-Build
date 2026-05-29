-- ============================================================
-- global_environments
-- World/location library shared between Lucid Repo and Lucid
-- Engine. Mirrors Lucid Engine's global_environments table
-- (simplified to the fields needed by the companion app).
-- When both apps use the same Supabase project, environments
-- created here appear automatically in Lucid Engine and vice versa.
-- ============================================================

create table if not exists global_environments (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references auth.users(id) on delete cascade,
  name                 text not null,
  description          text,
  primary_image_url    text,
  secondary_image_urls text[]  not null default '{}',
  tags                 text[]  not null default '{}',
  location_type        text,   -- 'interior' | 'exterior'
  time_of_day          text,   -- 'morning' | 'day' | 'golden-hour' | 'night'
  environment_type     text    not null default 'world',  -- 'world' | 'location'
  parent_world_id      uuid references global_environments(id) on delete set null,
  project_id           uuid,   -- null = global library; set = project-scoped
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists global_environments_user_idx
  on global_environments (user_id);

create index if not exists global_environments_parent_idx
  on global_environments (parent_world_id)
  where parent_world_id is not null;

alter table global_environments enable row level security;

create policy "Users can manage their own environments"
  on global_environments
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);
