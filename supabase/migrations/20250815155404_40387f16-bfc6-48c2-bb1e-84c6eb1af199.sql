-- Add sample data for comprehensive IPM system

-- First, insert sample hospitals/companies
INSERT INTO public.tenants (id, name, type, address, contact, email, phone) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'RS Bethesda Jakarta', 'rumah_sakit', 'Jl. Raya Kemang No. 12, Jakarta Selatan', 'Dr. Sarah Wijaya', 'admin@rsbethesda.com', '021-7890123'),
('550e8400-e29b-41d4-a716-446655440002', 'RSUD Cibinong', 'rumah_sakit', 'Jl. Raya Cibinong No. 45, Bogor', 'Dr. Ahmad Fauzi', 'admin@rsudcibinong.go.id', '021-8765432'),
('550e8400-e29b-41d4-a716-446655440003', 'PT. Kalibrator Prima', 'perusahaan', 'Jl. Industri Raya No. 78, Bekasi', 'Ir. Bambang Sutrisno', 'info@kalibratorprima.co.id', '021-9876543'),
('550e8400-e29b-41d4-a716-446655440004', 'CV. Medika Service', 'perusahaan', 'Jl. Veteran No. 23, Depok', 'Drs. Suharto', 'cs@medikaservice.com', '021-5432198')
ON CONFLICT (id) DO NOTHING;

-- Create comprehensive sample users for different roles
-- Super Admin users
INSERT INTO public.profiles (user_id, name, role, tenant_id, phone, is_active) VALUES
-- Super Admin
('7d427bd1-ba0f-4e53-8cf7-ae40d63582ef', 'Dayax Super Admin', 'super_admin', NULL, '081234567890', true),

-- SPV Super Admin  
('550e8400-e29b-41d4-a716-446655440101', 'Lina Supervisor', 'spv', NULL, '081234567891', true),

-- Operator Super Admin
('550e8400-e29b-41d4-a716-446655440102', 'Rudi Operator', 'operator', NULL, '081234567892', true),

-- Teknisi Super Admin
('550e8400-e29b-41d4-a716-446655440103', 'Joko Teknisi', 'teknisi', NULL, '081234567893', true),

-- Kalibrasi Company Users (PT. Kalibrator Prima)
('550e8400-e29b-41d4-a716-446655440201', 'Admin Kalibrasi Prima', 'admin_kalibrasi', '550e8400-e29b-41d4-a716-446655440003', '081234567894', true),
('550e8400-e29b-41d4-a716-446655440202', 'Sandi Kalibrator', 'kalibrator', '550e8400-e29b-41d4-a716-446655440003', '081234567895', true),
('550e8400-e29b-41d4-a716-446655440203', 'Budi Kalibrator', 'kalibrator', '550e8400-e29b-41d4-a716-446655440003', '081234567896', true),

-- RS Bethesda Users
('550e8400-e29b-41d4-a716-446655440301', 'Admin RS Bethesda', 'admin_rs', '550e8400-e29b-41d4-a716-446655440001', '081234567897', true),
('550e8400-e29b-41d4-a716-446655440302', 'SPV RS Bethesda', 'spv_rs', '550e8400-e29b-41d4-a716-446655440001', '081234567898', true),
('550e8400-e29b-41d4-a716-446655440303', 'Operator RS Bethesda', 'operator_rs', '550e8400-e29b-41d4-a716-446655440001', '081234567899', true),
('550e8400-e29b-41d4-a716-446655440304', 'Teknisi RS Bethesda', 'teknisi_rs', '550e8400-e29b-41d4-a716-446655440001', '081234567800', true),

-- RSUD Cibinong Users  
('550e8400-e29b-41d4-a716-446655440401', 'Admin RSUD Cibinong', 'admin_rs', '550e8400-e29b-41d4-a716-446655440002', '081234567801', true),
('550e8400-e29b-41d4-a716-446655440402', 'SPV RSUD Cibinong', 'spv_rs', '550e8400-e29b-41d4-a716-446655440002', '081234567802', true),
('550e8400-e29b-41d4-a716-446655440403', 'Operator RSUD Cibinong', 'operator_rs', '550e8400-e29b-41d4-a716-446655440002', '081234567803', true),
('550e8400-e29b-41d4-a716-446655440404', 'Teknisi RSUD Cibinong', 'teknisi_rs', '550e8400-e29b-41d4-a716-446655440002', '081234567804', true),

