-- Create company_type enum
CREATE TYPE company_type AS ENUM ('IPM', 'Mitra Kalibrasi', 'Rumah Sakit / Perusahaan');

-- Create new app_role enum with updated roles
DROP TYPE IF EXISTS app_role CASCADE;
CREATE TYPE app_role AS ENUM ('super_admin', 'admin_mitra', 'teknisi_mitra', 'admin_klien', 'operator_klien');

-- Add company_type to tenants table and rename columns
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS company_type company_type DEFAULT 'Rumah Sakit / Perusahaan',
ADD COLUMN IF NOT EXISTS nama_perusahaan text;

-- Update nama_perusahaan with existing name values
UPDATE tenants SET nama_perusahaan = name WHERE nama_perusahaan IS NULL;

-- Make nama_perusahaan NOT NULL after updating
ALTER TABLE tenants ALTER COLUMN nama_perusahaan SET NOT NULL;

-- Update profiles table structure
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS nama_lengkap text,
ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES tenants(id),
ADD COLUMN IF NOT EXISTS no_hp text;

-- Update nama_lengkap with existing name values
UPDATE profiles SET nama_lengkap = name WHERE nama_lengkap IS NULL;
UPDATE profiles SET company_id = tenant_id WHERE company_id IS NULL;
UPDATE profiles SET no_hp = phone WHERE no_hp IS NULL;

-- Make nama_lengkap NOT NULL after updating
ALTER TABLE profiles ALTER COLUMN nama_lengkap SET NOT NULL;

-- Update default role for existing users
UPDATE profiles SET role = 'admin_klien' WHERE role = 'admin_rs';
UPDATE profiles SET role = 'operator_klien' WHERE role = 'operator_rs';
UPDATE profiles SET role = 'admin_mitra' WHERE role = 'spv';
UPDATE profiles SET role = 'teknisi_mitra' WHERE role = 'teknisi';
UPDATE profiles SET role = 'super_admin' WHERE role = 'super_admin';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_tenants_company_type ON tenants(company_type);

-- Update RLS policies for tenants (companies)
DROP POLICY IF EXISTS "Super admin can view all tenants" ON tenants;
DROP POLICY IF EXISTS "Users can view their own tenant" ON tenants;

-- New RLS policies for companies
CREATE POLICY "Super admin can view all companies" ON tenants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Users can view their own company" ON tenants
  FOR SELECT USING (
    id IN (
      SELECT profiles.company_id 
      FROM profiles 
      WHERE profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Super admin can manage all companies" ON tenants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'super_admin'
    )
  );

-- Update profiles RLS policies
DROP POLICY IF EXISTS "Super admin can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admin can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admin can delete all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admin can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- New profiles RLS policies
CREATE POLICY "Super admin can view all profiles" ON profiles
  FOR SELECT USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admin mitra can view company profiles" ON profiles
  FOR SELECT USING (
    company_id IN (
      SELECT profiles.company_id 
      FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role IN ('admin_mitra', 'super_admin')
    )
  );

CREATE POLICY "Admin klien can view company profiles" ON profiles
  FOR SELECT USING (
    company_id IN (
      SELECT profiles.company_id 
      FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role IN ('admin_klien', 'super_admin')
    )
  );

CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Super admin can manage all profiles" ON profiles
  FOR ALL USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admin mitra can manage company profiles" ON profiles
  FOR ALL USING (
    company_id IN (
      SELECT profiles.company_id 
      FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin_mitra'
    )
    AND role IN ('teknisi_mitra', 'admin_mitra')
  );

CREATE POLICY "Admin klien can manage company profiles" ON profiles
  FOR ALL USING (
    company_id IN (
      SELECT profiles.company_id 
      FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin_klien'
    )
    AND role IN ('operator_klien', 'admin_klien')
  );

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (user_id = auth.uid());