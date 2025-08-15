-- Step 1: Create the new company_type enum and update tenants table
CREATE TYPE company_type AS ENUM ('IPM', 'Mitra Kalibrasi', 'Rumah Sakit / Perusahaan');

ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS company_type company_type DEFAULT 'Rumah Sakit / Perusahaan',
ADD COLUMN IF NOT EXISTS nama_perusahaan text;

UPDATE tenants SET nama_perusahaan = name WHERE nama_perusahaan IS NULL;
ALTER TABLE tenants ALTER COLUMN nama_perusahaan SET NOT NULL;

-- Step 2: Add new columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS nama_lengkap text,
ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES tenants(id),
ADD COLUMN IF NOT EXISTS no_hp text;

UPDATE profiles SET nama_lengkap = name WHERE nama_lengkap IS NULL;
UPDATE profiles SET company_id = tenant_id WHERE company_id IS NULL;
UPDATE profiles SET no_hp = phone WHERE no_hp IS NULL;
ALTER TABLE profiles ALTER COLUMN nama_lengkap SET NOT NULL;

-- Step 3: Drop ALL policies that depend on has_role function
DROP POLICY IF EXISTS "Super admin can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admin can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Super admin can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admin can delete all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Drop other related policies
DROP POLICY IF EXISTS "Super admin can view all tenants" ON tenants;
DROP POLICY IF EXISTS "Users can view their own tenant" ON tenants;
DROP POLICY IF EXISTS "Users can view equipment from their tenant" ON equipment;
DROP POLICY IF EXISTS "Users can create equipment for their tenant" ON equipment;
DROP POLICY IF EXISTS "Users can update equipment from their tenant" ON equipment;
DROP POLICY IF EXISTS "Users can view PM records for their tenant equipment" ON pm_records;
DROP POLICY IF EXISTS "Users can view calibration requests for their tenant" ON calibration_requests;
DROP POLICY IF EXISTS "Users can view calibration records for their tenant" ON calibration_records;
DROP POLICY IF EXISTS "Users can view PM schedules based on role and permissions" ON pm_schedules;
DROP POLICY IF EXISTS "Authorized users can create PM schedules" ON pm_schedules;
DROP POLICY IF EXISTS "Authorized users can update PM schedules" ON pm_schedules;
DROP POLICY IF EXISTS "Authorized users can delete PM schedules" ON pm_schedules;

-- Step 4: Now drop the function
DROP FUNCTION IF EXISTS has_role(uuid, app_role) CASCADE;

-- Step 5: Create new role enum and update profiles
CREATE TYPE app_role_new AS ENUM ('super_admin', 'admin_mitra', 'teknisi_mitra', 'admin_klien', 'operator_klien');

ALTER TABLE profiles ADD COLUMN role_new app_role_new;

UPDATE profiles SET role_new = 
  CASE 
    WHEN role = 'admin_rs' THEN 'admin_klien'::app_role_new
    WHEN role = 'operator_rs' THEN 'operator_klien'::app_role_new
    WHEN role = 'spv' THEN 'admin_mitra'::app_role_new
    WHEN role = 'spv_rs' THEN 'admin_mitra'::app_role_new
    WHEN role = 'teknisi' THEN 'teknisi_mitra'::app_role_new
    WHEN role = 'teknisi_rs' THEN 'teknisi_mitra'::app_role_new
    WHEN role = 'super_admin' THEN 'super_admin'::app_role_new
    WHEN role = 'operator' THEN 'operator_klien'::app_role_new
    ELSE 'operator_klien'::app_role_new
  END;

ALTER TABLE profiles ALTER COLUMN role_new SET NOT NULL;

-- Drop old role column and enum
ALTER TABLE profiles DROP COLUMN role CASCADE;
DROP TYPE app_role;

-- Rename new structures
ALTER TABLE profiles RENAME COLUMN role_new TO role;
ALTER TYPE app_role_new RENAME TO app_role;

-- Step 6: Recreate the has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1 from public.profiles p where p.user_id = _user_id and p.role = _role
  );
$function$;

-- Step 7: Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_tenants_company_type ON tenants(company_type);