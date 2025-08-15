-- Promote specific user to super_admin by email using existing SECURITY DEFINER function
DO $$
DECLARE
  v_uid uuid;
BEGIN
  -- Find the user's id by email
  SELECT id INTO v_uid
  FROM auth.users
  WHERE email = 'dayax19@gmail.com'
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_uid IS NOT NULL THEN
    -- Use existing helper to set or create profile with super_admin role
    PERFORM public.promote_to_super_admin(v_uid);
    RAISE NOTICE 'Promoted user % (id=%) to super_admin', 'dayax19@gmail.com', v_uid;
  ELSE
    RAISE NOTICE 'User with email % not found in auth.users', 'dayax19@gmail.com';
  END IF;
END $$;