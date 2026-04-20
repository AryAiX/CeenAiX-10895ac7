-- Create demo auth users for the lab and super_admin portals so local and dev-db
-- environments have working sign-in accounts to exercise the new backends.
--
-- This migration is idempotent: it uses deterministic UUIDs and ON CONFLICT
-- clauses for both auth.users and public.user_profiles. Passwords default to
-- "CeenAiXDemo!" for all demo accounts; rotate these in production.

DO $$
DECLARE
  lab_user_id uuid := '9a1f5c7c-4f74-4c5e-8d6e-7b2a1a111001';
  admin_user_id uuid := '9a1f5c7c-4f74-4c5e-8d6e-7b2a1a111002';
  demo_password text := 'CeenAiXDemo!';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = lab_user_id) THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      created_at,
      updated_at,
      is_sso_user,
      is_anonymous
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      lab_user_id,
      'authenticated',
      'authenticated',
      'lab1@aryaix.com',
      crypt(demo_password, gen_salt('bf')),
      now(),
      '',
      '',
      '',
      '',
      jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
      jsonb_build_object(
        'sub', lab_user_id::text,
        'role', 'lab',
        'email', 'lab1@aryaix.com',
        'full_name', 'Layla Haddad',
        'first_name', 'Layla',
        'last_name', 'Haddad'
      ),
      false,
      now(),
      now(),
      false,
      false
    );

    INSERT INTO auth.identities (
      id,
      provider_id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    )
    VALUES (
      gen_random_uuid(),
      lab_user_id::text,
      lab_user_id,
      jsonb_build_object(
        'sub', lab_user_id::text,
        'role', 'lab',
        'email', 'lab1@aryaix.com',
        'full_name', 'Layla Haddad',
        'first_name', 'Layla',
        'last_name', 'Haddad',
        'email_verified', true
      ),
      'email',
      now(),
      now(),
      now()
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = admin_user_id) THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      created_at,
      updated_at,
      is_sso_user,
      is_anonymous
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      admin_user_id,
      'authenticated',
      'authenticated',
      'admin1@aryaix.com',
      crypt(demo_password, gen_salt('bf')),
      now(),
      '',
      '',
      '',
      '',
      jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email'), 'role', 'super_admin'),
      jsonb_build_object(
        'sub', admin_user_id::text,
        'role', 'super_admin',
        'email', 'admin1@aryaix.com',
        'full_name', 'Amina Rashid',
        'first_name', 'Amina',
        'last_name', 'Rashid'
      ),
      false,
      now(),
      now(),
      false,
      false
    );

    INSERT INTO auth.identities (
      id,
      provider_id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    )
    VALUES (
      gen_random_uuid(),
      admin_user_id::text,
      admin_user_id,
      jsonb_build_object(
        'sub', admin_user_id::text,
        'role', 'super_admin',
        'email', 'admin1@aryaix.com',
        'full_name', 'Amina Rashid',
        'first_name', 'Amina',
        'last_name', 'Rashid',
        'email_verified', true
      ),
      'email',
      now(),
      now(),
      now()
    );
  END IF;
END
$$;

INSERT INTO public.user_profiles (
  user_id,
  role,
  full_name,
  first_name,
  last_name,
  email,
  city,
  profile_completed,
  terms_accepted
)
VALUES
  (
    '9a1f5c7c-4f74-4c5e-8d6e-7b2a1a111001',
    'lab',
    'Layla Haddad',
    'Layla',
    'Haddad',
    'lab1@aryaix.com',
    'Dubai',
    true,
    true
  ),
  (
    '9a1f5c7c-4f74-4c5e-8d6e-7b2a1a111002',
    'super_admin',
    'Amina Rashid',
    'Amina',
    'Rashid',
    'admin1@aryaix.com',
    'Dubai',
    true,
    true
  )
ON CONFLICT (user_id) DO UPDATE SET
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  email = EXCLUDED.email,
  city = EXCLUDED.city,
  profile_completed = true,
  terms_accepted = true,
  updated_at = now();
