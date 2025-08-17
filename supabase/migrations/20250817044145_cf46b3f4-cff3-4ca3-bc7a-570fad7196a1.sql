-- Fix RLS policies for profiles to ensure Super Admin can access their own profile

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Users can view own profile only" ON public.profiles;
DROP POLICY IF EXISTS "Super admin full profile access" ON public.profiles;
DROP POLICY IF EXISTS "Company admin view company users" ON public.profiles;

-- Create comprehensive RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Super admin can view all profiles" 
ON public.profiles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() AND p.role = 'super_admin'
  )
);

CREATE POLICY "Super admin can manage all profiles" 
ON public.profiles FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() AND p.role = 'super_admin'
  )
);

-- Company admins can view users in their company
CREATE POLICY "Admin can view company profiles" 
ON public.profiles FOR SELECT 
USING (
  company_id = (
    SELECT company_id FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin_klien', 'admin_mitra', 'admin_penyedia')
  )
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin_klien', 'admin_mitra', 'admin_penyedia')
  )
);

-- Allow users to update their own basic profile info
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Create a function to ensure profile exists for authenticated users
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
      'operator',
      true
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to auto-create profiles for new users
DROP TRIGGER IF EXISTS ensure_user_profile_trigger ON auth.users;
CREATE TRIGGER ensure_user_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_user_profile();