-- CV. Medika Service Users
('550e8400-e29b-41d4-a716-446655440501', 'Admin CV Medika', 'admin_kalibrasi', '550e8400-e29b-41d4-a716-446655440004', '081234567805', true),
('550e8400-e29b-41d4-a716-446655440502', 'Doni Kalibrator', 'kalibrator', '550e8400-e29b-41d4-a716-446655440004', '081234567806', true)
ON CONFLICT (user_id) DO UPDATE SET 
  role = EXCLUDED.role,
  tenant_id = EXCLUDED.tenant_id,
  name = EXCLUDED.name,
  phone = EXCLUDED.phone;

-- Insert sample equipment for different hospitals
INSERT INTO public.equipment (id, tenant_id, category_id, name, serial_number, brand, model, location, purchase_date, price, hospital_name, barcode, status, specifications, warranty_date) VALUES
-- Equipment for RS Bethesda Jakarta
('550e8400-e29b-41d4-a716-446655440601', '550e8400-e29b-41d4-a716-446655440001', (SELECT id FROM public.categories WHERE name = 'Alat Diagnostik' LIMIT 1), 'MRI Scanner 1.5T', 'MRI-BSJ-001', 'Siemens', 'Magnetom Essenza', 'Radiologi Lt. 2', '2022-01-15', 4500000000.00, 'RS Bethesda Jakarta', 'EQ1755272427001', 'active', '{"tesla": "1.5", "bore_diameter": "60cm", "gradient_strength": "45mT/m"}', '2027-01-15'),

('550e8400-e29b-41d4-a716-446655440602', '550e8400-e29b-41d4-a716-446655440001', (SELECT id FROM public.categories WHERE name = 'Alat Diagnostik' LIMIT 1), 'CT Scanner 64 Slice', 'CT-BSJ-001', 'GE Healthcare', 'Optima CT660', 'Radiologi Lt. 1', '2021-06-20', 2800000000.00, 'RS Bethesda Jakarta', 'EQ1755272427002', 'active', '{"slices": 64, "rotation_time": "0.35s", "detector_coverage": "40mm"}', '2026-06-20'),

('550e8400-e29b-41d4-a716-446655440603', '550e8400-e29b-41d4-a716-446655440001', (SELECT id FROM public.categories WHERE name = 'Alat Terapi' LIMIT 1), 'Ventilator ICU', 'VENT-BSJ-001', 'Dräger', 'Evita V300', 'ICU Lt. 3', '2023-03-10', 850000000.00, 'RS Bethesda Jakarta', 'EQ1755272427003', 'active', '{"modes": ["IPPV", "SIMV", "CPAP"], "tidal_volume": "50-2000ml"}', '2028-03-10'),

-- Equipment for RSUD Cibinong
('550e8400-e29b-41d4-a716-446655440604', '550e8400-e29b-41d4-a716-446655440002', (SELECT id FROM public.categories WHERE name = 'Alat Diagnostik' LIMIT 1), 'X-Ray Digital', 'XRAY-CBC-001', 'Philips', 'DigitalDiagnost C90', 'Radiologi Lt. 1', '2022-08-12', 1200000000.00, 'RSUD Cibinong', 'EQ1755272427004', 'active', '{"detector_size": "43x43cm", "pixel_matrix": "3072x3072"}', '2027-08-12'),

('550e8400-e29b-41d4-a716-446655440605', '550e8400-e29b-41d4-a716-446655440002', (SELECT id FROM public.categories WHERE name = 'Alat Terapi' LIMIT 1), 'Defibrillator Monitor', 'DEF-CBC-001', 'Zoll', 'X-Series', 'UGD', '2023-01-25', 320000000.00, 'RSUD Cibinong', 'EQ1755272427005', 'active', '{"energy": "1-200J", "modes": ["AED", "Manual", "Pacing"]}', '2028-01-25'),

('550e8400-e29b-41d4-a716-446655440606', '550e8400-e29b-41d4-a716-446655440002', (SELECT id FROM public.categories WHERE name = 'HVAC' LIMIT 1), 'AC Central ICU', 'AC-CBC-001', 'Daikin', 'VRV IV-S', 'ICU Lt. 2', '2021-11-30', 450000000.00, 'RSUD Cibinong', 'EQ1755272427006', 'active', '{"capacity": "54HP", "refrigerant": "R410A", "energy_class": "A"}', '2026-11-30');

