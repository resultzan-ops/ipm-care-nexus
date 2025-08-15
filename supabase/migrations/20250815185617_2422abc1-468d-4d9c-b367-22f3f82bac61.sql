-- Create function to promote user to super_admin
CREATE OR REPLACE FUNCTION public.promote_to_super_admin(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Update the user's role to super_admin
  UPDATE public.profiles 
  SET role = 'super_admin'::app_role
  WHERE user_id = target_user_id;
  
  -- If no profile exists, create one
  IF NOT FOUND THEN
    INSERT INTO public.profiles (user_id, nama_lengkap, role)
    VALUES (target_user_id, 'Super Admin', 'super_admin'::app_role);
  END IF;
END;
$$;