-- Add a temporary debug function to help troubleshoot authentication
CREATE OR REPLACE FUNCTION public.debug_auth_state()
RETURNS TABLE (
  current_user_id uuid,
  profile_exists boolean,
  profile_data jsonb,
  policies_active boolean
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    auth.uid() as current_user_id,
    EXISTS(SELECT 1 FROM public.profiles WHERE user_id = auth.uid()) as profile_exists,
    COALESCE(
      (SELECT to_jsonb(p) FROM public.profiles p WHERE p.user_id = auth.uid()),
      '{}'::jsonb
    ) as profile_data,
    (SELECT has_table_privilege('profiles', 'SELECT')) as policies_active;
$$;

-- Also create a function to test profile access specifically for dayax19@gmail.com
CREATE OR REPLACE FUNCTION public.test_dayax_profile()
RETURNS TABLE (
  user_exists boolean,
  profile_exists boolean,
  profile_data jsonb,
  can_access_with_rls boolean
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  WITH user_check AS (
    SELECT id FROM auth.users WHERE email = 'dayax19@gmail.com'
  ),
  profile_check AS (
    SELECT * FROM public.profiles WHERE user_id = (SELECT id FROM user_check)
  )
  SELECT 
    EXISTS(SELECT 1 FROM user_check) as user_exists,
    EXISTS(SELECT 1 FROM profile_check) as profile_exists,
    COALESCE((SELECT to_jsonb(p) FROM profile_check p), '{}'::jsonb) as profile_data,
    true as can_access_with_rls; -- This function bypasses RLS due to SECURITY DEFINER
$$;