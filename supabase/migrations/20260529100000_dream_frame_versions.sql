-- ============================================================
-- dream_frame_versions
-- Non-destructive versioning for generated dream images.
-- Mirrors Lucid Engine's shot_versions pattern so that no
-- generated frame is ever lost — all history is browsable.
-- ============================================================

create table if not exists dream_frame_versions (
  id           uuid primary key default gen_random_uuid(),
  dream_id     uuid not null references dream_entries(id) on delete cascade,
  frame_target int  not null,   -- section index (0-based); -1 = cover image
  image_url    text not null,
  prompt       text,
  model_used   text,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  user_id      uuid not null references auth.users(id) on delete cascade
);

-- Fast lookups by (dream, section)
create index if not exists dream_frame_versions_dream_frame_idx
  on dream_frame_versions (dream_id, frame_target);

-- RLS
alter table dream_frame_versions enable row level security;

create policy "Users can manage their own dream frame versions"
  on dream_frame_versions
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);
