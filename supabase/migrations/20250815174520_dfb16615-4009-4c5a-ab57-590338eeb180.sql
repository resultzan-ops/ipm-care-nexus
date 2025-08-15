-- Add indexes to improve query performance for filtering
CREATE INDEX IF NOT EXISTS idx_equipment_tenant_id ON equipment(tenant_id);
CREATE INDEX IF NOT EXISTS idx_pm_schedules_equipment_id ON pm_schedules(equipment_id);
CREATE INDEX IF NOT EXISTS idx_pm_schedules_assigned_to ON pm_schedules(assigned_to);

-- Update the existing SELECT policy to include all the new permission logic
DROP POLICY IF EXISTS "Users can view PM schedules for their tenant equipment" ON pm_schedules;
DROP POLICY IF EXISTS "Technicians can view their assigned PM schedules" ON pm_schedules;
DROP POLICY IF EXISTS "Admin RS can view PM schedules for their tenant" ON pm_schedules;

-- Comprehensive SELECT policy that handles all user roles
CREATE POLICY "Users can view PM schedules based on role and permissions"
ON pm_schedules FOR SELECT
TO authenticated
USING (
  -- Super admin can see everything
  (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'super_admin'::app_role
  )) OR
  -- SPV and Operators can see schedules for equipment in their tenant
  (equipment_id IN (
    SELECT equipment.id
    FROM equipment
    WHERE equipment.tenant_id IN (
      SELECT profiles.tenant_id
      FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = ANY(ARRAY['spv'::app_role, 'spv_rs'::app_role, 'operator'::app_role, 'operator_rs'::app_role, 'admin_rs'::app_role])
    )
  )) OR
  -- Technicians can only see schedules assigned to them
  (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = ANY(ARRAY['teknisi'::app_role, 'teknisi_rs'::app_role])
    AND pm_schedules.assigned_to = profiles.user_id
  ))
);

-- Update INSERT policy to allow Admin RS to create schedules
DROP POLICY IF EXISTS "Super admin and SPV can create PM schedules" ON pm_schedules;
DROP POLICY IF EXISTS "Admin RS can create PM schedules for their tenant" ON pm_schedules;

CREATE POLICY "Authorized users can create PM schedules"
ON pm_schedules FOR INSERT
TO authenticated
WITH CHECK (
  -- Super admin, SPV can create any schedule
  (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = ANY(ARRAY['super_admin'::app_role, 'spv'::app_role, 'spv_rs'::app_role])
  )) OR
  -- Admin RS can create schedules for their tenant's equipment
  (equipment_id IN (
    SELECT equipment.id
    FROM equipment
    WHERE equipment.tenant_id IN (
      SELECT profiles.tenant_id
      FROM profiles
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = ANY(ARRAY['admin_rs'::app_role, 'operator_rs'::app_role])
    )
  ))
);

-- Update UPDATE policy to allow Admin RS to update schedules
DROP POLICY IF EXISTS "Super admin and SPV can update PM schedules" ON pm_schedules;
DROP POLICY IF EXISTS "Admin RS can update PM schedules for their tenant" ON pm_schedules;

CREATE POLICY "Authorized users can update PM schedules"
ON pm_schedules FOR UPDATE
TO authenticated
USING (
  -- Super admin, SPV can update any schedule
  (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = ANY(ARRAY['super_admin'::app_role, 'spv'::app_role, 'spv_rs'::app_role])
  )) OR
  -- Admin RS can update schedules for their tenant's equipment
  (equipment_id IN (
    SELECT equipment.id
    FROM equipment
    WHERE equipment.tenant_id IN (
      SELECT profiles.tenant_id
      FROM profiles
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = ANY(ARRAY['admin_rs'::app_role, 'operator_rs'::app_role])
    )
  ))
);

-- Update DELETE policy similarly
DROP POLICY IF EXISTS "Super admin and SPV can delete PM schedules" ON pm_schedules;

CREATE POLICY "Authorized users can delete PM schedules"
ON pm_schedules FOR DELETE
TO authenticated
USING (
  -- Super admin, SPV can delete any schedule
  (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = ANY(ARRAY['super_admin'::app_role, 'spv'::app_role, 'spv_rs'::app_role])
  )) OR
  -- Admin RS can delete schedules for their tenant's equipment  
  (equipment_id IN (
    SELECT equipment.id
    FROM equipment
    WHERE equipment.tenant_id IN (
      SELECT profiles.tenant_id
      FROM profiles
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = ANY(ARRAY['admin_rs'::app_role, 'operator_rs'::app_role])
    )
  ))
);