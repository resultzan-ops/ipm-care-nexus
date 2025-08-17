-- Fix user profiles and role relationships

-- 1. Add unique constraint on profiles.user_id (if not exists)
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);

-- 2. Create function to sync profiles.role with user_roles table
CREATE OR REPLACE FUNCTION public.sync_user_roles()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create trigger for role synchronization
DROP TRIGGER IF EXISTS sync_user_roles_trigger ON public.profiles;
CREATE TRIGGER sync_user_roles_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_roles();

-- 4. Sync existing data - ensure all profiles have corresponding user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, role FROM public.profiles
WHERE user_id IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- 5. Remove orphaned user_roles (roles without profiles)
DELETE FROM public.user_roles 
WHERE user_id NOT IN (SELECT user_id FROM public.profiles WHERE user_id IS NOT NULL);

-- 6. Update has_role function to be more efficient and secure
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  -- Check both profiles and user_roles for redundancy
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = _user_id AND role = _role
  ) OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- 7. Create function to get user role (used by frontend)
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT role FROM public.profiles 
  WHERE user_id = _user_id 
  LIMIT 1;
$$;

-- 8. Create function to safely update user role (with validation)
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

-- 9. Add RLS policy for safe role updates
CREATE POLICY "Super admin can update any profile" 
ON public.profiles FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() AND p.role = 'super_admin'
  )
);