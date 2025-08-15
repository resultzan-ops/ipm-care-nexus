-- Create enum types
CREATE TYPE app_role AS ENUM (
  'super_admin',
  'spv',
  'operator', 
  'teknisi',
  'admin_kalibrasi',
  'kalibrator',
  'admin_rs',
  'spv_rs',
  'operator_rs',
  'teknisi_rs'
);

CREATE TYPE tenant_type AS ENUM ('rumah_sakit', 'perusahaan');
CREATE TYPE equipment_status AS ENUM ('active', 'inactive', 'maintenance', 'retired');
CREATE TYPE pm_status AS ENUM ('pending', 'in_progress', 'completed', 'overdue', 'cancelled');
CREATE TYPE calibration_status AS ENUM ('pending', 'approved', 'rejected', 'completed');
CREATE TYPE notification_channel AS ENUM ('email', 'whatsapp', 'in_app');
CREATE TYPE equipment_category_type AS ENUM ('medis', 'umum');

-- Create tenants table
CREATE TABLE public.tenants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type tenant_type NOT NULL,
  address TEXT,
  contact TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'teknisi',
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type equipment_category_type NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create equipment table
CREATE TABLE public.equipment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id),
  name TEXT NOT NULL,
  serial_number TEXT UNIQUE NOT NULL,
  brand TEXT,
  model TEXT,
  location TEXT,
  purchase_date DATE,
  price DECIMAL(15,2),
  hospital_name TEXT,
  photo_url TEXT,
  barcode TEXT UNIQUE NOT NULL,
  status equipment_status NOT NULL DEFAULT 'active',
  specifications JSONB,
  warranty_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create PM schedule table
CREATE TABLE public.pm_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  frequency_months INTEGER NOT NULL DEFAULT 3,
  assigned_to UUID REFERENCES public.profiles(user_id),
  status pm_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  priority INTEGER DEFAULT 1,
  created_by UUID NOT NULL REFERENCES public.profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create PM records table
CREATE TABLE public.pm_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pm_schedule_id UUID NOT NULL REFERENCES public.pm_schedules(id) ON DELETE CASCADE,
  performed_by UUID NOT NULL REFERENCES public.profiles(user_id),
  date_performed TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  findings TEXT,
  recommendations TEXT,
  condition_before TEXT,
  condition_after TEXT,
  parts_replaced JSONB,
  photos JSONB,
  next_maintenance_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create calibration requests table
CREATE TABLE public.calibration_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  request_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  requested_by UUID NOT NULL REFERENCES public.profiles(user_id),
  status calibration_status NOT NULL DEFAULT 'pending',
  approved_by UUID REFERENCES public.profiles(user_id),
  approved_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  priority INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create calibration records table
CREATE TABLE public.calibration_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  calibration_request_id UUID REFERENCES public.calibration_requests(id) ON DELETE CASCADE,
  equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  calibration_date TIMESTAMP WITH TIME ZONE NOT NULL,
  performed_by UUID NOT NULL REFERENCES public.profiles(user_id),
  certificate_number TEXT,
  certificate_file_url TEXT,
  next_due_date DATE,
  calibration_result TEXT,
  notes TEXT,
  is_passed BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  data JSONB,
  channel notification_channel NOT NULL DEFAULT 'in_app',
  is_read BOOLEAN NOT NULL DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pm_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pm_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calibration_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calibration_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for multi-tenant isolation

-- Tenants policies
CREATE POLICY "Super admin can view all tenants" ON public.tenants FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'super_admin')
);

CREATE POLICY "Users can view their own tenant" ON public.tenants FOR SELECT USING (
  id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid())
);

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Super admin can view all profiles" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'super_admin')
);

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (user_id = auth.uid());

-- Equipment policies (tenant isolation)
CREATE POLICY "Users can view equipment from their tenant" ON public.equipment FOR SELECT USING (
  tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'super_admin')
);

CREATE POLICY "Users can create equipment for their tenant" ON public.equipment FOR INSERT WITH CHECK (
  tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid())
  AND EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('operator', 'admin_rs', 'operator_rs', 'super_admin'))
);

CREATE POLICY "Users can update equipment from their tenant" ON public.equipment FOR UPDATE USING (
  tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid())
  AND EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('operator', 'admin_rs', 'operator_rs', 'super_admin'))
);

-- Categories policies
CREATE POLICY "Everyone can view categories" ON public.categories FOR SELECT USING (true);

-- PM Schedules policies
CREATE POLICY "Users can view PM schedules for their tenant equipment" ON public.pm_schedules FOR SELECT USING (
  equipment_id IN (
    SELECT id FROM public.equipment WHERE tenant_id IN (
      SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid()
    )
  )
  OR EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'super_admin')
);

-- PM Records policies
CREATE POLICY "Users can view PM records for their tenant equipment" ON public.pm_records FOR SELECT USING (
  pm_schedule_id IN (
    SELECT ps.id FROM public.pm_schedules ps
    JOIN public.equipment e ON ps.equipment_id = e.id
    WHERE e.tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid())
  )
  OR EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'super_admin')
);

-- Calibration requests policies
CREATE POLICY "Users can view calibration requests for their tenant" ON public.calibration_requests FOR SELECT USING (
  equipment_id IN (
    SELECT id FROM public.equipment WHERE tenant_id IN (
      SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid()
    )
  )
  OR EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'super_admin')
);

-- Calibration records policies  
CREATE POLICY "Users can view calibration records for their tenant" ON public.calibration_records FOR SELECT USING (
  equipment_id IN (
    SELECT id FROM public.equipment WHERE tenant_id IN (
      SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid()
    )
  )
  OR EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'super_admin')
);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON public.tenants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON public.equipment FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pm_schedules_updated_at BEFORE UPDATE ON public.pm_schedules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_calibration_requests_updated_at BEFORE UPDATE ON public.calibration_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email), 'teknisi');
  RETURN NEW;
END;
$$;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to generate unique barcode
CREATE OR REPLACE FUNCTION public.generate_barcode()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN 'EQ' || LPAD(EXTRACT(EPOCH FROM NOW())::TEXT, 10, '0') || LPAD((RANDOM() * 999)::INT::TEXT, 3, '0');
END;
$$;

-- Insert sample data
INSERT INTO public.tenants (name, type, address, contact, email, phone) VALUES
('Rumah Sakit Umum Daerah', 'rumah_sakit', 'Jl. Kesehatan No. 123', 'Dr. Ahmad', 'admin@rsud.com', '021-123456'),
('RS Swasta Medika', 'rumah_sakit', 'Jl. Sehat No. 456', 'Dr. Sari', 'admin@rsmedika.com', '021-654321'),
('PT. Maintenance Care', 'perusahaan', 'Jl. Industri No. 789', 'Budi Santoso', 'info@maintenancecare.com', '021-987654');

INSERT INTO public.categories (name, type, description) VALUES
('Alat Diagnostik', 'medis', 'Peralatan untuk diagnosis medis'),
('Alat Terapi', 'medis', 'Peralatan untuk terapi medis'),
('Alat Bedah', 'medis', 'Peralatan untuk operasi'),
('HVAC', 'umum', 'Heating, Ventilation, Air Conditioning'),
('Listrik', 'umum', 'Peralatan kelistrikan umum'),
('Plumbing', 'umum', 'Sistem perpipaan dan air');