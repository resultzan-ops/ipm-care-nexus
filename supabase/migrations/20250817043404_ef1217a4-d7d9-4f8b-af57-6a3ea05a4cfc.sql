-- Fix search path security issues for new functions

-- Fix sync_user_roles function
CREATE OR REPLACE FUNCTION public.sync_user_roles()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- When role is updated in profiles, sync with user_roles
  IF TG_OP = 'UPDATE' AND OLD.role IS DISTINCT FROM NEW.role THEN
    -- Delete old role from user_roles
    DELETE FROM public.user_roles 
    WHERE user_id = NEW.user_id;
    
    -- Insert new role into user_roles
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, NEW.role)
    ON CONFLICT (user_id, role) DO NOTHING;
    
  ELSIF TG_OP = 'INSERT' THEN
    -- When new profile is created, add role to user_roles
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, NEW.role)
    ON CONFLICT (user_id, role) DO NOTHING;
    
  ELSIF TG_OP = 'DELETE' THEN
    -- When profile is deleted, remove from user_roles
    DELETE FROM public.user_roles 
    WHERE user_id = OLD.user_id;
    RETURN OLD;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Fix update_user_role function
CREATE OR REPLACE FUNCTION public.update_user_role(
  _target_user_id uuid, 
  _new_role app_role,
  _admin_user_id uuid DEFAULT auth.uid()
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  _admin_role app_role;
  _target_name text;
BEGIN
  -- Check if admin has permission
  SELECT role INTO _admin_role 
  FROM public.profiles 
  WHERE user_id = _admin_user_id;
  
  IF _admin_role != 'super_admin' THEN
    RAISE EXCEPTION 'Only Super Admin can change user roles';
  END IF;
  
  -- Get target user name for audit
  SELECT nama_lengkap INTO _target_name 
  FROM public.profiles 
  WHERE user_id = _target_user_id;
  
  -- Update role in profiles (trigger will sync user_roles)
  UPDATE public.profiles 
  SET role = _new_role, updated_at = now()
  WHERE user_id = _target_user_id;
  
  -- Log the change
  INSERT INTO public.audit_logs (
    user_id, user_name, action, target_type, target_id, target_name, changes
  ) VALUES (
    _admin_user_id,
    COALESCE((SELECT nama_lengkap FROM public.profiles WHERE user_id = _admin_user_id), 'System'),
    'role_update_via_function',
    'user',
    _target_user_id::text,
    _target_name,
    jsonb_build_object(
      'new_role', _new_role,
      'updated_via', 'admin_function',
      'timestamp', now()
    )
  );
END;
$$;