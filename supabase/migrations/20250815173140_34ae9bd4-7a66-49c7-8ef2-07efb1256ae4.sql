-- Allow super admin and SPV to create PM schedules
CREATE POLICY "Super admin and SPV can create PM schedules" 
ON public.pm_schedules 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin'::app_role, 'spv'::app_role, 'spv_rs'::app_role)
  )
);

-- Allow super admin and SPV to update PM schedules
CREATE POLICY "Super admin and SPV can update PM schedules" 
ON public.pm_schedules 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin'::app_role, 'spv'::app_role, 'spv_rs'::app_role)
  )
);

-- Allow super admin and SPV to delete PM schedules
CREATE POLICY "Super admin and SPV can delete PM schedules" 
ON public.pm_schedules 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin'::app_role, 'spv'::app_role, 'spv_rs'::app_role)
  )
);