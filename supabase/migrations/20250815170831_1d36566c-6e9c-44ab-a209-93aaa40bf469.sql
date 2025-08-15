-- First, let's check if there's a foreign key constraint on profiles.user_id
-- and remove it temporarily to fix the issue, then add it back properly

-- Drop the existing foreign key constraint if it exists
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- Add the foreign key constraint properly with CASCADE options
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;