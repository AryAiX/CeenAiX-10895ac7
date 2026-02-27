/*
  # Simplify family_links RLS Policies

  1. Problem
    - Current policies query user_profiles unnecessarily
    - They use complex subqueries when simple comparisons would work
    - family_links already has user_id references

  2. Solution
    - Simplify all policies to use direct auth.uid() comparisons
    - Remove unnecessary subqueries

  3. Changes
    - Drop all existing family_links policies
    - Create new simplified policies
*/

-- Drop all existing family_links policies
DROP POLICY IF EXISTS "Users can view own family links" ON family_links;
DROP POLICY IF EXISTS "Users can view links to them" ON family_links;
DROP POLICY IF EXISTS "Users can create own family links" ON family_links;
DROP POLICY IF EXISTS "Users can delete own family links" ON family_links;

-- Users can view their own family links (where they are the primary user)
CREATE POLICY "Users can view own family links"
  ON family_links FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can view links where they are the linked user
CREATE POLICY "Users can view links to them"
  ON family_links FOR SELECT
  TO authenticated
  USING (auth.uid() = linked_user_id);

-- Users can create their own family links
CREATE POLICY "Users can create own family links"
  ON family_links FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own family links
CREATE POLICY "Users can delete own family links"
  ON family_links FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
