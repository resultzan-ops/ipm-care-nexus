-- Fix recursion in profiles RLS by removing self-referencing policy
DROP POLICY IF EXISTS "super_admin_can_manage_all_profiles" ON public.profiles;

-- Re-create super admin policy using SECURITY DEFINER function to avoid recursion
CREATE POLICY "super_admin_manage_all_profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Safety: ensure view/update/insert own profile policies exist (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'users_can_view_own_profile'
  ) THEN
    CREATE POLICY "users_can_view_own_profile"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'users_can_update_own_profile'
  ) THEN
    CREATE POLICY "users_can_update_own_profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'users_can_insert_own_profile'
  ) THEN
    CREATE POLICY "users_can_insert_own_profile"
    ON public.profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- Quick check (will return null current_user in migration context)
SELECT 'policies_applied' AS status;