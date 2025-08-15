-- First, let's see if we need to add any fields to pm_schedules for hospital/company tracking
-- The equipment table already has tenant_id, so maintenance schedules can be linked through equipment

-- Add index to improve query performance for filtering by tenant through equipment
CREATE INDEX IF NOT EXISTS idx_equipment_tenant_id ON equipment(tenant_id);
CREATE INDEX IF NOT EXISTS idx_pm_schedules_equipment_id ON pm_schedules(equipment_id);
CREATE INDEX IF NOT EXISTS idx_pm_schedules_assigned_to ON pm_schedules(assigned_to);

-- Update RLS policies to ensure proper permission controls for different user roles
-- Technicians should only see schedules assigned to them
CREATE OR REPLACE POLICY "Technicians can view their assigned PM schedules"
ON pm_schedules FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = ANY(ARRAY['teknisi'::app_role, 'teknisi_rs'::app_role])
    AND pm_schedules.assigned_to = profiles.user_id
  )
);

-- Admin RS/Company can view schedules for their tenant's equipment
CREATE OR REPLACE POLICY "Admin RS can view PM schedules for their tenant"
ON pm_schedules FOR SELECT
TO authenticated  
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN equipment e ON e.tenant_id = p.tenant_id
    WHERE p.user_id = auth.uid() 
    AND p.role = ANY(ARRAY['admin_rs'::app_role, 'operator_rs'::app_role])
    AND pm_schedules.equipment_id = e.id
  )
);

-- Admin RS can update schedules for their tenant's equipment
CREATE OR REPLACE POLICY "Admin RS can update PM schedules for their tenant"
ON pm_schedules FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN equipment e ON e.tenant_id = p.tenant_id
    WHERE p.user_id = auth.uid() 
    AND p.role = ANY(ARRAY['admin_rs'::app_role, 'operator_rs'::app_role])
    AND pm_schedules.equipment_id = e.id
  )
);

-- Admin RS can create schedules for their tenant's equipment  
CREATE OR REPLACE POLICY "Admin RS can create PM schedules for their tenant"
ON pm_schedules FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN equipment e ON e.tenant_id = p.tenant_id
    WHERE p.user_id = auth.uid() 
    AND p.role = ANY(ARRAY['admin_rs'::app_role, 'operator_rs'::app_role])
    AND pm_schedules.equipment_id = e.id
  ) OR 
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid() 
    AND p.role = ANY(ARRAY['super_admin'::app_role, 'spv'::app_role, 'spv_rs'::app_role])
  )
);