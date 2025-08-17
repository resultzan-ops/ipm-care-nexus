-- Fix all RLS policies for profiles table - clear and rebuild
-- Drop all existing policies first
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Super admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admin can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can view company profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin mitra can view company profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin klien can view company profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin mitra can manage company profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin klien can manage company profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Company admin view company users" ON public.profiles;
DROP POLICY IF EXISTS "Super admin full profile access" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile only" ON public.profiles;
DROP POLICY IF EXISTS "Super admin can update any profile" ON public.profiles;

-- Create clean, comprehensive RLS policies
-- 1. Users can always view their own profile
CREATE POLICY "user_can_view_own_profile" 
ON public.profiles FOR SELECT 
USING (user_id = auth.uid());

-- 2. Super admin can view and manage all profiles
CREATE POLICY "super_admin_full_access" 
ON public.profiles FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() AND p.role = 'super_admin'
  )
);

-- 3. Users can update their own basic profile info (excluding role)
CREATE POLICY "user_can_update_own_profile" 
ON public.profiles FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid() AND role = (SELECT role FROM public.profiles WHERE user_id = auth.uid()));

-- 4. Company admins can view users in their company
CREATE POLICY "company_admin_view_users" 
ON public.profiles FOR SELECT 
USING (
  company_id = (
    SELECT company_id FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin_klien', 'admin_mitra')
  )
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin_klien', 'admin_mitra')
  )
);

-- Fix the trigger function for auto-creating profiles
CREATE OR REPLACE FUNCTION public.ensure_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check if profile already exists
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE user_id = NEW.id
  ) THEN
    -- Create default profile for new user
    INSERT INTO public.profiles (
      user_id, 
      name, 
      nama_lengkap, 
      role, 
      is_active
    ) VALUES (
      NEW.id,
      COALESCE(NEW.email, 'Unknown User'),
      COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email, 'Unknown User'),
      'operator_klien',  -- Fixed to match actual enum
      true
    );
  END IF;
  RETURN NEW;
END;
$$;