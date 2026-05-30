-- 1. Animals table
create table if not exists animals (
  id           uuid primary key default gen_random_uuid(),
  key          text unique not null,
  name_hi      text not null,
  name_en      text not null,
  sound_word   text not null,
  emoji        text not null,
  bg           text not null,
  accent       text not null,
  video_url    text,
  sound_url    text,
  is_published boolean default false,
  created_at   timestamptz default now()
);

-- 2. Storage buckets (run in Supabase dashboard > Storage)
-- Create bucket: animal-videos  (public: true)
-- Create bucket: animal-sounds  (public: true)

-- 3. Public read policy for animals table
create policy "Public read animals"
  on animals for select
  using (is_published = true);

-- 4. Allow all for admin (use service key in admin panel for full access)
create policy "Admin full access"
  on animals for all
  using (true);

alter table animals enable row level security;
