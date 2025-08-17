-- Create audit logging for security tracking
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  target_name TEXT NOT NULL,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only super admins can view audit logs
CREATE POLICY "Super admin can view audit logs" 
ON public.audit_logs FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
);

-- Create function to log role changes
CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    INSERT INTO public.audit_logs (
      user_id, user_name, action, target_type, target_id, target_name, changes
    ) VALUES (
      auth.uid(),
      COALESCE((SELECT nama_lengkap FROM public.profiles WHERE user_id = auth.uid()), 'System'),
      'role_change',
      'user',
      NEW.user_id::text,
      NEW.nama_lengkap,
      jsonb_build_object(
        'old_role', OLD.role,
        'new_role', NEW.role,
        'changed_at', now()
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for role changes
CREATE TRIGGER audit_role_changes
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_role_change();

-- Strengthen RLS policies for profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Super admin can view all profiles" ON public.profiles;

-- More secure profile access policies
CREATE POLICY "Users can view own profile only" 
ON public.profiles FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Super admin full profile access" 
ON public.profiles FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() AND p.role = 'super_admin'
  )
);

-- Company admins can only view users in their company
CREATE POLICY "Company admin view company users" 
ON public.profiles FOR SELECT 
USING (
  company_id = (
    SELECT company_id FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('admin_klien', 'admin_mitra')
  )
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('admin_klien', 'admin_mitra')
  )
);