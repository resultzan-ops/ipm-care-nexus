-- Create comprehensive RLS policies for the updated structure

-- Tenants (Companies) RLS Policies
CREATE POLICY "Super admin can view all companies" ON tenants
  FOR SELECT USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can view their own company" ON tenants
  FOR SELECT USING (
    id IN (
      SELECT profiles.company_id 
      FROM profiles 
      WHERE profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Super admin can manage all companies" ON tenants
  FOR ALL USING (has_role(auth.uid(), 'super_admin'));

-- Profiles RLS Policies  
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

-- Equipment RLS Policies
CREATE POLICY "Users can view equipment from their company" ON equipment
  FOR SELECT USING (
    tenant_id IN (
      SELECT profiles.company_id 
      FROM profiles 
      WHERE profiles.user_id = auth.uid()
    ) OR has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Authorized users can create equipment" ON equipment
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT profiles.company_id 
      FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role IN ('admin_klien', 'operator_klien', 'super_admin')
    )
  );

CREATE POLICY "Authorized users can update equipment" ON equipment
  FOR UPDATE USING (
    tenant_id IN (
      SELECT profiles.company_id 
      FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role IN ('admin_klien', 'operator_klien', 'super_admin')
    )
  );

-- PM Schedules RLS Policies
CREATE POLICY "Users can view PM schedules based on role" ON pm_schedules
  FOR SELECT USING (
    has_role(auth.uid(), 'super_admin') OR 
    equipment_id IN (
      SELECT equipment.id 
      FROM equipment 
      WHERE equipment.tenant_id IN (
        SELECT profiles.company_id 
        FROM profiles 
        WHERE profiles.user_id = auth.uid() 
        AND profiles.role IN ('admin_mitra', 'teknisi_mitra', 'admin_klien', 'operator_klien')
      )
    ) OR 
    assigned_to = auth.uid()
  );

CREATE POLICY "Authorized users can create PM schedules" ON pm_schedules
  FOR INSERT WITH CHECK (
    has_role(auth.uid(), 'super_admin') OR 
    equipment_id IN (
      SELECT equipment.id 
      FROM equipment 
      WHERE equipment.tenant_id IN (
        SELECT profiles.company_id 
        FROM profiles 
        WHERE profiles.user_id = auth.uid() 
        AND profiles.role IN ('admin_mitra', 'admin_klien')
      )
    )
  );

CREATE POLICY "Authorized users can update PM schedules" ON pm_schedules
  FOR UPDATE USING (
    has_role(auth.uid(), 'super_admin') OR 
    equipment_id IN (
      SELECT equipment.id 
      FROM equipment 
      WHERE equipment.tenant_id IN (
        SELECT profiles.company_id 
        FROM profiles 
        WHERE profiles.user_id = auth.uid() 
        AND profiles.role IN ('admin_mitra', 'admin_klien')
      )
    )
  );

CREATE POLICY "Authorized users can delete PM schedules" ON pm_schedules
  FOR DELETE USING (
    has_role(auth.uid(), 'super_admin') OR 
    equipment_id IN (
      SELECT equipment.id 
      FROM equipment 
      WHERE equipment.tenant_id IN (
        SELECT profiles.company_id 
        FROM profiles 
        WHERE profiles.user_id = auth.uid() 
        AND profiles.role IN ('admin_mitra', 'admin_klien')
      )
    )
  );

-- PM Records RLS Policies
CREATE POLICY "Users can view PM records for their company equipment" ON pm_records
  FOR SELECT USING (
    has_role(auth.uid(), 'super_admin') OR 
    pm_schedule_id IN (
      SELECT ps.id 
      FROM pm_schedules ps 
      JOIN equipment e ON ps.equipment_id = e.id 
      WHERE e.tenant_id IN (
        SELECT profiles.company_id 
        FROM profiles 
        WHERE profiles.user_id = auth.uid()
      )
    )
  );

-- Calibration Requests RLS Policies  
CREATE POLICY "Users can view calibration requests for their company" ON calibration_requests
  FOR SELECT USING (
    has_role(auth.uid(), 'super_admin') OR 
    equipment_id IN (
      SELECT equipment.id 
      FROM equipment 
      WHERE equipment.tenant_id IN (
        SELECT profiles.company_id 
        FROM profiles 
        WHERE profiles.user_id = auth.uid()
      )
    )
  );

-- Calibration Records RLS Policies
CREATE POLICY "Users can view calibration records for their company" ON calibration_records
  FOR SELECT USING (
    has_role(auth.uid(), 'super_admin') OR 
    equipment_id IN (
      SELECT equipment.id 
      FROM equipment 
      WHERE equipment.tenant_id IN (
        SELECT profiles.company_id 
        FROM profiles 
        WHERE profiles.user_id = auth.uid()
      )
    )
  );