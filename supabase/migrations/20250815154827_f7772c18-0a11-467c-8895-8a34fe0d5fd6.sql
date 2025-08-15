-- Helper function to avoid RLS recursion and centralize role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  select exists (
    select 1 from public.profiles p where p.user_id = _user_id and p.role = _role
  );
$$;

-- Update profiles policy to use has_role and prevent infinite recursion
DROP POLICY IF EXISTS "Super admin can view all profiles" ON public.profiles;
CREATE POLICY "Super admin can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'super_admin'));

-- Ensure user dayax is super_admin
INSERT INTO public.profiles (user_id, name, role)
VALUES ('7d427bd1-ba0f-4e53-8cf7-ae40d63582ef', 'Dayax', 'super_admin')
ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role, name = COALESCE(public.profiles.name, EXCLUDED.name);
