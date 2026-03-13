# Supabase Setup

This document covers everything you need to run in your Supabase project before the app will work end-to-end.

---

## 1. Create the profiles table

Run this in the **Supabase SQL Editor** (Dashboard → SQL Editor → New query):

```sql
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  updated_at timestamptz,
  username text unique,
  full_name text,
  avatar_url text,
  subscription_tier text not null default 'free'
    check (subscription_tier in ('free', 'pro', 'premium'))
);
```

The `id` column references `auth.users`, so every profile is tied to an authenticated user. `on delete cascade` means the profile row is automatically removed if the user deletes their account.

---

## 2. Enable Row Level Security

RLS ensures users can only read and write their own profile. Without this, any authenticated user could read or modify any other user's profile.

```sql
alter table public.profiles enable row level security;

-- Allow users to read their own profile
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Allow users to update their own profile
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);
```

---

## 3. Auto-create a profile on sign-up

Without this trigger, new users will have an auth record but no `profiles` row, and the profile screen will show an error.

```sql
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

The function is marked `security definer` so it runs with the privileges of the function owner (postgres), bypassing RLS for the insert. This is intentional — the trigger needs to insert a row for the new user before any RLS policy based on `auth.uid()` would apply.

---

## 4. Backfill existing users (if needed)

If you signed up test users before running the migration, insert profile rows for them manually:

```sql
insert into public.profiles (id)
select id from auth.users
where id not in (select id from public.profiles);
```

---

## 5. Enable the subscription_tier enum type (optional)

The `database.ts` file uses a `subscription_tier` enum in the `Enums` section. If you want the database to enforce this at the type level rather than a check constraint, you can define it as a proper Postgres enum:

```sql
-- Optional: replace the check constraint approach with a Postgres enum
create type public.subscription_tier as enum ('free', 'pro', 'premium');

-- Then re-create the column using the enum type instead of text + check
alter table public.profiles
  alter column subscription_tier
  type public.subscription_tier
  using subscription_tier::public.subscription_tier;
```

If you do this, regenerate your TypeScript types so `database.ts` reflects the enum:

```bash
npx supabase gen types typescript --project-id your-project-id > src/types/database.ts
```

---

## 6. Keeping database.ts in sync

The `src/types/database.ts` file is checked in as a starting point but should be regenerated whenever you change your schema. The Supabase CLI handles this:

```bash
npx supabase gen types typescript --project-id your-project-id > src/types/database.ts
```

Your project ID is in your Supabase dashboard URL: `https://supabase.com/dashboard/project/<project-id>`.

---

## Checklist

- [ ] `profiles` table created
- [ ] RLS enabled with select and update policies
- [ ] `handle_new_user` trigger created
- [ ] Existing test users backfilled (if applicable)
- [ ] `database.ts` regenerated from your live schema
