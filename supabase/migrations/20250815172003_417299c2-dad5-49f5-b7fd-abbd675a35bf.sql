-- Allow super admin to update all profiles
CREATE POLICY "Super admin can update all profiles" 
ON public.profiles 
FOR UPDATE 
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Allow super admin to delete all profiles
CREATE POLICY "Super admin can delete all profiles" 
ON public.profiles 
FOR DELETE 
USING (has_role(auth.uid(), 'super_admin'::app_role));