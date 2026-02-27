/*
  # Add Profile Completion Fields

  1. Schema Changes
    - Update `user_profiles` table:
      - Split `full_name` into `first_name` and `last_name`
      - Add `uae_id_number` (Emirates ID)
      - Add `uae_id_expiry_date`
      - Add `insurance_provider`
      - Add `insurance_policy_number`
      - Add `insurance_expiry_date`
      - Add `profile_completed` flag
      - Add `terms_accepted` flag
      - Add `terms_accepted_at` timestamp

  2. New Tables
    - `family_links` - Links family members together
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `linked_user_id` (uuid, references user_profiles)
      - `relationship` (text - e.g., spouse, parent, child, sibling)
      - `created_at` (timestamp)
      - Unique constraint on user_id + linked_user_id

  3. Security
    - Enable RLS on `family_links` table
    - Add policies for users to manage their own family links
    - Add policies for family members to view each other's basic info
*/

-- Add new columns to user_profiles
DO $$
BEGIN
  -- Add first_name and last_name
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'first_name'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN first_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'last_name'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN last_name text;
  END IF;

  -- Add UAE ID fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'uae_id_number'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN uae_id_number text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'uae_id_expiry_date'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN uae_id_expiry_date date;
  END IF;

  -- Add insurance fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'insurance_provider'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN insurance_provider text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'insurance_policy_number'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN insurance_policy_number text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'insurance_expiry_date'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN insurance_expiry_date date;
  END IF;

  -- Add profile completion tracking
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'profile_completed'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN profile_completed boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'terms_accepted'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN terms_accepted boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'terms_accepted_at'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN terms_accepted_at timestamptz;
  END IF;
END $$;

-- Migrate existing full_name data to first_name/last_name
UPDATE user_profiles
SET 
  first_name = SPLIT_PART(full_name, ' ', 1),
  last_name = CASE 
    WHEN array_length(string_to_array(full_name, ' '), 1) > 1 
    THEN substring(full_name from position(' ' in full_name) + 1)
    ELSE ''
  END
WHERE full_name IS NOT NULL AND first_name IS NULL;

-- Create family_links table
CREATE TABLE IF NOT EXISTS family_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  linked_user_id uuid NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  relationship text NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT different_users CHECK (user_id != linked_user_id),
  CONSTRAINT unique_family_link UNIQUE (user_id, linked_user_id)
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_family_links_user_id ON family_links(user_id);
CREATE INDEX IF NOT EXISTS idx_family_links_linked_user_id ON family_links(linked_user_id);

-- Enable RLS on family_links
ALTER TABLE family_links ENABLE ROW LEVEL SECURITY;

-- RLS Policies for family_links

-- Users can view their own family links
CREATE POLICY "Users can view own family links"
  ON family_links FOR SELECT
  TO authenticated
  USING (auth.uid() = (SELECT user_id FROM user_profiles WHERE user_profiles.user_id = family_links.user_id));

-- Users can view links where they are the linked user
CREATE POLICY "Users can view links to them"
  ON family_links FOR SELECT
  TO authenticated
  USING (auth.uid() = (SELECT user_id FROM user_profiles WHERE user_profiles.user_id = family_links.linked_user_id));

-- Users can create their own family links
CREATE POLICY "Users can create own family links"
  ON family_links FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = (SELECT user_id FROM user_profiles WHERE user_profiles.user_id = family_links.user_id));

-- Users can delete their own family links
CREATE POLICY "Users can delete own family links"
  ON family_links FOR DELETE
  TO authenticated
  USING (auth.uid() = (SELECT user_id FROM user_profiles WHERE user_profiles.user_id = family_links.user_id));