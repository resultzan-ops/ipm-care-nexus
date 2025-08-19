-- Fix: drop all RLS policies on profiles and recreate cleanly
DROP POLICY IF EXISTS "super_admin_manage_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "super_admin_can_manage_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "users_can_view_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_can_update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_can_insert_own_profile" ON public.profiles;

-- Create simple, non-recursive policies
CREATE POLICY "view_own_profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "update_own_profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "insert_own_profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Super admin policy using external function (no recursion)
CREATE POLICY "super_admin_all_access"
ON public.profiles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Test success
SELECT 'policies_recreated' AS status;