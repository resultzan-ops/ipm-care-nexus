-- Ensure the user exists, set password to 'Masuk123$', and confirm email
-- 1) Update password and confirm email for the user
UPDATE auth.users
SET 
  encrypted_password = crypt('Masuk123$', gen_salt('bf')),
  email_confirmed_at = NOW(),
  updated_at = NOW()
WHERE email = 'dayax19@gmail.com';

-- 2) Ensure profile exists and set role to super_admin, active
INSERT INTO public.profiles (user_id, name, role, is_active)
SELECT id, COALESCE((SELECT name FROM public.profiles WHERE user_id = u.id LIMIT 1), 'Super Admin'), 'super_admin', true
FROM auth.users u
WHERE u.email = 'dayax19@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET 
  role = 'super_admin',
  is_active = true,
  name = COALESCE(EXCLUDED.name, public.profiles.name);
