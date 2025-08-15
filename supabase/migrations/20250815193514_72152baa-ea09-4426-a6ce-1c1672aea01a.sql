-- Fix security warning for function search path
CREATE OR REPLACE FUNCTION get_calibration_technicians()
RETURNS TABLE(
  user_id UUID,
  nama_lengkap TEXT,
  company_name TEXT,
  company_id UUID
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.user_id,
    p.nama_lengkap,
    t.nama_perusahaan,
    t.id
  FROM profiles p
  JOIN tenants t ON p.company_id = t.id
  WHERE t.company_type = 'Mitra Penyedia (Kalibrasi)'
  AND p.role IN ('teknisi_mitra', 'admin_mitra')
  AND p.is_active = true;
$$;