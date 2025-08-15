-- Part 2: Add RLS policies and additional table modifications
-- Update calibration_requests table to include provider company assignment
ALTER TABLE calibration_requests 
  ADD COLUMN IF NOT EXISTS assigned_provider_company_id UUID REFERENCES tenants(id),
  ADD COLUMN IF NOT EXISTS assigned_technician_id UUID REFERENCES profiles(user_id);

-- Update calibration_records to track provider company
ALTER TABLE calibration_records 
  ADD COLUMN IF NOT EXISTS provider_company_id UUID REFERENCES tenants(id);

-- Update RLS policies for better company-based access control
-- First drop existing policies that conflict
DROP POLICY IF EXISTS "Super admin can view all companies" ON tenants;
DROP POLICY IF EXISTS "Users can view their own company" ON tenants;
DROP POLICY IF EXISTS "Super admin can manage all companies" ON tenants;

-- Company viewing policies
CREATE POLICY "Super admin can view all companies" 
ON tenants 
FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Users can view their own company" 
ON tenants 
FOR SELECT 
USING (id = current_user_company_id());

-- Company management policies
CREATE POLICY "Super admin can manage all companies" 
ON tenants 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Company admins can update their own company" 
ON tenants 
FOR UPDATE 
USING (
  id = current_user_company_id() AND 
  (has_role(auth.uid(), 'admin_mitra'::app_role) OR has_role(auth.uid(), 'admin_klien'::app_role))
);

-- Create RLS policies for calibration requests based on company type
DROP POLICY IF EXISTS "Users can view calibration requests based on role and company" ON calibration_requests;
CREATE POLICY "Users can view calibration requests based on role and company" 
ON calibration_requests 
FOR SELECT 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  -- Klien can see their own requests
  (equipment_id IN (
    SELECT e.id FROM equipment e 
    JOIN tenants t ON e.tenant_id = t.id 
    WHERE t.company_type = 'Klien Rumah Sakit/Perusahaan' 
    AND e.tenant_id = current_user_company_id()
  )) OR
  -- Mitra Kalibrasi can see requests assigned to them or unassigned ones
  (current_user_company_id() IN (
    SELECT p.company_id FROM profiles p 
    JOIN tenants t ON p.company_id = t.id 
    WHERE p.user_id = auth.uid() 
    AND t.company_type = 'Mitra Penyedia (Kalibrasi)'
  ))
);

-- Allow Klien to create calibration requests for their equipment
CREATE POLICY "Klien can create calibration requests for their equipment" 
ON calibration_requests 
FOR INSERT 
WITH CHECK (
  equipment_id IN (
    SELECT e.id FROM equipment e 
    JOIN tenants t ON e.tenant_id = t.id 
    WHERE t.company_type = 'Klien Rumah Sakit/Perusahaan' 
    AND e.tenant_id = current_user_company_id()
  )
);

-- Allow authorized users to update calibration requests
CREATE POLICY "Authorized users can update calibration requests" 
ON calibration_requests 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  (current_user_company_id() IN (
    SELECT p.company_id FROM profiles p 
    JOIN tenants t ON p.company_id = t.id 
    WHERE p.user_id = auth.uid() 
    AND t.company_type = 'Mitra Penyedia (Kalibrasi)'
    AND (has_role(auth.uid(), 'admin_mitra'::app_role) OR has_role(auth.uid(), 'teknisi_mitra'::app_role))
  ))
);

-- Create function to get technicians from calibration provider companies
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