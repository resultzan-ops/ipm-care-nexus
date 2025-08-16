// Super Admin Configuration and Utilities

export interface AuditLog {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  target_type: "user" | "role" | "company" | "permission";
  target_id: string;
  target_name: string;
  changes: Record<string, any>;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
}

export interface SystemConfig {
  max_users_per_company: number;
  max_equipment_per_company: number;
  default_session_timeout: number;
  require_2fa_for_admins: boolean;
  backup_frequency_hours: number;
  maintenance_window_start: string;
  maintenance_window_end: string;
  allowed_file_types: string[];
  max_file_size_mb: number;
}

export const DEFAULT_SYSTEM_CONFIG: SystemConfig = {
  max_users_per_company: 100,
  max_equipment_per_company: 1000,
  default_session_timeout: 8, // hours
  require_2fa_for_admins: true,
  backup_frequency_hours: 24,
  maintenance_window_start: "02:00",
  maintenance_window_end: "04:00",
  allowed_file_types: [".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx", ".xls", ".xlsx"],
  max_file_size_mb: 10
};

// Super Admin utility functions
export function logAuditEvent(
  userId: string,
  userName: string,
  action: string,
  targetType: AuditLog["target_type"],
  targetId: string,
  targetName: string,
  changes: Record<string, any>
): AuditLog {
  return {
    id: Date.now().toString(),
    user_id: userId,
    user_name: userName,
    action,
    target_type: targetType,
    target_id: targetId,
    target_name: targetName,
    changes,
    timestamp: new Date().toISOString(),
    ip_address: "127.0.0.1", // In real app, get from request
    user_agent: navigator.userAgent
  };
}

export function isValidSystemConfig(config: Partial<SystemConfig>): boolean {
  // Validate system configuration
  if (config.max_users_per_company && config.max_users_per_company < 1) return false;
  if (config.max_equipment_per_company && config.max_equipment_per_company < 1) return false;
  if (config.default_session_timeout && config.default_session_timeout < 1) return false;
  if (config.max_file_size_mb && config.max_file_size_mb < 1) return false;
  
  return true;
}

// RBAC Database Schema Suggestions for Supabase Migration
export const RBAC_SCHEMA = `
-- Create roles table
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  company_type TEXT, -- 'klien', 'mitra', 'internal', null for global roles
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create permissions table
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  module TEXT NOT NULL, -- 'equipment', 'calibration', 'user', etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create role_permissions junction table
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(role_id, permission_id)
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  target_name TEXT NOT NULL,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create system_config table
CREATE TABLE IF NOT EXISTS public.system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT UNIQUE NOT NULL,
  config_value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- Super admin can manage everything
CREATE POLICY "Super admin full access on roles" ON public.roles FOR ALL USING (has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Super admin full access on permissions" ON public.permissions FOR ALL USING (has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Super admin full access on role_permissions" ON public.role_permissions FOR ALL USING (has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Super admin can view audit logs" ON public.audit_logs FOR SELECT USING (has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Super admin full access on system_config" ON public.system_config FOR ALL USING (has_role(auth.uid(), 'super_admin'));

-- Company admins can view roles for their company type
CREATE POLICY "Company admins can view relevant roles" ON public.roles 
  FOR SELECT USING (
    has_role(auth.uid(), 'admin_klien') AND company_type = 'klien' OR
    has_role(auth.uid(), 'admin_mitra') AND company_type = 'mitra'
  );

-- Insert default permissions
INSERT INTO public.permissions (name, display_name, description, module) VALUES
('dashboard', 'Dashboard Access', 'Access to dashboard', 'core'),
('equipment', 'Equipment Management', 'Manage equipment', 'equipment'),
('maintenance', 'Maintenance Operations', 'Maintenance operations', 'maintenance'),
('inspections', 'Equipment Inspections', 'Equipment inspections', 'inspection'),
('calibrations', 'Calibration Management', 'Calibration management', 'calibration'),
('reports', 'Generate Reports', 'Generate reports', 'reporting'),
('global_reports', 'Global Reports Access', 'Access all reports', 'reporting'),
('monitoring', 'System Monitoring', 'System monitoring', 'monitoring'),
('tools', 'System Tools', 'System tools', 'tools'),
('download', 'Download Capabilities', 'Download capabilities', 'download'),
('company_management', 'Company Management', 'Manage companies', 'company'),
('user_management', 'User Management', 'Manage users', 'user'),
('settings', 'System Settings', 'System settings', 'settings'),
('tasks', 'Task Management', 'Task management', 'tasks')
ON CONFLICT (name) DO NOTHING;

-- Insert default roles
INSERT INTO public.roles (name, display_name, description, company_type) VALUES
('super_admin', 'Super Admin', 'Full system access', null),
('admin_klien', 'Admin Klien', 'Client admin access', 'klien'),
('admin_mitra', 'Admin Mitra', 'Service provider admin', 'mitra'),
('operator_klien', 'Operator Klien', 'Client operator', 'klien'),
('teknisi_mitra', 'Teknisi Mitra', 'Service provider technician', 'mitra'),
('kalibrator', 'Kalibrator', 'Calibration specialist', 'mitra'),
('spv', 'Supervisor', 'Supervisor role', null)
ON CONFLICT (name) DO NOTHING;
`;

export function generateRBACMigration(): string {
  return RBAC_SCHEMA;
}