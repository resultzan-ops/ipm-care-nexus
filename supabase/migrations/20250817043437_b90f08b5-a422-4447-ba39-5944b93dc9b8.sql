-- Fix remaining function with search path issue
CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;