-- Create the missing function first, then fix policies
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