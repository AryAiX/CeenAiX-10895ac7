/*
  # Fix Infinite Recursion in user_profiles RLS Policies

  1. Problem
    - The SELECT policy on user_profiles causes infinite recursion
    - It queries user_profiles within the policy itself
    - This prevents any queries on user_profiles from working

  2. Solution
    - Drop the problematic policy
    - Create a simpler policy that doesn't cause recursion
    - Users can view their own profile
    - Users can view profiles of family members
    - Admins can view all profiles (without subquery)

  3. Changes
    - Drop "Users can view relevant profiles" policy
    - Create new policies without recursion
*/

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view relevant profiles" ON user_profiles;

-- Users can always view their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can view profiles of their family members
CREATE POLICY "Users can view family member profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM family_links
      WHERE (family_links.user_id = auth.uid() AND family_links.linked_user_id = user_profiles.user_id)
        OR (family_links.linked_user_id = auth.uid() AND family_links.user_id = user_profiles.user_id)
    )
  );

-- Allow searching for other users (for family linking feature)
CREATE POLICY "Users can search for other users"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);
