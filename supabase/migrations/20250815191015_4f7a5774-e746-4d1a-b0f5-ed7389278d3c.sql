-- Create user_roles table (idempotent via IF NOT EXISTS on table/columns)
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  unique (user_id, role)
);

-- Enable RLS
alter table public.user_roles enable row level security;

-- Create select policy (only if missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_roles' AND policyname = 'Users can view own roles'
  ) THEN
    CREATE POLICY "Users can view own roles" ON public.user_roles
      FOR SELECT TO authenticated USING (user_id = auth.uid());
  END IF;
END $$;

-- Update has_role() to use user_roles instead of profiles
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles ur where ur.user_id = _user_id and ur.role = _role
  );
$$;

-- Ensure target user has super_admin role
with u as (
  select id from auth.users where email = 'dayax19@gmail.com' order by created_at desc limit 1
)
insert into public.user_roles (user_id, role)
select id, 'super_admin'::app_role from u
on conflict (user_id, role) do nothing;

-- Also update profile role for UI consistency
update public.profiles p
set role = 'super_admin'::app_role
where p.user_id in (
  select id from auth.users where email = 'dayax19@gmail.com'
);
