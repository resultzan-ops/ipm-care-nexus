-- Helper: company id of current user via SECURITY DEFINER (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.current_user_company_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.company_id
  FROM public.profiles p
  WHERE p.user_id = auth.uid()
  LIMIT 1
$$;

-- Fix recursive profiles policies by removing self-referencing subqueries
DROP POLICY IF EXISTS "Admin mitra can view company profiles" ON public.profiles;
CREATE POLICY "Admin mitra can view company profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin_mitra'::app_role) AND
  company_id = public.current_user_company_id()
);

DROP POLICY IF EXISTS "Admin klien can view company profiles" ON public.profiles;
CREATE POLICY "Admin klien can view company profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin_klien'::app_role) AND
  company_id = public.current_user_company_id()
);

DROP POLICY IF EXISTS "Admin mitra can manage company profiles" ON public.profiles;
CREATE POLICY "Admin mitra can manage company profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin_mitra'::app_role) AND
  company_id = public.current_user_company_id() AND
  role = ANY (ARRAY['teknisi_mitra'::app_role, 'admin_mitra'::app_role])
)
WITH CHECK (
  has_role(auth.uid(), 'admin_mitra'::app_role) AND
  company_id = public.current_user_company_id() AND
  role = ANY (ARRAY['teknisi_mitra'::app_role, 'admin_mitra'::app_role])
);

DROP POLICY IF EXISTS "Admin klien can manage company profiles" ON public.profiles;
CREATE POLICY "Admin klien can manage company profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin_klien'::app_role) AND
  company_id = public.current_user_company_id() AND
  role = ANY (ARRAY['operator_klien'::app_role, 'admin_klien'::app_role])
)
WITH CHECK (
  has_role(auth.uid(), 'admin_klien'::app_role) AND
  company_id = public.current_user_company_id() AND
  role = ANY (ARRAY['operator_klien'::app_role, 'admin_klien'::app_role])
);
