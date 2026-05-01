-- Expected Supabase setup for openvid.
--
-- The app's only authenticated DB call is:
--   supabase.from("user_profiles").select("*").eq("id", userId).single()
-- in hooks/useAuth.tsx. Security depends entirely on RLS being configured so
-- a user can only read their own row. Run this in the Supabase SQL editor (or
-- copy to supabase-setup.sql, which is gitignored, for your own deploy).

-- 1. Schema -------------------------------------------------------------------

create table if not exists public.user_profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text,
  first_name  text,
  last_name   text,
  avatar_url  text,
  provider    text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 2. RLS ----------------------------------------------------------------------

alter table public.user_profiles enable row level security;

drop policy if exists "users read own profile"   on public.user_profiles;
drop policy if exists "users update own profile" on public.user_profiles;

-- The single SELECT in hooks/useAuth.tsx must match auth.uid() = id.
create policy "users read own profile"
  on public.user_profiles
  for select
  using (auth.uid() = id);

-- The app does not currently update profiles client-side, but if you add an
-- "edit profile" feature later, this policy keeps it scoped to the owner.
create policy "users update own profile"
  on public.user_profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 3. Auto-populate on signup --------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (
    id, email, full_name, first_name, last_name, avatar_url, provider
  ) values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name',
             new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'given_name',
    new.raw_user_meta_data->>'family_name',
    coalesce(new.raw_user_meta_data->>'avatar_url',
             new.raw_user_meta_data->>'picture'),
    coalesce(new.raw_app_meta_data->>'provider', 'email')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4. updated_at touch ---------------------------------------------------------

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists user_profiles_touch_updated_at on public.user_profiles;
create trigger user_profiles_touch_updated_at
  before update on public.user_profiles
  for each row execute function public.touch_updated_at();
