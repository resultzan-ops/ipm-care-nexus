-- Fix the RLS policy error - remove OLD reference in WITH CHECK

-- Drop all existing policies first  
DROP POLICY IF EXISTS "user_view_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "super_admin_all_access" ON public.profiles;
DROP POLICY IF EXISTS "user_update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "create_own_profile" ON public.profiles;

-- Create correct RLS policies
-- 1. Users can view their own profile
CREATE POLICY "user_view_own_profile" 
ON public.profiles FOR SELECT 
USING (user_id = auth.uid());

-- 2. Super admin can manage all profiles  
CREATE POLICY "super_admin_all_access" 
ON public.profiles FOR ALL 
USING (public.is_super_admin());

-- 3. Users can update their own profile (role changes handled separately)
CREATE POLICY "user_update_own_profile" 
ON public.profiles FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 4. Only super admin can update user roles
CREATE POLICY "super_admin_can_update_roles"
ON public.profiles FOR UPDATE
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

-- 5. Allow profile creation for new users
CREATE POLICY "create_own_profile" 
ON public.profiles FOR INSERT 
WITH CHECK (user_id = auth.uid());