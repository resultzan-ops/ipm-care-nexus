-- Fix security linter: set stable search_path for functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_barcode()
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN 'EQ' || LPAD(EXTRACT(EPOCH FROM NOW())::TEXT, 10, '0') || LPAD((RANDOM() * 999)::INT::TEXT, 3, '0');
END;
$$;