-- Insert sample PM schedules
INSERT INTO public.pm_schedules (id, equipment_id, scheduled_date, frequency_months, assigned_to, status, notes, priority, created_by) VALUES
('550e8400-e29b-41d4-a716-446655440701', '550e8400-e29b-41d4-a716-446655440601', '2025-09-15', 6, '550e8400-e29b-41d4-a716-446655440304', 'pending', 'Maintenance rutin MRI 6 bulan', 1, '550e8400-e29b-41d4-a716-446655440303'),
('550e8400-e29b-41d4-a716-446655440702', '550e8400-e29b-41d4-a716-446655440602', '2025-08-20', 3, '550e8400-e29b-41d4-a716-446655440304', 'pending', 'Maintenance CT Scanner 3 bulan', 2, '550e8400-e29b-41d4-a716-446655440303'),
('550e8400-e29b-41d4-a716-446655440703', '550e8400-e29b-41d4-a716-446655440604', '2025-08-30', 3, '550e8400-e29b-41d4-a716-446655440404', 'in_progress', 'Maintenance X-Ray Digital', 1, '550e8400-e29b-41d4-a716-446655440403');

-- Insert sample calibration requests
INSERT INTO public.calibration_requests (id, equipment_id, requested_by, status, notes, priority) VALUES
('550e8400-e29b-41d4-a716-446655440801', '550e8400-e29b-41d4-a716-446655440601', '550e8400-e29b-41d4-a716-446655440303', 'pending', 'Request kalibrasi MRI Scanner sesuai jadwal', 1),
('550e8400-e29b-41d4-a716-446655440802', '550e8400-e29b-41d4-a716-446655440603', '550e8400-e29b-41d4-a716-446655440303', 'approved', 'Kalibrasi ventilator ICU - urgent', 3),
('550e8400-e29b-41d4-a716-446655440803', '550e8400-e29b-41d4-a716-446655440605', '550e8400-e29b-41d4-a716-446655440403', 'approved', 'Kalibrasi defibrillator monitor', 2);

-- Insert sample calibration records for approved requests
INSERT INTO public.calibration_records (id, calibration_request_id, equipment_id, calibration_date, performed_by, certificate_number, next_due_date, calibration_result, notes, is_passed) VALUES
('550e8400-e29b-41d4-a716-446655440901', '550e8400-e29b-41d4-a716-446655440802', '550e8400-e29b-41d4-a716-446655440603', '2025-08-10', '550e8400-e29b-41d4-a716-446655440202', 'CAL-VENT-2025-001', '2026-08-10', 'PASSED', 'Kalibrasi ventilator berhasil, semua parameter dalam toleransi', true),
('550e8400-e29b-41d4-a716-446655440902', '550e8400-e29b-41d4-a716-446655440803', '550e8400-e29b-41d4-a716-446655440605', '2025-08-12', '550e8400-e29b-41d4-a716-446655440502', 'CAL-DEF-2025-002', '2026-08-12', 'PASSED', 'Kalibrasi defibrillator selesai, output energy akurat', true);

-- Insert sample notifications
INSERT INTO public.notifications (user_id, title, message, type, channel, is_read) VALUES
('550e8400-e29b-41d4-a716-446655440303', 'Request Kalibrasi Baru', 'Ada request kalibrasi baru untuk MRI Scanner yang perlu persetujuan', 'calibration_request', 'in_app', false),
('550e8400-e29b-41d4-a716-446655440304', 'Tugas Maintenance Baru', 'Anda ditugaskan untuk maintenance CT Scanner di Radiologi Lt. 1', 'maintenance_assignment', 'in_app', false),
('550e8400-e29b-41d4-a716-446655440202', 'Kalibrasi Selesai', 'Kalibrasi ventilator ICU telah selesai dan hasilnya PASSED', 'calibration_completed', 'in_app', true),
('550e8400-e29b-41d4-a716-446655440403', 'Peralatan Mendekati Jadwal Kalibrasi', 'X-Ray Digital perlu dikalibrasi dalam 30 hari', 'calibration_reminder', 'in_app', false);