-- Add new role to enum if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'app_role' AND e.enumlabel = 'kalibrator'
  ) THEN
    ALTER TYPE public.app_role ADD VALUE 'kalibrator';
  END IF;
END $$;