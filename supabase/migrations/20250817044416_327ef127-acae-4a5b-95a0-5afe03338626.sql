-- Fix infinite recursion in RLS policies by using security definer functions

-- Create security definer function to get current user role (avoids recursion)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT 
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Create security definer function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE  
SET search_path = 'public'
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  );
$$;

-- Drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "user_can_view_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "super_admin_full_access" ON public.profiles;
DROP POLICY IF EXISTS "user_can_update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "company_admin_view_users" ON public.profiles;

-- Create new RLS policies WITHOUT recursion using security definer functions
-- 1. Users can view their own profile (no recursion)
CREATE POLICY "user_view_own_profile" 
ON public.profiles FOR SELECT 
USING (user_id = auth.uid());

-- 2. Super admin can manage all profiles (using security definer function)
CREATE POLICY "super_admin_all_access" 
ON public.profiles FOR ALL 
USING (public.is_super_admin());

-- 3. Users can update their own basic profile (but not change role unless super admin)
CREATE POLICY "user_update_own_profile" 
ON public.profiles FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (
  user_id = auth.uid() AND 
  (role = OLD.role OR public.is_super_admin()) -- Only super admin can change roles
);

-- 4. Allow profile creation for new users
CREATE POLICY "create_own_profile" 
ON public.profiles FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Test the fix by running our debug function
SELECT * FROM public.test_dayax_profile();