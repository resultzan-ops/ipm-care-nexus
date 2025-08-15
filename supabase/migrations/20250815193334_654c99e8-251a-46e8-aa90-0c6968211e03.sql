-- Update company_type enum to match user requirements
ALTER TYPE company_type RENAME TO company_type_old;
CREATE TYPE company_type AS ENUM ('Mitra Penyedia (Kalibrasi)', 'Mitra Penyedia (Barang & Jasa)', 'Klien Rumah Sakit/Perusahaan');

-- Update tenants table with new fields for company profile
ALTER TABLE tenants 
  ALTER COLUMN company_type TYPE company_type USING 
    CASE 
      WHEN company_type_old = 'IPM' THEN 'Mitra Penyedia (Kalibrasi)'::company_type
      WHEN company_type_old = 'Mitra Kalibrasi' THEN 'Mitra Penyedia (Kalibrasi)'::company_type
      WHEN company_type_old = 'Rumah Sakit / Perusahaan' THEN 'Klien Rumah Sakit/Perusahaan'::company_type
      ELSE 'Klien Rumah Sakit/Perusahaan'::company_type
    END;

-- Add new fields for company profile
ALTER TABLE tenants 
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp TEXT,
  ADD COLUMN IF NOT EXISTS alamat TEXT;

-- Drop old enum
DROP TYPE company_type_old;

-- Update RLS policies for better company-based access control
-- Allow company admins to update their own company profile
CREATE POLICY "Company admins can update their own company" 
ON tenants 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  (id = current_user_company_id() AND has_role(auth.uid(), 'admin_mitra'::app_role)) OR
  (id = current_user_company_id() AND has_role(auth.uid(), 'admin_klien'::app_role))
);

-- Add policy for company profile creation (super admin only)
CREATE POLICY "Super admin can create companies" 
ON tenants 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- Update calibration_requests table to include provider company assignment
ALTER TABLE calibration_requests 
  ADD COLUMN IF NOT EXISTS assigned_provider_company_id UUID REFERENCES tenants(id),
  ADD COLUMN IF NOT EXISTS assigned_technician_id UUID REFERENCES profiles(user_id);

-- Update calibration_records to track provider company
ALTER TABLE calibration_records 
  ADD COLUMN IF NOT EXISTS provider_company_id UUID REFERENCES tenants(id);

-- Create RLS policies for calibration requests based on company type
DROP POLICY IF EXISTS "Users can view calibration requests for their company" ON calibration_requests;
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

-- Update equipment RLS to be more granular based on company type
DROP POLICY IF EXISTS "Users can view equipment from their company" ON equipment;
CREATE POLICY "Users can view equipment based on company type and role" 
ON equipment 
FOR SELECT 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  -- Klien can see their own equipment
  (tenant_id = current_user_company_id() AND current_user_company_id() IN (
    SELECT t.id FROM tenants t WHERE t.company_type = 'Klien Rumah Sakit/Perusahaan'
  )) OR
  -- Mitra Barang & Jasa can see equipment they sell/manage
  (tenant_id = current_user_company_id() AND current_user_company_id() IN (
    SELECT t.id FROM tenants t WHERE t.company_type = 'Mitra Penyedia (Barang & Jasa)'
  )) OR
  -- Mitra Kalibrasi can see all equipment for calibration purposes
  (current_user_company_id() IN (
    SELECT t.id FROM tenants t WHERE t.company_type = 'Mitra Penyedia (Kalibrasi)'
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