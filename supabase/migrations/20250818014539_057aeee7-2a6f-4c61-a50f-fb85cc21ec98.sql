-- Fix RLS policies for profiles table
-- Drop all existing policies first
DROP POLICY IF EXISTS "user_can_view_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "super_admin_full_access" ON public.profiles;
DROP POLICY IF EXISTS "user_can_update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "company_admin_view_users" ON public.profiles;
DROP POLICY IF EXISTS "view_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "insert_own_profile" ON public.profiles;

-- Create simple, clear RLS policies
CREATE POLICY "users_can_view_own_profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "users_can_update_own_profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_can_insert_own_profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "super_admin_can_manage_all_profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() 
    AND p.role = 'super_admin'
  )
);

-- Test the fix
SELECT 
  auth.uid() as current_user,
  EXISTS(SELECT 1 FROM public.profiles WHERE user_id = auth.uid()) as can_see_own_profile;