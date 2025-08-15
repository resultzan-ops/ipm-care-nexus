-- Create demo auth users and their profiles
-- We need to manually insert auth users first, then profiles

-- Create auth users (this is a special operation for demo purposes)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES 
-- Super Admin
('00000000-0000-0000-0000-000000000000', '7d427bd1-ba0f-4e53-8cf7-ae40d63582ef', 'authenticated', 'authenticated', 'superadmin@dayax.com', '$2a$10$7ynwCFWLkHzUNJn.JrF7n.nGRz3LZQN.5Z9JvLrRdtJNfYzXDQ4K6', NOW(), NOW(), NOW(), '', '', '', ''),
-- SPV
('00000000-0000-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440101', 'authenticated', 'authenticated', 'spv@dayax.com', '$2a$10$7ynwCFWLkHzUNJn.JrF7n.nGRz3LZQN.5Z9JvLrRdtJNfYzXDQ4K6', NOW(), NOW(), NOW(), '', '', '', ''),
-- Operator
('00000000-0000-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440102', 'authenticated', 'authenticated', 'operator@dayax.com', '$2a$10$7ynwCFWLkHzUNJn.JrF7n.nGRz3LZQN.5Z9JvLrRdtJNfYzXDQ4K6', NOW(), NOW(), NOW(), '', '', '', ''),
-- Teknisi
('00000000-0000-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440103', 'authenticated', 'authenticated', 'teknisi@dayax.com', '$2a$10$7ynwCFWLkHzUNJn.JrF7n.nGRz3LZQN.5Z9JvLrRdtJNfYzXDQ4K6', NOW(), NOW(), NOW(), '', '', '', ''),
-- Admin Kalibrasi Prima
('00000000-0000-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440201', 'authenticated', 'authenticated', 'admin@kalibratorprima.co.id', '$2a$10$7ynwCFWLkHzUNJn.JrF7n.nGRz3LZQN.5Z9JvLrRdtJNfYzXDQ4K6', NOW(), NOW(), NOW(), '', '', '', ''),
-- Kalibrator Sandi
('00000000-0000-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440202', 'authenticated', 'authenticated', 'sandi@kalibratorprima.co.id', '$2a$10$7ynwCFWLkHzUNJn.JrF7n.nGRz3LZQN.5Z9JvLrRdtJNfYzXDQ4K6', NOW(), NOW(), NOW(), '', '', '', ''),
-- Kalibrator Budi
('00000000-0000-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440203', 'authenticated', 'authenticated', 'budi@kalibratorprima.co.id', '$2a$10$7ynwCFWLkHzUNJn.JrF7n.nGRz3LZQN.5Z9JvLrRdtJNfYzXDQ4K6', NOW(), NOW(), NOW(), '', '', '', ''),
-- Admin RS Bethesda
('00000000-0000-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440301', 'authenticated', 'authenticated', 'admin@rsbethesda.com', '$2a$10$7ynwCFWLkHzUNJn.JrF7n.nGRz3LZQN.5Z9JvLrRdtJNfYzXDQ4K6', NOW(), NOW(), NOW(), '', '', '', ''),
-- SPV RS Bethesda
('00000000-0000-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440302', 'authenticated', 'authenticated', 'spv@rsbethesda.com', '$2a$10$7ynwCFWLkHzUNJn.JrF7n.nGRz3LZQN.5Z9JvLrRdtJNfYzXDQ4K6', NOW(), NOW(), NOW(), '', '', '', ''),
-- Operator RS Bethesda
('00000000-0000-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440303', 'authenticated', 'authenticated', 'operator@rsbethesda.com', '$2a$10$7ynwCFWLkHzUNJn.JrF7n.nGRz3LZQN.5Z9JvLrRdtJNfYzXDQ4K6', NOW(), NOW(), NOW(), '', '', '', ''),
-- Teknisi RS Bethesda
('00000000-0000-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440304', 'authenticated', 'authenticated', 'teknisi@rsbethesda.com', '$2a$10$7ynwCFWLkHzUNJn.JrF7n.nGRz3LZQN.5Z9JvLrRdtJNfYzXDQ4K6', NOW(), NOW(), NOW(), '', '', '', ''),
-- Admin RSUD Cibinong
('00000000-0000-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440401', 'authenticated', 'authenticated', 'admin@rsudcibinong.go.id', '$2a$10$7ynwCFWLkHzUNJn.JrF7n.nGRz3LZQN.5Z9JvLrRdtJNfYzXDQ4K6', NOW(), NOW(), NOW(), '', '', '', ''),
-- SPV RSUD Cibinong
('00000000-0000-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440402', 'authenticated', 'authenticated', 'spv@rsudcibinong.go.id', '$2a$10$7ynwCFWLkHzUNJn.JrF7n.nGRz3LZQN.5Z9JvLrRdtJNfYzXDQ4K6', NOW(), NOW(), NOW(), '', '', '', ''),
-- Operator RSUD Cibinong
('00000000-0000-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440403', 'authenticated', 'authenticated', 'operator@rsudcibinong.go.id', '$2a$10$7ynwCFWLkHzUNJn.JrF7n.nGRz3LZQN.5Z9JvLrRdtJNfYzXDQ4K6', NOW(), NOW(), NOW(), '', '', '', ''),
-- Teknisi RSUD Cibinong
('00000000-0000-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440404', 'authenticated', 'authenticated', 'teknisi@rsudcibinong.go.id', '$2a$10$7ynwCFWLkHzUNJn.JrF7n.nGRz3LZQN.5Z9JvLrRdtJNfYzXDQ4K6', NOW(), NOW(), NOW(), '', '', '', ''),
-- Admin CV Medika
('00000000-0000-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440501', 'authenticated', 'authenticated', 'admin@medikaservice.com', '$2a$10$7ynwCFWLkHzUNJn.JrF7n.nGRz3LZQN.5Z9JvLrRdtJNfYzXDQ4K6', NOW(), NOW(), NOW(), '', '', '', ''),
-- Kalibrator CV Medika
('00000000-0000-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440502', 'authenticated', 'authenticated', 'doni@medikaservice.com', '$2a$10$7ynwCFWLkHzUNJn.JrF7n.nGRz3LZQN.5Z9JvLrRdtJNfYzXDQ4K6', NOW(), NOW(), NOW(), '', '', '', '')
ON CONFLICT (id) DO NOTHING;